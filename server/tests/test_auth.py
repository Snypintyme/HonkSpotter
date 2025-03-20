import pytest
import uuid


def test_login_success(client):
    data = {"email": "test@test.com", "password": "test"}
    response = client.post("/api/login", json=data)
    assert response.status_code == 200
    assert "access_token" in response.json


def test_login_fail(client):
    data = {"email": "test@test.com", "password": "wrong"}
    response = client.post("/api/login", json=data)
    assert response.status_code == 401
    assert response.json["msg"] == "Invalid email or password"


def test_signup(client):
    unique_email = f"test-{uuid.uuid4()}@test.com"
    data = {"email": unique_email, "password": "password123"}
    response = client.post("/api/signup", json=data)
    assert response.status_code == 201
    assert "access_token" in response.json


def test_refresh_token(client):
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = client.post("/api/login", json=login_data)
    assert login_response.status_code == 200

    # Get cookies from the response
    refresh_token = login_response.headers.get("Set-Cookie")
    refresh_token_value = refresh_token.split("refresh_token_cookie=")[1].split(";")[0]

    csrf_token = login_response.json.get("csrf_token")

    headers = {
        "Authorization": f"Bearer {refresh_token_value}",
        "X-CSRF-TOKEN": csrf_token,
    }

    response = client.post(
        "/api/refresh", headers=headers, environ_base={"HTTP_COOKIE": refresh_token}
    )
    assert response.status_code == 200
    assert "access_token" in response.json


def test_logout(client, auth_headers):
    response = client.post("/api/logout", headers=auth_headers)
    assert response.status_code == 200
    assert response.json["msg"] == "Logged out"
