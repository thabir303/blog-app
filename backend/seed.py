"""
Run once to create a default Super Admin account.
Usage: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash

import app.models.user  # noqa
import app.models.post  # noqa
import app.models.comment  # noqa

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    existing = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
    if existing:
        print(f"Super Admin already exists: {existing.username}")
        sys.exit(0)

    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.SUPER_ADMIN,
    )
    db.add(admin)
    db.commit()
    print("Super Admin created!")
    print("  Username: admin")
    print("  Password: admin123")
    print("  Change the password after first login.")
finally:
    db.close()
