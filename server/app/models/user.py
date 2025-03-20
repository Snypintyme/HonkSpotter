import uuid
from app import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=True)
    password = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.String(256), nullable=True)
    is_banned = db.Column(db.Boolean, default=False)
    posts = relationship("Sighting", back_populates="user")

    def set_password(self, password_plaintext):
        self.password = generate_password_hash(password_plaintext)

    def check_password(self, password_plaintext):
        return check_password_hash(self.password, password_plaintext)

    def __repr__(self):
        return f"<User {self.username}>"
