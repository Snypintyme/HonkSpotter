import os
from datetime import timedelta


class Config:
    # JWT settings
    SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 15))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 7))
    )
    JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "True") == "True"
    JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Strict")
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_COOKIE_CSRF_PROTECT = True

    # SQLAlchemy settings
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI", "postgresql://postgres:postgres@localhost/honkspotter_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Environment setting
    FLASK_ENV = os.getenv("FLASK_ENV", "development")

