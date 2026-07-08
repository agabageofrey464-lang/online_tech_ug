"""Course data + access helpers.

DB-backed when the `courses` table is populated; otherwise falls back to this
seed list. Keep slugs/content in sync with apps/web/src/lib/data.ts.
"""

import logging

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.course import Course

logger = logging.getLogger("onlinetech.courses")


def _lesson(title, minutes, free=False, preview=None, youtube=None):
    return {"title": title, "minutes": minutes, "free": free, "preview": preview, "youtube": youtube}


SEED_COURSES: list[dict] = [
    {
        "slug": "computer-basics",
        "title": "Computer Basics for Everyone",
        "level": "Beginner",
        "lessons": 24,
        "hours": 6,
        "price_ugx": 50000,
        "blurb": "Start from zero — mouse, keyboard, files, internet and staying safe online.",
        "emoji": "laptop",
        "unlock_code": "CB-2026",
        "sample_video": "/videos/v-05.mp4",
        "syllabus": [
            _lesson("Computer basics — full beginner tutorial (video)", 60, free=True, youtube="y2kg3MOk1sY"),
            _lesson("Meet the computer: parts & switching on", 8, free=True, preview="/videos/v-01.mp4"),
            _lesson("Using the mouse & keyboard confidently", 15),
            _lesson("The desktop, windows & menus", 18),
            _lesson("Files & folders: save, find, organise", 25),
            _lesson("Typing your first document", 30),
            _lesson("Getting online safely", 22),
        ],
        "materials": [{"title": "Computer Basics — course notes (PDF)", "file": "/courses/computer-basics-notes.pdf"}],
        "quiz": [
            {"q": "Which device do you use to move the pointer on screen?", "options": ["Keyboard", "Mouse", "Monitor", "Printer"], "answer": 1},
            {"q": "What is used to type text into a computer?", "options": ["Mouse", "Speaker", "Keyboard", "Webcam"], "answer": 2},
            {"q": "Where are your saved documents kept?", "options": ["Files & folders", "The mouse", "The screen", "The power button"], "answer": 0},
            {"q": "To stay safe online you should…", "options": ["Share your password", "Click every link", "Use strong passwords", "Ignore updates"], "answer": 2},
            {"q": "What does CPU stand for?", "options": ["Central Processing Unit", "Computer Power Unit", "Central Print Unit", "Control Panel Unit"], "answer": 0},
            {"q": "Which of these is an output device?", "options": ["Keyboard", "Mouse", "Monitor", "Microphone"], "answer": 2},
            {"q": "Which shortcut saves your work?", "options": ["Ctrl + S", "Ctrl + P", "Ctrl + X", "Ctrl + A"], "answer": 0},
            {"q": "Turning the computer off correctly is called…", "options": ["Crashing", "Shutting down", "Refreshing", "Logging in"], "answer": 1},
            {"q": "A folder is mainly used to…", "options": ["Play music", "Organise files", "Print pages", "Delete viruses"], "answer": 1},
            {"q": "Which part stores your files permanently?", "options": ["RAM", "The screen", "Hard drive / SSD", "The mouse"], "answer": 2},
        ],
    },
    {
        "slug": "microsoft-office",
        "title": "Microsoft Office Mastery",
        "level": "Beginner",
        "lessons": 36,
        "hours": 10,
        "price_ugx": 80000,
        "blurb": "Word, Excel, PowerPoint and Access for school, work and business.",
        "emoji": "office",
        "unlock_code": "OFFICE-2026",
        "sample_video": "/videos/v-06.mp4",
        "syllabus": [
            _lesson("Microsoft Word — full beginner tutorial", 60, free=True, youtube="v3zc3bXL5pc"),
            _lesson("Microsoft Excel — full beginner tutorial", 60, free=True, youtube="Vl0H-qTclOg"),
            _lesson("Microsoft PowerPoint — full beginner tutorial", 60, free=True, youtube="KqgyvGxISxk"),
            _lesson("Microsoft Access — beginner database tutorial", 60, free=True, youtube="hMuSHYfG7H8"),
            _lesson("Word: tables, images & printing (practice)", 28),
            _lesson("Excel: charts & simple budgets (practice)", 45),
        ],
        "materials": [{"title": "MS Office — practice workbook & notes (PDF)", "file": "/courses/microsoft-office-notes.pdf"}],
        "quiz": [
            {"q": "Which app is best for typing a formal letter?", "options": ["Excel", "Word", "PowerPoint", "Paint"], "answer": 1},
            {"q": "In Excel, a formula always starts with…", "options": ["#", "@", "=", "!"], "answer": 2},
            {"q": "Which app is used to create slide presentations?", "options": ["Word", "Excel", "PowerPoint", "Notepad"], "answer": 2},
            {"q": "To make text bold you press…", "options": ["Ctrl + B", "Ctrl + S", "Ctrl + P", "Ctrl + Z"], "answer": 0},
            {"q": "In Excel, a single box is called a…", "options": ["Cell", "Slide", "Page", "Paragraph"], "answer": 0},
            {"q": "Which shortcut undoes your last action?", "options": ["Ctrl + Y", "Ctrl + Z", "Ctrl + V", "Ctrl + B"], "answer": 1},
            {"q": "Which Office app is best for calculations & budgets?", "options": ["Word", "Excel", "PowerPoint", "Access"], "answer": 1},
            {"q": "To print a document you press…", "options": ["Ctrl + P", "Ctrl + S", "Ctrl + D", "Ctrl + F"], "answer": 0},
            {"q": "Microsoft Access is used to manage…", "options": ["Photos", "Databases", "Videos", "Music"], "answer": 1},
            {"q": "In Word, where do you change the font size?", "options": ["Home tab", "Power button", "Taskbar", "Start menu"], "answer": 0},
        ],
    },
    {
        "slug": "internet-email",
        "title": "Internet, Email & Online Safety",
        "level": "Beginner",
        "lessons": 18,
        "hours": 4,
        "price_ugx": 40000,
        "blurb": "Browse, search, send email, use mobile money safely and avoid online scams.",
        "emoji": "globe",
        "unlock_code": "NET-2026",
        "sample_video": "/videos/v-07.mp4",
        "syllabus": [
            _lesson("Internet & online safety — full tutorial (video)", 30, free=True, youtube="aO858HyFbKI"),
            _lesson("Email basics — how email works (video)", 20, free=True, youtube="0kIaw1yhUVM"),
            _lesson("Searching Google like a pro", 14),
            _lesson("Creating & using email", 22),
            _lesson("Mobile Money safety", 16),
            _lesson("Spotting scams & staying safe", 18),
        ],
        "materials": [{"title": "Internet & Online Safety — notes (PDF)", "file": "/courses/internet-email-notes.pdf"}],
        "quiz": [
            {"q": "A safe password should be…", "options": ["Your name", "12345", "Long & unique", "Your phone number"], "answer": 2},
            {"q": "An email address always contains…", "options": ["@", "#", "&", "%"], "answer": 0},
            {"q": "If a message says you won money you never entered for, it is likely…", "options": ["True", "A scam", "From your bank", "Safe to click"], "answer": 1},
            {"q": "Before sending Mobile Money you should…", "options": ["Confirm the number", "Share your PIN", "Rush", "Ignore the amount"], "answer": 0},
            {"q": "A website address (like onlinetechug.com) is called a…", "options": ["URL", "PIN", "CPU", "RAM"], "answer": 0},
            {"q": "To open websites you use a…", "options": ["Web browser", "Calculator", "Printer", "Speaker"], "answer": 0},
            {"q": "You should NEVER share your…", "options": ["Name", "PIN / password", "Photo", "Email address"], "answer": 1},
            {"q": "WWW stands for…", "options": ["World Wide Web", "Wide World Website", "Web World Wide", "World Web Wide"], "answer": 0},
            {"q": "A link from an unknown sender you should…", "options": ["Click quickly", "Not click", "Forward to all", "Reply with your PIN"], "answer": 1},
            {"q": "Antivirus software helps to…", "options": ["Type faster", "Protect from viruses", "Save money", "Print faster"], "answer": 1},
        ],
    },
    {
        "slug": "typing-skills",
        "title": "Fast & Accurate Typing",
        "level": "Beginner",
        "lessons": 15,
        "hours": 5,
        "price_ugx": 35000,
        "blurb": "Build real typing speed with guided drills — a skill every computer user needs.",
        "emoji": "keyboard",
        "unlock_code": "TYPE-2026",
        "sample_video": "/videos/v-08.mp4",
        "syllabus": [
            _lesson("Learn to touch type — full tutorial (video)", 60, free=True, youtube="bEKQQvMF8QE"),
            _lesson("Home row & correct finger placement", 9, free=True, preview="/videos/v-04.mp4"),
            _lesson("Top & bottom rows", 12),
            _lesson("Numbers & symbols", 15),
            _lesson("Speed drills & accuracy", 20),
            _lesson("Real-world typing practice", 25),
        ],
        "materials": [{"title": "Typing — drills & finger guide (PDF)", "file": "/courses/typing-skills-notes.pdf"}],
        "quiz": [
            {"q": "Correct typing posture means…", "options": ["Slouching", "Wrists straight, sit up", "One finger only", "Looking at keys"], "answer": 1},
            {"q": "The 'home row' keys for the left hand are…", "options": ["QWER", "ASDF", "ZXCV", "1234"], "answer": 1},
            {"q": "Typing speed is measured in…", "options": ["KPH", "WPM", "MB", "GHz"], "answer": 1},
            {"q": "For accuracy you should…", "options": ["Type fast & ignore errors", "Look at the keyboard", "Practice steadily", "Use one hand"], "answer": 2},
            {"q": "The home row keys for the right hand are…", "options": ["JKL;", "UIOP", "NM,.", "5678"], "answer": 0},
            {"q": "Which key do your thumbs press?", "options": ["Enter", "Spacebar", "Shift", "Tab"], "answer": 1},
            {"q": "'Touch typing' means typing…", "options": ["Very slowly", "Without looking at the keys", "With one hand", "Only numbers"], "answer": 1},
            {"q": "Which finger usually presses the F key?", "options": ["Left index", "Right thumb", "Left pinky", "Right index"], "answer": 0},
            {"q": "To type a capital letter you hold…", "options": ["Shift", "Tab", "Ctrl", "Alt"], "answer": 0},
            {"q": "The best way to improve typing is…", "options": ["Never practice", "Regular practice", "Looking down", "Using two fingers"], "answer": 1},
        ],
    },
]

