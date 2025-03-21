import logging
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.sightings import Sighting
from app.models.user import User
from app import db

main_bp = Blueprint("main", __name__)
security_logger = logging.getLogger("security")
debug_logger = logging.getLogger("debug")


@main_bp.route("/test", methods=["GET"])
@jwt_required()
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

        name = data.get("name")
        notes = data.get("notes")
        coords = data.get("coords")
        image = data.get("image")

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
            f"Submit goose sighting by {current_user}, name='{name}', notes='{notes}', coords='{coords}', img link='{image}'"
        )

        response = make_response(
            jsonify(
                {
                    "msg": "Successfully submitted goose sighting",
                    "id": str(goose_sighting.id),
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
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()  # does nothing if no transaction occured
        security_logger.error(
            f"Error: submit goose sighting - IP: {request.remote_addr}\n{e}"
        )
        debug_logger.error(f"Error: submit goose sighting\n{e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@main_bp.route("/sightings", methods=["GET"])
def sightings():
    """
    GET /api/sightings
    Gets all active goose sightings in the database
    """
    try:
        security_logger.info(f"Get goose sightings - IP: {request.remote_addr}")

        # Query sightings with joined user data to avoid N+1 query problem
        goose_sightings = Sighting.query.join(User).all()

        # Convert the sightings to a list of dictionaries
        sightings_list = []
        for sighting in goose_sightings:
            # Convert the sighting to a dict
            sighting_dict = {
                "id": str(sighting.id),
                "name": sighting.name,
                "notes": sighting.notes,
                "image": sighting.image,
                "created_date": (
                    sighting.created_date.isoformat() if sighting.created_date else None
                ),
            }

            # Parse the coordinates string into lat/lng object
            if sighting.coords:
                lat_str, lng_str = sighting.coords.split(",")
                sighting_dict["coords"] = {
                    "lat": float(lat_str.strip()),
                    "lng": float(lng_str.strip()),
                }
            else:
                sighting_dict["coords"] = None

            # Include the full user object instead of just the ID
            if sighting.user:
                sighting_dict["user"] = {
                    "id": str(sighting.user.id),
                    "email": sighting.user.email,
                    "username": sighting.user.username,
                    "description": sighting.user.description,
                    "profile_picture": sighting.user.profile_picture,
                }
            else:
                sighting_dict["user"] = None

            sightings_list.append(sighting_dict)

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
        return jsonify({"error": str(e)}), 500
