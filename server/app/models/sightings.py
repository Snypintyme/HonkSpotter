"""Sighting model definition"""
import uuid
import re
import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from dataclasses import dataclass
from app.models.user import User
from app import db

@dataclass
class Sighting(db.Model):
    """Sighting record"""
    __tablename__ = "sightings"
    id: str
    name: str
    notes: str
    coords: str
    image: str
    user_id: str
    created_date: datetime.datetime

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(80), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    coords = db.Column(db.String(80), nullable=False)
    image = db.Column(db.String(256), nullable=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"))
    user = relationship("User", back_populates="posts")
    created_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    @validates('name')
    def validate_name(self, key, name):
        """Validate name field"""
        if not isinstance(name, str):
            raise TypeError("Name must be a string")
        if not name.strip():
            raise ValueError("Name cannot be empty")
        if len(name) > 80:
            raise ValueError("Name cannot be longer than 80 characters")
        return name

    @validates('notes')
    def validate_notes(self, key, notes):
        """Validate observation notes"""
        if notes is not None and not isinstance(notes, str):
            raise TypeError("Notes must be a string")
        return notes

    @validates('coords')
    def validate_coords(self, key, coords):
        """Validate coordinate format"""
        if not isinstance(coords, str):
            raise TypeError("Coordinates must be a string")

        # Improved regex pattern for latitude,longitude format
        # Matches: "34.0522,-118.2437" or "34.0522, -118.2437" (with optional space)
        pattern = r'^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$'
        match = re.match(pattern, coords)

        if not match:
            raise ValueError("Coordinates must be in 'latitude,longitude' format")

        try:
            lat = float(match.group(1))
            lng = float(match.group(3))

            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")

            if not (-180 <= lng <= 180):
                raise ValueError("Longitude must be between -180 and 180")

            return coords
        except ValueError:
            raise ValueError("Coordinates must contain valid numbers")

    @validates('image')
    def validate_image(self, key, image):
        """Validate image id"""
        if not image:
            return image

        if not isinstance(image, str):
            raise TypeError("Image URL must be a string")

        return image

    def to_dict(self):
        # Convert the sighting to a dict
        sighting_dict = {
            "id": str(self.id),
            "name": self.name,
            "notes": self.notes,
            "image": self.image,
            "created_date": (
                self.created_date.isoformat() if self.created_date else None
            ),
        }

        # Parse the coordinates string into lat/lng object
        if self.coords:
            lat_str, lng_str = self.coords.split(",")
            sighting_dict["coords"] = {
                "lat": float(lat_str.strip()),
                "lng": float(lng_str.strip()),
            }
        else:
            sighting_dict["coords"] = None

        # Include the full user object instead of just the ID
        if self.user:
            sighting_dict["user"] = {
                "id": str(self.user.id),
                "email": self.user.email,
                "username": self.user.username,
                "description": self.user.description,
                "profile_picture": self.user.profile_picture,
            }
        else:
            sighting_dict["user"] = None

        return sighting_dict