_SEED_BY_SLUG = {c["slug"]: c for c in SEED_COURSES}


def _to_dict(c: Course) -> dict:
    return {
        "id": c.id,
        "slug": c.slug,
        "title": c.title,
        "level": c.level,
        "lessons": c.lessons,
        "hours": c.hours,
        "price_ugx": int(c.price_ugx),
        "blurb": c.blurb,
        "emoji": c.emoji,
        "unlock_code": c.unlock_code,
        "sample_video": c.sample_video,
        "syllabus": c.syllabus or [],
        "materials": c.materials or [],
        "quiz": c.quiz or [],
    }


def list_courses(db: Session | None = None) -> list[dict]:
    if db is not None:
        try:
            rows = db.execute(select(Course)).scalars().all()
            if rows:
                return [_to_dict(r) for r in rows]
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Courses DB query failed, using seed: %s", exc)
    return [{"id": i + 1, **c} for i, c in enumerate(SEED_COURSES)]


def get_course(db: Session | None, slug: str) -> dict | None:
    if db is not None:
        try:
            row = db.execute(select(Course).where(Course.slug == slug)).scalar_one_or_none()
            if row:
                return _to_dict(row)
        except SQLAlchemyError as exc:
            db.rollback()
            logger.warning("Course DB lookup failed, using seed: %s", exc)
    seed = _SEED_BY_SLUG.get(slug)
    if seed:
        idx = next(i for i, c in enumerate(SEED_COURSES) if c["slug"] == slug)
        return {"id": idx + 1, **seed}
    return None


def seed_courses(db: Session) -> int:
    """Insert seed courses into the DB if the table is empty. Returns count inserted."""
    existing = db.execute(select(Course.slug)).scalars().all()
    have = set(existing)
    added = 0
    for c in SEED_COURSES:
        if c["slug"] in have:
            continue
        db.add(Course(**c))
        added += 1
    if added:
        db.commit()
    return added
