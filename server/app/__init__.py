"""Flask application factory and configuration setup"""
import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from config import Config

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def configure_logging(app):
    """Configure logging handlers and formatters based on environment."""
    from logging.handlers import RotatingFileHandler

    # Ensure logs directory exists
    logs_dir = os.path.join(os.getcwd(), "logs")
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    # Determine environment mode from config
    env = app.config.get("FLASK_ENV", "development")

    # Security logger (always enabled)
    security_log_file = os.path.join(logs_dir, "security.log")
    security_handler = RotatingFileHandler(
        security_log_file, maxBytes=5 * 1024 * 1024, backupCount=3
    )
    security_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    security_handler.setFormatter(security_formatter)

    security_logger = logging.getLogger("security")
    security_logger.setLevel(logging.INFO)
    if not security_logger.handlers:
        security_logger.addHandler(security_handler)

    # Debug logger (only in development)
    debug_logger = logging.getLogger("debug")
    if (
        env == "development"
    ):  # TODO: Make sure when prod is set up that the debug stuff isnt logged
        debug_log_file = os.path.join(logs_dir, "debug.log")
        debug_handler = RotatingFileHandler(
            debug_log_file, maxBytes=5 * 1024 * 1024, backupCount=3
        )
        debug_formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s [%(pathname)s:%(lineno)d]"
        )
        debug_handler.setFormatter(debug_formatter)
        debug_logger.setLevel(logging.DEBUG)
        if not debug_logger.handlers:
            debug_logger.addHandler(debug_handler)
    else:
        debug_logger.setLevel(logging.CRITICAL)

    security_logger.info("Flask server initialized")
    if env == "development":
        debug_logger.debug("Debugging enabled - Development Mode")


def create_app():
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS for API endpoints
    # TODO: Fix this for prod (adjust origins for production)
    origin_http = "http://honkspotter.rocks" if app.config['IS_PROD'] else "http://localhost:5174"
    origin_https = "https://honkspotter.rocks" if app.config['IS_PROD'] else "https://localhost:5174"
    CORS(
        app,
        resources={r"/api/*": {"origins": [origin_http, origin_https]}},
        supports_credentials=True,
    )

    # Configure logging
    configure_logging(app)

    # Register blueprints
    from app.auth.routes import auth_bp # pylint: disable=import-outside-toplevel
    from app.main.routes import main_bp # pylint: disable=import-outside-toplevel
    from app.users.routes import users_bp # pylint: disable=import-outside-toplevel
    from app.image.routes import image_bp # pylint: disable=import-outside-toplevel

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(main_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(image_bp, url_prefix="/api")

    return app
