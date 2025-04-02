"""Main application routes"""

import logging
import bleach

from flask import Blueprint, request, jsonify, make_response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.sightings import Sighting
from app.models.user import User
from app import db
import uuid

main_bp = Blueprint("main", __name__)
security_logger = logging.getLogger("security")
debug_logger = logging.getLogger("debug")

@main_bp.route("/test", methods=["GET"])
@jwt_required()
@limiter.exempt
def test():
    current_user = get_jwt_identity()
    debug_logger.debug(f"Test endpoint accessed by {current_user}")
    return jsonify(logged_in_as=current_user), 200


@main_bp.route("/submit-sighting", methods=["POST"])
@jwt_required()
def submit_sighting():
    """
    POST /api/submit-sighting
    Adds a new goose sighting to the database
    """
    try:
        current_user = get_jwt_identity()
        security_logger.info(f"Submit goose sighting - IP: {request.remote_addr}")

        # Get user
        user = User.query.filter_by(email=current_user).first()
        if not user:
            security_logger.warning(f"User does not exist - IP: {request.remote_addr}")
            return jsonify({"error": "User does not exist"}), 500

        data = request.get_json(force=True)  # object
        if not data:
            raise Exception("No data provided")

        name = bleach.clean(data.get("name"))
        notes = bleach.clean(data.get("notes"))
        coords = bleach.clean(data.get("coords"))
        image = bleach.clean(data.get("image"))

        goose_sighting = Sighting(
            name=name,
            notes=notes,
            coords=coords,
            image=image,
            user_id=current_user,
            user=user,
        )
        db.session.add(goose_sighting)
        db.session.commit()

        debug_logger.debug(
            f"Submit goose sighting by {current_user}, name='{name}', "
            f"notes='{notes}', coords='{coords}', img link='{image}'"
        )

        sighting_dict = goose_sighting.to_dict()
        response = make_response(
            jsonify(
                {
                    "msg": "Successfully submitted goose sighting",
                    "sighting": sighting_dict,
                }
            )
        )
        return response, 201

    except (TypeError, ValueError) as e:
        db.session.rollback()  # does nothing if no transaction occured
        security_logger.error(
            f"Validation error: submit goose sighting - IP: {request.remote_addr}\n{e}"
        )
        debug_logger.error(
            f"Validation error: submit goose sighting\n{e}", exc_info=True
        )
        return jsonify({"error": "Invalid input"}), 400
    except Exception as e:
        db.session.rollback()  # does nothing if no transaction occured
        security_logger.error(
            f"Error: submit goose sighting - IP: {request.remote_addr}\n{e}"
        )
        debug_logger.error(f"Error: submit goose sighting\n{e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred"}), 500


@main_bp.route("/sightings", methods=["GET"])
@limiter.exempt
def sightings():
    """
    GET /api/sightings
    Gets all active goose sightings in the database, optionally filtered by user ID
    """
    try:
        security_logger.info(f"Get goose sightings - IP: {request.remote_addr}")

        user_id = request.args.get("user_id")

        if user_id:
            try:
                uuid.UUID(user_id, version=4)
            except ValueError:
                return jsonify({"error": "Invalid user_id format"}), 400

            goose_sightings = (
                Sighting.query.join(User).filter(Sighting.user_id == user_id).all()
            )
        else:
            goose_sightings = Sighting.query.join(User).all()

        # Convert the sightings to a list of dictionaries
        sightings_list = [sighting.to_dict() for sighting in goose_sightings]

        debug_logger.debug(
            f"Get goose sightings, number of sightings: {len(goose_sightings)}"
        )
        response = make_response(jsonify({"sightings": sightings_list}))
        return response, 200

    except Exception as e:
        security_logger.error(
            f"Error: get goose sightings - IP: {request.remote_addr}\n{e}"
        )
        debug_logger.error(f"Error: get goose sightings\n{e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred"}), 500
