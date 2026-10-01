import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

questions_data = [
    # Q1
    {
        "q_num": 1,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Adi Shankaracharya was born in Kalady, Kerala, on the banks of which river?",
        "q_te": "ఆది శంకరాచార్యులు కేరళలోని కాలడిలో ఏ నదీ తీరాన జన్మించారు?",
        "opt_a_en": "River Pamba", "opt_a_te": "పంపా నది",
        "opt_b_en": "River Poorna (Periyar)", "opt_b_te": "పూర్ణా నది (పెరియార్)",
        "opt_c_en": "River Bharathappuzha", "opt_c_te": "భరతప్పుళా నది",
        "opt_d_en": "River Netravati", "opt_d_te": "నేత్రావతి నది",
        "ans": "B",
        "exp_en": "Kalady is situated on the banks of River Poorna (also known as River Periyar).",
        "exp_te": "కాలడి క్షేత్రం పూర్ణా నది (పెరియార్ నది అని కూడా పిలుస్తారు) ఒడ్డున ఉంది."
    },
    # Q2
    {
        "q_num": 2,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Who were the devout parents of Adi Shankaracharya?",
        "q_te": "ఆది శంకరాచార్యుల భక్తిపరులైన తల్లిదండ్రులు ఎవరు?",
        "opt_a_en": "Madarasa and Madalambike", "opt_a_te": "మాదరస మరియు మాదలాంబిక",
        "opt_b_en": "Asuri Keshava Somayaji and Kantimathi", "opt_b_te": "ఆసూరి కేశవ సోమయాజి మరియు కాంతిమతి",
        "opt_c_en": "Sivaguru and Aryamba", "opt_c_te": "శివగురు మరియు ఆర్యాంబ",
        "opt_d_en": "Madhava and Shreedevi", "opt_d_te": "మాధవ మరియు శ్రీదేవి",
        "ans": "C",
        "exp_en": "Sivaguru and Aryamba were a Nambudiri Brahmin couple of Kalady. (Option A refers to Basaveshwara's parents; Option B refers to Ramanujacharya's parents).",
        "exp_te": "కాలడికి చెందిన నంబూదిరి బ్రాహ్మణ దంపతులు శివగురు మరియు ఆర్యాంబ శంకరాచార్యుల తల్లిదండ్రులు. (ఎంపిక A బసవేశ్వరుడి తల్లిదండ్రులు; ఎంపిక B రామానుజాచార్యుల తల్లిదండ్రులు)."
    },
    # Q3
    {
        "q_num": 3,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "At what age did young Shankara master all four Vedas, according to traditional biographies?",
        "q_te": "సంప్రదాయ జీవిత చరిత్రల ప్రకారం, బాల శంకరుడు ఏ వయస్సులో నాలుగు వేదాలను ఔపోసన పట్టారు?",
        "opt_a_en": "Age 5", "opt_a_te": "5 సంవత్సరాలు",
        "opt_b_en": "Age 8", "opt_b_te": "8 సంవత్సరాలు",
        "opt_c_en": "Age 12", "opt_c_te": "12 సంవత్సరాలు",
        "opt_d_en": "Age 16", "opt_d_te": "16 సంవత్సరాలు",
        "ans": "B",
        "exp_en": "The tradition records: \"Ashtavarshe chaturvedi\" (master of the 4 Vedas by age 8, author of commentaries by 16, toured India until 32).",
        "exp_te": "సంప్రదాయ శ్లోకం: \"అష్టవర్షే చతుర్వేదీ\" (8 ఏళ్లకే 4 వేదాలు, 16 ఏళ్లకు భాష్యాలు, 32 ఏళ్ల వరకు దేశ సంచారం)."
    },
    # Q4
    {
        "q_num": 4,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "What form of renunciation did young Shankara seek his mother's permission for during the crocodile incident in River Poorna?",
        "q_te": "పూర్ణా నదిలో మొసలి పట్టుకున్న సంఘటన సమయంలో బాల శంకరుడు తన తల్లి నుండి ఏ రూపంలోని సన్యాసానికి అనుమతి కోరారు?",
        "opt_a_en": "Vidvat-Sannyasa", "opt_a_te": "విద్వత్-సన్యాసం",
        "opt_b_en": "Markata-Sannyasa", "opt_b_te": "మర్కట-సన్యాసం",
        "opt_c_en": "Apat-Sannyasa", "opt_c_te": "ఆపత్-సన్యాసం",
        "opt_d_en": "Kuti-Chaka", "opt_d_te": "కుటీచక",
        "ans": "C",
        "exp_en": "Apat-Sannyasa is renunciation taken under the immediate threat of death or mortal crisis.",
        "exp_te": "ప్రాణాపాయ స్థితి లేదా మరణ సంక్షోభం ఎదురైనప్పుడు స్వీకరించే సన్యాసాన్ని 'ఆపత్-సన్యాసం' అంటారు."
    },
    # Q5
    {
        "q_num": 5,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Adi Shankaracharya found his spiritual preceptor, Govinda Bhagavatpada, meditating in a cave on the banks of which river?",
        "q_te": "ఆది శంకరాచార్యులు తన ఆధ్యాత్మిక గురువు గోవింద భగవత్పాదులను ఏ నదీ తీరాన గల గుహలో ధ్యానంలో ఉండగా కనుగొన్నారు?",
        "opt_a_en": "River Ganga", "opt_a_te": "గంగా నది",
        "opt_b_en": "River Yamuna", "opt_b_te": "యమునా నది",
        "opt_c_en": "River Narmada", "opt_c_te": "నర్మదా నది",
        "opt_d_en": "River Godavari", "opt_d_te": "గోదావరి నది",
        "ans": "C",
        "exp_en": "Guru Govinda Bhagavatpada resided in a secluded cave on the banks of the sacred River Narmada in central India.",
        "exp_te": "గురు గోవింద భగవత్పాదులు మధ్య భారతదేశంలోని పవిత్ర నర్మదా నదీ తీరంలో ఉన్న గుహలో నివసించారు."
    },
    # Q6
    {
        "q_num": 6,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Which immortal philosophical hymn was spontaneously recited by Shankara when his Guru asked him \"Who are you?\"",
        "q_te": "\"నువ్వు ఎవరు?\" అని గురువు ప్రశ్నించినప్పుడు శంకరాచార్యులు ఆశువుగా ఆలపించిన అమర తాత్విక స్తోత్రం ఏది?",
        "opt_a_en": "Bhaja Govindam", "opt_a_te": "భజ గోవిందం",
        "opt_b_en": "Nirvana Shatakam", "opt_b_te": "నిర్వాణ షట్కం",
        "opt_c_en": "Soundarya Lahari", "opt_c_te": "సౌందర్య లహరి",
        "opt_d_en": "Kanakadhara Stotram", "opt_d_te": "కనకధారా స్తోత్రం",
        "ans": "B",
        "exp_en": "Young Shankara answered with the 6-verse Nirvana Shatakam (\"Chidananda Rupah Shivoham Shivoham\").",
        "exp_te": "బాల శంకరుడు 6 శ్లోకాల నిర్వాణ షట్కం (\"చిదానంద రూపః శివోహం శివోహం\") ద్వారా సమాధానమిచ్చారు."
    },
    # Q7
    {
        "q_num": 7,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The preceptor of Adi Shankaracharya's Guru was Gaudapada, who authored which foundational Advaita text?",
        "q_te": "ఆది శంకరాచార్యుల పరమగురువు గౌడపాదులు ఏ పునాది అద్వైత గ్రంథాన్ని రచించారు?",
        "opt_a_en": "Brahma Sutra Bhashya", "opt_a_te": "బ్రహ్మ సూత్ర భాష్యం",
        "opt_b_en": "Mandukya Karika", "opt_b_te": "మాండూక్య కారిక",
        "opt_c_en": "Panchadasi", "opt_c_te": "పంచదశి",
        "opt_d_en": "Tattva Bodha", "opt_d_te": "తత్త్వ బోధ",
        "ans": "B",
        "exp_en": "Gaudapada wrote the celebrated Mandukya Karika, an uncompromising treatise on Ajativada and Advaita.",
        "exp_te": "గౌడపాదులు అజాతివాదం మరియు అద్వైతంపై సుప్రసిద్ధమైన 'మాండూక్య కారిక'ను రచించారు."
    },
    # Q8
    {
        "q_num": 8,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In Varanasi (Kashi), Adi Shankaracharya composed the 'Manisha Panchakam' after an encounter with Lord Shiva disguised as:",
        "q_te": "వారణాసి (కాశీ)లో ఆది శంకరాచార్యులు శివుడు ఏ రూపంలో దర్శనమిచ్చిన తర్వాత 'మనీషా పంచకం'ను రచించారు?",
        "opt_a_en": "A royal king", "opt_a_te": "ఒక మహారాజు",
        "opt_b_en": "An elderly Brahmin priest", "opt_b_te": "వృద్ధ బ్రాహ్మణ పూజారి",
        "opt_c_en": "An outcaste (Chandala) accompanied by four dogs", "opt_c_te": "నాలుగు శునకాలతో కూడిన చండాలుడు",
        "opt_d_en": "A wandering Buddhist monk", "opt_d_te": "ఒక సంచార బౌద్ధ సన్యాసి",
        "ans": "C",
        "exp_en": "Lord Shiva tested Shankara's non-dual realization as a Chandala with four dogs (symbolizing the 4 Vedas).",
        "exp_te": "శివుడు నాలుగు వేదాలకు ప్రతీకలైన నాలుగు శునకాలతో చండాలుడి రూపంలో వచ్చి శంకరుని అద్వైత భావనను పరీక్షించారు."
    },
    # Q9
    {
        "q_num": 9,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "When Shankara debated Mandana Mishra at Mahishmati, who served as the impartial judge by placing flower garlands on both debaters?",
        "q_te": "మాహిష్మతిలో మండన మిశ్రుడితో శంకరుడు వాదించినప్పుడు, ఇరువురికీ పూలమాలలు వేసి నిష్పాక్షిక న్యాయనిర్ణేతగా ఎవరు వ్యవహరించారు?",
        "opt_a_en": "Gargi Vachaknavi", "opt_a_te": "గార్గి వాచక్నవి",
        "opt_b_en": "Maitreyi", "opt_b_te": "మైత్రేయి",
        "opt_c_en": "Ubhaya Bharati", "opt_c_te": "ఉభయ భారతి",
        "opt_d_en": "Akka Mahadevi", "opt_d_te": "అక్క మహాదేవి",
        "ans": "C",
        "exp_en": "Mandana Mishra's erudite wife, Ubhaya Bharati (an incarnation of Saraswati), arbitrated the debate.",
        "exp_te": "మండన మిశ్రుని విదుషీమణి అయిన భార్య ఉభయ భారతి (సరస్వతి అవతారం) ఈ వాదోపవాదాలకు మధ్యవర్తిగా వ్యవహరించారు."
    },
    # Q10
    {
        "q_num": 10,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "hard",
        "q_en": "Before debating Mandana Mishra, Shankara met the great ritualist philosopher Kumarila Bhatta at Prayagraj, who was performing self-immolation in:",
        "q_te": "మండన మిశ్రుడితో వాదించడానికి ముందు, శంకరుడు ప్రయాగ్‌రాజ్‌లో మీమాంసక పండితుడు కుమారిల భట్టును కలిశారు; ఆ సమయంలో ఆయన దేనిలో ప్రాయశ్చిత్త దహనం చేసుకుంటున్నారు?",
        "opt_a_en": "A pit of molten copper", "opt_a_te": "కరిగించిన రాగి గుండంలో",
        "opt_b_en": "A pyre of slow-burning paddy husks (Tushagni)", "opt_b_te": "నిప్పుల ఊక చితి (తుషాగ్ని)లో",
        "opt_c_en": "The waters of the Triveni Sangam", "opt_c_te": "త్రివేణి సంగమ జలాల్లో",
        "opt_d_en": "A Himalayan cave", "opt_d_te": "హిమాలయ గుహలో",
        "ans": "B",
        "exp_en": "Kumarila Bhatta was undergoing expiation in Tushagni (slow-burning husk fire) for having disowned his Buddhist teachers.",
        "exp_te": "కుమారిల భట్టు తన బౌద్ధ గురువుల పట్ల గురుద్రోహ ప్రాయశ్చిత్తంగా తుషాగ్ని (ఊక మంట)లో ప్రాయశ్చిత్తం చేసుకుంటున్నారు."
    },
    # Q11
    {
        "q_num": 11,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In which historic temple did Adi Shankaracharya open the previously unopened Southern Gate and ascend the 'Sarvajna Peetham' (Throne of Omniscience)?",
        "q_te": "ఆది శంకరాచార్యులు ఇంతకుముందు ఎన్నడూ తెరవబడని దక్షిణ ద్వారాన్ని తెరిచి, ఏ చారిత్రాత్మక దేవాలయంలో 'సర్వజ్ఞ పీఠం' అధిష్టించారు?",
        "opt_a_en": "Kashi Vishwanath Temple, Varanasi", "opt_a_te": "కాశీ విశ్వనాథ ఆలయం, వారణాసి",
        "opt_b_en": "Sharada Temple, Kashmir", "opt_b_te": "శారదా ఆలయం, కాశ్మీర్",
        "opt_c_en": "Meenakshi Temple, Madurai", "opt_c_te": "మీనాక్షి ఆలయం, మధురై",
        "opt_d_en": "Kamakhya Temple, Assam", "opt_d_te": "కామాఖ్య ఆలయం, అస్సాం",
        "ans": "B",
        "exp_en": "Shankara ascended the Sarvajna Peetham at the Sharada Temple in Kashmir after refuting scholars of all competing schools.",
        "exp_te": "ఇతర దర్శనాల పండితులందరినీ వాదనలో ఓడించి కాశ్మీర్‌లోని శారదా పీఠంలో శంకరులు సర్వజ్ఞ పీఠాన్ని అధిష్టించారు."
    },
    # Q12
    {
        "q_num": 12,
        "category": "Biography & Life Milestones",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "At what age, and at which sacred Himalayan location, did Adi Shankaracharya attain Mahasamadhi?",
        "q_te": "ఆది శంకరాచార్యులు ఏ వయస్సులో, హిమాలయాలలోని ఏ పవిత్ర క్షేత్రంలో మహాసమాధి చెందారు?",
        "opt_a_en": "Age 32, at Kedarnath", "opt_a_te": "32 సంవత్సరాల వయసులో, కేదార్‌నాథ్‌లో",
        "opt_b_en": "Age 40, at Badrinath", "opt_b_te": "40 సంవత్సరాల వయసులో, బద్రీనాథ్‌లో",
        "opt_c_en": "Age 60, at Mount Kailash", "opt_c_te": "60 సంవత్సరాల వయసులో, కైలాస పర్వతం వద్ద",
        "opt_d_en": "Age 32, at Joshimath", "opt_d_te": "32 సంవత్సరాల వయసులో, జోషిమఠ్‌లో",
        "ans": "A",
        "exp_en": "Adi Shankara lived for 32 years and merged into Brahman at Kedarnath in the Himalayas.",
        "exp_te": "ఆది శంకరులు 32 ఏళ్ల పిన్న వయస్సులోనే హిమాలయాల్లోని కేదార్‌నాథ్ క్షేత్రంలో బ్రహ్మైక్యం చెందారు."
    },

    # Q13
    {
        "q_num": 13,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "The literal etymological meaning of the word 'Advaita' is:",
        "q_te": "'అద్వైతం' అనే పదానికి నిష్పత్తిపరమైన/అక్షరార్థం ఏమిటి?",
        "opt_a_en": "Two realities", "opt_a_te": "రెండు సత్యాలు",
        "opt_b_en": "Qualified Monism", "opt_b_te": "విశిష్టాద్వైతం",
        "opt_c_en": "Not-Two / Non-Duality", "opt_c_te": "రెండు కానిది / ద్వైతం లేనిది (అద్వితీయం)",
        "opt_d_en": "Supreme Dualism", "opt_d_te": "పరమ ద్వైతం",
        "ans": "C",
        "exp_en": "A (not) + Dvaita (two) = Non-Dualism.",
        "exp_te": "'న ద్వైతం అద్వైతం' – రెండు కానిది, అభేదమైనది అని అర్థం."
    },
    # Q14
    {
        "q_num": 14,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In the core Advaita dictum \"Brahma Satyam Jagan Mithya, Jivo Brahmaiva Naaparah\", the term 'Mithya' means:",
        "q_te": "\"బ్రహ్మ సత్యం జగన్మిథ్య, జీవో బ్రహ్మైవ నాపరః\" అనే మూల సూత్రంలో 'మిథ్య' అనగా అర్థం ఏమిటి?",
        "opt_a_en": "Absolute non-existence (like a barren woman's son)", "opt_a_te": "సంపూర్ణ శూన్యం/అసత్తు (వంధ్యా పుత్రుని వలె)",
        "opt_b_en": "An eternal, permanent reality", "opt_b_te": "శాశ్వతమైన, స్థిరమైన సత్యం",
        "opt_c_en": "An apparent, dependent, and relative reality", "opt_c_te": "అనిర్వచనీయమైన, ఆధారాధారిత దృగ్విషయం (సాపేక్ష సత్యం)",
        "opt_d_en": "A permanent physical substance", "opt_d_te": "శాశ్వత భౌతిక పదార్థం",
        "ans": "C",
        "exp_en": "Mithya is neither absolute reality (Sat) nor absolute non-entity (Asat); it is dependent appearance.",
        "exp_te": "మిథ్య అంటే సత్తు కాదు, అసత్తూ కాదు; అది అధిష్టానంపై ఆధారపడిన అనిర్వచనీయ దృగ్విషయం."
    },
    # Q15
    {
        "q_num": 15,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "In Advaita Vedanta, the ultimate Reality without attributes and forms is known as:",
        "q_te": "అద్వైత వేదాంతంలో గుణాలు మరియు రూపాలు లేని పరమ సత్యాన్ని ఏమని పిలుస్తారు?",
        "opt_a_en": "Saguna Brahman", "opt_a_te": "సగుణ బ్రహ్మం",
        "opt_b_en": "Nirguna Brahman", "opt_b_te": "నిర్గుణ బ్రహ్మం",
        "opt_c_en": "Ishvara", "opt_c_te": "ఈశ్వరుడు",
        "opt_d_en": "Hiranyagarbha", "opt_d_te": "హిరణ్యగర్భుడు",
        "ans": "B",
        "exp_en": "Nirguna Brahman is the unconditioned, attributeless, formless absolute.",
        "exp_te": "ఉపాధి రహిత, గుణరహిత, నిరాకార పరబ్రహ్మ తత్త్వమే నిర్గుణ బ్రహ్మం."
    },
    # Q16
    {
        "q_num": 16,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which of the following represents the two distinct functional powers (Shaktis) of Maya?",
        "q_te": "మాయ యొక్క రెండు క్రియాశీలక శక్తులు ఏవి?",
        "opt_a_en": "Iccha and Kriya", "opt_a_te": "ఇచ్ఛా మరియు క్రియా",
        "opt_b_en": "Avarana (veiling) and Vikshepa (projecting)", "opt_b_te": "ఆవరణ (కప్పిపుచ్చుట) మరియు విక్షేప (భ్రమను సృష్టించుట)",
        "opt_c_en": "Sattva and Rajas", "opt_c_te": "సత్త్వ మరియు రజస్",
        "opt_d_en": "Vidya and Avidya", "opt_d_te": "విద్యా మరియు అవిద్య",
        "ans": "B",
        "exp_en": "Avarana Shakti conceals the true reality of Brahman; Vikshepa Shakti projects the pluralistic universe.",
        "exp_te": "ఆవరణ శక్తి బ్రహ్మ సత్యాన్ని కప్పివేస్తుంది; విక్షేప శక్తి జగత్తు అనే నానాత్వాన్ని ప్రదర్శిస్తుంది."
    },
    # Q17
    {
        "q_num": 17,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "hard",
        "q_en": "Maya is defined in Advaita as 'Anirvachaniya', which means:",
        "q_te": "అద్వైతంలో మాయను 'అనిర్వచనీయము' అంటారు, దీని అర్థం ఏమిటి?",
        "opt_a_en": "Completely real and eternal", "opt_a_te": "సంపూర్ణ సత్యం మరియు శాశ్వతం",
        "opt_b_en": "Completely non-existent", "opt_b_te": "సంపూర్ణంగా లేనిది",
        "opt_c_en": "Inexplicable (neither purely real nor purely unreal)", "opt_c_te": "సత్తు లేదా అసత్తుగా నిర్వచించలేనిది (సదసద్విలక్షణం)",
        "opt_d_en": "Subject to sensory verification", "opt_d_te": "ఇంద్రియాల ద్వారా నిరూపించదగినది",
        "ans": "C",
        "exp_en": "Anirvachaniya means indescribable or inexplicable in terms of Sat (real) or Asat (unreal).",
        "exp_te": "అనిర్వచనీయం అనగా సత్తుగా గానీ, అసత్తుగా గానీ వివరించడానికి వీలుకానిది."
    },
    # Q18
    {
        "q_num": 18,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "hard",
        "q_en": "The cosmological theory of creation upheld exclusively by Advaita Vedanta is:",
        "q_te": "అద్వైత వేదాంతం ప్రతిపాదించిన సృష్టి సిద్ధాంతం ఏది?",
        "opt_a_en": "Parinamavada (Actual transformation)", "opt_a_te": "పరిణామవాదం",
        "opt_b_en": "Vivartavada (Apparent transformation)", "opt_b_te": "వివర్తవాదం (మిథ్యా పరిణామం/భాసించడం)",
        "opt_c_en": "Arambhavada (Atomic conjunction)", "opt_c_te": "ఆరంభవాదం",
        "opt_d_en": "Asat-karyavada (Creation from non-existence)", "opt_d_te": "అసత్కార్యవాదం",
        "ans": "B",
        "exp_en": "Vivartavada asserts that the universe is an apparent modification of Brahman without any real change occurring in Brahman.",
        "exp_te": "వివర్తవాదం ప్రకారం కారణం (బ్రహ్మం) నిజమైన మార్పు చెందకుండానే కార్యం (జగత్తు)గా భాసిస్తుంది."
    },
    # Q19
    {
        "q_num": 19,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In the classic Rope-Snake analogy (Rajju-Sarpa Nyaya), the snake is described as what on the rope?",
        "q_te": "ప్రసిద్ధ 'రజ్జు-సర్ప న్యాయం' (తాడు-పాము దృష్టాంతం)లో తాడుపై పాము కనిపించడాన్ని ఏమంటారు?",
        "opt_a_en": "Parinama (physical evolution)", "opt_a_te": "పరిణామం",
        "opt_b_en": "Adhyasa (superimposition)", "opt_b_te": "అధ్యాస (ఆరోపణ)",
        "opt_c_en": "Samavaya (inherence)", "opt_c_te": "సమవాయం",
        "opt_d_en": "Abhavapratiniti (negation)", "opt_d_te": "అభావప్రతీతి",
        "ans": "B",
        "exp_en": "Adhyasa is the superimposition of an illusory object upon an underlying substrate (Adhishthana).",
        "exp_te": "అధిష్టానమైన తాడుపై లేని పాము భాసించడాన్ని 'అధ్యాస' (ఆరోపణ) అంటారు."
    },
    # Q20
    {
        "q_num": 20,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "According to Advaita, which of the following is the correct order of the Three Levels of Reality (Sattatraya)?",
        "q_te": "అద్వైతం ప్రకారం 'సత్తాత్రయం' (మూడు స్థాయిల సత్యాలు) యొక్క సరైన క్రమం ఏది?",
        "opt_a_en": "Pratibhasika -> Vyavaharika -> Paramarthika", "opt_a_te": "ప్రాతిభాసిక -> వ్యావహారిక -> పారమార్థిక",
        "opt_b_en": "Paramarthika -> Pratibhasika -> Vyavaharika", "opt_b_te": "పారమార్థిక -> ప్రాతిభాసిక -> వ్యావహారిక",
        "opt_c_en": "Vyavaharika -> Paramarthika -> Pratibhasika", "opt_c_te": "వ్యావహారిక -> పారమార్థిక -> ప్రాతిభాసిక",
        "opt_d_en": "Pratibhasika -> Paramarthika -> Vyavaharika", "opt_d_te": "ప్రాతిభాసిక -> పారమార్థిక -> వ్యావహారిక",
        "ans": "A",
        "exp_en": "From lowest to highest: Pratibhasika (subjective/dreams), Vyavaharika (empirical waking world), and Paramarthika (absolute truth of Brahman).",
        "exp_te": "నిమ్న స్థాయి నుండి అత్యున్నత స్థాయి: ప్రాతిభాసిక సత్యం (కలలు/భ్రమలు), వ్యావహారిక సత్యం (లౌకిక ప్రపంచం), పారమార్థిక సత్యం (పరబ్రహ్మ తత్త్వం)."
    },
    # Q21
    {
        "q_num": 21,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The analogy of 'Ghatakasha and Mahakasha' (pot-space and limitless open sky) is used to explain:",
        "q_te": "'ఘటాకాశం - మహాకాశం' (కుండలోని ఆకాశం - అనంత ఆకాశం) దృష్టాంతం దేనిని వివరించడానికి ఉపయోగపడుతుంది?",
        "opt_a_en": "Why God created matter", "opt_a_te": "భగవంతుడు పదార్థాన్ని ఎందుకు సృష్టించాడో",
        "opt_b_en": "The non-difference between the Jiva (soul) and Atman/Brahman", "opt_b_te": "జీవుడు మరియు ఆత్మ/బ్రహ్మల మధ్య గల అభేదం",
        "opt_c_en": "The reality of the physical body", "opt_c_te": "భౌతిక శరీరం యొక్క సత్యత్వం",
        "opt_d_en": "The difference between heaven and hell", "opt_d_te": "స్వర్గ నరకాల మధ్య భేదం",
        "ans": "B",
        "exp_en": "Space inside a pot (Ghatakasha) appears separate only because of the clay pot's walls (Upadhi); when the pot breaks, it was and is the open sky (Mahakasha).",
        "exp_te": "కుండ అనే ఉపాధి వల్ల ఆకాశం వేరుగా కనిపించినా, కుండ పగిలితే అది మహాకాశమే; అలాగే దేహోపాధి తొలగితే జీవుడే బ్రహ్మం."
    },
    # Q22
    {
        "q_num": 22,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "The state of liberation attained while still living in the physical body is termed:",
        "q_te": "భౌతిక శరీరంలో జీవించి ఉండగానే పొందే మోక్ష స్థితిని ఏమంటారు?",
        "opt_a_en": "Videhamukti", "opt_a_te": "విదేహముక్తి",
        "opt_b_en": "Krama Mukti", "opt_b_te": "క్రమ ముక్తి",
        "opt_c_en": "Jivanmukti", "opt_c_te": "జీవన్ముక్తి",
        "opt_d_en": "Salokya Mukti", "opt_d_te": "సాలోక్య ముక్తి",
        "ans": "C",
        "exp_en": "Jivanmukti is liberation here and now in the living organism, a core hallmark of Advaita.",
        "exp_te": "జీవించి ఉండగానే అజ్ఞానం నశించి ఆత్మజ్ఞానం పొందడాన్ని 'జీవన్ముక్తి' అంటారు. ఇది అద్వైత విశిష్టత."
    },
    # Q23
    {
        "q_num": 23,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which among the following is NOT part of the 'Sadhana Chatushtaya' (the 4 preliminary qualifications of a spiritual seeker in Advaita)?",
        "q_te": "క్రింది వాటిలో అద్వైత 'సాధన చతుష్టయం'లో భాగం కానిది ఏది?",
        "opt_a_en": "Nitya-Anitya Vastu Viveka (Discrimination)", "opt_a_te": "నిత్యా-అనిత్య వస్తు వివేకం",
        "opt_b_en": "Ihamutrartha Phala Bhoga Vairagya (Dispassion)", "opt_b_te": "ఇహాముత్రార్థ ఫలభోగ విరాగం",
        "opt_c_en": "Shat-Sampat (Sixfold virtues)", "opt_c_te": "శమదమాది షట్క సంపత్తి",
        "opt_d_en": "Ashvamedha Yajna (Vedic horse sacrifice)", "opt_d_te": "అశ్వమేధ యాగం",
        "ans": "D",
        "exp_en": "The four are: 1. Viveka, 2. Vairagya, 3. Shat-Sampat (Shama, Dama, Uparati, Titiksha, Shraddha, Samadhana), and 4. Mumukshutva (longing for freedom).",
        "exp_te": "సాధన చతుష్టయాలు: 1. వివేకం, 2. వైరాగ్యం, 3. షట్కసంపత్తి (శమ, దమ, ఉపరతి, తితిక్ష, శ్రద్ధ, సమాధానం), 4. ముముక్షుత్వం. అశ్వమేధ యాగం కర్మకాండకు చెందినది."
    },
    # Q24
    {
        "q_num": 24,
        "category": "Advaita Metaphysics & Philosophy",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "What are the three sequential steps of the spiritual path in Jnana Yoga according to Advaita?",
        "q_te": "అద్వైతం ప్రకారం జ్ఞాన యోగ సాధనలో మూడు వరుస సోపానాలు ఏవి?",
        "opt_a_en": "Karma, Bhakti, Dhyana", "opt_a_te": "కర్మ, భక్తి, ధ్యానం",
        "opt_b_en": "Shravana (hearing), Manana (reflection), Nididhyasana (deep meditation)", "opt_b_te": "శ్రవణం, మననం, నిదిధ్యాసనం",
        "opt_c_en": "Charya, Kriya, Yoga", "opt_c_te": "చర్య, క్రియ, యోగం",
        "opt_d_en": "Asana, Pranayama, Pratyahara", "opt_d_te": "ఆసన, ప్రాణాయామ, ప్రత్యాహార",
        "ans": "B",
        "exp_en": "The Brihadaranyaka Upanishad mandates: \"Atma va are drashtavyah shrotavyo mantavyo nididhyasitavyah\".",
        "exp_te": "బృహదారణ్యకోపనిషత్ ప్రకారం ఆత్మజ్ఞానానికి సోపానాలు: శ్రవణం (గురుముఖతః వినుట), మననం (యుక్తితో ఆలోచించుట), నిదిధ్యాసనం (నిరంతర ధ్యానం)."
    },

    # Q25
    {
        "q_num": 25,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Which Amnaya Matha was established by Adi Shankara in the South, and on the banks of which river is it located?",
        "q_te": "ఆది శంకరాచార్యులు దక్షిణ దిక్కున స్థాపించిన ఆమ్నాయ మఠం ఏది మరియు అది ఏ నదీ తీరాన ఉంది?",
        "opt_a_en": "Govardhana Matha, River Ganga", "opt_a_te": "గోవర్ధన మఠం, గంగా నది",
        "opt_b_en": "Sharada Peetham at Sringeri, River Tunga", "opt_b_te": "శృంగేరి శారదా పీఠం, తుంగ నది",
        "opt_c_en": "Kalika Matha, River Gomti", "opt_c_te": "కాళికా మఠం, గోమతి నది",
        "opt_d_en": "Jyotirmath, River Alaknanda", "opt_d_te": "జ్యోతిర్మఠం, అలకనంద నది",
        "ans": "B",
        "exp_en": "Sringeri Sharada Peetham is located on the banks of River Tunga in Chikkamagaluru district, Karnataka.",
        "exp_te": "శృంగేరి శారదా పీఠం కర్ణాటకలోని చిక్కమగళూరు జిల్లాలో తుంగా నదీ తీరాన ఉంది."
    },
    # Q26
    {
        "q_num": 26,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "matching_mcq",
        "difficulty": "medium",
        "q_en": "Match the Amnaya Mathas with their respective cardinal directions: List I (Mathas): a. Govardhana Matha (Puri), b. Kalika Matha (Dwaraka), c. Jyotirmath (Joshimath), d. Sharada Peetham (Sringeri). List II (Directions): 1. North, 2. South, 3. East, 4. West.",
        "q_te": "ఆమ్నాయ మఠాలను వాటి సంబంధిత దిక్కులతో జతపరచండి: జాబితా I (మఠాలు): a. గోవర్ధన మఠం (పూరి), b. కాళికా మఠం (ద్వారక), c. జ్యోతిర్మఠం (జోషిమఠ్), d. శారదా పీఠం (శృంగేరి). జాబితా II (దిక్కులు): 1. ఉత్తరం, 2. దక్షిణం, 3. తూర్పు, 4. పడమర.",
        "opt_a_en": "a-3, b-4, c-1, d-2", "opt_a_te": "a-3, b-4, c-1, d-2",
        "opt_b_en": "a-1, b-2, c-3, d-4", "opt_b_te": "a-1, b-2, c-3, d-4",
        "opt_c_en": "a-4, b-3, c-2, d-1", "opt_c_te": "a-4, b-3, c-2, d-1",
        "opt_d_en": "a-3, b-1, c-4, d-2", "opt_d_te": "a-3, b-1, c-4, d-2",
        "ans": "A",
        "exp_en": "Puri = East, Dwaraka = West, Joshimath = North, Sringeri = South.",
        "exp_te": "పూరి = తూర్పు, ద్వారక = పడమర, జోషిమఠ్ = ఉత్తరం, శృంగేరి = దక్షిణం."
    },
    # Q27
    {
        "q_num": 27,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which of the four Vedas is preserved and propagated by the Govardhana Matha at Puri?",
        "q_te": "పూరిలోని గోవర్ధన మఠం ఏ వేదాన్ని పరిరక్షించి ప్రచారం చేస్తుంది?",
        "opt_a_en": "Yajurveda", "opt_a_te": "యజుర్వేదం",
        "opt_b_en": "Samaveda", "opt_b_te": "సామవేదం",
        "opt_c_en": "Rigveda", "opt_c_te": "ఋగ్వేదం",
        "opt_d_en": "Atharvaveda", "opt_d_te": "అథర్వణవేదం",
        "ans": "C",
        "exp_en": "Puri = Rigveda, Sringeri = Yajurveda, Dwaraka = Samaveda, Joshimath = Atharvaveda.",
        "exp_te": "పూరి గోవర్ధన మఠం = ఋగ్వేదం; శృంగేరి = యజుర్వేదం; ద్వారక = సామవేదం; జోషిమఠ్ = అథర్వణవేదం."
    },
    # Q28
    {
        "q_num": 28,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The Mahavakya 'Aham Brahmasmi' (\"I am Brahman\") belongs to which Upanishad and is associated with which Matha?",
        "q_te": "'అహం బ్రహ్మాస్మి' (\"నేను బ్రహ్మమును\") అనే మహావాక్యం ఏ ఉపనిషత్తుకు చెందినది మరియు ఏ మఠంతో అనుసంధానించబడింది?",
        "opt_a_en": "Chandogya Upanishad, Dwaraka Matha", "opt_a_te": "ఛాందోగ్యోపనిషత్, ద్వారకా మఠం",
        "opt_b_en": "Brihadaranyaka Upanishad, Sringeri Sharada Peetham", "opt_b_te": "బృహదారణ్యకోపనిషత్, శృంగేరి శారదా పీఠం",
        "opt_c_en": "Aitareya Upanishad, Puri Govardhana Matha", "opt_c_te": "ఐతరేయోపనిషత్, పూరి గోవర్ధన మఠం",
        "opt_d_en": "Mandukya Upanishad, Joshimath", "opt_d_te": "మాండూక్యోపనిషత్, జోషిమఠ్",
        "ans": "B",
        "exp_en": "Aham Brahmasmi is from the Brihadaranyaka Upanishad (Yajurveda) of Sringeri Sharada Peetham.",
        "exp_te": "'అహం బ్రహ్మాస్మి' యజుర్వేదానికి చెందిన బృహదారణ్యకోపనిషత్తులోనిది; ఇది దక్షిణ శృంగేరి శారదా పీఠానికి చెందిన మహావాక్యం."
    },
    # Q29
    {
        "q_num": 29,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The Mahavakya 'Tat Tvam Asi' (\"That Thou Art\") is associated with which Veda and Matha?",
        "q_te": "'తత్ త్వమ్ అసి' (\"అది నీవే అయి ఉన్నావు\") అనే మహావాక్యం ఏ వేదం మరియు మఠానికి సంబంధించినది?",
        "opt_a_en": "Rigveda, Puri", "opt_a_te": "ఋగ్వేదం, పూరి",
        "opt_b_en": "Samaveda, Dwaraka Matha", "opt_b_te": "సామవేదం, ద్వారకా మఠం",
        "opt_c_en": "Atharvaveda, Joshimath", "opt_c_te": "అథర్వణవేదం, జోషిమఠ్",
        "opt_d_en": "Yajurveda, Sringeri", "opt_d_te": "యజుర్వేదం, శృంగేరి",
        "ans": "B",
        "exp_en": "Tat Tvam Asi is from the Chandogya Upanishad (Samaveda) of Dwaraka Kalika Matha.",
        "exp_te": "'తత్ త్వమ్ అసి' సామవేద ఛాందోగ్యోపనిషత్తులోనిది; ఇది పశ్చిమ ద్వారకా శారదా/కాళికా మఠ మహావాక్యం."
    },
    # Q30
    {
        "q_num": 30,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Who was the first direct disciple appointed by Adi Shankaracharya as the head of the Sringeri Sharada Peetham?",
        "q_te": "శృంగేరి శారదా పీఠాధిపతిగా ఆది శంకరాచార్యులచే నియమితులైన మొదటి ప్రత్యక్ష శిష్యుడు ఎవరు?",
        "opt_a_en": "Padmapadacharya", "opt_a_te": "పద్మపాదాచార్యులు",
        "opt_b_en": "Hastamalakacharya", "opt_b_te": "హస్తామలకాచార్యులు",
        "opt_c_en": "Sureshwaracharya", "opt_c_te": "సురేశ్వరాచార్యులు",
        "opt_d_en": "Totakacharya", "opt_d_te": "తోటకాచార్యులు",
        "ans": "C",
        "exp_en": "Sureshwaracharya (formerly Mandana Mishra) was installed as the first Peethadhipati of Sringeri.",
        "exp_te": "పూర్వాశ్రమంలో మండన మిశ్రులైన సురేశ్వరాచార్యులు శృంగేరి పీఠానికి ప్రథమ పీఠాధిపతిగా నియమితులయ్యారు."
    },
    # Q31
    {
        "q_num": 31,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The disciple Sanandana was renamed 'Padmapadacharya' because:",
        "q_te": "సనందనుడనే శిష్యుడికి 'పద్మపాదాచార్యులు' అనే పేరు రావడానికి కారణం ఏమిటి?",
        "opt_a_en": "He had lotus-shaped marks on his feet", "opt_a_te": "ఆయన పాదాలపై పద్మం ఆకారపు గుర్తులు ఉండడం వల్ల",
        "opt_b_en": "Lotus flowers bloomed under his feet as he walked across a flooded river to reach his Guru", "opt_b_te": "పొంగిపొర్లుతున్న నదిని దాటి గురువు వద్దకు వస్తున్నప్పుడు ఆయన అడుగుల క్రింద తామర పూలు వికసించడం వల్ల",
        "opt_c_en": "He worshipped Goddess Lakshmi with lotuses", "opt_c_te": "కమలాలతో లక్ష్మీదేవిని పూజించడం వల్ల",
        "opt_d_en": "He was born inside a sacred lotus pond", "opt_d_te": "పవిత్ర పద్మ సరస్సులో జన్మించడం వల్ల",
        "ans": "B",
        "exp_en": "When summoned by Shankara across a raging river, lotuses rose to support Sanandana's steps.",
        "exp_te": "గురువు శంకరులు పిలవగానే ఉధృతంగా ప్రవహిస్తున్న నదిపై నడిచివచ్చినప్పుడు ఆయన పాదాల క్రింద కమలాలు ఉద్భవించాయి."
    },
    # Q32
    {
        "q_num": 32,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which disciple of Shankara was believed by his parents to be mute, but spoke sublime verses comparing Self-realization to a gooseberry in the hand?",
        "q_te": "చిన్నతనంలో మూగవాడిగా భావించబడి, శంకరుని అనుగ్రహంతో ఆత్మజ్ఞానాన్ని అరచేతిలోని ఉసిరికాయతో పోలుస్తూ అద్భుత శ్లోకాలు పలికిన శిష్యుడు ఎవరు?",
        "opt_a_en": "Padmapadacharya", "opt_a_te": "పద్మపాదాచార్యులు",
        "opt_b_en": "Totakacharya", "opt_b_te": "తోటకాచార్యులు",
        "opt_c_en": "Hastamalakacharya", "opt_c_te": "హస్తామలకాచార్యులు",
        "opt_d_en": "Sureshwaracharya", "opt_d_te": "సురేశ్వరాచార్యులు",
        "ans": "C",
        "exp_en": "Hasta-Amalaka means a gooseberry in the palm of one's hand; Hastamalaka headed Dwaraka Matha.",
        "exp_te": "'హస్తామలకం' అనగా అరచేతిలోని ఉసిరికాయ; హస్తామలకాచార్యులు పశ్చిమ ద్వారకా పీఠాధిపతి అయ్యారు."
    },
    # Q33
    {
        "q_num": 33,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Discipled as Giri, who was initially ridiculed for doing menial chores but later spontaneously composed verses in a complex meter, becoming:",
        "q_te": "ప్రారంభంలో ఆశ్రమ పనులకే పరిమితమై తోటివారిచే చులకనగా చూడబడి, ఆ తర్వాత క్లిష్టమైన ఛందస్సులో ఆశువుగా స్తోత్రం చేసి పీఠాధిపతి అయిన 'గిరి' ఎవరిగా ప్రసిద్ధి చెందారు?",
        "opt_a_en": "Totakacharya", "opt_a_te": "తోటకాచార్యులు",
        "opt_b_en": "Vidyaranya", "opt_b_te": "విద్యారణ్యులు",
        "opt_c_en": "Padmapadacharya", "opt_c_te": "పద్మపాదాచార్యులు",
        "opt_d_en": "Appayya Dikshita", "opt_d_te": "అప్పయ్య దీక్షితులు",
        "ans": "A",
        "exp_en": "Giri was blessed by Shankara and chanted the Totakashtakam in the difficult Totaka meter, becoming Totakacharya (head of Joshimath).",
        "exp_te": "శంకర కృపతో తోటక వృత్తంలో 'తోటకాష్టకం' రచించి, ఉత్తర జ్యోతిర్మఠానికి అధిపతిగా తోటకాచార్యులు అయ్యారు."
    },
    # Q34
    {
        "q_num": 34,
        "category": "The 4 Amnaya Mathas, Disciples & Mahavakyas",
        "format": "standard_mcq",
        "difficulty": "hard",
        "q_en": "Sureshwaracharya, the first head of Sringeri, authored which independent Advaitic masterwork?",
        "q_te": "శృంగేరి ప్రథమ పీఠాధిపతి అయిన సురేశ్వరాచార్యులు రచించిన స్వతంత్ర అద్వైత ప్రామాణిక గ్రంథం ఏది?",
        "opt_a_en": "Vivekachudamani", "opt_a_te": "వివేకచూడామణి",
        "opt_b_en": "Naishkarmya Siddhi", "opt_b_te": "నైష్కర్మ్య సిద్ధి",
        "opt_c_en": "Panchadasi", "opt_c_te": "పంచదశి",
        "opt_d_en": "Bhamati", "opt_d_te": "భామతి",
        "ans": "B",
        "exp_en": "Naishkarmya Siddhi is Sureshwaracharya's celebrated independent treatise.",
        "exp_te": "'నైష్కర్మ్య సిద్ధి' అనేది సురేశ్వరాచార్యులు రచించిన అత్యంత ప్రసిద్ధ స్వతంత్ర వేదాంత గ్రంథం."
    },

    # Q35
    {
        "q_num": 35,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "The 'Prasthanatrayi' on which Adi Shankaracharya authored his master commentaries (Bhashyas) consists of:",
        "q_te": "ఆది శంకరాచార్యులు ప్రామాణిక భాష్యాలు రచించిన 'ప్రస్థానత్రయం'లో ఏవి ఉంటాయి?",
        "opt_a_en": "Ramayana, Mahabharata, and Bhagavatam", "opt_a_te": "రామాయణం, మహాభారతం, భాగవతం",
        "opt_b_en": "Rigveda, Yajurveda, and Samaveda", "opt_b_te": "ఋగ్వేదం, యజుర్వేదం, సామవేదం",
        "opt_c_en": "Upanishads, Bhagavad Gita, and Brahma Sutras", "opt_c_te": "ఉపనిషత్తులు, భగవద్గీత, బ్రహ్మ సూత్రాలు",
        "opt_d_en": "Manusmriti, Naradasmriti, and Yajnavalkyasmriti", "opt_d_te": "మనుస్మృతి, నారదస్మృతి, యాజ్ఞవల్క్యస్మృతి",
        "ans": "C",
        "exp_en": "The triple foundation of Vedanta consists of the Upanishads (Shruti Prasthana), Bhagavad Gita (Smriti Prasthana), and Brahma Sutras (Nyaya Prasthana).",
        "exp_te": "వేదాంత ప్రస్థానత్రయం: శ్రుతి ప్రస్థానం (ఉపనిషత్తులు), స్మృతి ప్రస్థానం (భగవద్గీత), న్యాయ ప్రస్థానం (బ్రహ్మ సూత్రాలు)."
    },
    # Q36
    {
        "q_num": 36,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Which monumental philosophical text by Adi Shankara is titled \"The Crest-Jewel of Discrimination\"?",
        "q_te": "\"వివేకపు శిరోరత్నం\" అనే అర్థం వచ్చేలా ఆది శంకరులు రచించిన మహోన్నత తాత్విక గ్రంథం ఏది?",
        "opt_a_en": "Upadeshasahasri", "opt_a_te": "ఉపదేశసాహస్రి",
        "opt_b_en": "Vivekachudamani", "opt_b_te": "వివేకచూడామణి",
        "opt_c_en": "Atmabodha", "opt_c_te": "ఆత్మబోధ",
        "opt_d_en": "Aparokshanubhuti", "opt_d_te": "అపరోక్షానుభూతి",
        "ans": "B",
        "exp_en": "Viveka (discrimination) + Chudamani (crest-jewel) = Vivekachudamani (580 verses).",
        "exp_te": "వివేకం (సదసద్వివేచన) + చూడామణి (శిరోరత్నం) = వివేకచూడామణి (580 శ్లోకాలు)."
    },
    # Q37
    {
        "q_num": 37,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which famous devotional hymn by Shankara is also known as 'Moha Mudgara' (The Hammer on Delusion)?",
        "q_te": "శంకరాచార్యులు రచించిన ఏ ప్రసిద్ధ భక్తి స్తోత్రానికి 'మోహ ముద్గరం' (అజ్ఞానాన్ని పగులగొట్టే సుత్తి) అనే పేరు ఉంది?",
        "opt_a_en": "Soundarya Lahari", "opt_a_te": "సౌందర్య లహరి",
        "opt_b_en": "Bhaja Govindam", "opt_b_te": "భజ గోవిందం",
        "opt_c_en": "Kanakadhara Stotram", "opt_c_te": "కనకధారా స్తోత్రం",
        "opt_d_en": "Sivananda Lahari", "opt_d_te": "శివానంద లహరి",
        "ans": "B",
        "exp_en": "Bhaja Govindam was originally titled Moha Mudgara, warning against chasing ephemeral wealth and worldly attachments.",
        "exp_te": "భజ గోవిందం స్తోత్రానికి ప్రాచీన నామం 'మోహ ముద్గరం'; ఇది లౌకిక వ్యామోహాన్ని తొలగించే ఉపదేశం."
    },
    # Q38
    {
        "q_num": 38,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "The 21-verse hymn 'Kanakadhara Stotram' was composed by young Shankara to invoke Goddess Lakshmi for:",
        "q_te": "21 శ్లోకాల 'కనకధారా స్తోత్రం'ను బాల శంకరుడు లక్ష్మీదేవిని ప్రార్థిస్తూ ఎందుకు రచించారు?",
        "opt_a_en": "Winning a philosophical debate", "opt_a_te": "శాస్త్ర వాదనలో విజయం సాధించడానికి",
        "opt_b_en": "Curing his mother's illness", "opt_b_te": "తన తల్లి అనారోగ్యాన్ని నయం చేయడానికి",
        "opt_c_en": "Showering golden gooseberries to relieve the poverty of a destitute woman", "opt_c_te": "ఒక నిరుపేద ఇల్లాలి దారిద్ర్యాన్ని పోగొట్టడానికి బంగారు ఉసిరికాయల వర్షం కురిపించడానికి",
        "opt_d_en": "Building the Sringeri temple", "opt_d_te": "శృంగేరి దేవాలయ నిర్మాణానికి",
        "ans": "C",
        "exp_en": "Moved by a poor woman offering her only possession—a dry gooseberry—Shankara prayed to Lakshmi, causing a rain of golden amlas.",
        "exp_te": "నిరుపేద మహిళ తన వద్దనున్న ఏకైక ఎండిన ఉసిరికాయను భిక్షగా ఇవ్వగా, చలించిన శంకరుడు లక్ష్మీదేవిని ప్రార్థించి బంగారు ఉసిరికాయల వర్షం కురిపించారు."
    },
    # Q39
    {
        "q_num": 39,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The esoteric, 100-verse Tantric hymn composed by Adi Shankara in praise of Goddess Tripura Sundari is:",
        "q_te": "త్రిపుర సుందరీ దేవి స్తుతిస్తూ ఆది శంకరులు రచించిన 100 శ్లోకాల శాక్తేయ రహస్య తాంత్రిక స్తోత్రం ఏది?",
        "opt_a_en": "Lalita Sahasranama", "opt_a_te": "లలితా సహస్రనామం",
        "opt_b_en": "Soundarya Lahari", "opt_b_te": "సౌందర్య లహరి",
        "opt_c_en": "Mahishasura Mardini Stotram", "opt_c_te": "మహిషాసుర మర్దిని స్తోత్రం",
        "opt_d_en": "Annapurna Stotram", "opt_d_te": "అన్నపూర్ణా స్తోత్రం",
        "ans": "B",
        "exp_en": "Soundarya Lahari (\"The Wave of Beauty\") comprises two parts: Ananda Lahari and Soundarya Lahari.",
        "exp_te": "'సౌందర్య లహరి' (ఆనంద లహరి మరియు సౌందర్య లహరి భాగాలు) శ్రీవిద్య, తాంత్రిక తత్త్వాలతో నిండిన 100 శ్లోకాల కావ్యం."
    },
    # Q40
    {
        "q_num": 40,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which of Shankara's independent philosophical texts contains both a prose section and a metrical poetry section?",
        "q_te": "గద్య భాగం మరియు పద్య భాగం రెండూ కలిగి ఉన్న ఆది శంకరుల స్వతంత్ర తాత్విక గ్రంథం ఏది?",
        "opt_a_en": "Atmabodha", "opt_a_te": "ఆత్మబోధ",
        "opt_b_en": "Upadeshasahasri", "opt_b_te": "ఉపదేశసాహస్రి",
        "opt_c_en": "Vivekachudamani", "opt_c_te": "వివేకచూడామణి",
        "opt_d_en": "Vakya Vritti", "opt_d_te": "వాక్య వృత్తి",
        "ans": "B",
        "exp_en": "Upadeshasahasri (\"A Thousand Teachings\") is uniquely divided into Prose (Gadya) and Metrical (Padya) sections.",
        "exp_te": "'ఉపదేశసాహస్రి' గ్రంథం గద్య భాగం (గద్యబంధం) మరియు పద్య భాగం (పద్యబంధం) అనే రెండు విశిష్ట విభాగాలుగా ఉంటుంది."
    },
    # Q41
    {
        "q_num": 41,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In which stotra does Shankara eulogize Lord Shiva as the youthful Guru teaching aged sages through profound silence?",
        "q_te": "వృద్ధులైన ఋషులకు మౌన ముద్రతో బోధించే యువ గురువుగా పరమశివుని వర్ణిస్తూ శంకరులు రచించిన స్తోత్రం ఏది?",
        "opt_a_en": "Sivananda Lahari", "opt_a_te": "శివానంద లహరి",
        "opt_b_en": "Dakshinamurthy Stotram", "opt_b_te": "దక్షిణామూర్తి స్తోత్రం",
        "opt_c_en": "Shiva Tandava Stotram", "opt_c_te": "శివ తాండవ స్తోత్రం",
        "opt_d_en": "Bilvashtakam", "opt_d_te": "బిల్వాష్టకం",
        "ans": "B",
        "exp_en": "Dakshinamurthy Stotram praises Shiva facing south beneath the banyan tree, removing doubts through silence (Gurostu maunam vyakhyanam).",
        "exp_te": "'దక్షిణామూర్తి స్తోత్రం' (\"గురోస్తు మౌనం వ్యాఖ్యానం శిష్యాస్తు ఛిన్నసంశయాః\") మౌన వ్యాఖ్యానం ద్వారా బోధించే దక్షిణామూర్తిని కీర్తిస్తుంది."
    },
    # Q42
    {
        "q_num": 42,
        "category": "Master Literature & Compositions",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "When attacked by a Kapalika in the forests of Srisailam, Shankara composed which moving stotra after being rescued by Lord Narasimha?",
        "q_te": "శ్రీశైల అరణ్యాలలో కాపాలికుడి బారి నుండి నరసింహ స్వామి రక్షించిన తర్వాత శంకరులు కృతజ్ఞతతో రచించిన స్తోత్రం ఏది?",
        "opt_a_en": "Lakshmi Narasimha Karavalamba Stotram", "opt_a_te": "లక్ష్మీ నరసింహ కరావలంబ స్తోత్రం",
        "opt_b_en": "Narasimha Kavacham", "opt_b_te": "నరసింహ కవచం",
        "opt_c_en": "Runavimochana Stotram", "opt_c_te": "ఋణవిమోచన స్తోత్రం",
        "opt_d_en": "Govinda Ashtakam", "opt_d_te": "గోవిందాష్టకం",
        "ans": "A",
        "exp_en": "Shankara composed the Lakshmi Narasimha Karavalamba Stotram in gratitude to Lord Narasimha.",
        "exp_te": "నరసింహ స్వామి శిష్యుడైన పద్మపాదుని ఆవేశించి శంకరులను రక్షించగా, శంకరులు 'లక్ష్మీ నరసింహ కరావలంబ స్తోత్రం' రచించారు."
    },

    # Q43
    {
        "q_num": 43,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "Why was Adi Shankaracharya accorded the historic title 'Shanmata Sthapanacharya'?",
        "q_te": "ఆది శంకరాచార్యులకు 'షణ్మత స్థాపనాచార్య' అనే చారిత్రాత్మక బిరుదు ఎందుకు లభించింది?",
        "opt_a_en": "For establishing six monasteries across the Himalayas", "opt_a_te": "హిమాలయాలలో ఆరు మఠాలను స్థాపించినందుకు",
        "opt_b_en": "For synthesizing and systematizing the six traditional streams of deity worship", "opt_b_te": "సాంప్రదాయక ఆరు దేవతోపాసన మార్గాలను సమన్వయపరిచి పునరుద్ధరించినందుకు",
        "opt_c_en": "For authoring six major commentaries on the Vedas", "opt_c_te": "వేదాలపై ఆరు ప్రముఖ భాష్యాలను రచించినందుకు",
        "opt_d_en": "For defeating six Buddhist emperors", "opt_d_te": "ఆరుగురు బౌద్ధ చక్రవర్తులను ఓడించినందుకు",
        "ans": "B",
        "exp_en": "He integrated Shaiva, Vaishnava, Shakta, Saura, Ganapatya, and Kaumara worship into a harmonious Vedic fold.",
        "exp_te": "శైవ, వైష్ణవ, శాక్తేయ, సౌర, గాణాపత్య, కౌమార అను ఆరు సాంప్రదాయ ఉపాసనా మార్గాలను వైదిక పరిధిలోకి తెచ్చి వ్యవస్థీకరించారు."
    },
    # Q44
    {
        "q_num": 44,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "The six religious streams integrated under the 'Shanmata' system are:",
        "q_te": "'షణ్మత' వ్యవస్థ కింద సమన్వయం చేయబడిన ఆరు ఆరాధనా రూపాలు ఏవి?",
        "opt_a_en": "Shiva, Vishnu, Shakti, Surya, Ganesha, and Kartikeya (Kumara)", "opt_a_te": "శివ, విష్ణు, శక్తి, సూర్య, గణేశ, కార్తికేయ (కుమార)",
        "opt_b_en": "Brahma, Vishnu, Shiva, Indra, Varuna, and Agni", "opt_b_te": "బ్రహ్మ, విష్ణు, శివ, ఇంద్ర, వరుణ, అగ్ని",
        "opt_c_en": "Rama, Krishna, Narasimha, Vamana, Parashurama, and Matsya", "opt_c_te": "రామ, కృష్ణ, నరసింహ, వామన, పరశురామ, మత్స్య",
        "opt_d_en": "Buddha, Mahavira, Shankara, Ramanuja, Madhva, and Basava", "opt_d_te": "బుద్ధ, మహావీర, శంకర, రామానుజ, మధ్వ, బసవ",
        "ans": "A",
        "exp_en": "Shaiva, Vaishnava, Shakta, Saura, Ganapatya, and Kaumara (Skanda/Kartikeya).",
        "exp_te": "శైవం (శివుడు), వైష్ణవం (విష్ణువు), శాక్తేయం (శక్తి), సౌరం (సూర్యుడు), గాణాపత్యం (గణపతి), కౌమారం (కుమారస్వామి/సుబ్రహ్మణ్యుడు)."
    },
    # Q45
    {
        "q_num": 45,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In the domestic ritual 'Panchayatana Puja' popularized by Shankara, Lord Shiva is traditionally represented by which sacred object?",
        "q_te": "శంకరులు ప్రాచుర్యంలోకి తెచ్చిన 'పంచాయతన పూజ'లో పరమశివునికి ప్రతీకగా ఏ పవిత్ర వస్తువును పూజిస్తారు?",
        "opt_a_en": "Salagrama", "opt_a_te": "సాలగ్రామం",
        "opt_b_en": "Bana Linga (from River Narmada)", "opt_b_te": "బాణ లింగం (నర్మదా నది నుండి)",
        "opt_c_en": "Swarna Mukhi Shila", "opt_c_te": "స్వర్ణముఖి శిల",
        "opt_d_en": "Suryakanta crystal", "opt_d_te": "సూర్యకాంత శిల",
        "ans": "B",
        "exp_en": "Shiva is represented by the Bana Linga found in the Narmada river.",
        "exp_te": "పంచాయతన పూజలో శివునికి ప్రతీకగా నర్మదా నదిలో లభించే 'బాణ లింగం'ను ఉంచుతారు."
    },
    # Q46
    {
        "q_num": 46,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "In the Panchayatana Puja, Lord Vishnu is represented by:",
        "q_te": "పంచాయతన పూజలో శ్రీ మహావిష్ణువునకు ప్రతీకగా దేనిని పూజిస్తారు?",
        "opt_a_en": "Bana Linga", "opt_a_te": "బాణ లింగం",
        "opt_b_en": "Salagrama (from River Gandaki)", "opt_b_te": "సాలగ్రామం (గండకీ నది నుండి)",
        "opt_c_en": "Raktashila", "opt_c_te": "రక్తశిల",
        "opt_d_en": "Sphatika Linga", "opt_d_te": "స్పటిక లింగం",
        "ans": "B",
        "exp_en": "Vishnu is worshipped in the sacred ammonite fossil stone, the Salagrama, from the Gandaki river in Nepal.",
        "exp_te": "నేపాల్‌లోని గండకీ నదిలో లభించే పవిత్ర శిలారూపమైన 'సాలగ్రామం' విష్ణువుకు ప్రతీక."
    },
    # Q47
    {
        "q_num": 47,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "easy",
        "q_en": "How did Adi Shankaracharya reconcile caste barriers in his encounter with the Chandala at Varanasi?",
        "q_te": "వారణాసిలో చండాలుని ఎదుర్కొన్న సందర్భంలో ఆది శంకరాచార్యులు వర్ణ/కుల భేదాలను ఎలా సమన్వయపరిచారు?",
        "opt_a_en": "By advocating physical caste war", "opt_a_te": "భౌతిక కుల యుద్ధాన్ని ప్రోత్సహించడం ద్వారా",
        "opt_b_en": "By asserting that one who has realized the indivisible Atman is a true Guru, irrespective of birth", "opt_b_te": "జన్మతో సంబంధం లేకుండా అద్వైత ఆత్మజ్ఞానం పొందిన వాడే నిజమైన గురువు అని ప్రకటించడం ద్వారా",
        "opt_c_en": "By renouncing the Vedas entirely", "opt_c_te": "వేదాలను పూర్తిగా తిరస్కరించడం ద్వారా",
        "opt_d_en": "By leaving Hinduism", "opt_d_te": "హిందూ మతాన్ని విడిచిపెట్టడం ద్వారా",
        "ans": "B",
        "exp_en": "In the Manisha Panchakam, he proclaimed: \"Chandalo'stu sa tu dvijo'stu gururityesha manisha mama\" (Be he an outcaste or a twice-born, he who knows the Self is my Guru).",
        "exp_te": "మనీషా పంచకంలో \"చండాలుడైనా లేదా ద్విజుడైనా ఆత్మజ్ఞానము కలవాడే నా గురువు\" అని నిస్సందేహంగా ప్రకటించారు."
    },
    # Q48
    {
        "q_num": 48,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "When his mother Aryamba died, why was Shankara forced to cremate her in her own backyard?",
        "q_te": "శంకరుల తల్లి ఆర్యాంబ మరణించినప్పుడు, శంకరులు ఆమెకు స్వంత పెరట్లోనే అంత్యక్రియలు నిర్వహించాల్సి రావడానికి గల కారణం ఏమిటి?",
        "opt_a_en": "Floods had submerged the public cremation grounds", "opt_a_te": "వరదల వల్ల స్మశానవాటిక మునిగిపోవడం వల్ల",
        "opt_b_en": "Orthodox Nambudiri relatives boycotted her funeral because a sannyasi was performing rites", "opt_b_te": "సన్యాసి అంత్యక్రియలు చేయకూడదంటూ ఛాందస నంబూదిరి బంధువులు సహాయ నిరాకరణ చేయడం వల్ల",
        "opt_c_en": "It was royal law in Kerala", "opt_c_te": "అది కేరళ రాజశాసనం కావడం వల్ల",
        "opt_d_en": "Aryamba had requested to be buried under a mango tree", "opt_d_te": "మామిడి చెట్టు కింద సమాధి చేయాలని ఆర్యాంబ కోరడం వల్ల",
        "ans": "B",
        "exp_en": "Orthodox relatives refused wood and fire, claiming a monk had no right to perform familial rites; Shankara chopped banana stems and lit the pyre alone.",
        "exp_te": "సన్యాసి దహన సంస్కారాలు చేయకూడదని బంధువులు అగ్ని, కట్టెలు ఇవ్వకుండా బహిష్కరించగా, శంకరులు అరటి బోదెలతో స్వయంగా పెరట్లోనే చితి పేర్చారు."
    },
    # Q49
    {
        "q_num": 49,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "Which famous yantra did Adi Shankaracharya install at the Kollur Mookambika Temple in Karnataka and the Kamakshi Temple at Kanchipuram?",
        "q_te": "కర్ణాటకలోని కొల్లూరు మూకాంబిక దేవాలయం మరియు కాంచీపురంలోని కామాక్షి అమ్మవారి దేవాలయంలో ఆది శంకరాచార్యులు ఏ ప్రసిద్ధ యంత్రాన్ని ప్రతిష్టించారు?",
        "opt_a_en": "Kali Yantra", "opt_a_te": "కాళీ యంత్రం",
        "opt_b_en": "Sri Chakra", "opt_b_te": "శ్రీ చక్రం",
        "opt_c_en": "Kubera Yantra", "opt_c_te": "కుబేర యంత్రం",
        "opt_d_en": "Sudarshana Yantra", "opt_d_te": "సుదర్శన యంత్రం",
        "ans": "B",
        "exp_en": "Shankara consecrated the sacred geometric Sri Chakra to calm ferocious forms of the Mother Goddess into benevolent deities.",
        "exp_te": "ఉగ్రరూపిణిగా ఉన్న అమ్మవార్లను శాంతింపజేసి లోకకళ్యాణార్థం శంకరులు 'శ్రీ చక్రం' ప్రతిష్టించారు."
    },
    # Q50
    {
        "q_num": 50,
        "category": "Religious, Social & Temple Reforms",
        "format": "standard_mcq",
        "difficulty": "medium",
        "q_en": "At the Badrinath Temple in the high Himalayas, Shankara recovered the idol of Lord Badri Narayana from which river and appointed priests from which community?",
        "q_te": "హిమాలయాలలోని బద్రీనాథ్ ఆలయంలో శంకరులు శ్రీ బద్రీ నారాయణుని విగ్రహాన్ని ఏ నది నుండి వెలికితీశారు మరియు ఏ వర్గానికి చెందిన పూజారులను నియమించారు?",
        "opt_a_en": "River Alaknanda; Nambudiri Brahmins of Kerala (Rawals)", "opt_a_te": "అలకనంద నది; కేరళకు చెందిన నంబూదిరి బ్రాహ్మణులు (రావల్స్)",
        "opt_b_en": "River Mandakini; Kashmiri Pandits", "opt_b_te": "మందాకినీ నది; కాశ్మీరీ పండితులు",
        "opt_c_en": "River Bhagirathi; Maithil Brahmins", "opt_c_te": "భాగీరథీ నది; మైథిలీ బ్రాహ్మణులు",
        "opt_d_en": "River Yamuna; Gouda Saraswat Brahmins", "opt_d_te": "యమునా నది; గౌడ సారస్వత బ్రాహ్మణులు",
        "ans": "A",
        "exp_en": "Shankara retrieved the Narayana idol from the Narada Kunda in River Alaknanda and established the tradition that the chief priest (Rawal) of Badrinath must be a Nambudiri Brahmin from Kerala, linking the extreme north and south of India.",
        "exp_te": "శంకరులు అలకనంద నదిలోని నారద కుండం నుండి నారాయణుని విగ్రహాన్ని వెలికితీసి, కేరళ నంబూదిరి బ్రాహ్మణులనే ప్రధాన పూజారులు (రావల్)గా నియమించి ఉత్తర-దక్షిణ భారత ఐక్యతను చాటారు."
    }
]

# Varadhi standard columns
headers_varadhi = [
    "import_key", "exam_categories", "availability_scope", "primary_exam", "subject",
    "topic", "difficulty", "source_paper_code", "source_paper_name", "source_year",
    "source_date", "source_page", "source_question_number", "source_question_id",
    "question_format", "question_en", "question_te", "option_a_en", "option_a_te",
    "option_b_en", "option_b_te", "option_c_en", "option_c_te", "option_d_en",
    "option_d_te", "correct_options", "explanation_en", "explanation_te",
    "correct_marks", "negative_marks", "content_lifecycle", "review_on", "expires_on",
    "answer_key_status", "is_active"
]

rows_varadhi = []
for q in questions_data:
    key = f"EO-AS-{q['q_num']:03d}"
    rows_varadhi.append([
        key,
        "TGPSC|APPSC",
        "all_exam_entries",
        "Endowment Officer",
        "Hinduism & Philosophy",
        f"Adi Shankaracharya - {q['category']}",
        q["difficulty"],
        "EO-P2-VEDANTA",
        "TGPSC/APPSC Endowment Officer Paper-2",
        "2026",
        "2026-09-30",
        "",
        str(q["q_num"]),
        "",
        q["format"],
        q["q_en"],
        q["q_te"],
        q["opt_a_en"],
        q["opt_a_te"],
        q["opt_b_en"],
        q["opt_b_te"],
        q["opt_c_en"],
        q["opt_c_te"],
        q["opt_d_en"],
        q["opt_d_te"],
        q["ans"],
        q["exp_en"],
        q["exp_te"],
        1,
        0.33,
        "permanent",
        "",
        "",
        "official_verified",
        "true"
    ])

if __name__ == "__main__":
    # Write CSV with UTF-8-SIG (BOM)
    csv_path = "varadhi-adi-shankaracharya-50-mcqs.csv"
    with open(csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers_varadhi)
        writer.writerows(rows_varadhi)
    print(f"Generated {csv_path}")

    # Write to docs/import-templates as well
    docs_csv_path = os.path.join("docs", "import-templates", "varadhi-adi-shankaracharya-50-mcqs.csv")
    with open(docs_csv_path, mode="w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers_varadhi)
        writer.writerows(rows_varadhi)
    print(f"Generated {docs_csv_path}")

    excel_path = "Varadhi_Adi_Shankaracharya_50_MCQs.xlsx"
    wb.save(excel_path)
    print(f"Generated Excel workbook: {excel_path}")

