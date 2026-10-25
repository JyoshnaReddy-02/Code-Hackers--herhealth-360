import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from .models import db
from .routes import register_blueprints

def create_app(test_config=None):
    # Configure project paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_env = os.path.join(base_dir, ".env")
    if os.path.exists(backend_env):
        load_dotenv(backend_env, override=True)
    else:
        load_dotenv()

    app = Flask(__name__, instance_relative_config=True)
    instance_dir = os.path.join(base_dir, "instance")
    generated_dir = os.path.join(base_dir, "generated")

    # Local E: drive cache and temp paths if on Windows
    if os.name == "nt" and os.path.exists("E:\\herhealth-360"):
        os.environ.setdefault("PYTHONPYCACHEPREFIX", "E:\\herhealth-360\\.cache\\python")
        os.environ.setdefault("TEMP", "E:\\herhealth-360\\.tmp")
        os.environ.setdefault("TMP", "E:\\herhealth-360\\.tmp")

    try:
        os.makedirs(instance_dir, exist_ok=True)
        os.makedirs(generated_dir, exist_ok=True)
    except (OSError, PermissionError):
        pass

    default_db_path = f"sqlite:///{os.path.join(instance_dir, 'herhealth.db').replace('\\', '/')}"

    # Resolve Database URI: Check DATABASE_URL or MYSQL_* parameters
    db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")
    if not db_url:
        mysql_user = os.getenv("MYSQL_USER")
        mysql_password = os.getenv("MYSQL_PASSWORD")
        mysql_host = os.getenv("MYSQL_HOST")
        mysql_port = os.getenv("MYSQL_PORT", "3306")
        mysql_db = os.getenv("MYSQL_DATABASE") or os.getenv("MYSQL_DB")
        if mysql_user and mysql_host and mysql_db:
            pwd_str = f":{mysql_password}" if mysql_password else ""
            db_url = f"mysql+pymysql://{mysql_user}{pwd_str}@{mysql_host}:{mysql_port}/{mysql_db}"

    # Check if in production or serverless environment
    is_production = os.getenv("VERCEL") or os.getenv("FLASK_ENV") == "production"

    # Fallback to local SQLite only in local development
    if not db_url:
        if is_production:
            raise RuntimeError(
                "Production Configuration Error: DATABASE_URL environment variable is required in production / on Vercel. "
                "SQLite fallback is strictly disabled in production to protect data integrity and prevent silent ephemeral data loss."
            )
        db_url = default_db_path

    # Normalize MySQL driver prefix to use pure-python pymysql
    if db_url.startswith("mysql://"):
        db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # Database engine options for serverless and cloud MySQL resilience
    engine_options = {}
    if "mysql" in db_url.lower():
        engine_options = {
            "pool_recycle": 280,
            "pool_pre_ping": True,
        }

        # TLS / SSL Certificate configuration for TiDB Cloud & Cloud MySQL
        connect_args = {}
        ca_path = os.getenv("TIDB_CA_PATH") or os.getenv("MYSQL_SSL_CA")
        if not ca_path and "tidbcloud.com" in db_url.lower():
            # Check project certificate on E: drive
            local_cert = os.path.join(base_dir, "certs", "isrgrootx1.pem")
            if os.path.exists(local_cert):
                ca_path = local_cert

        if ca_path and os.path.exists(ca_path):
            connect_args["ssl"] = {"ca": ca_path}
        elif os.getenv("VERCEL"):
            # On Vercel Linux, system CA bundle is at /etc/ssl/certs/ca-certificates.crt
            if os.path.exists("/etc/ssl/certs/ca-certificates.crt"):
                connect_args["ssl"] = {"ca": "/etc/ssl/certs/ca-certificates.crt"}

        if connect_args:
            engine_options["connect_args"] = connect_args

        if os.getenv("VERCEL"):
            from sqlalchemy.pool import NullPool
            engine_options["poolclass"] = NullPool

    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-secret-herhealth-360-production-platform-key-2026"),
        SQLALCHEMY_DATABASE_URI=db_url,
        SQLALCHEMY_ENGINE_OPTIONS=engine_options,
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
        # Support automatic Vercel preview and production domain
        vercel_url = os.getenv("VERCEL_URL")
        if vercel_url:
            origins_list.append(f"https://{vercel_url}")
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
