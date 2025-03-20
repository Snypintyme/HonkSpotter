import sys
import os
import pytest
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.models.user import User
from app.models.sightings import Sighting

# Base URL for API requests
BASE_URL = "http://127.0.0.1:8000/api"

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    app = create_app()

    # Configure app for testing
    app.config.update(
        {
            "TESTING": True,
            "SERVER_NAME": "localhost.localdomain",
        }
    )

    # Establish application context
    with app.app_context():
        yield app


@pytest.fixture
def client():
    app = create_app()
    app.config.update(
        {"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"}
    )

    with app.test_client() as client:
        with app.app_context():
            # Setup test database
            from app.models.user import User
            from app.models.sightings import Sighting
            from app import db

            db.create_all()  # Create all tables

            # Create test user
            test_user = User.query.filter_by(email="test@test.com").first()
            if not test_user:
                test_user = User(email="test@test.com")
                test_user.set_password("test")
                db.session.add(test_user)
                db.session.commit()

            # Create a test sighting
            test_sighting = Sighting.query.first()
            if not test_sighting:
                test_sighting = Sighting(
                    name="Test Goose Location",
                    notes="Test notes",
                    coords="34.0522,-118.2437",
                    image="https://my-bucket-name.s3.amazonaws.com/folder1/image.jpg",
                    user_id=test_user.id,
                )
                db.session.add(test_sighting)
                db.session.commit()

            yield client

            # Clean up
            db.session.remove()


@pytest.fixture
def auth_headers(client):
    """Get authentication headers for a test user."""
    data = {"email": "test@test.com", "password": "test"}
    response = client.post("/api/login", json=data)

    access_token = response.json.get("access_token")

    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
