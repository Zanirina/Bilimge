"""
Fill three flagship universities with full data so they look complete in the UI:
  - L.N. Gumilyov Eurasian National University (ENU)  — code 13
  - Kazakh-British Technical University (KBTU)         — code 421
  - Astana IT University (AITU)                        — code 522

Idempotent: re-running wipes and re-creates the related rows (programs,
requirements, exams, accreditations, mobility, teaching languages) but keeps
the University row itself (updates fields in place).

Usage:
    python manage.py seed_top3_unis
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from unipage.models import (
    University, UniversityProgram, NtcProgram, Language,
    UniversityLanguage, EntranceRequirement, EntranceExam,
    AcademicMobility, Accreditation,
)


def _lang(name):
    return Language.objects.get(name=name)


def _ntc(code):
    return NtcProgram.objects.get(code=code)


def _set_uni_fields(uni: University, **fields):
    for k, v in fields.items():
        setattr(uni, k, v)
    uni.save()


def _replace_collection(manager, items):
    """Wipe existing rows for this related manager and create fresh ones."""
    manager.all().delete()
    for kwargs in items:
        manager.create(**kwargs)


def _replace_programs(uni: University, programs):
    """Wipe & recreate UniversityProgram rows for this uni.

    `programs` is a list of dicts with at least `code`, `ntc_code`, `local_name`,
    `language`, and optionally `cost`, `passing_score`, `grant_score`, etc.
    """
    UniversityProgram.objects.filter(university=uni).delete()
    for p in programs:
        UniversityProgram.objects.create(
            code=p['code'],
            university=uni,
            ntc_program=_ntc(p['ntc_code']),
            local_name=p['local_name'],
            language=_lang(p['language']) if p.get('language') else None,
            degree=p.get('degree', 'bachelor'),
            years_of_study=p.get('years_of_study', 4),
            study_type=p.get('study_type', 'full_time'),
            description=p.get('description', ''),
            cost=p.get('cost'),
            passing_score=p.get('passing_score'),
            grant_score=p.get('grant_score'),
            future_professions=p.get('future_professions', ''),
        )


def _set_languages(uni: University, names):
    UniversityLanguage.objects.filter(university=uni).delete()
    for n in names:
        UniversityLanguage.objects.create(university=uni, language=_lang(n))


class Command(BaseCommand):
    help = "Fill ENU / KBTU / AITU with full data."

    @transaction.atomic
    def handle(self, *args, **opts):
        self._seed_enu()
        self._seed_kbtu()
        self._seed_aitu()
        self.stdout.write(self.style.SUCCESS("Seeded ENU, KBTU and AITU."))

    # ─────────────────────────────────────────────────────────────────────
    def _seed_enu(self):
        uni = University.objects.get(code=13)
        _set_uni_fields(
            uni,
            name='L.N. Gumilyov Eurasian National University',
            short_name='ENU',
            city='Astana',
            address='2 Satpayev St., Astana 010008',
            year_established=1996,
            email='enu@enu.kz',
            phone='+7 (7172) 70-95-00',
            website='https://www.enu.kz',
            telegram_url='https://t.me/enu_kz',
            instagram_url='https://www.instagram.com/enu_official',
            passing_score=85,
            tuition_cost=950000,
            has_dormitory=True,
            has_military_department=True,
            logo_url='https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Coat_of_Arms_of_Eurasian_National_University.svg/200px-Coat_of_Arms_of_Eurasian_National_University.svg.png',
            cover_url='https://www.enu.kz/static/img/main-bg.jpg',
            history=(
                "L.N. Gumilyov Eurasian National University was founded in 1996 by a "
                "Decree of the First President of the Republic of Kazakhstan. Named after "
                "the great Eurasian thinker Lev Gumilyov, the university quickly became "
                "one of the flagship classical universities in Central Asia.\n\n"
                "Today ENU offers more than 80 undergraduate programs across 13 faculties "
                "and is home to over 20,000 students. It is consistently ranked in the QS "
                "Asia top 250 and houses partnerships with leading universities across "
                "Europe and Asia."
            ),
        )

        _set_languages(uni, ['Kazakh', 'Russian', 'English'])

        _replace_programs(uni, [
            dict(code=130001, ntc_code='6111', local_name='Computer Engineering and Software',
                 language='English', cost=1100000, passing_score=110, grant_score=128,
                 description='Foundations of computer science with applied software engineering tracks.',
                 future_professions='Software engineer, backend developer, DevOps engineer.'),
            dict(code=130002, ntc_code='6150', local_name='Information Security',
                 language='Russian', cost=1050000, passing_score=108, grant_score=125,
                 description='Cryptography, network security and applied infosec for state and enterprise.',
                 future_professions='SOC analyst, penetration tester, security architect.'),
            dict(code=130003, ntc_code='1510', local_name='Mathematics',
                 language='Kazakh', cost=720000, passing_score=85, grant_score=98,
                 description='Classical mathematics with research-track preparation for graduate study.'),
            dict(code=130004, ntc_code='5310', local_name='Physics',
                 language='Russian', cost=780000, passing_score=85, grant_score=100,
                 description='Theoretical and applied physics, with laboratories in optics and condensed matter.'),
            dict(code=130005, ntc_code='4220', local_name='International Law',
                 language='English', cost=1050000, passing_score=100, grant_score=118,
                 description='Public and private international law, with English-track moot court practice.',
                 future_professions='Lawyer, diplomat, legal counsel, prosecutor.'),
            dict(code=130006, ntc_code='3110', local_name='International Relations',
                 language='English', cost=1050000, passing_score=105, grant_score=122,
                 description='Diplomacy, geopolitics, regional studies (Central Asia, EU, MENA).'),
            dict(code=130007, ntc_code='3220', local_name='Journalism',
                 language='Russian', cost=850000, passing_score=90, grant_score=105,
                 description='Digital and broadcast journalism with editorial newsroom practice.'),
            dict(code=130008, ntc_code='2330', local_name='Foreign Philology',
                 language='English', cost=900000, passing_score=95, grant_score=110,
                 description='English, German and Chinese tracks for translators and educators.'),
            dict(code=130009, ntc_code='3130', local_name='Psychology',
                 language='Russian', cost=820000, passing_score=85, grant_score=98),
            dict(code=130010, ntc_code='4130', local_name='Accounting and Audit',
                 language='Kazakh', cost=830000, passing_score=88, grant_score=102),
        ])

        _replace_collection(uni.entrance_requirements, [
            dict(description='UNT total score not lower than 85 for paid programs / 105 for state grant.'),
            dict(description='School certificate (attestat) with GPA ≥ 3.5 for grant candidates.'),
            dict(description='Internal interview for International Relations and International Law.'),
            dict(description='English proficiency certificate (IELTS 5.5+ / TOEFL iBT 60+) for English-medium programs.'),
        ])

        _replace_collection(uni.entrance_exams, [
            dict(name='UNT — Profile subjects',
                 description='History of Kazakhstan, Mathematical & Reading literacy, plus two profile subjects per program.'),
            dict(name='Creative entrance test — Journalism',
                 description='Two stages: written essay (3h) and editorial interview.'),
            dict(name='English-medium readiness interview',
                 description='Short interview confirming readiness to study in English (for English-language tracks).'),
        ])

        _replace_collection(uni.academic_mobility, [
            dict(partner_university_name='Free University of Berlin', country='Germany'),
            dict(partner_university_name='University of Warsaw', country='Poland'),
            dict(partner_university_name='Beijing Foreign Studies University', country='China'),
            dict(partner_university_name='Istanbul University', country='Türkiye'),
            dict(partner_university_name='University of Bologna', country='Italy'),
            dict(partner_university_name='Tomsk State University', country='Russia'),
        ])

        _replace_collection(uni.accreditations, [
            dict(name='Institutional accreditation',
                 issued_by='Independent Agency for Accreditation and Rating (IAAR)',
                 valid_until='2030-06-30'),
            dict(name='Specialised accreditation — IT programs',
                 issued_by='Independent Kazakh Agency for Quality Assurance (IQAA)',
                 valid_until='2028-09-30'),
            dict(name='ASIIN accreditation — Engineering & Natural Sciences',
                 issued_by='ASIIN e.V.',
                 valid_until='2027-12-31'),
        ])

    # ─────────────────────────────────────────────────────────────────────
    def _seed_kbtu(self):
        uni = University.objects.get(code=421)
        _set_uni_fields(
            uni,
            name='Kazakh-British Technical University',
            short_name='KBTU',
            city='Almaty',
            address='59 Tole bi St., Almaty 050000',
            year_established=2001,
            email='info@kbtu.kz',
            phone='+7 (727) 357-42-22',
            website='https://kbtu.edu.kz',
            telegram_url='https://t.me/kbtuofficial',
            instagram_url='https://www.instagram.com/kbtu_official',
            passing_score=120,
            tuition_cost=2400000,
            has_dormitory=True,
            has_military_department=True,
            logo_url='https://kbtu.edu.kz/templates/yootheme/cache/8d/kbtu-logo-8d4d3e3f.png',
            cover_url='https://kbtu.edu.kz/images/main/campus.jpg',
            history=(
                "Kazakh-British Technical University was established in 2001 by the "
                "governments of Kazakhstan and the United Kingdom as a model "
                "research-intensive university focused on oil & gas, IT and business.\n\n"
                "KBTU runs flagship schools — School of Information Technology and "
                "Engineering, KBTU Business School, School of Energy and Petroleum "
                "Industry, School of Mathematics and Cybernetics, and School of "
                "Geology — and offers all bachelor programs in English. The university "
                "is a member of the Erasmus+ program and partners with UCL, Heriot-Watt, "
                "the University of Westminster and many others."
            ),
        )

        _set_languages(uni, ['English', 'Russian'])

        _replace_programs(uni, [
            dict(code=421001, ntc_code='6111', local_name='Computer Science and Software Engineering',
                 language='English', cost=2400000, passing_score=125, grant_score=130,
                 description='Industry-standard CS curriculum with internships at top KZ tech companies.',
                 future_professions='Software engineer, ML engineer, backend / mobile developer.'),
            dict(code=421002, ntc_code='6150', local_name='Information Systems and Cybersecurity',
                 language='English', cost=2400000, passing_score=120, grant_score=128,
                 description='Enterprise IT systems, cloud architecture and defensive security.'),
            dict(code=421003, ntc_code='6121', local_name='Big Data and AI',
                 language='English', cost=2400000, passing_score=126, grant_score=132,
                 description='Statistical learning, deep learning and large-scale data engineering.'),
            dict(code=421004, ntc_code='7172', local_name='Petroleum Engineering',
                 language='English', cost=2700000, passing_score=118, grant_score=125,
                 description='Upstream petroleum engineering with field practice at major KZ operators.',
                 future_professions='Reservoir engineer, drilling engineer, production engineer.'),
            dict(code=421005, ntc_code='7181', local_name='Machinery for Oil and Gas',
                 language='English', cost=2600000, passing_score=115, grant_score=123),
            dict(code=421006, ntc_code='7140', local_name='Thermal Power Engineering',
                 language='Russian', cost=2300000, passing_score=110, grant_score=120),
            dict(code=421007, ntc_code='7150', local_name='Electric Power Industry',
                 language='Russian', cost=2300000, passing_score=110, grant_score=120),
            dict(code=421008, ntc_code='4140', local_name='Finance',
                 language='English', cost=2500000, passing_score=120, grant_score=128,
                 description='CFA-aligned finance curriculum with corporate-finance and FinTech tracks.'),
            dict(code=421009, ntc_code='4120', local_name='Management',
                 language='English', cost=2400000, passing_score=118, grant_score=125),
            dict(code=421010, ntc_code='1510', local_name='Applied Mathematics',
                 language='English', cost=2200000, passing_score=115, grant_score=122),
        ])

        _replace_collection(uni.entrance_requirements, [
            dict(description='UNT total score not lower than 120 for paid programs; 130 for state grants.'),
            dict(description='English certificate (IELTS 6.0+ / TOEFL iBT 70+) OR pass the KBTU internal English placement test.'),
            dict(description='Online application via apply.kbtu.edu.kz with school certificate (attestat) and ID.'),
            dict(description='Interview for KBTU scholarship candidates.'),
        ])

        _replace_collection(uni.entrance_exams, [
            dict(name='UNT — Profile subjects',
                 description='Mathematics + Physics for engineering tracks; Mathematics + Geography for Finance/Management.'),
            dict(name='KBTU English placement test',
                 description='Written and oral parts; required for students without IELTS/TOEFL.'),
            dict(name='Interview — KBTU Honors Scholarship',
                 description='Motivation interview held in May for top-30 UNT applicants.'),
        ])

        _replace_collection(uni.academic_mobility, [
            dict(partner_university_name='University College London (UCL)', country='United Kingdom'),
            dict(partner_university_name='Heriot-Watt University', country='United Kingdom'),
            dict(partner_university_name='University of Westminster', country='United Kingdom'),
            dict(partner_university_name='RWTH Aachen University', country='Germany'),
            dict(partner_university_name='Politecnico di Milano', country='Italy'),
            dict(partner_university_name='Texas A&M University', country='United States'),
            dict(partner_university_name='Seoul National University', country='South Korea'),
            dict(partner_university_name='Nanyang Technological University', country='Singapore'),
        ])

        _replace_collection(uni.accreditations, [
            dict(name='Institutional accreditation',
                 issued_by='Independent Agency for Accreditation and Rating (IAAR)',
                 valid_until='2031-03-31'),
            dict(name='ASIIN accreditation — Engineering programs',
                 issued_by='ASIIN e.V.',
                 valid_until='2029-09-30'),
            dict(name='AMBA accreditation — Business School',
                 issued_by='Association of MBAs',
                 valid_until='2028-12-31'),
            dict(name='ACCA-accredited Finance curriculum',
                 issued_by='Association of Chartered Certified Accountants',
                 valid_until='2027-06-30'),
        ])

    # ─────────────────────────────────────────────────────────────────────
    def _seed_aitu(self):
        uni = University.objects.get(code=522)
        _set_uni_fields(
            uni,
            name='Astana IT University',
            short_name='AITU',
            city='Astana',
            address='Mangilik El 55/11, Block C1, Astana 010000',
            year_established=2019,
            email='info@astanait.edu.kz',
            phone='+7 (7172) 64-57-00',
            website='https://astanait.edu.kz',
            telegram_url='https://t.me/aitu2020info',
            instagram_url='https://www.instagram.com/astana_it_university',
            passing_score=110,
            tuition_cost=2200000,
            has_dormitory=True,
            has_military_department=True,
            logo_url='https://astanait.edu.kz/wp-content/uploads/2020/01/aitu-logo.png',
            cover_url='https://astanait.edu.kz/wp-content/uploads/2022/05/aitu-campus.jpg',
            history=(
                "Astana IT University was founded in 2019 by a Decree of the Government "
                "of Kazakhstan to become the country's leading IT-focused university. "
                "Located in Astana Hub — the largest international technopark in Central "
                "Asia — AITU brings together a fully English-medium curriculum, dual-"
                "degree partnerships and direct collaboration with the local tech industry.\n\n"
                "AITU operates four schools — Computing, Engineering, Creative Industries "
                "and Business — and hosts the AITU NeuroSpace research center, Telegram "
                "Lab Kazakhstan and joint programs with the University of Westminster, "
                "Tampere University and others."
            ),
        )

        _set_languages(uni, ['English', 'Kazakh', 'Russian'])

        _replace_programs(uni, [
            dict(code=522001, ntc_code='6111', local_name='Computer Science',
                 language='English', cost=2200000, passing_score=115, grant_score=125,
                 description='Core CS plus electives in distributed systems, ML and HCI.',
                 future_professions='Software engineer, ML engineer, system architect.'),
            dict(code=522002, ntc_code='6150', local_name='Software Engineering',
                 language='English', cost=2200000, passing_score=112, grant_score=122),
            dict(code=522003, ntc_code='6121', local_name='Artificial Intelligence',
                 language='English', cost=2300000, passing_score=118, grant_score=128,
                 description='Deep learning, NLP, computer vision; capstone with Astana Hub residents.'),
            dict(code=522004, ntc_code='6121', local_name='Big Data Analysis',
                 language='English', cost=2300000, passing_score=115, grant_score=125),
            dict(code=522005, ntc_code='6150', local_name='Cybersecurity',
                 language='English', cost=2300000, passing_score=115, grant_score=125,
                 description='Offensive and defensive security; CTF training; certified Red Team labs.'),
            dict(code=522006, ntc_code='6120', local_name='Information Systems',
                 language='English', cost=2100000, passing_score=110, grant_score=120),
            dict(code=522007, ntc_code='6130', local_name='Computer Hardware and Software',
                 language='Russian', cost=2100000, passing_score=110, grant_score=118),
            dict(code=522008, ntc_code='4160', local_name='IT Marketing & Digital Communications',
                 language='English', cost=1900000, passing_score=100, grant_score=110),
            dict(code=522009, ntc_code='4120', local_name='IT Management',
                 language='English', cost=1900000, passing_score=100, grant_score=110),
        ])

        _replace_collection(uni.entrance_requirements, [
            dict(description='UNT total score not lower than 110 for paid; 120 for state grants.'),
            dict(description='English certificate (IELTS 5.5+ / TOEFL iBT 60+) OR pass the AITU internal English entrance.'),
            dict(description='Online application via apply.astanait.edu.kz with attestat and ID.'),
            dict(description='Optional portfolio for AI/Cybersecurity scholarship competition.'),
        ])

        _replace_collection(uni.entrance_exams, [
            dict(name='UNT — Profile subjects',
                 description='Mathematics + Informatics for all bachelor programs.'),
            dict(name='AITU English entrance test',
                 description='Internal English placement (B1+) for students without an external certificate.'),
            dict(name='Coding interview — AITU Scholarship',
                 description='90-minute algorithmic round for top scholarship candidates (held in May).'),
        ])

        _replace_collection(uni.academic_mobility, [
            dict(partner_university_name='University of Westminster', country='United Kingdom'),
            dict(partner_university_name='Tampere University', country='Finland'),
            dict(partner_university_name='Sorbonne University', country='France'),
            dict(partner_university_name='KAIST', country='South Korea'),
            dict(partner_university_name='Riga Technical University', country='Latvia'),
            dict(partner_university_name='Eötvös Loránd University (ELTE)', country='Hungary'),
            dict(partner_university_name='Cyprus International Institute of Management', country='Cyprus'),
        ])

        _replace_collection(uni.accreditations, [
            dict(name='Institutional accreditation',
                 issued_by='Independent Agency for Accreditation and Rating (IAAR)',
                 valid_until='2030-12-31'),
            dict(name='Specialised accreditation — IT programs',
                 issued_by='Independent Kazakh Agency for Quality Assurance (IQAA)',
                 valid_until='2029-06-30'),
            dict(name='ABET-style program review — Software Engineering',
                 issued_by='ASIIN e.V.',
                 valid_until='2028-09-30'),
        ])
