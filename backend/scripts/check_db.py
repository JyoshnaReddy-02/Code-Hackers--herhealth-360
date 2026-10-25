"""
HerHealth 360 - Database Connectivity & Health Diagnostics
Checks database engine, connection status, table row counts, and cloud/local readiness.
Never exposes database passwords in logs or terminal output.
"""

import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app, db
from app.models import User, Doctor, AvailabilitySlot, Appointment, SymptomEntry, HealthResource, ExercisePractice

def check_database():
    print("=" * 65)
    print(" HerHealth 360 — Database Diagnostics")
    print("=" * 65)

    app = create_app()
    with app.app_context():
        raw_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        
        # Mask password securely
        masked_uri = raw_uri
        if "@" in raw_uri and ":" in raw_uri.split("@")[0]:
            parts = raw_uri.split("@")
            user_part = parts[0].split(":")[0] + ":" + parts[0].split(":")[1]
            masked_uri = f"{user_part}:****@{parts[1]}"

        print(f" Configured URI : {masked_uri}")

        engine_name = db.engine.name if hasattr(db, "engine") and db.engine else "unknown"
        print(f" Engine Type    : {engine_name.upper()}")

        # Check CA Certificate if MySQL / TiDB
        if "mysql" in raw_uri.lower():
            ca_path = os.getenv("TIDB_CA_PATH") or os.getenv("MYSQL_SSL_CA") or os.path.join(backend_dir, "certs", "isrgrootx1.pem")
            if os.path.exists(ca_path):
                print(f" TLS CA Cert    : OK ({ca_path})")
            else:
                print(f" TLS CA Cert    : NOT FOUND at {ca_path}")

        try:
            db.session.execute(db.text("SELECT 1"))
            print(" Connection     : OK (Connected successfully)")
        except Exception as e:
            err_str = str(e)
            if "1045" in err_str:
                print(" Connection     : AUTHENTICATION FAILED (Error 1045)")
                print("   [!] The username or password in backend/.env was rejected.")
                print("   [!] Tip: If your password contains special characters (e.g. @, :, /, #), make sure to URL-encode them.")
            elif "2003" in err_str or "timeout" in err_str.lower():
                print(" Connection     : NETWORK TIMEOUT / UNREACHABLE (Error 2003)")
                print("   [!] Could not reach the TiDB Cloud gateway. Check your internet connection or cluster status.")
            else:
                # Sanitize error to avoid printing any raw credentials
                print(f" Connection     : FAILED ({e.__class__.__name__})")
                print(f"   [!] Details: {err_str[:200]}")
            return False

        print("-" * 65)
        print(" Table Record Counts:")
        try:
            print(f"   • Users               : {User.query.count()}")
            print(f"   • Clinicians / Doctors: {Doctor.query.count()}")
            print(f"   • Availability Slots  : {AvailabilitySlot.query.count()}")
            print(f"   • Appointments        : {Appointment.query.count()}")
            print(f"   • Symptom Logs        : {SymptomEntry.query.count()}")
            print(f"   • Educational Topics  : {HealthResource.query.count()}")
            print(f"   • Exercise Practices  : {ExercisePractice.query.count()}")
        except Exception as e:
            print(f"   [!] Tables not created yet in this database: {e.__class__.__name__}")
            print("   [!] (When ready, run python backend/run.py to create initial schema, or migrate SQLite data)")

        print("=" * 65)
        if engine_name == "mysql":
            if "tidbcloud.com" in raw_uri:
                print(" Status: Connected to TiDB Cloud Serverless (Shared Data Mode ACTIVE!).")
            elif "localhost" in raw_uri or "127.0.0.1" in raw_uri:
                print(" Status: Connected to LOCAL MySQL database.")
            else:
                print(" Status: Connected to Cloud MySQL.")
        else:
            print(" Status: Running on local SQLite database backup.")
        print("=" * 65)
        return True

if __name__ == "__main__":
    check_database()
