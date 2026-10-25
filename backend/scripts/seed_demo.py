import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Doctor, AvailabilitySlot, HealthResource, User, ExercisePractice

def seed_demo_data():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("[HerHealth 360] Starting database seed on E: drive...")

        # 1. Seed Demo User
        demo_user = User.query.filter_by(email="demo@herhealth360.internal").first()
        if not demo_user:
            demo_user = User(
                email="demo@herhealth360.internal",
                display_name="Priya Sharma (Demo Account)",
                date_of_birth="1996-05-14",
                life_stage="reproductive"
            )
            demo_user.set_password("HerHealthDemo2026!")
            db.session.add(demo_user)
            db.session.commit()
            print("[+] Seeded demo user: demo@herhealth360.internal")
        else:
            print("[*] Demo user already exists.")

        # 2. Seed Fictional Doctors
        fictional_doctors = [
            {
                "name": "Dr Ananya Rao",
                "email": "dr.ananya@herhealth360.internal",
                "specialty": "Gynecology and reproductive health education",
                "bio": "Fictional demo clinician specializing in menstrual disorders, PCOS management, and adolescent reproductive health education."
            },
            {
                "name": "Dr Meera Nair",
                "email": "dr.meera@herhealth360.internal",
                "specialty": "Obstetrics and maternal health education",
                "bio": "Fictional demo clinician focused on antenatal preparation, gestational wellness, and postpartum fourth-trimester recovery."
            },
            {
                "name": "Dr Kavya Iyer",
                "email": "dr.kavya@herhealth360.internal",
                "specialty": "Breast and cervical health education",
                "bio": "Fictional demo clinician passionate about preventive screening, Pap smears, HPV awareness, and breast self-awareness education."
            }
        ]

        doctors_created = []
        for d_info in fictional_doctors:
            doc = Doctor.query.filter_by(name=d_info["name"]).first()
            if not doc:
                doc = Doctor(
                    name=d_info["name"],
                    email=d_info["email"],
                    specialty=d_info["specialty"],
                    bio=d_info["bio"],
                    is_demo=True,
                    is_active=True
                )
                doc.set_password("DoctorDemo2026!")
                db.session.add(doc)
                db.session.flush()
                print(f"[+] Created fictional doctor: {doc.name}")
            else:
                doc.email = d_info["email"]
                doc.set_password("DoctorDemo2026!")
            doctors_created.append(doc)
        db.session.commit()

        # 3. Seed Availability Slots (for next 14 days)
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        total_slots_added = 0

        for doc in doctors_created:
            # Check existing upcoming slots
            existing_count = AvailabilitySlot.query.filter_by(doctor_id=doc.id).count()
            if existing_count < 10:
                for day_offset in range(1, 15):
                    slot_date = now + timedelta(days=day_offset)
                    # Skip Sundays
                    if slot_date.weekday() == 6:
                        continue
                    
                    # Add 2 slots per working day: 10:00 AM and 3:00 PM
                    for hour in [10, 15]:
                        start_time = slot_date.replace(hour=hour, minute=0)
                        end_time = start_time + timedelta(minutes=45)

                        # Check if exists
                        exists = AvailabilitySlot.query.filter_by(doctor_id=doc.id, start_time=start_time).first()
                        if not exists:
                            slot = AvailabilitySlot(
                                doctor_id=doc.id,
                                start_time=start_time,
                                end_time=end_time,
                                is_booked=False
                            )
                            db.session.add(slot)
                            total_slots_added += 1

        db.session.commit()
        print(f"[+] Seeded {total_slots_added} availability slots across fictional clinicians.")

        # 4. Seed Health Library Resources
        articles = [
            {
                "title": "PCOS & PCOD: Evidence-Based Guide to Hormonal Balance",
                "slug": "pcos-pcod-guide",
                "topic": "PCOS and PCOD",
                "life_stage": "Reproductive",
                "summary": "Understanding polycystic ovary syndrome, hormonal patterns, metabolic factors, and daily management.",
                "overview": (
                    "Polycystic Ovary Syndrome (PCOS) is one of the most common endocrine disorders affecting women of reproductive age worldwide. "
                    "Characterized by irregular ovulatory cycles, elevated androgens, and multiple small follicles on ovarian ultrasound, "
                    "it is closely tied to insulin resistance and lifestyle dynamics. Early recognition enables sustainable wellness strategies."
                ),
                "signs_and_symptoms": (
                    "• Irregular, infrequent, or absent periods (oligomenorrhea or amenorrhea)\n"
                    "• Excess facial or body hair (hirsutism)\n"
                    "• Persistent adult cystic acne along the jawline\n"
                    "• Hair thinning or androgenic alopecia\n"
                    "• Difficulty with weight management and insulin sensitivity"
                ),
                "when_to_seek_care": (
                    "• If your periods are absent for more than 3 consecutive months.\n"
                    "• When bleeding episodes are unusually heavy, prolonged (>7 days), or accompanied by severe fatigue.\n"
                    "• If you have been trying to conceive for 6 to 12 months without success.\n"
                    "• If you experience severe mood changes, anxiety, or depressive episodes."
                ),
                "self_care_info": (
                    "• Nutrition: Focus on whole, minimally processed foods, high dietary fiber, lean proteins, and complex low-GI carbs.\n"
                    "• Physical Movement: Blend progressive resistance training with steady-state cardio to improve cellular insulin sensitivity.\n"
                    "• Sleep & Stress: Maintain 7–8 hours of restorative sleep to regulate cortisol and morning fasting glucose.\n"
                    "• Tracking: Keep regular logs of cycle days and symptoms in HerHealth 360."
                ),
                "common_misconceptions": (
                    "• Myth: Having cysts on an ultrasound always means you have PCOS (false; cysts are immature follicles common in normal ovaries).\n"
                    "• Myth: Women with PCOS can never get pregnant (false; with medical and lifestyle guidance, many conceive naturally or with mild ovulatory support).\n"
                    "• Myth: PCOS only affects people who are overweight (false; 'lean PCOS' affects approximately 20-30% of diagnosed individuals)."
                ),
                "trusted_source": "World Health Organization (WHO) & NHS UK",
                "source_url": "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
                "last_reviewed": "2026-03-15"
            },
            {
                "title": "Endometriosis Awareness: Recognizing Chronic Pelvic Pain",
                "slug": "endometriosis-awareness",
                "topic": "Endometriosis",
                "life_stage": "Reproductive",
                "summary": "Exploring why painful periods are not just 'normal pain' and how endometriosis is diagnosed and managed.",
                "overview": (
                    "Endometriosis occurs when tissue similar to the lining of the uterus implants outside the uterine cavity, "
                    "commonly on the ovaries, fallopian tubes, and pelvic peritoneum. This tissue sheds with monthly hormonal changes, "
                    "causing chronic inflammation, intense pain, and progressive adhesions."
                ),
                "signs_and_symptoms": (
                    "• Severe, debilitating menstrual cramps (dysmenorrhea) unresponsive to simple analgesics\n"
                    "• Deep pelvic pain during or after sexual intercourse (dyspareunia)\n"
                    "• Pain with bowel movements or urination during menstrual bleeding\n"
                    "• Chronic non-cyclical lower back and pelvic aching\n"
                    "• Significant fatigue and gastrointestinal bloating"
                ),
                "when_to_seek_care": (
                    "• Menstrual pain forces you to miss work, school, or daily commitments.\n"
                    "• Over-the-counter pain medications fail to provide functional relief.\n"
                    "• Unexplained pelvic pain accompanied by gastrointestinal distress.\n"
                    "• Evaluation for subfertility or prolonged inability to conceive."
                ),
                "self_care_info": (
                    "• Targeted heat therapy: Warm baths or low-frequency heat wraps to ease pelvic floor muscle spasms.\n"
                    "• Pelvic physical therapy: Consultation with a specialized pelvic floor physical therapist.\n"
                    "• Anti-inflammatory dietary patterns rich in antioxidants, omega-3s, and magnesium.\n"
                    "• Gentle mind-body movement such as yin yoga and diaphragmatic breathing."
                ),
                "common_misconceptions": (
                    "• Myth: Extreme period pain is normal for all women (false; severe pain that disrupts life requires medical assessment).\n"
                    "• Myth: Hysterectomy is an absolute guaranteed cure for endometriosis (false; microscopic lesions outside the uterus can persist).\n"
                    "• Myth: Pregnancy automatically cures endometriosis (false; symptoms may pause during amenorrhea but often return)."
                ),
                "trusted_source": "WHO & American College of Obstetricians and Gynecologists (ACOG)",
                "source_url": "https://www.who.int/news-room/fact-sheets/detail/endometriosis",
                "last_reviewed": "2026-02-10"
            },
            {
                "title": "Cervical Cancer Prevention & The Vital Role of HPV Screening",
                "slug": "cervical-health-hpv",
                "topic": "Cervical cancer and HPV",
                "life_stage": "All",
                "summary": "How regular screening, HPV testing, and early vaccination make cervical cancer one of the most preventable conditions.",
                "overview": (
                    "Almost all cervical cancers are caused by persistent infection with high-risk strains of Human Papillomavirus (HPV). "
                    "Because precancerous cellular changes take 5 to 15 years to develop, timely Pap smears and HPV DNA testing "
                    "allow detection and curative treatment long before malignancy occurs."
                ),
                "signs_and_symptoms": (
                    "Early precancerous changes typically produce zero symptoms. Advanced changes may cause:\n"
                    "• Bleeding between normal menstrual cycles\n"
                    "• Vaginal bleeding after intercourse or pelvic exams\n"
                    "• Post-menopausal bleeding (any bleeding after menopause is an essential warning sign)\n"
                    "• Unusual, persistent watery or malodorous discharge"
                ),
                "when_to_seek_care": (
                    "• Any post-coital or intermenstrual bleeding.\n"
                    "• Any post-menopausal spotting or bleeding.\n"
                    "• If you have not undergone cervical screening within the past 3 to 5 years.\n"
                    "• Discussion regarding HPV vaccination eligibility."
                ),
                "self_care_info": (
                    "• Adhere strictly to national screening recommendations (starting at age 21–25 depending on local protocol).\n"
                    "• Receive the HPV vaccine if eligible (recommended for adolescents and young adults up to age 26, and selectively up to 45).\n"
                    "• Maintain barrier protection to lower transmission rates.\n"
                    "• Refrain from tobacco use, which significantly impairs the body's immune clearance of HPV."
                ),
                "common_misconceptions": (
                    "• Myth: Testing positive for HPV means you have cancer (false; most infections are cleared naturally by the immune system within 2 years).\n"
                    "• Myth: Women who have received the HPV vaccine do not need Pap tests (false; the vaccine protects against high-risk strains, but routine screening remains vital).\n"
                    "• Myth: Cervical cancer only affects older women (false; peak incidence of precancerous lesions occurs in reproductive years)."
                ),
                "trusted_source": "CDC Cervical Cancer & WHO Global Cervical Cancer Elimination Initiative",
                "source_url": "https://www.cdc.gov/cervical-cancer/",
                "last_reviewed": "2026-01-20"
            },
            {
                "title": "Breast Health & Systematic Self-Awareness",
                "slug": "breast-health-awareness",
                "topic": "Breast health",
                "life_stage": "All",
                "summary": "Understanding normal tissue changes, distinguishing benign cysts, and when to get clinical evaluation.",
                "overview": (
                    "Breast self-awareness is about knowing the normal terrain, texture, and hormonal fluctuations of your breast tissue. "
                    "While up to 80% of examined breast lumps in women under 50 are benign (such as cysts or fibroadenomas), "
                    "any new discrete lump or localized skin alteration warrants a clinical breast examination."
                ),
                "signs_and_symptoms": (
                    "• A distinct, firm lump or thickening differing from surrounding breast tissue\n"
                    "• Persistent swelling or skin dimpling (often resembling an orange peel texture)\n"
                    "• Nipple retraction, inversion, or spontaneous clear/bloody discharge\n"
                    "• Persistent localized pain or redness unconnected to the menstrual cycle"
                ),
                "when_to_seek_care": (
                    "• A new lump that remains firm and palpable through an entire menstrual cycle.\n"
                    "• Spontaneous unilateral nipple discharge.\n"
                    "• Skin puckering, scaling, or redness over the breast or underarm.\n"
                    "• Routine screening mammograms starting around age 40 (or earlier with high familial risk)."
                ),
                "self_care_info": (
                    "• Conduct gentle self-examinations 3 to 5 days after your period concludes, when tissue is least swollen.\n"
                    "• Wear well-fitting, supportive bras during high-impact exercise.\n"
                    "• Maintain moderate alcohol intake and regular cardiovascular fitness, both linked to lower breast risk."
                ),
                "common_misconceptions": (
                    "• Myth: Most breast lumps are cancerous (false; approximately 8 out of 10 lumps evaluated are completely benign).\n"
                    "• Myth: Painful breasts always indicate cancer (false; cyclical breast soreness is usually tied to progesterone and fluid retention).\n"
                    "• Myth: Family history is required to develop breast cancer (false; over 70% of diagnosed individuals have no family history)."
                ),
                "trusted_source": "NHS UK Conditions & CDC Breast Cancer Screening",
                "source_url": "https://www.nhs.uk/conditions/breast-lump/",
                "last_reviewed": "2026-03-01"
            },
            {
                "title": "Pregnancy & Antenatal Journey: Trimester-by-Trimester",
                "slug": "pregnancy-antenatal-guide",
                "topic": "Pregnancy and antenatal care",
                "life_stage": "Pregnancy & Postpartum",
                "summary": "Essential milestones, evidence-based nutrition, red-flag symptoms, and questions to ask your obstetrician.",
                "overview": (
                    "Antenatal care represents a collaborative partnership between an expectant mother and her healthcare team. "
                    "Monitoring blood pressure, gestational glucose, fetal growth, and maternal emotional wellness ensures "
                    "the safest possible pregnancy experience."
                ),
                "signs_and_symptoms": (
                    "• Common physiological changes: morning nausea, breast enlargement, increased urinary frequency, mild fatigue.\n"
                    "• Second trimester: emergence of fetal movements (quickening around weeks 18–22).\n"
                    "• Third trimester: Braxton Hicks contractions, mild ankle edema, and shortness of breath as the uterus expands."
                ),
                "when_to_seek_care": (
                    "• IMMEDIATE EMERGENCY: Vaginal bleeding, fluid leakage, severe abdominal pain, or sudden severe headache with blurry vision.\n"
                    "• Significant reduction or cessation of fetal kicks after 28 weeks.\n"
                    "• High fever (>38°C / 100.4°F) or painful burning urination.\n"
                    "• Uncontrollable nausea preventing any fluid retention for >24 hours."
                ),
                "self_care_info": (
                    "• Take prenatal vitamins containing 400–600 mcg of folic acid and elemental iron.\n"
                    "• Hydrate with 2.5–3 liters of water daily.\n"
                    "• Practice pelvic floor contractions (Kegels) and light walking with clinical approval.\n"
                    "• Sleep in the left lateral position during the late second and third trimesters to optimize placental perfusion."
                ),
                "common_misconceptions": (
                    "• Myth: Pregnant women need to 'eat for two' (false; caloric needs increase only by ~300-450 kcal/day in the 2nd and 3rd trimesters).\n"
                    "• Myth: Exercise is dangerous during pregnancy (false; moderate exercise supports blood sugar and cardiovascular stamina).\n"
                    "• Myth: Mild contractions are always labor (false; Braxton Hicks contractions are irregular practice contractions that do not dilate the cervix)."
                ),
                "trusted_source": "NHS Pregnancy Guide & Ministry of Health and Family Welfare (India)",
                "source_url": "https://www.nhs.uk/pregnancy/",
                "last_reviewed": "2026-02-28"
            },
            {
                "title": "Postpartum Recovery & The Vital Fourth Trimester",
                "slug": "postpartum-recovery-guide",
                "topic": "Postpartum recovery",
                "life_stage": "Pregnancy & Postpartum",
                "summary": "Healing after birth, managing lochia, navigating breastfeeding challenges, and caring for maternal mental health.",
                "overview": (
                    "The postpartum period encompasses the initial 12 weeks following childbirth, often referred to as the 'fourth trimester'. "
                    "Maternal recovery requires physiological healing of the uterus and perineum or surgical incision, hormonal adaptation, "
                    "and proactive emotional support."
                ),
                "signs_and_symptoms": (
                    "• Lochia (postpartum vaginal discharge progressing from red to pink to yellowish-white over 4–6 weeks)\n"
                    "• Uterine afterpains, especially during early breastfeeding sessions due to oxytocin release\n"
                    "• Breast engorgement and nipple sensitivity as milk matures\n"
                    "• 'Baby blues' (mood swings, tearfulness) typically lasting up to 10–14 days postpartum"
                ),
                "when_to_seek_care": (
                    "• EMERGENCY: Soaking more than one sanitary pad per hour or passing clots larger than a golf ball (Postpartum Hemorrhage).\n"
                    "• Fever >38°C, localized red tender area on the breast with body aches (Mastitis).\n"
                    "• Redness, swelling, or foul purulent drainage from a C-section or episiotomy incision.\n"
                    "• Intense feelings of despair, debilitating anxiety, or inability to care for self or infant lasting over two weeks."
                ),
                "self_care_info": (
                    "• Maximize horizontal rest and delegate non-essential household responsibilities.\n"
                    "• Use peri bottles with warm water after urination for perineal comfort.\n"
                    "• Eat warm, nutrient-dense foods rich in protein, iron, and zinc to rebuild maternal blood volume.\n"
                    "• Connect with certified lactation educators if breastfeeding is accompanied by severe nipple trauma or latch pain."
                ),
                "common_misconceptions": (
                    "• Myth: Postpartum depression is simply a personal weakness (false; it is a serious neurochemical and hormonal medical condition).\n"
                    "• Myth: Breastfeeding should always hurt (false; persistent pain usually indicates a shallow latch or anatomical restriction).\n"
                    "• Myth: You can't get pregnant while breastfeeding (false; ovulation can occur before your first postpartum period arrives)."
                ),
                "trusted_source": "WHO Maternal Health & NHS Postpartum Wellbeing",
                "source_url": "https://www.nhs.uk/conditions/baby/support-and-services/your-post-pregnancy-body/",
                "last_reviewed": "2026-03-10"
            },
            {
                "title": "Perimenopause & Menopause: Navigating Hormonal Transitions",
                "slug": "menopause-perimenopause-wellness",
                "topic": "Menopause and perimenopause",
                "life_stage": "Perimenopause & Menopause",
                "summary": "Understanding hot flashes, sleep disruption, bone health, cardiovascular changes, and therapy choices.",
                "overview": (
                    "Perimenopause represents the transitional years before menopause, characterized by fluctuating estrogen levels. "
                    "Menopause itself is officially reached when a woman has gone 12 consecutive months without a menstrual period. "
                    "Modern healthcare offers numerous evidence-based nutritional, lifestyle, and medical therapies to protect quality of life."
                ),
                "signs_and_symptoms": (
                    "• Variable cycle lengths (skipped periods, varying flow heaviness)\n"
                    "• Vasomotor symptoms (sudden heat surges, sweating, nocturnal flushing)\n"
                    "• Insomnia and disrupted sleep architecture\n"
                    "• Mood volatility, brain fog, and heightened anxiety\n"
                    "• Vaginal dryness and dyspareunia due to thinning uro-genital tissues"
                ),
                "when_to_seek_care": (
                    "• CRITICAL: Any vaginal bleeding that occurs AFTER menopause (12 months amenorrhea) requires prompt gynecological evaluation.\n"
                    "• Unusually heavy bleeding soaking through clothes during the perimenopause transition.\n"
                    "• Severe hot flashes that disable occupational or social daily functioning.\n"
                    "• Screening for osteoporosis and cardiovascular lipid profiles."
                ),
                "self_care_info": (
                    "• Implement progressive resistance training twice weekly to stimulate osteoblast activity and preserve lean muscle mass.\n"
                    "• Maintain adequate intake of calcium (1200 mg/day) and Vitamin D3 (800–1000 IU/day).\n"
                    "• Layer lightweight, natural-fiber clothing and minimize caffeine/alcohol triggers near bedtime.\n"
                    "• Consult your clinician regarding Menopausal Hormone Therapy (MHT) or non-hormonal prescription alternatives."
                ),
                "common_misconceptions": (
                    "• Myth: Menopause happens suddenly overnight (false; perimenopause can span 4 to 8 years before the final period).\n"
                    "• Myth: Hormone therapy is uniformly dangerous for all women (false; modern guidelines confirm benefits outweigh risks for most symptomatic women under 60).\n"
                    "• Myth: Once menopause occurs, sexual satisfaction ends (false; local estrogen treatments and lubricants effectively restore vaginal comfort)."
                ),
                "trusted_source": "North American Menopause Society (NAMS) & WHO Fact Sheets",
                "source_url": "https://www.who.int/news-room/fact-sheets/detail/menopause",
                "last_reviewed": "2026-03-20"
            },
            {
                "title": "Whole-Body Nutrition, Sleep Hygiene & Stress Physiology",
                "slug": "wellness-nutrition-sleep",
                "topic": "Nutrition, movement, sleep, and general wellness",
                "life_stage": "All",
                "summary": "Building foundational lifestyle resilience: circadian rhythm alignment, anti-inflammatory nutrition, and nervous system calm.",
                "overview": (
                    "Women's biological rhythms are cyclical and sensitive to metabolic cues, sleep regularity, and autonomic stress. "
                    "Focusing on foundational pillars—consistent circadian cues, nutrient-dense whole foods, and autonomic regulation— "
                    "substantially buffers against hormonal volatility across all life stages."
                ),
                "signs_and_symptoms": (
                    "• Common signs of autonomic overload: chronic mid-afternoon energy slumps, unrefreshing sleep, intense sugar cravings, irritability.\n"
                    "• Signs of circadian disruption: difficulty falling asleep before 1 AM, morning grogginess, digestive sluggishness."
                ),
                "when_to_seek_care": (
                    "• Severe chronic fatigue persisting longer than 6 weeks despite adequate time in bed.\n"
                    "• Unexplained weight loss or gain of more than 5 kg within 3 months.\n"
                    "• Persistent gastrointestinal pain or chronic insomnia unresponsive to sleep hygiene."
                ),
                "self_care_info": (
                    "• Morning natural sunlight exposure within 30 minutes of waking to anchor the master circadian pacemaker (SCN).\n"
                    "• Balance meals with the 3Ps: Protein, Produce (fiber), and Pure Healthy Fats to stabilize glucose.\n"
                    "• Digital sunset: Avoid blue-light screens 60 minutes prior to sleep to foster natural melatonin synthesis.\n"
                    "• Daily diaphragmatic breathing or physiological sighs (2 quick inhales, 1 long exhale) to downregulate sympathetic tone."
                ),
                "common_misconceptions": (
                    "• Myth: Extreme calorie restriction is the healthiest diet for women (false; severe restriction elevates cortisol and suppresses ovulatory hormones).\n"
                    "• Myth: Intense cardio is the only way to stay fit (false; over-training can induce hypothalamic amenorrhea; balanced movement is key).\n"
                    "• Myth: You can catch up on 5 days of sleep debt on Sunday (false; sleep regularity is crucial for endocrine stability)."
                ),
                "trusted_source": "NHS Live Well & India eSanjeevani Teleconsultation",
                "source_url": "https://esanjeevani.mohfw.gov.in/",
                "last_reviewed": "2026-03-25"
            },
            {
                "title": "Healthy Weight Management, Metabolism & Women's Fitness",
                "slug": "healthy-weight-metabolic-wellness",
                "topic": "Weight management, metabolic health, and physical fitness",
                "life_stage": "All",
                "summary": "Evidence-based strategies for sustainable fat loss, resting metabolic rate, hormonal insulin balance, and physical conditioning.",
                "overview": (
                    "Sustainable weight management in women centers on preserving metabolic health, supporting thyroid and insulin balance, "
                    "and maintaining lean skeletal muscle tissue. Restrictive starvation diets provoke compensatory cortisol and ghrelin surges. "
                    "In contrast, combining moderate aerobic intervals, resistance training, and nutrient-dense whole foods supports enduring body composition and vitality."
                ),
                "signs_and_symptoms": (
                    "• Common metabolic flags: mid-day lethargy, stubborn visceral weight retention, intense carbohydrate cravings, disrupted sleep.\n"
                    "• Hormonal interplay: Difficulty managing weight alongside irregular menstrual cycles may signal insulin resistance or PCOS."
                ),
                "when_to_seek_care": (
                    "• Rapid unexplained weight changes exceeding 4–5 kg within 6 weeks.\n"
                    "• Suspected insulin resistance (acanthosis nigricans, stubborn weight, polycystic ovaries).\n"
                    "• Chronic cold sensitivity, hair loss, and extreme fatigue (warrants thyroid profile: TSH, Free T3/T4).\n"
                    "• Joint or cardiovascular discomfort during low-intensity movement."
                ),
                "self_care_info": (
                    "• Exercise Synergy: Combine 150 minutes of moderate aerobic cardio weekly with 2–3 resistance/bodyweight sessions to boost metabolic rate.\n"
                    "• Satiety & Glucose: Anchor meals with 25–30g quality protein and high dietary fiber (legumes, vegetables, seeds) to stabilize insulin.\n"
                    "• Sleep Recovery: Prioritize 7–8 hours of restorative sleep to prevent hunger-stimulating ghrelin elevation.\n"
                    "• Sustainable Habits: Track progressive strength, stamina, and energy instead of fixating solely on scale fluctuations."
                ),
                "common_misconceptions": (
                    "• Myth: Women who lift weights will get bulky (false; women have lower testosterone; resistance builds lean, metabolically active tone).\n"
                    "• Myth: Skipping meals accelerates fat loss (false; skipping meals slows basal metabolic rate and prompts muscle catabolism).\n"
                    "• Myth: Spot-reduction of belly fat is possible (false; overall metabolic conditioning and calorie balance drive systemic fat loss)."
                ),
                "trusted_source": "WHO Physical Activity Guidelines & NHS Healthy Weight",
                "source_url": "https://www.nhs.uk/live-well/healthy-weight/",
                "last_reviewed": "2026-03-28"
            }
        ]

        for art_data in articles:
            existing_art = HealthResource.query.filter_by(slug=art_data["slug"]).first()
            if not existing_art:
                art = HealthResource(**art_data)
                db.session.add(art)
                print(f"[+] Added health library resource: {art.title}")
            else:
                for k, v in art_data.items():
                    setattr(existing_art, k, v)

        # 5. Seed Exercise Practices
        practices = [
            ExercisePractice(
                title='Low-Impact Fat Burn & Cardio for Beginners',
                category='Weight Loss & Metabolic Cardio',
                target_condition='Healthy Weight Loss & Calorie Burn',
                duration_minutes=25,
                difficulty='Gentle / Low Impact',
                description='Joint-friendly aerobic fat burning routine designed for steady calorie burn, cardiovascular endurance, and metabolic activation without harsh jumping.',
                instructions='Perform 40 seconds of movement followed by 20 seconds of rest. Includes gentle marching, side step jacks, knee drives, and standing boxing jabs. Maintain steady rhythmic breathing.',
                image_url='https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=gC_L9qAHVJ8',
                website_url='https://www.nhs.uk/live-well/exercise/running-and-aerobic-exercises/'
            ),
            ExercisePractice(
                title='Full-Body Strength & Bodyweight Conditioning for Fat Loss',
                category='Weight Loss & Strength Conditioning',
                target_condition='Lean Muscle Preservation & Basal Metabolic Rate (BMR) Boost',
                duration_minutes=20,
                difficulty='Moderate / No Equipment',
                description='Metabolic resistance sequence using bodyweight squats, lunges, and core stabilization to build lean muscle tone and accelerate fat burning.',
                instructions='Complete 3 rounds of: 12 bodyweight squats, 10 modified push-ups or wall planks, 12 glute bridges, and 30 seconds of high knees. Rest 45 seconds between rounds.',
                image_url='https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=UBMk30rjy0o',
                website_url='https://www.cdc.gov/physicalactivity/basics/adults/index.htm'
            ),
            ExercisePractice(
                title='Core & Full-Body HIIT for Active Weight Loss',
                category='Weight Loss & High-Energy HIIT',
                target_condition='Active Weight Loss & Abdominal Fat Reduction',
                duration_minutes=15,
                difficulty='Moderate / Active',
                description='High-energy fat-shredding routine targeting core stability and overall endurance to stimulate post-exercise metabolic burn.',
                instructions='Alternate between 30 seconds of dynamic core exercises (mountain climbers, Russian twists, bicycle crunches) and 15 seconds of rest. Stay hydrated and engage your core throughout.',
                image_url='https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=2MoGxae-zyo',
                website_url='https://www.who.int/news-room/fact-sheets/detail/physical-activity'
            ),
            ExercisePractice(
                title='PCOS & Hormonal Weight Management Gentle Interval Workout',
                category='Hormonal Weight Management',
                target_condition='Insulin Resistance & Stubborn Weight in PCOS',
                duration_minutes=20,
                difficulty='Mild / Cortisol-Conscious',
                description='Low-cortisol interval training formulated to improve insulin sensitivity and support steady fat loss for women with PCOS or thyroid concerns.',
                instructions='Perform slow, controlled tempo bodyweight movements (tempo squats, step-taps, wall sits). Avoid extreme breathlessness to prevent cortisol spikes that hinder fat loss.',
                image_url='https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=ml6cT4AZdqI',
                website_url='https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/treatment/'
            ),
            ExercisePractice(
                title='Pelvic Floor Kegels & Relaxation Therapy',
                category='Pelvic Health & Floor Restoration',
                target_condition='Postpartum Recovery & Incontinence Prevention',
                duration_minutes=12,
                difficulty='Gentle / Beginner',
                description='Physical therapist guided pelvic floor conditioning and release techniques for core stabilization.',
                instructions='Lie on your back with knees bent and feet flat. Inhale into the lower abdomen. On exhale, gently draw the pelvic floor inward and upward. Hold for 5 seconds, then fully release for 5 seconds.',
                image_url='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=2aEceax_be4',
                website_url='https://www.nhs.uk/conditions/pelvic-floor-exercises/'
            ),
            ExercisePractice(
                title='Restorative Yoga for Menstrual Cramps & PCOS',
                category='Menstrual Comfort & Cycle Syncing',
                target_condition='Dysmenorrhea & PCOS Pelvic Aches',
                duration_minutes=15,
                difficulty='Gentle / Restorative',
                description='Gentle postures including Reclined Butterfly and Supported Child’s Pose to release uterine tension.',
                instructions='Perform Child’s Pose (Balasana) with knees wide. Rest your forehead on a cushion. Breathe slowly into the lower back to relieve pelvic tension and encourage healthy ovarian blood flow.',
                image_url='https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=awrZtZ49_bg',
                website_url='https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome'
            ),
            ExercisePractice(
                title='Prenatal Diaphragmatic Breathing & Hip Mobility',
                category='Antenatal & Maternal Movement',
                target_condition='Pregnancy Back Tension & Labor Preparation',
                duration_minutes=15,
                difficulty='Mild / Prenatal Safe',
                description='Obstetric physical therapy sequence for ribcage mobility, pelvic stability, and calm breathing during pregnancy.',
                instructions='Sit tall with hands on your lower ribs. Inhale deeply, allowing ribs to expand 360 degrees sideways. Exhale smoothly while gently engaging the deep core. Avoid any breath holding.',
                image_url='https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=0cKnStmV1dI',
                website_url='https://www.acog.org/womens-health/faqs/exercise-during-pregnancy'
            ),
            ExercisePractice(
                title='Doctor Explains 11 Causes of Breast Pain & Warning Signs',
                category='Breast Health & Clinical Guidance',
                target_condition='Cyclic & Non-Cyclic Breast Pain (Mastalgia)',
                duration_minutes=12,
                difficulty='Educational / Clinical Guide',
                description='Specialist physician breakdown on cyclic breast tenderness, hormonal fluctuations, cysts, musculoskeletal triggers, and warning signs.',
                instructions='Learn how to differentiate cyclic hormonal tenderness from chest wall muscle strain. Note down whether your pain correlates with your cycle.',
                image_url='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=opVic1ubxu4',
                website_url='https://www.nhs.uk/conditions/breast-pain-mastalgia/'
            ),
            ExercisePractice(
                title='How to Check Your Breasts or Chest (Official NHS Guide)',
                category='Breast Health & Routine Awareness',
                target_condition='Routine Breast Self-Check & Lump Detection',
                duration_minutes=8,
                difficulty='Gentle / Self-Care',
                description='Official National Health Service (NHS) step-by-step tutorial on normal breast tissue terrain, looking and feeling for changes, and when to get evaluated.',
                instructions='Stand before a mirror with arms relaxed, then raised. Feel the entire breast tissue, underarm, and collarbone using the pads of your fingers. Check for any new lumps or skin dimpling.',
                image_url='https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=xcg7jWrlLJ8',
                website_url='https://www.nhs.uk/conditions/breast-lump/'
            ),
            ExercisePractice(
                title='Upper Body & Chest Wall Tension Relief Stretches',
                category='Upper Body Mobility & Pain Relief',
                target_condition='Chest Wall Strain & Musculoskeletal Pain Mimicking Breast Pain',
                duration_minutes=10,
                difficulty='Gentle / Restorative',
                description='Physiotherapist flow targeting pectoral muscles, neck, and upper spine to decompress chest wall tightness that frequently causes sharp radiating breast aches.',
                instructions='Perform doorway pectoral stretches, gentle neck rolls, and shoulder blade retractions. Breathe deeply into the upper chest to release muscle tension.',
                image_url='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=s-7lyvblFNI',
                website_url='https://www.nhs.uk/live-well/exercise/stretching/'
            ),
            ExercisePractice(
                title='Cervical Screening: How It\'s Done (Official NHS Guide)',
                category='Cervical Health & Preventive Care',
                target_condition='Pap Smear & HPV Screening Examination',
                duration_minutes=6,
                difficulty='Educational / Clinical Guide',
                description='Official National Health Service (NHS) demonstration of what happens during cervical screening (smear test) and why it saves lives.',
                instructions='Learn what to expect during a routine cervical screening appointment, how the speculum is used, and how cell samples are examined for HPV.',
                image_url='https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=OU7fZb_sTus',
                website_url='https://www.nhs.uk/conditions/cervical-screening/'
            ),
            ExercisePractice(
                title='Vagus Nerve Reset & Deep Sleep Downregulation',
                category='Mind-Body Wellness & Fatigue',
                target_condition='Hormonal Fatigue & Perimenopause Sleep Disruption',
                duration_minutes=20,
                difficulty='Relaxation / All Levels',
                description='Evidence-based non-sleep deep rest (NSDR) protocol to downregulate cortisol and support sleep quality.',
                instructions='Lie flat with a pillow under your head. Engage in 4-7-8 breathing (inhale 4 seconds, pause 7 seconds, exhale slowly for 8 seconds). Repeat for 4 cycles to stimulate the vagus nerve.',
                image_url='https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=inpok4MKVLM',
                website_url='https://www.cdc.gov/sleep/about/index.html'
            ),
            ExercisePractice(
                title='Pelvic Floor Gentle Release & Restorative Stretches for Endometriosis',
                category='Endometriosis & Chronic Pelvic Pain',
                target_condition='Endometriosis Pain & Deep Pelvic Spasm Relief',
                duration_minutes=15,
                difficulty='Gentle / Restorative',
                description='Specialized pelvic physical therapy postures (Supported Bridge, Reclined Cobbler, and Diaphragmatic Pelvic Release) to calm hypertonic pelvic floor muscles in endometriosis.',
                instructions='1. Recline onto a comfortable mat or cushion in Supta Baddha Konasana (Reclined Cobbler). 2. Place a hand on your lower belly and take slow, deep breaths, visualizing the pelvic floor dropping and releasing tension. 3. Transition into gentle Child’s Pose with knees wide. Hold each posture for 3–5 minutes.',
                image_url='https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=awrZtZ49_bg',
                website_url='https://www.who.int/news-room/fact-sheets/detail/endometriosis'
            ),
            ExercisePractice(
                title='10-Minute Morning Full-Body Mobility & Tension Release Routine',
                category='Daily Mobility & Morning Movement',
                target_condition='Joint Stiffness, Posture Realignment & Morning Energy',
                duration_minutes=10,
                difficulty='Gentle / All Levels',
                description='Complete full-body mobility flow designed to awaken stiff joints, lengthen the spine, and improve circulation upon waking.',
                instructions='1. Start with gentle neck rolls and shoulder shrugs. 2. Move into Cat-Cow stretches on all fours to mobilize the thoracic spine. 3. Step forward into a low lunge with side twist. 4. Stand tall for arm sweeps and deep morning breaths.',
                image_url='https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=g_tea8ZNk5A',
                website_url='https://www.nhs.uk/live-well/exercise/stretching/'
            ),
            ExercisePractice(
                title='15-Minute Gentle Stretch & Flexibility Routine for All Levels',
                category='Restorative Flexibility & Tension Relief',
                target_condition='Muscle Tension, Low Back Tightness & Relaxation',
                duration_minutes=15,
                difficulty='Gentle / Restorative',
                description='Floor-based whole body stretch targeting hamstrings, hips, upper back, and neck to soothe muscular fatigue.',
                instructions='Perform each stretch for 30 to 45 seconds without bouncing. Focus on relaxing your jaw and shoulders while exhaling into each stretch.',
                image_url='https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
                youtube_url='https://www.youtube.com/watch?v=L_xrDAtykMI',
                website_url='https://www.cdc.gov/physicalactivity/basics/adults/index.htm'
            )
        ]

        for p in practices:
            existing_p = ExercisePractice.query.filter_by(title=p.title).first()
            if not existing_p:
                db.session.add(p)
                print(f"[+] Added exercise practice routine: {p.title}")
            else:
                existing_p.category = p.category
                existing_p.target_condition = p.target_condition
                existing_p.duration_minutes = p.duration_minutes
                existing_p.difficulty = p.difficulty
                existing_p.description = p.description
                existing_p.instructions = p.instructions
                existing_p.image_url = p.image_url
                existing_p.youtube_url = p.youtube_url
                existing_p.website_url = p.website_url

        db.session.commit()
        print("[SUCCESS] Database seed successfully completed on E: drive!")

if __name__ == "__main__":
    seed_demo_data()
