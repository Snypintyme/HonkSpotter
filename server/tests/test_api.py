import requests

BASE_URL = "http://127.0.0.1:8000/api"


# Used pytest to run these
def test_login_success():
    """Test successful login"""
    data = {"email": "test@test.com", "password": "test"}
    response = requests.post(f"{BASE_URL}/login", json=data)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_fail():
    """Test failed login due to wrong password"""
    data = {"email": "test@test.com", "password": "wrong"}
    response = requests.post(f"{BASE_URL}/login", json=data)
    assert response.status_code == 401
    assert response.json()["msg"] == "Invalid email or password"

# TODO figure out how to test without polluting user database
# def test_signup():
#     """Test user signup"""
#     data = {"email": "newuser@test.com", "password": "password123"}
#     response = requests.post(f"{BASE_URL}/signup", json=data)
#     assert response.status_code == 200
#     assert "access_token" in response.json()


def test_refresh_token():
    """Test refreshing an access token"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)

    assert login_response.status_code == 200, f"Login failed: {login_response.text}"

    # Get refresh token from cookies
    refresh_token = login_response.cookies.get("refresh_token_cookie")
    csrf_token = login_response.cookies.get("csrf_refresh_token")  # Get CSRF token

    assert refresh_token is not None, "Refresh token was not set in cookies"
    assert csrf_token is not None, "CSRF token was not set in cookies"

    headers = {
        "Authorization": f"Bearer {refresh_token}",
        "X-CSRF-TOKEN": csrf_token,  # Include CSRF token
    }

    response = requests.post(
        f"{BASE_URL}/refresh", headers=headers, cookies=login_response.cookies
    )

    assert response.status_code == 200, f"Refresh token request failed: {response.text}"
    assert "access_token" in response.json()


def test_logout():
    """Test user logout"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    access_token = login_response.json().get("access_token")

    assert access_token is not None

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["msg"] == "Logged out"

def test_submit_sighting():
    """Test goose sighting submission"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    access_token = login_response.json().get("access_token")

    assert access_token is not None

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {
        "name": "goose location 1",
        "notes": "i am a note",
        "coords": "34.0522,-118.2437",
        "image": "https://my-bucket-name.s3.amazonaws.com/folder1/image.jpg"
    }
    response = requests.post(f"{BASE_URL}/submit-sighting", headers=headers, json=data)
    assert response.status_code == 201
    assert response.json()["msg"] == "Successfully submitted goose sighting"

def test_submit_invalid_coords_sighting():
    """Test goose sighting submission with an invalid json schema"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    access_token = login_response.json().get("access_token")

    assert access_token is not None

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {
        "name": "goose location 1",
        "notes": "i am a note",
        "coords": "3 3",
        "image": 'https://my-bucket-name.s3.amazonaws.com/folder1/image.jpg'
    }
    response = requests.post(f"{BASE_URL}/submit-sighting", headers=headers, json=data)
    assert response.status_code == 400

def test_submit_invalid_image_link_sighting():
    """Test goose sighting submission with an invalid json schema"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    access_token = login_response.json().get("access_token")

    assert access_token is not None

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    data = {
        "name": "goose location 1",
        "notes": "i am a note",
        "coords": "34.0522,-118.2437",
        "image": 'apple.com'
    }
    response = requests.post(f"{BASE_URL}/submit-sighting", headers=headers, json=data)
    assert response.status_code == 400

def test_get_sightings():
    """Test fetching all goose sightings"""
    login_data = {"email": "test@test.com", "password": "test"}
    login_response = requests.post(f"{BASE_URL}/login", json=login_data)
    access_token = login_response.json().get("access_token")

    assert access_token is not None

    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(f"{BASE_URL}/sightings", headers=headers)
    data = response.json()
    sighting = data.get("sightings")

    assert response.status_code == 200
    assert len(sighting) > 0

def test_protected_route_requires_auth():
    """Test accessing a protected route without authentication"""
    response = requests.get(f"{BASE_URL}/test")

    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    assert (
        "Missing JWT" in response.json()["msg"]
    ), f"Unexpected error message: {response.json()}"
