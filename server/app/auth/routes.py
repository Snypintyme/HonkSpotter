import re
import logging
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__)

security_logger = logging.getLogger("security")
debug_logger = logging.getLogger("debug")
limiter = Limiter(get_remote_address, app=current_app, default_limits=["10 per minute"])

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        if not request.is_json:
            security_logger.warning(
                f"Login attempt failed: No JSON payload - IP: {request.remote_addr}"
            )
            return jsonify({"error": "Invalid request, expected JSON"}), 400

        data = request.get_json(silent=True)
        if data is None:
            security_logger.warning(
                f"Login attempt failed: Invalid JSON format - IP: {request.remote_addr}"
            )
            return jsonify({"error": "Invalid JSON format"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            security_logger.warning(
                f"Login attempt failed: Missing email or password - IP: {request.remote_addr}"
            )
            return jsonify({"msg": "Missing email or password"}), 400

        # Validate user credentials against the DB
        user = User.query.filter_by(email=email).first()

        if (
            user
            and user.account_locked_until
            and user.account_locked_until > datetime.now(timezone.utc)
        ):
            security_logger.warning(
                f"Locked account login attempt - IP: {request.remote_addr}"
            )
            return (
                jsonify(
                    {
                        "msg": f"Account locked until {user.account_locked_until.strftime('%Y-%m-%d %H:%M:%S UTC')}"
                    }
                ),
                403,
            )

        if not user or not user.check_password(password):
            if user:
                if not user.failed_login_attempts:
                    user.failed_login_attempts = 1
                else:
                    user.failed_login_attempts += 1
                print(user.failed_login_attempts)

                if user.failed_login_attempts >= 4:
                    user.account_locked_until = datetime.now(timezone.utc) + timedelta(
                        minutes=1
                    )
                    security_logger.warning(
                        f"Account locked for {email} - IP: {request.remote_addr}"
                    )

                db.session.commit()

            security_logger.warning(f"Failed login attempt - IP: {request.remote_addr}")
            return jsonify({"msg": "Invalid email or password"}), 401

        security_logger.info(f"Successful login - IP: {request.remote_addr}")
        debug_logger.debug(f"User {email} logged in successfully")

        if user.failed_login_attempts > 0 or user.account_locked_until:
            user.failed_login_attempts = 0
            user.account_locked_until = None
            db.session.commit()

        additional_claims = {
            "user_id": str(user.id),
            "profile_picture": user.profile_picture,
            "username": user.username,
        }
        access_token = create_access_token(
            identity=email, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=email)

        response = make_response(jsonify(access_token=access_token))
        set_refresh_cookies(response, refresh_token)
        return response, 200

    except Exception as e:
        security_logger.error(f"Login error: {str(e)}", exc_info=True)
        print(e)
        return jsonify({"error": "Internal server error"}), 500


def check_password_complexity(password):
    if len(password) < 8:
        return False

    categories = 0
    if re.search(r"[A-Z]", password):
        categories += 1
    if re.search(r"[a-z]", password):
        categories += 1
    if re.search(r"[0-9]", password):
        categories += 1
    if re.search(r"[^A-Za-z0-9]", password):
        categories += 1

    return categories >= 4


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    POST /signup

    Expects JSON with "email" and "password".
    Creates a new user—leaving username, description, and profile_picture as null—
    and returns a JWT access token while setting the refresh token as an httpOnly cookie.
    """
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            security_logger.warning(
                f"Signup attempt failed: Missing email or password - IP: {request.remote_addr}"
            )
            return jsonify({"msg": "Missing email or password"}), 400

        if not check_password_complexity(password):
            security_logger.warning(
                f"Weak password attempt for {email} - IP: {request.remote_addr}"
            )
            return (
                jsonify(
                    {
                        "error": "Password must be at least 8 characters and include at least one of each: uppercase, lowercase, number, special character"
                    }
                ),
                400,
            )

        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "User already exists"}), 409

        new_user = User(email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        security_logger.info(f"New user signed up - IP: {request.remote_addr}")
        debug_logger.debug(f"User {email} created successfully")

        additional_claims = {
            "user_id": str(new_user.id),
            "profile_picture": new_user.profile_picture,
            "username": new_user.username,
        }
        access_token = create_access_token(
            identity=email, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=email)
        response = make_response(jsonify(access_token=access_token))
        set_refresh_cookies(response, refresh_token)
        return response, 201

    except Exception as e:
        security_logger.error(
            f"Signup error - IP: {request.remote_addr}", exc_info=True
        )
        debug_logger.error("Signup error", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        security_logger.info(f"Token refreshed - IP: {request.remote_addr}")
        debug_logger.debug(f"Token refreshed for {current_user}")

        user = User.query.filter_by(email=current_user).first()
        if not user:
            security_logger.warning(
                f"User not found during token refresh - IP: {request.remote_addr}"
            )
            return jsonify({"error": "User not found"}), 404

        additional_claims = {
            "user_id": str(user.id),
            "profile_picture": user.profile_picture,
            "username": user.username,
        }
        new_access_token = create_access_token(
            identity=current_user, additional_claims=additional_claims
        )
        new_refresh_token = create_refresh_token(identity=current_user)

        response = make_response(jsonify(access_token=new_access_token))
        set_refresh_cookies(response, new_refresh_token)
        return response, 200

    except Exception as e:
        security_logger.error(f"Token refresh error - IP: {request.remote_addr}")
        debug_logger.error("Token refresh error", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        current_user = get_jwt_identity()
        security_logger.info(f"User logged out - IP: {request.remote_addr}")
        debug_logger.debug(f"User {current_user} logged out")

        response = make_response(jsonify({"msg": "Logged out"}))
        unset_jwt_cookies(response)
        return response, 200

    except Exception as e:
        security_logger.error(f"Logout error - IP: {request.remote_addr}")
        debug_logger.error("Logout error", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
