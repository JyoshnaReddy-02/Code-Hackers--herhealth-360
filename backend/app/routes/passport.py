from datetime import datetime
from flask import Blueprint, request, jsonify, g, send_file
from ..models import SymptomEntry, Appointment
from ..security import require_auth
from ..services.pdf_generator import generate_health_passport_pdf

passport_bp = Blueprint("passport", __name__, url_prefix="/api/v1/health-passport.pdf")

@passport_bp.route("", methods=["GET"])
@require_auth
def download_health_passport():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    # Filter strictly for authenticated user
    symptom_query = SymptomEntry.query.filter_by(user_id=g.current_user.id)
    if start_date:
        try:
            s_dt = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            symptom_query = symptom_query.filter(SymptomEntry.recorded_at >= s_dt)
        except ValueError:
            pass

    if end_date:
        try:
            e_dt = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            symptom_query = symptom_query.filter(SymptomEntry.recorded_at <= e_dt)
        except ValueError:
            pass

    symptoms = symptom_query.order_by(SymptomEntry.recorded_at.desc()).all()
    appointments = Appointment.query.filter_by(user_id=g.current_user.id).order_by(Appointment.appointment_time.desc()).all()

    try:
        pdf_path = generate_health_passport_pdf(
            user=g.current_user,
            symptoms=symptoms,
            appointments=appointments,
            start_date=start_date,
            end_date=end_date
        )

        return send_file(
            pdf_path,
            as_attachment=True,
            download_name="HerHealth360_Personal_Health_Passport.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate Personal Health Passport: {str(e)}"}), 500
