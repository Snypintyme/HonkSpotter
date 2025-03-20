import uuid
import re
import datetime
from app import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
from dataclasses import dataclass
from app.models.user import User
from typing import List

@dataclass
class Sighting(db.Model):
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
        if not isinstance(name, str):
            raise TypeError("Name must be a string")
        if not name.strip():
            raise ValueError("Name cannot be empty")
        if len(name) > 80:
            raise ValueError("Name cannot be longer than 80 characters")
        return name

    @validates('notes')
    def validate_notes(self, key, notes):
        if notes is not None and not isinstance(notes, str):
            raise TypeError("Notes must be a string")
        return notes

    @validates('coords')
    def validate_coords(self, key, coords):
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
        if image is None:
            return image

        if not isinstance(image, str):
            raise TypeError("Image URL must be a string")

        # Validate S3 bucket link format
        # Example: https://bucket-name.s3.amazonaws.com/path/to/object
        # or: https://s3.amazonaws.com/bucket-name/path/to/object
        s3_pattern = r'^https?://(?:([^.]+)\.s3\.amazonaws\.com/|s3\.amazonaws\.com/([^/]+)/)'
        match = re.match(s3_pattern, image)

        if not match:
            raise ValueError("Image must be a valid S3 bucket link")

        return image
