import logging
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from app import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__)

security_logger = logging.getLogger("security")
debug_logger = logging.getLogger("debug")


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
        if not user or not user.check_password(password):
            security_logger.warning(f"Failed login attempt - IP: {request.remote_addr}")
            return jsonify({"msg": "Invalid email or password"}), 401

        security_logger.info(f"Successful login - IP: {request.remote_addr}")
        debug_logger.debug(f"User {email} logged in successfully")

        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)

        response = make_response(jsonify(access_token=access_token))
        set_refresh_cookies(response, refresh_token)
        return response, 200

    except Exception as e:
        security_logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


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

        if User.query.filter_by(email=email).first():
            return jsonify({"msg": "User already exists"}), 409

        new_user = User(email=email)
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        security_logger.info(f"New user signed up - IP: {request.remote_addr}")
        debug_logger.debug(f"User {email} created successfully")

        access_token = create_access_token(identity=email)
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

        new_access_token = create_access_token(identity=current_user)
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
