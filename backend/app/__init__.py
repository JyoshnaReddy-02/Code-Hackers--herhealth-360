import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from .models import db
from .routes import register_blueprints

def create_app(test_config=None):
    load_dotenv()

    app = Flask(__name__, instance_relative_config=True)

    # Base project paths on E: drive
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    instance_dir = os.path.join(base_dir, "instance")
    generated_dir = os.path.join(base_dir, "generated")

    os.makedirs(instance_dir, exist_ok=True)
    os.makedirs(generated_dir, exist_ok=True)

    default_db_path = f"sqlite:///{os.path.join(instance_dir, 'herhealth.db').replace('\\', '/')}"

    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret-herhealth-360-production-platform-key-2026"),
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", default_db_path),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False,
    )

    if test_config:
        app.config.update(test_config)

    # Initialize Database
    db.init_app(app)

    # Restricted CORS configuration
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    if frontend_origin.strip() == "*":
        allowed_origins = "*"
    else:
        origins_list = [o.strip() for o in frontend_origin.split(",") if o.strip()]
        allowed_origins = list(set(origins_list + ["http://127.0.0.1:5173", "http://localhost:5173"]))

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True if allowed_origins != "*" else False,
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # Rate Limiting configuration
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["300 per hour", "60 per minute"],
        storage_uri="memory://"
    )

    # Register API blueprints
    register_blueprints(app)

    # Safe Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request. Please check input parameters."}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Authentication required."}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "HTTP method not allowed."}), 405

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({"error": "Resource conflict."}), 409

    @app.errorhandler(429)
    def ratelimit_exceeded(e):
        return jsonify({"error": "Rate limit exceeded. Please wait a moment before trying again."}), 429

    @app.errorhandler(500)
    def internal_server_error(e):
        # Do not expose stack traces to client
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

    return app
