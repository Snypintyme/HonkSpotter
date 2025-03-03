from flask import Flask, Blueprint, request, jsonify, make_response
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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

jwt = JWTManager(app)

api_bp = Blueprint("api", __name__)


@api_bp.route("/test", methods=["GET"])
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
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    # TODO: Validate credentials properly
    if email != "test@test.com" or password != "test":
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    response = make_response(jsonify(access_token=access_token))
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=app.config["JWT_COOKIE_SECURE"],
        samesite=app.config["JWT_COOKIE_SAMESITE"],
    )
    return response, 200


@api_bp.route("/signup", methods=["POST"])
def signup():
    """
    POST /signup

    Expects JSON { "username": ..., "password": ... }.
    Creates a user (placeholder) and returns a JWT access token, setting the refresh token as an httpOnly cookie.
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    # TODO: Create user and hash password accordingly
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)

    response = make_response(jsonify(access_token=access_token))
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=app.config["JWT_COOKIE_SECURE"],
        samesite=app.config["JWT_COOKIE_SAMESITE"],
    )
    return response, 200


@api_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    POST /refresh

    Requires a valid refresh token (provided via cookie).
    Returns a new access token and rotates the refresh token.
    """
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    new_refresh_token = create_refresh_token(identity=current_user)
    response = make_response(jsonify(access_token=new_access_token))
    response.set_cookie(
        "refresh_token",
        new_refresh_token,
        httponly=True,
        secure=app.config["JWT_COOKIE_SECURE"],
        samesite=app.config["JWT_COOKIE_SAMESITE"],
    )
    return response, 200


app.register_blueprint(api_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
