from flask import Blueprint, request, jsonify
from ..models import HealthResource

resources_bp = Blueprint("resources", __name__, url_prefix="/api/v1")

@resources_bp.route("/health-topics", methods=["GET"])
def get_topics():
    topics = [
        {"id": "menstrual", "title": "Menstrual Health & Cycle Tracking", "description": "Normal cycles, tracking changes, cramps, and hormone phases."},
        {"id": "pcos_pcod", "title": "PCOS & PCOD", "description": "Hormone balance, insulin resistance, ovulation, and lifestyle strategies."},
        {"id": "endometriosis", "title": "Endometriosis & Pelvic Discomfort", "description": "Recognizing chronic symptoms, staging, and evidence-based management."},
        {"id": "fertility", "title": "Fertility & Reproductive Health", "description": "Ovulation tracking, preconception health, and reproductive wellness."},
        {"id": "breast_health", "title": "Breast Health & Self-Awareness", "description": "Breast awareness, benign lumps, screening guidelines, and clinical checks."},
        {"id": "cervical_hpv", "title": "Cervical Cancer & HPV Screening", "description": "HPV vaccination, Pap smears, cervical changes, and early detection."},
        {"id": "pregnancy", "title": "Pregnancy & Antenatal Care", "description": "Trimester guides, nutrition, warning signs, and clinician questions."},
        {"id": "postpartum", "title": "Postpartum Recovery & Care", "description": "Fourth trimester healing, mental health, breastfeeding, and red flags."},
        {"id": "menopause", "title": "Menopause & Perimenopause", "description": "Hormone transitions, vasomotor symptoms, bone health, and therapy options."},
        {"id": "wellness", "title": "Nutrition, Sleep & Mind-Body Wellness", "description": "Holistic self-care, physical movement, stress regulation, and sleep hygiene."}
    ]
    return jsonify({"topics": topics}), 200

@resources_bp.route("/resources", methods=["GET"])
def get_resources():
    query = HealthResource.query
    
    topic = request.args.get("topic")
    if topic:
        query = query.filter(HealthResource.topic.ilike(f"%{topic}%"))

    life_stage = request.args.get("life_stage")
    if life_stage and life_stage.lower() != "all":
        query = query.filter(HealthResource.life_stage.ilike(f"%{life_stage}%"))

    search = request.args.get("search")
    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            (HealthResource.title.ilike(s_term)) | 
            (HealthResource.summary.ilike(s_term)) |
            (HealthResource.overview.ilike(s_term))
        )

    articles = query.all()
    return jsonify({
        "count": len(articles),
        "resources": [a.to_dict() for a in articles]
    }), 200

@resources_bp.route("/resources/<slug_or_id>", methods=["GET"])
def get_resource(slug_or_id):
    if slug_or_id.isdigit():
        article = HealthResource.query.get(int(slug_or_id))
    else:
        article = HealthResource.query.filter_by(slug=slug_or_id).first()

    if not article:
        return jsonify({"error": "Educational resource not found."}), 404

    return jsonify({"resource": article.to_dict()}), 200

@resources_bp.route("/mothercare", methods=["GET"])
def get_mothercare_resources():
    articles = HealthResource.query.filter(
        (HealthResource.topic.ilike("%pregnancy%")) | 
        (HealthResource.topic.ilike("%postpartum%")) |
        (HealthResource.life_stage.ilike("%pregnancy%"))
    ).all()
    return jsonify({
        "title": "MotherCare — Pregnancy & Postpartum Education",
        "description": "Evidence-based maternal education supporting you through antenatal care and fourth trimester recovery.",
        "disclaimer": "MotherCare is educational and does not replace regular antenatal checkups or professional clinical assessments.",
        "resources": [a.to_dict() for a in articles]
    }), 200

@resources_bp.route("/wellness", methods=["GET"])
def get_wellness_resources():
    articles = HealthResource.query.filter(
        (HealthResource.topic.ilike("%wellness%")) |
        (HealthResource.topic.ilike("%nutrition%")) |
        (HealthResource.topic.ilike("%lifestyle%"))
    ).all()
    return jsonify({
        "title": "Whole-Body Wellness & Lifestyle Guidance",
        "disclaimer": "Educational wellness resources. Always speak with your doctor before starting new vigorous exercise or dietary programs.",
        "resources": [a.to_dict() for a in articles]
    }), 200

@resources_bp.route("/exercises", methods=["GET"])
def get_public_exercises():
    from ..models import ExercisePractice
    category = request.args.get("category")
    query = ExercisePractice.query
    if category and category.lower() != "all":
        query = query.filter(ExercisePractice.category.ilike(f"%{category}%"))
    exercises = query.order_by(ExercisePractice.created_at.desc()).all()
    return jsonify({
        "exercises": [ex.to_dict() for ex in exercises]
    }), 200
