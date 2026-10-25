import re
from typing import Dict, Any, List

# Conservative list of critical emergency indicators
RED_FLAG_PATTERNS = [
    r"\b(severe|excruciating|unbearable|sudden sharp)\s+(pain|cramp|abdominal pain|pelvic pain|chest pain)\b",
    r"\b(soaking|soaked)\s+(more than\s+)?(two|2)\s+(pads|tampons)\s+(an|per)\s+hour\b",
    r"\b(heavy bleeding|hemorrhage|bleeding)\s+.*(faint|passed out|dizzy|collapse|pale|weakness|breathless)\b",
    r"\b(faint|fainting|blackout|unconscious)\b",
    r"\b(shortness of breath|difficulty breathing|cannot breathe|struggling to breathe)\b",
    r"\b(pregnant|pregnancy)\s+.*(severe headache|blurred vision|seeing spots|swelling in face|decreased movement|no movement|fluid leak|bleeding)\b",
    r"\b(high fever)\s+.*(stiff neck|confusion|seizure)\b",
    r"\b(coughing blood|vomiting blood)\b",
    r"\b(suicid|kill myself|end my life|self harm)\b"
]

TOPIC_RULES = [
    {
        "id": "pcos_pcod",
        "title": "PCOS & PCOD (Polycystic Ovary Syndrome)",
        "keywords": ["pcos", "pcod", "irregular period", "missed period", "facial hair", "hirsutism", "cystic acne", "ovarian cyst", "androgen", "insulin resistance"],
        "category": "Reproductive & Endocrine Health",
        "educational_summary": (
            "Polycystic Ovary Syndrome (PCOS) is a common hormonal condition affecting women of reproductive age. "
            "It often involves irregular menstrual cycles, excess androgen levels (which may cause hirsutism or acne), "
            "and multifollicular ovaries on ultrasound. Managing PCOS focuses on hormonal balance, lifestyle, and individualized medical support."
        ),
        "when_to_seek_care": [
            "Periods are absent for more than 3 consecutive months without pregnancy.",
            "Excessive, prolonged menstrual bleeding lasting over 7 days.",
            "Signs of insulin resistance or metabolic concerns.",
            "Difficulty conceiving after 6–12 months of trying."
        ],
        "self_care_tips": [
            "Adopt a balanced whole-foods eating pattern with low glycemic index carbohydrates and adequate protein.",
            "Engage in regular physical activity (combination of moderate aerobic movement and resistance training).",
            "Prioritize consistent 7–8 hours of quality sleep to support insulin and cortisol balance.",
            "Keep a symptom and menstrual cycle log to share with your gynecologist or endocrinologist."
        ],
        "trusted_sources": [
            {"title": "WHO Fact Sheet: Polycystic Ovary Syndrome", "url": "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome"},
            {"title": "NHS Overview: Polycystic Ovary Syndrome", "url": "https://www.nhs.uk/conditions/polycystic-ovary-syndrome-pcos/"}
        ],
        "related_slug": "pcos-pcod-guide",
        "suggested_specialty": "Gynecology and reproductive health education"
    },
    {
        "id": "endometriosis",
        "title": "Endometriosis & Chronic Pelvic Discomfort",
        "keywords": ["endometriosis", "severe cramps", "pelvic pain", "painful period", "dysmenorrhea", "pain during sex", "painful bowel", "chronic pelvic"],
        "category": "Reproductive Health",
        "educational_summary": (
            "Endometriosis occurs when tissue similar to the lining of the uterus grows outside the uterus, causing inflammation, pain, "
            "and sometimes scar tissue. It is a recognized medical condition and should not be dismissed as 'just ordinary period pain'."
        ),
        "when_to_seek_care": [
            "Pelvic pain that significantly disrupts work, school, or daily activities.",
            "Painful periods that do not respond to common over-the-counter pain relief.",
            "Pain during intercourse, urination, or bowel movements during menstruation.",
            "Unexplained difficulty becoming pregnant."
        ],
        "self_care_tips": [
            "Use gentle pelvic heat application (warm water bottle or heating pad) to relax uterine muscles.",
            "Incorporate gentle mobility, pelvic floor stretches, and restorative movement.",
            "Maintain an anti-inflammatory dietary pattern rich in omega-3 fatty acids, fruits, and leafy greens.",
            "Log pain episodes noting exact cycle timing, intensity, and duration."
        ],
        "trusted_sources": [
            {"title": "WHO Fact Sheet: Endometriosis", "url": "https://www.who.int/news-room/fact-sheets/detail/endometriosis"},
            {"title": "NHS Health Conditions: Endometriosis", "url": "https://www.nhs.uk/conditions/endometriosis/"}
        ],
        "related_slug": "endometriosis-awareness",
        "suggested_specialty": "Gynecology and reproductive health education"
    },
    {
        "id": "cervical_hpv",
        "title": "Cervical Health & HPV Prevention",
        "keywords": ["cervical", "cervix", "hpv", "pap smear", "pap test", "post coital bleeding", "bleeding after sex", "abnormal discharge", "cervical cancer"],
        "category": "Preventive Screening",
        "educational_summary": (
            "Cervical health is closely linked with Human Papillomavirus (HPV), a very common infection. "
            "Most HPV infections clear on their own, but high-risk strains can cause cellular changes over years. "
            "Regular screening (Pap tests or HPV DNA tests) and HPV vaccination are highly effective preventive tools."
        ),
        "intents": {
            "definition": {
                "title": "What is Cervical Cancer: Clinical Definition & Anatomy",
                "educational_summary": (
                    "Cervical cancer is a malignancy that develops in the tissues of the cervix—the lower, narrow cylinder of the uterus that connects directly to the vagina (the birth canal).\n\n"
                    "It most commonly originates in the 'transformation zone', the dynamic microscopic junction where the squamous cells of the outer cervix meet the glandular mucus-producing cells of the inner endocervical canal.\n\n"
                    "Key Classifications:\n"
                    "• Squamous Cell Carcinoma (~85% to 90% of cases): Develops from the outer squamous epithelium.\n"
                    "• Adenocarcinoma (~10% to 15% of cases): Arises from the mucus-secreting endocervical glandular cells.\n\n"
                    "Unlike many other malignancies, cervical cancer develops unusually slowly over 10 to 15–20 years from identifiable pre-cancerous lesions (cervical dysplasia), making it one of the most preventable and curable cancers in the world when screened regularly."
                ),
                "key_insights": [
                    "Anatomy: Arises in the cervix, specifically at the transformation zone where outer squamous and inner glandular cells meet.",
                    "Primary Types: Squamous cell carcinoma (85–90%) and adenocarcinoma (10–15%).",
                    "Precancerous Window: Takes 10 to 20 years to evolve from abnormal dysplasia (CIN 1–3) into invasive cancer.",
                    "Curability: When detected early via routine screening, 5-year survival rates exceed 92%."
                ]
            },
            "occurrence_causes": {
                "title": "How Cervical Cancer Occurs: HPV Mechanism, Progression & Causes",
                "educational_summary": (
                    "Cervical cancer occurs primarily through persistent infection with oncogenic (cancer-causing) strains of the Human Papillomavirus (HPV), most commonly HPV types 16 and 18, which account for over 70% of all cervical cancer cases worldwide.\n\n"
                    "Biological Progression (How it Occurs Step-by-Step):\n"
                    "1. Initial HPV Infection: High-risk HPV is transmitted through intimate skin-to-skin sexual contact. In roughly 90% of healthy women, the immune system successfully suppresses and clears the virus within 1 to 2 years without lasting cellular damage.\n\n"
                    "2. Viral Persistence & DNA Integration: In a subset of women where the virus is not cleared, high-risk HPV establishes a persistent infection in the basal cells of the cervical transformation zone. The viral genome integrates into the human host cell chromosome.\n\n"
                    "3. Oncoprotein Activation (E6 and E7): Integrated HPV produces two active viral oncoproteins known as E6 and E7. Oncoprotein E6 binds to and degrades the human p53 tumor-suppressor protein, while E7 inactivates the retinoblastoma (pRb) tumor-suppressor protein. Without these guardian proteins, cervical cells lose their natural ability to repair DNA damage or undergo programmed cell death (apoptosis).\n\n"
                    "4. Precancerous Dysplasia (CIN 1, 2, 3): Unchecked cellular proliferation causes progressive histological changes called Cervical Intraepithelial Neoplasia (CIN). CIN 1 (mild dysplasia) may regress, but CIN 2 and CIN 3 (moderate to severe dysplasia / carcinoma in situ) involve the full thickness of the cervical epithelium.\n\n"
                    "5. Invasive Carcinoma: Over 10 to 15–20 years, if untreated by screening, malignant cells break through the cervical basement membrane, invading blood vessels and lymph channels to become invasive cervical cancer.\n\n"
                    "Major Contributing Co-Factors:\n"
                    "• Tobacco Smoking: By-products of tobacco concentrate in cervical mucus, impairing local immune cells and doubling the risk of progression.\n"
                    "• Immunocompromise: Women living with HIV or on immunosuppressive medications have reduced capacity to clear HPV.\n"
                    "• Lack of Routine Screening: The single greatest factor in late-stage occurrence is missing routine Pap smear or HPV DNA screening intervals."
                ),
                "key_insights": [
                    "Primary Cause: Persistent infection with high-risk oncogenic HPV (especially types 16 and 18).",
                    "Oncoprotein Mechanism: Viral E6 and E7 oncoproteins disable human p53 and pRb tumor suppressors, triggering uncontrolled cell division.",
                    "Dysplasia Continuum: Progresses through Cervical Intraepithelial Neoplasia (CIN 1 -> CIN 2 -> CIN 3) over 10 to 20 years.",
                    "Invasion: Cancer only occurs when dysplastic cells break through the epithelial basement membrane into surrounding stroma.",
                    "Accelerating Factors: Cigarette smoking (carcinogens in cervical mucus), immune suppression, and lack of screening."
                ]
            },
            "symptoms": {
                "title": "Cervical Cancer Symptoms: Warning Signs & Clinical Indicators",
                "educational_summary": (
                    "In its earliest precancerous and early invasive stages, cervical cancer typically produces ZERO noticeable symptoms. Symptoms typically appear only after malignant cells invade deeper cervical stromal tissues.\n\n"
                    "Characteristic Clinical Symptoms:\n"
                    "• Abnormal Vaginal Bleeding: Bleeding between menstrual cycles, bleeding after sexual intercourse (post-coital bleeding), or bleeding after douching or pelvic examination.\n"
                    "• Post-Menopausal Bleeding: Any vaginal spotting or bleeding occurring after menopause has been established is an essential red-flag sign.\n"
                    "• Unusual Vaginal Discharge: Watery, pale, pink, brown, or foul-smelling continuous discharge.\n"
                    "• Pain During Intercourse (Dyspareunia): Pain or deep pelvic aching during or following sexual contact.\n"
                    "• Advanced Symptoms: Unexplained pelvic or lower back aching, leg swelling, or difficulties with urination or bowel movements."
                ),
                "key_insights": [
                    "Silent Early Phase: Precancerous lesions (CIN) and microinvasive disease rarely produce any pain or bleeding.",
                    "Hallmark Sign: Bleeding after sexual intercourse (post-coital bleeding) or spotting between periods.",
                    "Post-Menopausal Alert: Any bleeding after menopause warrants urgent clinical investigation.",
                    "Importance of Pap Smear: Because early stages are symptomless, screening is essential before symptoms manifest."
                ]
            },
            "prevention": {
                "title": "Cervical Cancer Prevention: Vaccines, Screening & Guidelines",
                "educational_summary": (
                    "Cervical cancer is unique because it is almost entirely preventable through a combination of prophylactic vaccination and routine screening.\n\n"
                    "Primary Prevention Tools:\n"
                    "1. HPV Vaccination (Gardasil 9): Protects against 9 high-risk HPV types (including 16, 18, 31, 33, 45, 52, 58) that cause over 90% of cervical cancers. Recommended for adolescents aged 9–14 (2 doses) and young adults up to 26 (3 doses), and selectively up to age 45.\n"
                    "2. Routine Cervical Screening: High-risk HPV DNA testing and Pap cytology detect pre-cancerous cellular changes 5 to 15 years before cancer develops, allowing curative clinic-based removal.\n"
                    "3. Barrier Protection: Consistent condom use reduces HPV transmission by up to 70%.\n"
                    "4. Tobacco Cessation: Quitting smoking restores cervical mucosal immunity and accelerates natural HPV clearance."
                ),
                "key_insights": [
                    "HPV Vaccine: Prevents over 90% of cervical cancers when administered before HPV exposure.",
                    "Screening Frequency: Every 3 years for Pap cytology (ages 21-29), or every 5 years for HPV DNA / co-testing (ages 30-65).",
                    "Smoking Cessation: Significantly boosts the body's natural immune clearance of transient HPV infections.",
                    "Barrier Methods: Regular condom use lowers transmission rates and protects against co-infections."
                ]
            }
        },
        "when_to_seek_care": [
            "Bleeding between periods or after sexual intercourse.",
            "Unexplained post-menopausal vaginal bleeding.",
            "Persistent, foul-smelling or unusual vaginal discharge.",
            "Due for routine cervical screening (every 3 to 5 years depending on age and clinical guidelines)."
        ],
        "self_care_tips": [
            "Ensure you are up to date on recommended Pap smear / HPV screening intervals.",
            "Discuss HPV vaccination eligibility with your healthcare provider.",
            "Practice safe barrier methods during sexual activity.",
            "Avoid tobacco use, which increases cervical vulnerability to persistent infection."
        ],
        "trusted_sources": [
            {"title": "WHO Fact Sheet: Cervical Cancer", "url": "https://www.who.int/news-room/fact-sheets/detail/cervical-cancer"},
            {"title": "CDC: Cervical Cancer Screening & HPV", "url": "https://www.cdc.gov/cervical-cancer/"}
        ],
        "related_slug": "cervical-health-hpv",
        "suggested_specialty": "Breast and cervical health education"
    },
    {
        "id": "breast_health",
        "title": "Breast Health & Routine Awareness",
        "keywords": ["breast", "lump", "breast pain", "nipple discharge", "mammogram", "breast tissue", "tenderness in breast", "dense breasts"],
        "category": "Preventive & Diagnostic Health",
        "educational_summary": (
            "Breast awareness means knowing how your breasts normally look and feel so you can notice changes promptly. "
            "Many breast lumps and cyclical tenderness episodes are benign (such as fibroadenomas or hormonal cysts), "
            "but any new lump, nipple discharge, or skin dimpling warrants clinical evaluation."
        ),
        "intents": {
            "definition": {
                "title": "What is Breast Health: Tissue Terrain & Clinical Overview",
                "educational_summary": (
                    "Breast tissue is a dynamic biological composite of glandular milk-producing lobules, ducts, fibrous connective tissue, and adipose (fat) tissue, which continuously responds to cyclical estrogen and progesterone signals.\n\n"
                    "Clinical Spectrum of Breast Observations:\n"
                    "• Benign Hormonal Variations: Over 80% to 90% of examined breast changes in reproductive-aged women are completely benign. Common examples include fibroadenomas (smooth, mobile benign tissue clumps) and fibrocystic changes (fluid-filled hormonal cysts).\n"
                    "• Dense Breasts: Having a high proportion of fibrous/glandular tissue relative to fat is normal in young women; routine clinical screening ensures changes behind dense tissue are properly assessed.\n"
                    "• Malignancy (Breast Cancer): Occurs when epithelial cells within terminal duct lobular units proliferate uncontrollably, forming an invasive tumor mass."
                ),
                "key_insights": [
                    "Tissue Composition: Blend of glandular, fibrous, and fat tissue responsive to monthly hormones.",
                    "Benign Prevalence: 80–90% of breast lumps in women under 50 are benign cysts or fibroadenomas.",
                    "Breast Density: Common and normal, but clinical mammography/ultrasound aids clear visualization.",
                    "Goal of Awareness: Becoming familiar with your individual tissue terrain so you promptly recognize genuine changes."
                ]
            },
            "occurrence_causes": {
                "title": "How Breast Pain & Breast Conditions Occur: Hormonal & Tissue Causes",
                "educational_summary": (
                    "Understanding what causes breast symptoms depends heavily on whether you are experiencing tenderness/pain (mastalgia) or a distinct physical tissue change.\n\n"
                    "How Breast Pain (Mastalgia) Occurs:\n"
                    "1. Cyclic Hormonal Mastalgia: During the luteal phase of the menstrual cycle (the 7 to 10 days before your period), surging estrogen and progesterone provoke physiological water retention and swelling inside breast glandular lobules, producing bilateral tenderness or a heavy aching sensation.\n"
                    "2. Non-Cyclic Mastalgia: Unconnected to cycle timing, this frequently arises from chest wall musculoskeletal strain (e.g., pectoral muscle tight knots, costochondritis rib inflammation, poor ergonomics, or lack of support during exercise).\n"
                    "3. Benign Cysts & Fibroadenomas: Fluctuating hormonal stimulation can prompt localized fluid accumulation inside obstructed terminal ducts, forming tender, smooth cysts.\n\n"
                    "How Breast Cancer Occurs:\n"
                    "Malignant breast disease initiates when epithelial cells lining the breast ducts (invasive ductal carcinoma) or lobules (invasive lobular carcinoma) acquire cumulative DNA mutations. These mutations inactivate cell-cycle inhibitors and allow unchecked, abnormal division. While early malignant tumors are usually painless, they form a firm, irregular lump that does not change with the menstrual cycle."
                ),
                "key_insights": [
                    "Cyclic Swelling: Caused by luteal estrogen/progesterone surges causing glandular fluid retention.",
                    "Musculoskeletal Chest Strain: More than 50% of non-cyclical breast ache is actually referred chest wall or pectoral muscle strain.",
                    "Malignancy Mechanism: Initiates from cumulative DNA mutations in ductal or lobular epithelial cells.",
                    "Pain vs Lump: Pure breast pain alone without a distinct physical lump is rarely indicative of breast cancer."
                ]
            },
            "symptoms": {
                "title": "Breast Warning Signs: Normal Terrain vs Changes Requiring Evaluation",
                "educational_summary": (
                    "Being breast aware involves recognizing the critical differences between normal monthly hormonal fluctuations and warning signs that necessitate professional medical evaluation.\n\n"
                    "Key Signs Requiring Prompt Evaluation:\n"
                    "• Discrete Palpable Lump: A distinct, firm, or hard thickening that persists through a complete menstrual cycle.\n"
                    "• Skin Textural Changes: Surface dimpling, puckering, or an orange-peel (peau d'orange) appearance.\n"
                    "• Nipple Alterations: Recent spontaneous nipple inversion, retraction, or localized eczema-like crusting.\n"
                    "• Nipple Discharge: Spontaneous unilateral discharge, particularly if clear, watery, or blood-stained.\n"
                    "• Axillary Swelling: Swelling or a palpable lump in the armpit (axilla) or along the collarbone."
                ),
                "key_insights": [
                    "Red-Flag Lump: A firm, solitary lump that does not resolve after your menstrual period ends.",
                    "Skin Dimpling: Puckering or orange-peel texture is an essential sign requiring clinical examination.",
                    "Discharge Warning: Spontaneous unilateral discharge (especially bloody or clear) warrants immediate assessment.",
                    "Monthly Baseline: Compare observations against your normal baseline 3–5 days after your period."
                ]
            }
        },
        "when_to_seek_care": [
            "A new discrete lump or thickening in either breast or underarm.",
            "Changes in breast skin texture, such as dimpling, puckering, or redness.",
            "Spontaneous nipple discharge, especially if clear or bloody.",
            "Nipple inversion or alteration in appearance."
        ],
        "self_care_tips": [
            "Practice monthly breast self-awareness, best done 3 to 5 days after your period ends when hormonal swelling is minimal.",
            "Wear supportive, well-fitted bras especially during physical workouts.",
            "Track cyclical tenderness in your symptom log to determine if it aligns with your luteal phase."
        ],
        "trusted_sources": [
            {"title": "NHS: Breast Lumps and Breast Care", "url": "https://www.nhs.uk/conditions/breast-lump/"},
            {"title": "CDC: Breast Cancer Screening", "url": "https://www.cdc.gov/breast-cancer/screening/"}
        ],
        "related_slug": "breast-health-awareness",
        "suggested_specialty": "Breast and cervical health education"
    },
    {
        "id": "pregnancy_prenatal",
        "title": "Pregnancy & Prenatal Wellness",
        "keywords": ["pregnant", "pregnancy", "morning sickness", "nausea", "trimester", "prenatal", "baby movement", "antenatal", "gestational"],
        "category": "Maternal Health",
        "educational_summary": (
            "Pregnancy involves profound physical changes across three distinct trimesters. Regular antenatal visits, "
            "adequate folic acid, balanced nutrition, and hydration support both maternal and fetal well-being."
        ),
        "when_to_seek_care": [
            "Any vaginal spotting, bleeding, or fluid leakage.",
            "Severe persistent nausea and vomiting preventing fluid retention (Hyperemesis Gravidarum).",
            "Noticeable decrease or cessation in fetal movements after 24–28 weeks.",
            "Sudden severe swelling in hands, face, or severe persistent headache with vision changes."
        ],
        "self_care_tips": [
            "Take prescribed prenatal vitamins including folic acid and iron as advised by your obstetrician.",
            "Eat small, frequent meals to manage mild morning sickness and keep hydration high.",
            "Avoid tobacco, alcohol, and unpasteurized foods.",
            "Engage in low-impact prenatal movements like walking and prenatal yoga with obstetric clearance."
        ],
        "trusted_sources": [
            {"title": "NHS Pregnancy Guide & Care", "url": "https://www.nhs.uk/pregnancy/"},
            {"title": "India MoHFW: Maternal Health Services", "url": "https://mohfw.gov.in/"}
        ],
        "related_slug": "pregnancy-antenatal-guide",
        "suggested_specialty": "Obstetrics and maternal health education"
    },
    {
        "id": "postpartum_recovery",
        "title": "Postpartum Recovery & Fourth Trimester",
        "keywords": ["postpartum", "after birth", "lochia", "breastfeeding", "lactation", "baby blues", "postpartum depression", "perineal tear", "c section recovery"],
        "category": "Postpartum & Maternal Care",
        "educational_summary": (
            "The fourth trimester (the first 12 weeks after birth) involves physical healing, hormonal rebalancing, "
            "lochia discharge, and lactation adjustment. Emotional fluctuations are common, but severe depression, "
            "anxiety, or overwhelming intrusive thoughts require compassionate clinical support."
        ),
        "when_to_seek_care": [
            "Heavy bleeding soaking a pad in under an hour, or passing large blood clots.",
            "Signs of mastitis: high fever, red wedge-shaped warm patch on breast, flu-like chills.",
            "Persistent feelings of hopelessness, severe anxiety, or inability to bond with baby lasting >2 weeks.",
            "Incision redness, discharge, or separation (C-section or episiotomy)."
        ],
        "self_care_tips": [
            "Rest whenever baby rests; prioritize physical recovery over household tasks.",
            "Nourish your body with nutrient-dense, warm, easily digestible meals and ample fluids.",
            "Accept social support from family or friends for childcare and meal preparation.",
            "Seek guidance from a certified lactation consultant if breastfeeding is painful."
        ],
        "trusted_sources": [
            {"title": "NHS: Keeping Well After Childbirth", "url": "https://www.nhs.uk/conditions/baby/support-and-services/your-post-pregnancy-body/"},
            {"title": "WHO: Maternal and Perinatal Health Guidelines", "url": "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/maternal-perinatal-health"}
        ],
        "related_slug": "postpartum-recovery-guide",
        "suggested_specialty": "Obstetrics and maternal health education"
    },
    {
        "id": "menopause",
        "title": "Perimenopause & Menopause Transition",
        "keywords": ["menopause", "perimenopause", "hot flash", "night sweat", "vaginal dryness", "mood swing", "skipped period in 40s", "estrogen drop"],
        "category": "Midlife & Menopause Care",
        "educational_summary": (
            "Perimenopause is the natural transition leading up to menopause (defined as 12 consecutive months without a period). "
            "Fluctuating estrogen and progesterone can trigger vasomotor symptoms (hot flashes, night sweats), sleep disruption, "
            "and mood shifts. Evidence-based lifestyle strategies and hormone therapy (MHT) can offer significant relief."
        ),
        "when_to_seek_care": [
            "Any bleeding occurring after menopause has been established (post-menopausal bleeding requires prompt investigation).",
            "Severe hot flashes or night sweats that severely impair sleep and daily functioning.",
            "Unexplained rapid heart rate, palpitations, or profound mood changes.",
            "Severe discomfort during intercourse or recurrent urinary tract infections."
        ],
        "self_care_tips": [
            "Dress in breathable natural fiber layers and keep a cool bedroom environment.",
            "Engage in weight-bearing exercises to protect bone mineral density against osteopenia.",
            "Ensure adequate calcium, vitamin D, and protein intake.",
            "Discuss benefits and risks of Menopause Hormone Therapy (MHT) with a gynecologist."
        ],
        "trusted_sources": [
            {"title": "NHS Overview: Menopause", "url": "https://www.nhs.uk/conditions/menopause/"},
            {"title": "WHO: Menopause Fact Sheet", "url": "https://www.who.int/news-room/fact-sheets/detail/menopause"}
        ],
        "related_slug": "menopause-perimenopause-wellness",
        "suggested_specialty": "Gynecology and reproductive health education"
    },
    {
        "id": "menstrual_basics",
        "title": "Menstrual Cycle & Hormonal Health",
        "keywords": ["period", "menstrual", "bleeding", "cycle", "spotting", "pms", "premenstrual", "cramps", "ovulation"],
        "category": "General Menstrual Health",
        "educational_summary": (
            "A standard menstrual cycle typically lasts between 21 and 35 days, governed by follicular, ovulatory, and luteal phases. "
            "Tracking your cycle provides valuable insight into overall endocrine, metabolic, and emotional wellness."
        ),
        "when_to_seek_care": [
            "Cycles that are consistently shorter than 21 days or longer than 35 days.",
            "Sudden severe menstrual pain that prevents you from standing or carrying out normal routines.",
            "Unusual spotting between cycles or after intercourse.",
            "Bleeding lasting longer than 7 full days."
        ],
        "self_care_tips": [
            "Track start date, flow heaviness, and symptoms using HerHealth 360's Symptom Tracker.",
            "Stay well-hydrated and consider magnesium-rich foods to help soothe muscle cramping.",
            "Rest during peak cramping days and apply warm compresses to the lower abdomen."
        ],
        "trusted_sources": [
            {"title": "NHS: Menstrual Cycle and Periods", "url": "https://www.nhs.uk/conditions/periods/"},
            {"title": "eSanjeevani National Teleconsultation", "url": "https://esanjeevani.mohfw.gov.in/"}
        ],
        "related_slug": "menstrual-cycle-mastery",
        "suggested_specialty": "Gynecology and reproductive health education"
    },
    {
        "id": "weight_metabolism",
        "title": "Healthy Weight Management, Metabolism & Fitness",
        "keywords": [
            "weight loss", "lose weight", "losing weight", "weight gain", "weight", 
            "fat loss", "fat burn", "burn fat", "belly fat", "metabolism", "metabolic", 
            "calorie", "bmi", "obesity", "overweight", "cardio", "workout for weight",
            "body recomposition", "fitness routine", "slimming", "exercise for weight",
            "exercises for weight", "excersise", "burn calories", "fat burning"
        ],
        "category": "Metabolic & Lifestyle Wellness",
        "educational_summary": (
            "Healthy weight management in women involves a balanced interplay of metabolic rate, hormonal regulation "
            "(including insulin, thyroid hormones, and cortisol), regular aerobic movement, resistance training, and whole-food nutrition. "
            "Evidence emphasizes progressive, sustainable habits—combining fat-burning cardio, muscle preservation, and adequate recovery—rather "
            "than severe, unsustainable dietary restriction."
        ),
        "when_to_seek_care": [
            "Sudden unexplained weight loss or rapid weight gain despite no changes in nutrition or activity level.",
            "Weight gain accompanied by irregular periods, excess facial hair, or severe cystic acne (signs of PCOS or insulin resistance).",
            "Persistent fatigue, constipation, cold intolerance, and hair loss (potential indicators of hypothyroidism).",
            "Joint pain, shortness of breath, or chest discomfort during mild physical activity."
        ],
        "self_care_tips": [
            "Incorporate a mix of low-impact aerobic cardio (to elevate calorie expenditure) and resistance training (to boost resting metabolic rate).",
            "Prioritize balanced meals with adequate lean protein, complex dietary fiber, and healthy fats to support satiety and stable blood sugar.",
            "Aim for 7–8 hours of restorative sleep; chronic sleep deprivation elevates hunger hormones (ghrelin) and cortisol.",
            "Stay well-hydrated throughout the day and practice gradual, consistent lifestyle adjustments rather than crash dieting."
        ],
        "trusted_sources": [
            {"title": "WHO Fact Sheet: Physical Activity & Health", "url": "https://www.who.int/news-room/fact-sheets/detail/physical-activity"},
            {"title": "NHS Guidelines: Managing Your Weight Safely", "url": "https://www.nhs.uk/live-well/healthy-weight/"},
            {"title": "CDC: Physical Activity for a Healthy Weight", "url": "https://www.cdc.gov/healthy-weight-growth/physical-activity/index.html"}
        ],
        "related_slug": "healthy-weight-metabolic-wellness",
        "suggested_specialty": "Nutrition, endocrinology, and metabolic health education"
    },
    {
        "id": "fitness_exercise",
        "title": "Physical Fitness & Clinical Movement Guidance",
        "keywords": [
            "exercise video", "exercise videos", "workout video", "workout videos", 
            "workout routine", "workout", "fitness routine", "fitness", "aerobic",
            "strength training", "stretching", "daily exercise", "home workout"
        ],
        "category": "Physical Fitness & Conditioning",
        "educational_summary": (
            "Regular physical activity is vital for cardiovascular resilience, bone density preservation, mental well-being, "
            "and metabolic optimization across all stages of a woman's life. Following a structured combination of aerobic movement, "
            "resistance training, and mobility/flexibility exercises yields profound systemic health benefits."
        ),
        "when_to_seek_care": [
            "Sharp, sudden joint, muscular, or back pain during or following exercise.",
            "Dizziness, lightheadedness, or chest tightness when exercising.",
            "Returning to physical activity after recent surgery, childbirth, or extended illness."
        ],
        "self_care_tips": [
            "Aim for at least 150 minutes of moderate-intensity aerobic physical activity weekly.",
            "Include muscle-strengthening activities involving major muscle groups on 2 or more days weekly.",
            "Warm up with gentle dynamic stretches before workouts and cool down with static stretches."
        ],
        "trusted_sources": [
            {"title": "WHO Guidelines on Physical Activity and Sedentary Behaviour", "url": "https://www.who.int/publications/i/item/9789240015128"},
            {"title": "NHS: Physical Activity Guidelines for Adults", "url": "https://www.nhs.uk/live-well/exercise/exercise-guidelines/"}
        ],
        "related_slug": "wellness-nutrition-sleep",
        "suggested_specialty": "Physical therapy and sports medicine"
    }
]

