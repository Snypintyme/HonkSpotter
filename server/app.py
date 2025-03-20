from flask import Flask, Blueprint, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from datetime import timedelta
import os
from dotenv import load_dotenv
import json
from schemas import GooseSighting

# Load environment variables from .env file
load_dotenv()

# Logging stuff
import logging
from logging.handlers import RotatingFileHandler

# Ensure logs directory exists
if not os.path.exists("logs"):
    os.makedirs("logs")

# Read environment mode (default to dev)
FLASK_ENV = os.getenv("FLASK_ENV", "development")

# Security logger (Always enabled)
security_log_file = "logs/security.log"
security_handler = RotatingFileHandler(security_log_file, maxBytes=5 * 1024 * 1024, backupCount=3)
security_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
security_handler.setFormatter(security_formatter)

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)
security_logger.addHandler(security_handler)

# Debug logger (Only enabled in development)
debug_logger = logging.getLogger("debug")

if FLASK_ENV == "development": # TODO: Make sure when prod is set up that the debug stuff isnt logged
    debug_log_file = "logs/debug.log"
    debug_handler = RotatingFileHandler(debug_log_file, maxBytes=5 * 1024 * 1024, backupCount=3)
    debug_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s [%(pathname)s:%(lineno)d]")
    debug_handler.setFormatter(debug_formatter)

    debug_logger.setLevel(logging.DEBUG)
    debug_logger.addHandler(debug_handler)
else:
    debug_logger.setLevel(logging.CRITICAL)  # Disable debug logging in prod

security_logger.info("Flask server initialized")
if FLASK_ENV == "development":
    debug_logger.debug("Debugging enabled - Development Mode")
#------------

app = Flask(__name__)

# Enable CORS for the /api endpoints, allowing the specified origin and credentials
# TODO: Fix this for prod
CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
)

# Configure JWT settings from environment variables
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default_secret_key")
access_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 15))
refresh_days = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 7))
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=access_minutes)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=refresh_days)
app.config["JWT_COOKIE_SECURE"] = os.getenv("JWT_COOKIE_SECURE", "True") == "True"
app.config["JWT_COOKIE_SAMESITE"] = os.getenv("JWT_COOKIE_SAMESITE", "Strict")
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = True

jwt = JWTManager(app)

api_bp = Blueprint("api", __name__)


@api_bp.route("/test", methods=["GET", "POST"])
@jwt_required()
def test():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@api_bp.route("/login", methods=["POST"])
def login():
    """
    POST /login

    Expects JSON { "username": ..., "password": ... }.
    Returns a JWT access token in the JSON response and sets a refresh token as an httpOnly cookie.
    """
    try:
        if not request.is_json:
            security_logger.warning(f"Login attempt failed: No JSON payload - IP: {request.remote_addr}")
            return jsonify({"error": "Invalid request, expected JSON"}), 400

        data = request.get_json(silent=True)
        if data is None:
            security_logger.warning(f"Login attempt failed: Invalid JSON format - IP: {request.remote_addr}")
            return jsonify({"error": "Invalid JSON format"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            security_logger.warning(f"Login attempt failed: Missing email or password - IP: {request.remote_addr}")
            return jsonify({"msg": "Missing email or password"}), 400

        # TODO: Validate credentials properly
        if email != "test@test.com" or password != "test":
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


@api_bp.route("/signup", methods=["POST"])
def signup():
    """
    POST /signup

    Expects JSON { "username": ..., "password": ... }.
    Creates a user (placeholder) and returns a JWT access token, setting the refresh token as an httpOnly cookie.
    """
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            security_logger.warning(f"Signup attempt failed: Missing email or password - IP: {request.remote_addr}")
            return jsonify({"msg": "Missing email or password"}), 400

        # TODO: Create user and hash password accordingly
        security_logger.info(f"New user signed up - IP: {request.remote_addr}")
        debug_logger.debug(f"User {email} created successfully")

        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)

        response = make_response(jsonify(access_token=access_token))
        set_refresh_cookies(response, refresh_token)
        return response, 200

    except Exception as e:
        security_logger.error(f"Signup error - IP: {request.remote_addr}")
        debug_logger.error("Signup error", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    POST /refresh

    Requires a valid refresh token (provided via cookie).
    Returns a new access token and rotates the refresh token.
    """
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


@api_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    POST /api/logout

    Revokes the refresh token by clearing the refresh token cookie.
    This signals to the client that the access token should be removed
    and that the user is now logged out.
    """
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

@api_bp.route("/submit-sighting", methods=["POST"])
@jwt_required()
def submit_sighting():
    """
    POST /api/submit-sighting

    Adds a new goose sighting to the database
    """
    try:
        current_user = get_jwt_identity()
        security_logger.info(f"Submit goose sighting - IP: {request.remote_addr}")

        request_data = request.get_json(force=True) # object
        data = GooseSighting(**request_data)

        debug_logger.debug(f"Submit goose sighting by {current_user}, name='{data.name}', notes='{data.notes}', coords='{data.coords}', img link='{data.image}'")

        response = make_response(jsonify({"msg": "Successfully submitted goose sighting"}))
        return response, 200

    except Exception as e:
        security_logger.error(f"Submit goose sighting error - IP: {request.remote_addr} - Error: {e}")
        debug_logger.error(f"Submit goose sighting error: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Log sanitized error messages for security logs."""
    security_logger.error(f"Unhandled exception - IP: {request.remote_addr}")
    debug_logger.error("Unhandled exception", exc_info=True)
    return jsonify({"error": "Internal server error"}), 500


app.register_blueprint(api_bp, url_prefix="/api")
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
