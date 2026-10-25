import os
import sys

# Cache and temporary file paths on E: drive for local development
if os.name == "nt" and os.path.exists("E:\\herhealth-360"):
    os.environ.setdefault("PYTHONPYCACHEPREFIX", "E:\\herhealth-360\\.cache\\python")
    os.environ.setdefault("TEMP", "E:\\herhealth-360\\.tmp")
    os.environ.setdefault("TMP", "E:\\herhealth-360\\.tmp")

from app import create_app, db

app = create_app()

with app.app_context():
    try:
        # Safely create all tables if they do not exist
        db.create_all()
    except Exception as e:
        print(f"[HerHealth 360 Notice] Table initialization status: {e}")

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host=host, port=port, debug=debug)
