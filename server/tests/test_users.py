import pytest
import uuid
import json


def test_update_profile_success(client, auth_headers):
    """Test successful profile update with all fields"""
    data = {
        "username": f"testuser_{uuid.uuid4()}",
        "description": "This is a test description",
        "profile_picture": "https://example.com/test.jpg",
    }
    response = client.post("/api/update-profile", headers=auth_headers, json=data)
    assert response.status_code == 200
    assert response.json["msg"] == "Profile updated successfully"
    assert response.json["user"]["username"] == data["username"]
    assert response.json["user"]["description"] == data["description"]
    assert response.json["user"]["profile_picture"] == data["profile_picture"]


def test_update_profile_partial(client, auth_headers):
    """Test successful profile update with only username"""
    data = {"username": f"testuser_{uuid.uuid4()}"}
    response = client.post("/api/update-profile", headers=auth_headers, json=data)
    assert response.status_code == 200
    assert response.json["msg"] == "Profile updated successfully"
    assert response.json["user"]["username"] == data["username"]


def test_update_profile_no_auth(client):
    """Test profile update without authentication"""
    data = {"username": "unauthorized_user"}
    response = client.post("/api/update-profile", json=data)
    assert response.status_code == 401


def test_update_profile_no_fields(client, auth_headers):
    """Test profile update with no valid fields"""
    data = {"invalid_field": "some value"}
    response = client.post("/api/update-profile", headers=auth_headers, json=data)
    assert response.status_code == 400
    assert "At least one valid field must be provided" in response.json["error"]


def test_update_profile_empty_json(client, auth_headers):
    """Test profile update with empty JSON"""
    data = {}
    response = client.post("/api/update-profile", headers=auth_headers, json=data)
    assert response.status_code == 400
    assert "At least one valid field must be provided" in response.json["error"]


def test_update_profile_not_json(client, auth_headers):
    """Test profile update with non-JSON data"""
    headers = auth_headers.copy()
    headers["Content-Type"] = "text/plain"
    response = client.post("/api/update-profile", headers=headers, data="not json")
    assert response.status_code == 400
    assert "Invalid request, expected JSON" in response.json["error"]


def test_update_profile_duplicate_username(client, auth_headers):
    """Test profile update with already taken username"""
    # Create a user with a specific username
    from app.models.user import User
    from app import db

    # Generate unique values outside the context
    existing_username = f"existing_user_{uuid.uuid4()}"
    unique_email = f"existing_{uuid.uuid4()}@test.com"

    # Add the user directly without creating a new context
    existing_user = User(email=unique_email)
    existing_user.set_password("test")
    existing_user.username = existing_username
    db.session.add(existing_user)
    db.session.commit()

    # Now try to update our test user with the same username
    data = {"username": existing_username}
    response = client.post("/api/update-profile", headers=auth_headers, json=data)
    assert response.status_code == 409
    assert "Username already taken" in response.json["error"]


def test_update_profile_invalid_json(client, auth_headers):
    """Test profile update with invalid JSON format"""
    headers = auth_headers.copy()
    headers["Content-Type"] = "application/json"
    response = client.post("/api/update-profile", headers=headers, data="{invalid json")
    assert response.status_code == 400
    assert "Invalid JSON format" in response.json["error"]
