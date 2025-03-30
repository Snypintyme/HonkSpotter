import uuid
import re
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app import db

class Image(db.Model):
    """Model for storing image data with an S3 bucket link."""
    __tablename__ = "images"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    s3_url = db.Column(db.String(256), nullable=False)

    @validates('s3_url')
    def validate_s3_url(self, key, s3_url):
        """Validate that the S3 URL is correctly formatted."""
        if not isinstance(s3_url, str):
            raise TypeError("S3 URL must be a string")

        s3_pattern = r'https://honk-spotter\.s3\.amazonaws\.com/images/[a-f0-9\-]+(?:\.[a-zA-Z0-9]+)'
        if not re.match(s3_pattern, s3_url):
            raise ValueError("S3 URL must be a valid S3 bucket link")

        return s3_url

    def to_dict(self):
        """Convert the image record to a dictionary."""
        return {
            "id": str(self.id),
            "s3_url": self.s3_url,
        }