GENERAL_SAFETY_DISCLAIMER = (
    "HerHealth 360 provides educational health information and general guidance. "
    "It does not diagnose, treat, or replace a qualified healthcare professional. "
    "If symptoms are severe, rapidly worsening, or potentially life-threatening, seek urgent medical care immediately."
)

def get_matching_exercises(clean_text: str, topic_id: str = None) -> List[Dict[str, Any]]:
    """Query and rank evidence-based physical therapy & clinical practice videos matching the user query or clinical topic."""
    try:
        from ..models.exercise import ExercisePractice
        all_exercises = ExercisePractice.query.all()
    except Exception:
        return []

    if not all_exercises:
        return []

    # Detect user clinical intent from query and topic
    is_breast_query = any(w in clean_text for w in [
        "breast", "nipple", "mastalgia", "underarm", "chest pain", "breast pain", 
        "breast lump", "breast tenderness", "sore breast", "breast ache", "pain from last 2 days"
    ]) or (topic_id == "breast_health")

    is_cervical_query = any(w in clean_text for w in [
        "cervical", "cervix", "pap smear", "pap test", "hpv", "smear test", "post coital", "cervical cancer"
    ]) or (topic_id == "cervical_hpv")

    is_endometriosis_query = any(w in clean_text for w in [
        "endometriosis", "endo", "chronic pelvic", "dyspareunia", "pelvic pain"
    ]) or (topic_id == "endometriosis")

    is_pcos_query = any(w in clean_text for w in [
        "pcos", "pcod", "facial hair", "hirsutism", "cystic acne", "insulin resistance", "ovarian cyst"
    ]) or (topic_id == "pcos_pcod")

    is_pregnancy_query = any(w in clean_text for w in [
        "pregnant", "pregnancy", "prenatal", "antenatal", "maternal", "trimester", "baby", "labor"
    ]) or (topic_id == "pregnancy_prenatal")

    is_pelvic_query = any(w in clean_text for w in [
        "pelvic floor", "kegel", "incontinence", "bladder leak", "prolapse", "postpartum"
    ]) or (topic_id == "postpartum_recovery")

    is_menopause_query = any(w in clean_text for w in [
        "menopause", "perimenopause", "hot flash", "night sweat", "estrogen drop"
    ]) or (topic_id == "menopause")

    is_weight_query = any(w in clean_text for w in [
        "weight loss", "lose weight", "losing weight", "fat burn", "burn fat", "belly fat", 
        "calorie", "cardio", "hiit", "metabol", "tone", "toning", "slimming", "shred"
    ]) or (topic_id == "weight_metabolism")

    is_cramp_query = any(w in clean_text for w in [
        "cramp", "period pain", "painful period", "dysmenorrhea", "menstrual pain", "uterine"
    ]) or (topic_id == "menstrual_basics")

    is_stretch_query = any(w in clean_text for w in [
        "stretch", "morning", "mobility", "flexibility", "stiff", "joint", "back pain", "relaxation", "yoga routine"
    ]) or (topic_id == "fitness_exercise")

    scored = []
    for ex in all_exercises:
        score = 0
        cat_lower = (ex.category or "").lower()
        title_lower = (ex.title or "").lower()
        desc_lower = (ex.description or "").lower()
        target_lower = (ex.target_condition or "").lower()

        # 1. Breast Health queries (Breast pain, lump, self-check, chest wall strain)
        if is_breast_query:
            if "breast" in cat_lower or "breast" in title_lower or "breast" in target_lower:
                score += 50
            elif "chest" in cat_lower or "shoulder" in title_lower or "upper body" in cat_lower:
                score += 30
            else:
                score -= 40

        # 2. Cervical Health & Pap Screening
        elif is_cervical_query:
            if "cervical" in cat_lower or "cervical" in title_lower or "pap" in title_lower:
                score += 50
            else:
                score -= 40

        # 3. Endometriosis queries (Pelvic relaxation, restorative stretches)
        elif is_endometriosis_query:
            if "endometriosis" in title_lower or "endometriosis" in cat_lower or "endometriosis" in target_lower:
                score += 60
            elif "menstrual comfort" in cat_lower or "pelvic health" in cat_lower or "restorative yoga" in title_lower:
                score += 35
            else:
                score -= 40

        # 4. PCOS & PCOD queries (Hormone balance intervals & restorative yoga)
        elif is_pcos_query:
            if "pcos" in title_lower or "hormonal weight" in cat_lower:
                score += 55
            elif "cycle syncing" in cat_lower or "cramps & pcos" in title_lower:
                score += 45
            else:
                score -= 40

        # 5. Pregnancy & Antenatal Movement
        elif is_pregnancy_query:
            if "antenatal" in cat_lower or "prenatal" in title_lower or "pregnancy" in target_lower:
                score += 60
            else:
                score -= 40

        # 6. Postpartum & Pelvic Floor Restoration
        elif is_pelvic_query:
            if "pelvic health" in cat_lower or "kegel" in title_lower or "incontinence" in target_lower:
                score += 60
            elif "pelvic floor" in title_lower:
                score += 40
            else:
                score -= 40

        # 7. Menopause & Sleep Downregulation
        elif is_menopause_query:
            if "vagus" in title_lower or "sleep" in title_lower or "fatigue" in cat_lower or "menopause" in target_lower:
                score += 60
            elif "flexibility" in title_lower or "gentle stretch" in title_lower:
                score += 35
            else:
                score -= 40

        # 8. Menstrual Cramps & Dysmenorrhea
        elif is_cramp_query:
            if "menstrual comfort" in cat_lower or "cramp" in title_lower or "dysmenorrhea" in target_lower:
                score += 60
            elif "endometriosis" in cat_lower:
                score += 40
            else:
                score -= 40

        # 9. Weight Loss & Metabolic Cardio
        elif is_weight_query:
            if "weight" in cat_lower or "fat" in title_lower or "weight" in title_lower:
                score += 50
            elif "cardio" in cat_lower or "hiit" in cat_lower or "strength" in cat_lower:
                score += 30
            else:
                score -= 40

        # 10. General Mobility & Morning Stretches
        elif is_stretch_query:
            if "morning" in clean_text and "morning" in title_lower:
                score += 70
            elif "morning mobility" in cat_lower or "flexibility" in cat_lower:
                score += 55
            elif "upper body" in cat_lower:
                score += 40
            elif "prenatal" in title_lower or "kegel" in title_lower or "endometriosis" in title_lower:
                score -= 40
            elif "stretch" in title_lower or "mobility" in title_lower:
                score += 30
            else:
                score -= 20

        else:
            # Fallback for general movement questions
            if any(w in clean_text for w in ["exercise", "excersise", "excercise", "exercies", "workout", "routine", "practice", "movement", "stretch", "yoga"]):
                if "mobility" in title_lower or "stretch" in title_lower or "cardio" in title_lower:
                    score += 20

        if score > 0:
            scored.append((score, ex))

    scored.sort(key=lambda x: x[0], reverse=True)

    # CRITICAL: If no exercises matched the specific condition with positive score,
    # return an empty list. NEVER show unrelated fallback videos (e.g. Kegels for Breast Pain)!
    if not scored:
        return []

    return [ex.to_dict() for score, ex in scored[:3]]

