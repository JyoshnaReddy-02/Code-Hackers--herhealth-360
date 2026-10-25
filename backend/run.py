import os
from app import create_app, db

app = create_app()

with app.app_context():
    # Safely create all tables if they do not exist
    db.create_all()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    app.run(host=host, port=port, debug=debug)
