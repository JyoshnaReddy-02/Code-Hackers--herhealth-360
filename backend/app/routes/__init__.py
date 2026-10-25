from .health import health_bp
from .auth import auth_bp
from .profile import profile_bp
from .symptoms import symptoms_bp
from .analytics import analytics_bp
from .doctors import doctors_bp
from .appointments import appointments_bp
from .navigator import navigator_bp
from .resources import resources_bp
from .passport import passport_bp
from .doctor_portal import doctor_portal_bp
from .admin import admin_bp

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(symptoms_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(navigator_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(passport_bp)
    app.register_blueprint(doctor_portal_bp)
    app.register_blueprint(admin_bp)
