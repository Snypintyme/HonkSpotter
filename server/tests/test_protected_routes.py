import requests
from conftest import BASE_URL


def test_protected_route_requires_auth(client):
    response = client.get("/api/test")
    assert response.status_code == 401
    assert "Missing JWT" in response.json["msg"]
