import logging
import uuid
import bleach

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.user import User

users_bp = Blueprint("users", __name__)
security_logger = logging.getLogger("security")
debug_logger = logging.getLogger("debug")

@users_bp.route("/user/<string:user_id>", methods=["GET"])
@limiter.exempt
@jwt_required()
def get_user(user_id):
    """
    GET /api/user/<user_id>
    Returns information for a specific user
    """
    try:
        uuid_obj = uuid.UUID(user_id)
    except ValueError:
        return jsonify({"error": "Invalid user ID format"}), 404

    try:
        current_user_email = get_jwt_identity()
        security_logger.info(
            f"Get user attempt - User ID: {user_id}, IP: {request.remote_addr}"
        )

        # Verify the requesting user exists
        requesting_user = User.query.filter_by(email=current_user_email).first()
        if not requesting_user:
            security_logger.warning(
                f"Requesting user not found for get user request - IP: {request.remote_addr}"
            )
            return jsonify({"error": "Requesting user not found"}), 404

        # Get the requested user from database
        user = User.query.get(user_id)
        if not user:
            security_logger.warning(
                f"Requested user not found - User ID: {user_id}, IP: {request.remote_addr}"
            )
            return jsonify({"error": "Requested user not found"}), 404

        # Format user data, excluding sensitive information
        user_data = {
            "id": str(user.id),
            "username": user.username,
            "description": user.description,
            "profile_picture": user.profile_picture,
            "is_banned": user.is_banned,
        }

        debug_logger.debug(
            f"User {current_user_email} retrieved user {user_id} successfully"
        )
        security_logger.info(
            f"User retrieved successfully - User ID: {user_id}, IP: {request.remote_addr}"
        )

        return jsonify({"user": user_data}), 200

    except Exception as e:
        security_logger.error(
            f"Get user error - User ID: {user_id}, IP: {request.remote_addr}"
        )
        debug_logger.error(f"Get user error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@users_bp.route("/update-profile", methods=["POST"])
@jwt_required()
def update_profile():
    """
    POST /api/user/update-profile
    Updates user profile information (username, description, profile_picture)
    """
    try:
        current_user_email = get_jwt_identity()
        security_logger.info(f"Profile update attempt - IP: {request.remote_addr}")

        # Get user from database
        user = User.query.filter_by(email=current_user_email).first()
        if not user:
            security_logger.warning(
                f"User not found for profile update - IP: {request.remote_addr}"
            )
            return jsonify({"error": "User not found"}), 404

        # Get request data
        if not request.is_json:
            security_logger.warning(
                f"Profile update failed: No JSON payload - IP: {request.remote_addr}"
            )
            return jsonify({"error": "Invalid request, expected JSON"}), 400

        data = request.get_json(silent=True)
        if data is None:
            security_logger.warning(
                f"Profile update failed: Invalid JSON format - IP: {request.remote_addr}"
            )
            return jsonify({"error": "Invalid JSON format"}), 400

        # Check if at least one field to update is provided
        update_fields = ["username", "description", "profile_picture"]
        if not any(field in data for field in update_fields):
            security_logger.warning(
                f"Profile update failed: No valid fields to update - IP: {request.remote_addr}"
            )
            return jsonify({"error": "At least one valid field must be provided"}), 400

        # Update fields if provided
        if "username" in data and data["username"]:
            # Check if username is already taken
            existing_user = User.query.filter_by(username=data["username"]).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Username already taken"}), 409
            user.username = bleach.clean(data["username"])

        if "description" in data:
            user.description = bleach.clean(data["description"])

        if "profile_picture" in data:
            user.profile_picture = bleach.clean(data["profile_picture"])

        # Save changes
        db.session.commit()

        debug_logger.debug(f"User {current_user_email} updated profile successfully")
        security_logger.info(
            f"Profile updated successfully - IP: {request.remote_addr}"
        )

        # Return updated user info
        return (
            jsonify(
                {
                    "msg": "Profile updated successfully",
                    "user": {
                        "email": user.email,
                        "username": user.username,
                        "description": user.description,
                        "profile_picture": user.profile_picture,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        security_logger.error(f"Profile update error - IP: {request.remote_addr}")
        debug_logger.error(f"Profile update error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
