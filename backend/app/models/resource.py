from . import db

class HealthResource(db.Model):
    __tablename__ = "health_resources"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    topic = db.Column(db.String(100), nullable=False, index=True)
    life_stage = db.Column(db.String(100), default="All", nullable=False)
    summary = db.Column(db.Text, nullable=False)
    overview = db.Column(db.Text, nullable=False)
    signs_and_symptoms = db.Column(db.Text, nullable=True)
    when_to_seek_care = db.Column(db.Text, nullable=False)
    self_care_info = db.Column(db.Text, nullable=False)
    common_misconceptions = db.Column(db.Text, nullable=True)
    trusted_source = db.Column(db.String(255), nullable=False)
    source_url = db.Column(db.String(500), nullable=False)
    last_reviewed = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "topic": self.topic,
            "life_stage": self.life_stage,
            "summary": self.summary,
            "overview": self.overview,
            "signs_and_symptoms": self.signs_and_symptoms,
            "when_to_seek_care": self.when_to_seek_care,
            "self_care_info": self.self_care_info,
            "common_misconceptions": self.common_misconceptions,
            "trusted_source": self.trusted_source,
            "source_url": self.source_url,
            "last_reviewed": self.last_reviewed,
            "disclaimer": "This information is educational and does not constitute medical diagnosis or individual clinical advice."
        }