def detect_question_intent(clean_text: str) -> str:
    """Classifies user inquiry into specific clinical information intents:
    - 'occurrence_causes': How it occurs, biological mechanism, etiology, triggers, progression
    - 'definition': What it is, anatomical location, classifications, clinical overview
    - 'symptoms': Warning signs, early vs advanced symptoms, physical indicators
    - 'prevention': Vaccination, screening guidelines, lifestyle risk reduction
    - 'diagnosis_tests': Diagnostic modalities, Pap smears, biopsies, mammograms
    - 'treatment_cure': Medical/surgical management, therapies, lifestyle protocols
    - 'general': Default whole-topic overview
    """
    if (
        re.search(r"\b(how|why)\b.*\b(occur|occurs|happen|happens|develop|develops|form|forms|start|starts|work|works|cause|causes)\b", clean_text)
        or any(p in clean_text for p in [
            "what causes", "cause of", "causes of", "why does", "why do", "why it happens",
            "how do you get", "how does one get", "etiology", "mechanism", "pathology",
            "risk factors for", "where does it come from", "biological mechanism"
        ])
    ):
        return "occurrence_causes"

    if any(p in clean_text for p in [
        "what is", "what are", "meaning of", "define", "definition of", "explain", "what does",
        "tell me about", "overview of", "what exactly is"
    ]):
        return "definition"

    if any(p in clean_text for p in [
        "symptom", "symptoms", "sign of", "signs of", "warning sign", "warning signs",
        "how do i know", "how to tell if", "indications of"
    ]):
        return "symptoms"

    if any(p in clean_text for p in [
        "prevent", "prevention", "how to avoid", "avoiding", "reduce risk", "can it be prevented",
        "vaccine", "vaccination", "protect against", "protection"
    ]):
        return "prevention"

    if any(p in clean_text for p in [
        "test", "testing", "tests", "diagnos", "screening", "pap smear", "mammogram",
        "biopsy", "ultrasound", "how is it detected", "how to check"
    ]):
        return "diagnosis_tests"

    if any(p in clean_text for p in [
        "treat", "treatment", "cure", "cured", "curable", "surgery", "medication", "medicine",
        "how to heal", "how to manage", "therapy"
    ]):
        return "treatment_cure"

    return "general"

