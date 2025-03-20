import pytest
import uuid


def test_submit_sighting(client, auth_headers):
    data = {
        "name": f"goose location {uuid.uuid4()}",
        "notes": "i am a note",
        "coords": "34.0522,-118.2437",
        "image": "https://my-bucket-name.s3.amazonaws.com/folder1/image.jpg",
    }
    response = client.post("/api/submit-sighting", headers=auth_headers, json=data)
    assert response.status_code == 201
    assert response.json["msg"] == "Successfully submitted goose sighting"


def test_submit_invalid_coords_sighting(client, auth_headers):
    data = {
        "name": "goose location 1",
        "notes": "i am a note",
        "coords": "3 3",
        "image": "https://my-bucket-name.s3.amazonaws.com/folder1/image.jpg",
    }
    response = client.post("/api/submit-sighting", headers=auth_headers, json=data)
    assert response.status_code == 400


def test_submit_invalid_image_link_sighting(client, auth_headers):
    data = {
        "name": "goose location 1",
        "notes": "i am a note",
        "coords": "34.0522,-118.2437",
        "image": "apple.com",
    }
    response = client.post("/api/submit-sighting", headers=auth_headers, json=data)
    assert response.status_code == 400


def test_get_sightings(client):
    response = client.get("/api/sightings")
    data = response.json
    sighting = data.get("sightings")
    assert response.status_code == 200
    assert len(sighting) > 0
