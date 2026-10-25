import os
import sys

# Ensure backend directory is in sys.path so app modules can be loaded
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(base_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

# Vercel Python Serverless runtime entrypoint
app = create_app()