def evaluate_health_query(user_text: str, selected_topic: str = None) -> Dict[str, Any]:
    clean_text = user_text.strip().lower()
    
    # 1. Check for Emergency Red Flags
    for pattern in RED_FLAG_PATTERNS:
        if re.search(pattern, clean_text, re.IGNORECASE):
            return {
                "is_emergency": True,
                "urgency_level": "CRITICAL_EMERGENCY",
                "title": "Immediate Urgent Medical Care Recommended",
                "message": (
                    "Based on the symptoms you described (such as severe pain, heavy bleeding with fainting, "
                    "breathing difficulty, or acute pregnancy warning signs), this may represent a medical emergency. "
                    "Please DO NOT wait for an online response or questionnaire."
                ),
                "emergency_actions": [
                    "Call emergency services immediately: In India, dial 112 (National Emergency Helpline) or 102 (Ambulance).",
                    "Proceed to the nearest emergency department or hospital casualty.",
                    "If you are alone, alert a family member, neighbor, or friend immediately.",
                    "For women in distress in India, the Women's Helpline is 1091."
                ],
                "disclaimer": GENERAL_SAFETY_DISCLAIMER,
                "topics_matched": [],
                "recommended_exercises": [],
                "trusted_sources": [
                    {"title": "India National Emergency Number: 112", "url": "https://112.gov.in/"},
                    {"title": "India Ministry of Health (MoHFW)", "url": "https://mohfw.gov.in/"}
                ]
            }

    # 2. Rule-based Topic Matching
    matched_topics = []
    
    # If user explicitly selected a topic
    if selected_topic:
        for t in TOPIC_RULES:
            if t["id"] == selected_topic:
                matched_topics.append(t)
                break

    # Match based on keywords in query
    for t in TOPIC_RULES:
        if t not in matched_topics:
            for kw in t["keywords"]:
                if kw in clean_text:
                    matched_topics.append(t)
                    break

    # If no specific topic matched, provide general healthcare navigation
    if not matched_topics:
        matching_exercises = get_matching_exercises(clean_text, selected_topic)
        return {
            "is_emergency": False,
            "urgency_level": "GENERAL_EDUCATION",
            "title": "General Health Exploration & Guidance",
            "educational_summary": (
                "Your inquiry does not clearly match our specific library topics (such as PCOS, Endometriosis, "
                "Cervical Health, Breast Awareness, Pregnancy, or Menopause). Women's health is comprehensive and multifaceted. "
                "We recommend exploring our curated health library or speaking with a licensed clinician."
            ),
            "when_to_seek_care": [
                "Symptoms that persist for more than a few days or progressively worsen.",
                "Unusual bodily changes, unexplained pain, or abnormal bleeding.",
                "Whenever you feel uncertain or distressed about your physical or mental health."
            ],
            "self_care_tips": [
                "Maintain a daily log of symptoms, duration, and severity in HerHealth 360's Tracker.",
                "Ensure balanced nutrition, adequate hydration, and restorative sleep.",
                "Prepare a list of clear questions prior to clinical consultations."
            ],
            "topics_matched": [],
            "recommended_exercises": matching_exercises,
            "suggested_specialty": "Gynecology and reproductive health education",
            "related_slug": "menstrual-cycle-mastery",
            "trusted_sources": [
                {"title": "NHS Health Conditions A-Z", "url": "https://www.nhs.uk/conditions/"},
                {"title": "WHO Health Topics: Women's Health", "url": "https://www.who.int/health-topics/women-s-health"},
                {"title": "India eSanjeevani Teleconsultation", "url": "https://esanjeevani.mohfw.gov.in/"}
            ],
            "disclaimer": GENERAL_SAFETY_DISCLAIMER
        }

    primary_topic = matched_topics[0]
    matching_exercises = get_matching_exercises(clean_text, primary_topic["id"])

    # Resolve specific question intent (e.g. definition vs how it occurs vs symptoms vs prevention)
    intent = detect_question_intent(clean_text)
    intent_data = primary_topic.get("intents", {}).get(intent)

    title = intent_data.get("title", primary_topic["title"]) if intent_data else primary_topic["title"]
    educational_summary = intent_data.get("educational_summary", primary_topic["educational_summary"]) if intent_data else primary_topic["educational_summary"]
    key_insights = intent_data.get("key_insights", []) if intent_data else []
    when_to_seek_care = intent_data.get("when_to_seek_care", primary_topic["when_to_seek_care"]) if intent_data else primary_topic["when_to_seek_care"]
    self_care_tips = intent_data.get("self_care_tips", primary_topic["self_care_tips"]) if intent_data else primary_topic["self_care_tips"]

    return {
        "is_emergency": False,
        "urgency_level": "EDUCATIONAL_GUIDANCE",
        "title": title,
        "category": primary_topic["category"],
        "educational_summary": educational_summary,
        "key_insights": key_insights,
        "when_to_seek_care": when_to_seek_care,
        "self_care_tips": self_care_tips,
        "topics_matched": [t["title"] for t in matched_topics],
        "recommended_exercises": matching_exercises,
        "suggested_specialty": primary_topic["suggested_specialty"],
        "related_slug": primary_topic["related_slug"],
        "trusted_sources": primary_topic["trusted_sources"],
        "disclaimer": GENERAL_SAFETY_DISCLAIMER
    }
