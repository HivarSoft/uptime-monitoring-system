# PulseWatch — Uptime Monitoring System

A full-stack SaaS uptime monitoring platform. Monitor your APIs, websites, and endpoints with automatic checks every 10 minutes, beautiful charts, and real-time status dashboards.

---

## Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18 + TypeScript + Vite + MUI v5 + Redux Toolkit + Chart.js |
| Backend   | Node.js + Express + MongoDB (Mongoose) + JWT + node-cron |
| Auth      | JWT (Bearer token, 7-day expiry) |

---

## Quick Start

### 1. Clone & configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# → fill in MongoDBURL and JWT_SECRET

# Frontend
cp frontend/.env.example frontend/.env
# → set VITE_BASE_URL if your backend runs on a different port
```

### 2. Install & run backend

```bash
cd backend
npm install
npm run dev        # nodemon — auto-restarts on changes
# or: npm start   # production
```

### 3. Install & run frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

---

## Environment Variables

### `backend/.env`

| Variable       | Required | Description |
|----------------|----------|-------------|
| `PORT`         | No       | Server port (default: `911`) |
| `MongoDBURL`   | **Yes**  | MongoDB connection string |
| `JWT_SECRET`   | **Yes**  | Secret for signing JWTs — use a long random string |
| `FRONTEND_URL` | No       | Deployed frontend URL (added to CORS allowlist) |

### `frontend/.env`

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_BASE_URL` | **Yes**  | Backend API base URL, e.g. `http://localhost:911/api/v1` |

---

## API Reference

### Auth  (`/api/v1/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signUp` | Create account |
| POST | `/login` | Sign in, returns JWT |
| GET  | `/checkLogin` | Validate current token |

### User  (`/api/v1/user`) — JWT required
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/getUser` | Fetch profile |
| PATCH  | `/updateUser` | Update name / avatar |
| PATCH  | `/changePassword` | Change password |
| DELETE | `/deleteAccount` | Delete account |

### Services  (`/api/v1/service`) — JWT required
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/getAllProjects` | List all projects + services |
| POST   | `/createProject` | Create project |
| POST   | `/createService` | Add service to project |
| POST   | `/getAllServices` | List services in a project |
| GET    | `/getService/:id` | Get service + paginated logs |
| DELETE | `/deleteService/:serviceId/:projectId` | Delete service + logs |
| DELETE | `/deleteProject/:projectId` | Delete project + all services |

---

## Architecture

```
Frontend (React/Vite)
├── Layout (sticky navbar, auth dialogs, single ToastContainer)
├── AuthProvider (JWT verification on protected routes)
├── Redux store (user profile + token)
└── Pages
    ├── / → Landing page
    ├── /dashboard → Projects overview with summary stats
    ├── /project/:id → Services list with health indicators
    ├── /service/:id → Service detail + response time charts (auto-refreshes every 60s)
    └── /settings → Edit profile + change password

Backend (Express/Node)
├── app.js (CORS, routes, error handler)
├── index.js (DB connect, cron scheduler)
├── loggService/ → Parallel health checker (concurrency-limited)
│   ├── CONCURRENCY_LIMIT = 20 parallel checks
│   ├── REQUEST_TIMEOUT = 10s per URL
│   └── MAX_LOGS = 144 per service (~24h retention)
└── MongoDB
    ├── User → Project[] (ref)
    ├── Project → Service[] (ref)
    ├── Service → MonitorLog[] (ref)
    └── MonitorLog (hitTime, responseTime: Number, status: Number)
```

---
