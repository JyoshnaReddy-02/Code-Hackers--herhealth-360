import os
import sys
import json
import csv
import random
from datetime import datetime, timedelta, timezone

# Project paths on E: drive
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SYNTHETIC_DIR = os.path.join(PROJECT_ROOT, "data", "synthetic")

CATEGORIES_AND_SYMPTOMS = {
    "Menstrual": [
        ("Cramping / Dysmenorrhea", 3, 8, [1, 2, 3, 28]),
        ("Heavy Flow / Menorrhagia", 4, 9, [1, 2, 3]),
        ("Irregular Spotting", 2, 5, [14, 15, 20]),
        ("PMS Bloating", 2, 6, [24, 25, 26, 27]),
        ("Pelvic Heaviness", 2, 6, [1, 2, 28])
    ],
    "Pelvic or abdominal discomfort": [
        ("Lower Abdominal Aching", 3, 7, None),
        ("Right Lower Quadrant Twinge", 2, 5, [12, 13, 14]),
        ("Bowel Discomfort during Period", 4, 8, [1, 2]),
        ("Mild Pelvic Pressure", 2, 6, None)
    ],
    "Breast": [
        ("Cyclical Breast Tenderness", 2, 6, [21, 22, 23, 24, 25]),
        ("Mild Bilateral Soreness", 2, 5, [25, 26, 27]),
        ("Underarm Sensitivity", 1, 4, None)
    ],
    "Digestive": [
        ("Digestive Bloating", 2, 7, None),
        ("Mild Nausea", 2, 6, None),
        ("Constipation before cycle", 2, 5, [26, 27, 28]),
        ("Indigestion / Acid Reflux", 2, 5, None)
    ],
    "Fatigue and sleep": [
        ("Mid-Afternoon Slump", 3, 8, None),
        ("Difficulty Falling Asleep", 3, 7, None),
        ("Unrefreshing Sleep", 3, 8, None),
        ("General Physical Exhaustion", 4, 8, None)
    ],
    "Mood and well-being": [
        ("Heightened Anxiety", 3, 7, [25, 26, 27, 28]),
        ("Low Mood / Tearfulness", 3, 7, [26, 27, 28]),
        ("Irritability / Brain Fog", 2, 6, None),
        ("Restlessness", 2, 5, None)
    ],
    "Pregnancy-related observations": [
        ("Morning Nausea", 3, 7, None),
        ("Lower Back Soreness", 2, 6, None),
        ("Mild Ankle Edema", 1, 4, None)
    ],
    "Menopause-related observations": [
        ("Nocturnal Flushing / Heat Surge", 4, 8, None),
        ("Daytime Hot Flash", 3, 7, None),
        ("Sudden Sweating", 3, 6, None)
    ],
    "Other": [
        ("Tension Headache", 2, 7, None),
        ("Mild Dizziness on Standing", 2, 5, None),
        ("Muscle Aches", 2, 6, None)
    ]
}

ACTIVITY_LEVELS = ["Sedentary", "Light", "Moderate", "High"]
MOODS = ["Calm", "Anxious", "Low", "Energetic", "Irritable", "Balanced"]
SAMPLE_TRIGGERS = [
    "High stress workday",
    "Poor sleep previous night",
    "Skipped breakfast",
    "High sodium dinner",
    "Intense physical exertion",
    "Caffeine late afternoon",
    "Weather change",
    "None identified"
]

SAMPLE_NOTES = [
    "Felt mild discomfort after sitting for extended periods.",
    "Warm tea and resting in the evening helped soothe the ache.",
    "Noticeable relief after gentle walking and stretching.",
    "Coincides with expected luteal phase hormonal shifts.",
    "Symptoms subsided after adequate hydration and early bedtime.",
    "Mild intensity, did not interfere with daily routine.",
    "Noted following an unusually demanding deadline.",
    "Comfortably managed with a heating pad on lower abdomen."
]

def generate_synthetic_dataset(count=300, seed=42):
    random.seed(seed)
    os.makedirs(SYNTHETIC_DIR, exist_ok=True)

    base_date = datetime(2026, 1, 1, 8, 0, 0, tzinfo=timezone.utc)
    records = []

    categories = list(CATEGORIES_AND_SYMPTOMS.keys())

    for i in range(1, count + 1):
        # Spread observations across 90 days
        day_offset = random.randint(0, 90)
        hour_offset = random.randint(7, 21)
        minute_offset = random.choice([0, 15, 30, 45])
        rec_time = base_date + timedelta(days=day_offset, hours=hour_offset, minutes=minute_offset)

        category = random.choice(categories)
        symptom_choices = CATEGORIES_AND_SYMPTOMS[category]
        symptom_item = random.choice(symptom_choices)
        symptom_name, min_s, max_s, possible_days = symptom_item

        severity = random.randint(min_s, max_s)
        duration_hours = round(random.choice([0.5, 1.0, 2.0, 3.5, 5.0, 8.0]), 1)
        cycle_day = random.choice(possible_days) if possible_days else (random.randint(1, 28) if category == "Menstrual" else None)

        record = {
            "synthetic_id": f"SYN-{i:04d}",
            "is_synthetic": True,
            "recorded_at": rec_time.isoformat(),
            "category": category,
            "symptom_name": symptom_name,
            "severity": severity,
            "duration_hours": duration_hours,
            "cycle_day": cycle_day,
            "sleep_quality": random.randint(1, 5),
            "fatigue_level": random.randint(1, 5),
            "activity_level": random.choice(ACTIVITY_LEVELS),
            "mood": random.choice(MOODS),
            "triggers": random.choice(SAMPLE_TRIGGERS),
            "notes": random.choice(SAMPLE_NOTES)
        }
        records.append(record)

    # Sort chronologically
    records.sort(key=lambda r: r["recorded_at"])

    # 1. Save JSON
    json_path = os.path.join(SYNTHETIC_DIR, "synthetic_symptoms.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    # 2. Save CSV
    csv_path = os.path.join(SYNTHETIC_DIR, "synthetic_symptoms.csv")
    fieldnames = list(records[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"[SUCCESS] Successfully generated {len(records)} synthetic symptom observations.")
    print(f"    JSON saved to: {json_path}")
    print(f"    CSV saved to:  {csv_path}")
    return records

if __name__ == "__main__":
    generate_synthetic_dataset(count=300, seed=42)
