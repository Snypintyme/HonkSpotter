import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

main_bp = Blueprint("main", __name__)
debug_logger = logging.getLogger("debug")


@main_bp.route("/test", methods=["GET"])
@jwt_required()
def test():
    current_user = get_jwt_identity()
    debug_logger.debug(f"Test endpoint accessed by {current_user}")
    return jsonify(logged_in_as=current_user), 200
