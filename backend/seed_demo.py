"""
Seed demo data: users, posts, and comments across all roles.
Safe to run multiple times — skips already-existing users.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.comment import Comment
from app.core.security import get_password_hash

import app.models.user    # noqa
import app.models.post    # noqa
import app.models.comment # noqa

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── 1. Users ────────────────────────────────────────────────────────────────
USERS = [
    dict(username="admin",    email="admin@example.com",   password="admin123",   role=UserRole.SUPER_ADMIN),
    dict(username="morgan",   email="morgan@example.com",  password="morgan123",  role=UserRole.MODERATOR),
    dict(username="alice",    email="alice@example.com",   password="alice123",   role=UserRole.REGULAR_USER),
    dict(username="bob",      email="bob@example.com",     password="bob123",     role=UserRole.REGULAR_USER),
    dict(username="carol",    email="carol@example.com",   password="carol123",   role=UserRole.REGULAR_USER),
    dict(username="visitor",  email="visitor@example.com", password="visitor123", role=UserRole.GUEST),
]

user_objs = {}
for u in USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        user_objs[u["username"]] = existing
        print(f"  [skip] user '{u['username']}' already exists")
    else:
        obj = User(
            username=u["username"],
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            role=u["role"],
        )
        db.add(obj)
        db.flush()
        user_objs[u["username"]] = obj
        print(f"  [create] user '{u['username']}' ({u['role'].value})")

db.commit()

admin   = user_objs["admin"]
morgan  = user_objs["morgan"]
alice   = user_objs["alice"]
bob     = user_objs["bob"]
carol   = user_objs["carol"]
visitor = user_objs["visitor"]

# ── 2. Posts ────────────────────────────────────────────────────────────────
POSTS = [
    dict(owner=admin, title="Welcome to Blog Application System",
         content=(
             "This platform demonstrates Role-Based Access Control with four distinct roles: "
             "Super Admin, Moderator, Regular User, and Guest.\n\n"
             "Super Admins have full control — they can manage users, change roles, delete any content, "
             "and keep the community running smoothly.\n\n"
             "Try logging in as different users to explore what each role can and cannot do!"
         )),

    dict(owner=morgan, title="Community Guidelines",
         content=(
             "As a moderator, I want to remind everyone of a few simple rules:\n\n"
             "1. Be respectful. Disagreement is fine; personal attacks are not.\n"
             "2. Stay on topic. Keep discussions relevant to the post.\n"
             "3. No spam. Quality over quantity.\n"
             "4. Report problems. Moderators are here to help.\n\n"
             "Violations may result in content removal or account suspension."
         )),

    dict(owner=alice, title="Getting Started with Next.js App Router",
         content=(
             "The App Router in Next.js 13+ fundamentally changes how you think about routing.\n\n"
             "Key concepts:\n"
             "- Every folder with a page.tsx becomes a route segment\n"
             "- Layouts persist across navigations — great for shared UI like navbars\n"
             "- Server Components are the default; add 'use client' only when needed\n"
             "- Dynamic params like [id] now return a Promise in Next.js 16\n\n"
             "The learning curve is real but the developer experience is worth it."
         )),

    dict(owner=bob, title="Why I Switched from REST to FastAPI",
         content=(
             "After years of building Django REST Framework APIs, I gave FastAPI a serious try. "
             "Here's what stood out:\n\n"
             "• Automatic OpenAPI docs at /docs — no setup required\n"
             "• Pydantic models catch type errors before they reach the database\n"
             "• Async support out of the box makes I/O-bound endpoints much faster\n"
             "• Dependency injection is elegant and testable\n\n"
             "The only downside: the ecosystem is smaller than Django's. But for API-first projects, "
             "FastAPI is now my default choice."
         )),

    dict(owner=carol, title="Tailwind CSS v4 — What Changed?",
         content=(
             "Tailwind v4 is a ground-up rewrite and several things tripped me up at first:\n\n"
             "1. No more tailwind.config.js for most setups — config lives in CSS\n"
             "2. `bg-gradient-to-r` is now `bg-linear-to-r`\n"
             "3. The `@tailwind base/components/utilities` directives are gone — "
             "use `@import 'tailwindcss'` instead\n"
             "4. Dark mode custom variant: `@custom-variant dark (&:is(.dark *))`\n\n"
             "Once you internalize the new mental model it's faster to work with. "
             "The CSS output is significantly smaller too."
         )),

    dict(owner=alice, title="Understanding JWT Authentication",
         content=(
             "JSON Web Tokens are the backbone of stateless authentication. Here's the flow:\n\n"
             "1. User logs in with email + password\n"
             "2. Server validates credentials and returns a signed JWT\n"
             "3. Client stores the token (localStorage, cookie, etc.)\n"
             "4. Every subsequent request includes the token in the Authorization header\n"
             "5. Server verifies the signature on each request — no DB lookup needed\n\n"
             "The token payload can contain the user's ID, role, and expiry time. "
             "This makes Blog Application checks cheap and fast."
         )),

    dict(owner=bob, title="SQLAlchemy 2.0 Migration Tips",
         content=(
             "Migrating from SQLAlchemy 1.4 to 2.0 style is straightforward once you know the key changes:\n\n"
             "- Use `select(Model)` instead of `db.query(Model)`\n"
             "- Session operations now use `db.execute(stmt).scalars()`\n"
             "- The ORM now defaults to 2.0 behavior with `future=True`\n"
             "- Type annotations on models are now first-class via `Mapped[type]`\n\n"
             "The new style is more explicit but also much more predictable. "
             "Type checkers like mypy can now catch ORM errors at development time."
         )),

    dict(owner=carol, title="Building Accessible UIs with shadcn/ui",
         content=(
             "shadcn/ui is not a component library — it's a collection of copy-paste components "
             "built on top of Radix UI (and Base UI for the canary version).\n\n"
             "What makes it special:\n"
             "- Full keyboard navigation out of the box\n"
             "- ARIA attributes handled automatically by the headless primitives\n"
             "- You own the code — no black-box library to work around\n"
             "- Themeable via CSS variables, including dark mode\n\n"
             "The canary version adds Tailwind v4 support. It's production-ready for new projects."
         )),
]

post_objs = []
for p in POSTS:
    # skip if owner already has a post with same title
    exists = db.query(Post).filter(
        Post.owner_id == p["owner"].id,
        Post.title == p["title"]
    ).first()
    if exists:
        post_objs.append(exists)
        print(f"  [skip] post '{p['title'][:40]}…'")
    else:
        obj = Post(title=p["title"], content=p["content"], owner_id=p["owner"].id)
        db.add(obj)
        db.flush()
        post_objs.append(obj)
        print(f"  [create] post '{p['title'][:40]}…'")

db.commit()

p_welcome, p_guidelines, p_nextjs, p_fastapi, p_tailwind, p_jwt, p_sqlalchemy, p_shadcn = post_objs

# ── 3. Comments ─────────────────────────────────────────────────────────────
COMMENTS = [
    # Welcome post
    (p_welcome, alice,   "Great overview! The role system is intuitive. Glad to be here as a regular user."),
    (p_welcome, bob,     "Nice to see Blog Application done properly. Most tutorials skip the moderator role entirely."),
    (p_welcome, morgan,  "As the mod here, I appreciate the shoutout. Let me know if anything needs cleaning up."),
    (p_welcome, carol,   "Really clean UI too. Love the dark mode support!"),
    (p_welcome, visitor, "Just browsing as a guest — cool project!"),

    # Community Guidelines
    (p_guidelines, alice,  "Pinning this. Thanks for laying it out clearly, Morgan."),
    (p_guidelines, bob,    "Rule 3 is the most important one. Quality over quantity indeed."),
    (p_guidelines, carol,  "Would love a dedicated feedback thread too. Just a thought!"),
    (p_guidelines, admin,  "Well written. I've linked this from the onboarding docs."),

    # Next.js post
    (p_nextjs, bob,    "The Promise params in Next.js 16 caught me off guard too. Took me a while to figure out `use(params)`."),
    (p_nextjs, carol,  "Server Components + layouts is where the App Router really shines. The mental shift is worth it."),
    (p_nextjs, morgan, "Good write-up. I'll share this with our onboarding team."),
    (p_nextjs, alice,  "Thanks everyone! Turbopack also makes the dev server noticeably faster once you get the config right."),

    # FastAPI post
    (p_fastapi, alice,  "The /docs endpoint alone sold me on FastAPI. Showing it to stakeholders is so easy now."),
    (p_fastapi, carol,  "Agreed on async support. Handling hundreds of concurrent requests without thread pools is a game-changer."),
    (p_fastapi, bob,    "Fair point on the ecosystem. I still miss django-admin for internal tools though."),

    # Tailwind post
    (p_tailwind, alice,  "The `bg-linear-to-r` rename tripped me up for an embarrassingly long time."),
    (p_tailwind, bob,    "The CSS variable approach for theming is so much cleaner than the old config-based approach."),
    (p_tailwind, morgan, "Flagging this as a useful resource. Will sticky it."),

    # JWT post
    (p_jwt, bob,      "One thing worth mentioning: always validate the `exp` claim on the server side too."),
    (p_jwt, carol,    "Refresh tokens are the piece most tutorials skip. Any plans for a follow-up post on that?"),
    (p_jwt, morgan,   "Good intro. I'd also suggest HttpOnly cookies over localStorage for the token storage."),
    (p_jwt, alice,    "Great feedback all! HttpOnly cookies are definitely the more secure option for production."),

    # SQLAlchemy post
    (p_sqlalchemy, carol, "The `Mapped[type]` annotations are such a quality-of-life improvement. mypy catches so many issues now."),
    (p_sqlalchemy, alice, "Do you have a recommendation for handling alembic migrations alongside the 2.0 style?"),
    (p_sqlalchemy, bob,   "Great tips. The `scalars()` method confused me at first but it makes sense once you see the pattern."),

    # shadcn post
    (p_shadcn, alice,  "The 'you own the code' philosophy is underrated. No more digging through node_modules to understand behavior."),
    (p_shadcn, bob,    "Accessibility out of the box is the killer feature for me. Saves so much time during audits."),
    (p_shadcn, carol,  "Thanks for reading! The canary branch is very close to stable now — highly recommend trying it."),
]

for (post, owner, content) in COMMENTS:
    exists = db.query(Comment).filter(
        Comment.post_id == post.id,
        Comment.owner_id == owner.id,
        Comment.content == content,
    ).first()
    if exists:
        print(f"  [skip] comment by {owner.username} on '{post.title[:30]}…'")
    else:
        obj = Comment(content=content, post_id=post.id, owner_id=owner.id)
        db.add(obj)
        print(f"  [create] comment by {owner.username} on '{post.title[:30]}…'")

db.commit()
db.close()

print("\n✓ Demo seed complete!\n")
print("Test accounts:")
print("  admin@example.com    / admin123   (Super Admin)")
print("  morgan@example.com   / morgan123  (Moderator)")
print("  alice@example.com    / alice123   (Regular User)")
print("  bob@example.com      / bob123     (Regular User)")
print("  carol@example.com    / carol123   (Regular User)")
print("  visitor@example.com  / visitor123 (Guest)")
