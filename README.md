# Blog Application System — FastAPI + Next.js

A full-stack Role-Based Access Control application with four distinct roles, post management, and a commenting system.

---

## Roles & Permissions

| Action                         | Super Admin | Moderator |    Regular User    | Guest |
| ------------------------------ | :---------: | :-------: | :----------------: | :---: |
| View posts & comments          |     ✅      |    ✅     |         ✅         |  ✅   |
| Create post                    |     ✅      |    ✅     |         ✅         |  ❌   |
| Edit own post                  |     ✅      |    ❌     |         ✅         |  ❌   |
| Edit any post                  |     ✅      |    ❌     |         ❌         |  ❌   |
| Delete own post                |     ✅      |    ✅     |         ✅         |  ❌   |
| Delete any post                |     ✅      |    ✅     |         ❌         |  ❌   |
| Create comment                 |     ✅      |    ✅     |         ✅         |  ❌   |
| Delete own comment             |     ✅      |    ✅     |         ✅         |  ❌   |
| Delete any comment on own post |     ✅      |    ✅     | ✅ (as post owner) |  ❌   |
| Delete any comment             |     ✅      |    ✅     |         ❌         |  ❌   |
| Manage users                   |     ✅      |    ❌     |         ❌         |  ❌   |

---

## Project Structure

```
.
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── core/             config, database, JWT/security
│   │   ├── models/           SQLAlchemy ORM models
│   │   ├── schemas/          Pydantic request/response schemas
│   │   ├── services/         Business logic (auth, users, posts, comments)
│   │   └── api/v1/           Route handlers + dependency injection
│   ├── seed.py               Creates default Super Admin account
│   ├── requirements.txt
│   └── .env
└── frontend/                 Next.js 16 application
    ├── app/                  Pages (login, register, posts, admin)
    ├── components/           PostCard, PostForm, CommentCard, CommentForm, Navbar
    ├── contexts/             AuthContext (JWT stored in localStorage)
    ├── lib/                  api.ts (typed fetch client), types.ts
    └── utils/                permissions.ts (all Blog Application checks)
```

---

## Prerequisites

- Python 3.9+
- Node.js 18+

---

## Running the Backend

```bash
cd backend

# 1. Activate virtual environment
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies (first time only)
pip install -r requirements.txt

# 3. Seed the default Super Admin (first time only)
python seed.py

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

- API base URL: http://localhost:8000/api/v1
- Interactive docs (Swagger UI): http://localhost:8000/docs

---

## Running the Frontend

Open a second terminal:

```bash
cd frontend

# 1. Install dependencies (first time only)
npm install

# 2. Start the dev server
npm run dev
```

- App URL: http://localhost:3000

---

## Default Accounts

After running `python seed.py` a Super Admin account is created:

| Email | Password   | Role        |
| -------- | ---------- | ----------- |
| `admin@example.com`  | `admin123` | Super Admin |

Register more accounts at http://localhost:3000/register. All new registrations start as **Regular User**. A Super Admin can change any user's role from the Admin panel (http://localhost:3000/admin).

---

## API Endpoints

### Auth

| Method | Path                    | Auth     | Description                     |
| ------ | ----------------------- | -------- | ------------------------------- |
| POST   | `/api/v1/auth/register` | —        | Register (creates Regular User) |
| POST   | `/api/v1/auth/login`    | —        | Login, returns JWT              |
| GET    | `/api/v1/auth/me`       | Required | Get current user                |

### Posts

| Method | Path                 | Auth     | Description     |
| ------ | -------------------- | -------- | --------------- |
| GET    | `/api/v1/posts`      | —        | List all posts  |
| POST   | `/api/v1/posts`      | Required | Create post     |
| GET    | `/api/v1/posts/{id}` | —        | Get single post |
| PUT    | `/api/v1/posts/{id}` | Required | Update post     |
| DELETE | `/api/v1/posts/{id}` | Required | Delete post     |

### Comments

| Method | Path                                | Auth     | Description             |
| ------ | ----------------------------------- | -------- | ----------------------- |
| GET    | `/api/v1/posts/{id}/comments`       | —        | List comments on a post |
| POST   | `/api/v1/posts/{id}/comments`       | Required | Add comment             |
| PUT    | `/api/v1/posts/{id}/comments/{cid}` | Required | Edit comment            |
| DELETE | `/api/v1/posts/{id}/comments/{cid}` | Required | Delete comment          |

### Users (Super Admin only)

| Method | Path                 | Auth        | Description          |
| ------ | -------------------- | ----------- | -------------------- |
| GET    | `/api/v1/users`      | Super Admin | List all users       |
| GET    | `/api/v1/users/{id}` | Super Admin | Get user             |
| PUT    | `/api/v1/users/{id}` | Super Admin | Update role / status |
| DELETE | `/api/v1/users/{id}` | Super Admin | Delete user          |

---

## Tech Stack

**Backend**

- FastAPI 0.115
- SQLAlchemy 2 (SQLite)
- Pydantic v2
- python-jose (JWT)
- passlib + bcrypt (password hashing)
- uvicorn

**Frontend**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
