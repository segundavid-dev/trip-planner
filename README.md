# ELD Trip Planner

Full-stack trip planner

## Backend (port 8000)

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt   
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py runserver     
```

Endpoints:

- `POST /api/trips/plan/` — plan a trip
- `GET  /api/health/` — health check

## Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev                                     
```

Vite proxies `/api` → `http://127.0.0.1:8000` automatically.

## Production

- Frontend → Vercel (set `VITE_API_URL` to the deployed backend URL)
- Backend → Render (start: `python manage.py runserver 0.0.0.0:8000`)