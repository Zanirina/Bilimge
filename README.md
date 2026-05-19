# Bilimge

University admissions platform for Kazakhstan — applicants browse universities and programs, compare options, calculate grant chances, and follow announcements; university and NTC admins manage their pages, programs, and announcements.

- **Backend:** Django + DRF (PostgreSQL)
- **Frontend:** React + Vite + TypeScript + Tailwind + Zustand

## Backend

Python 3.11+ and PostgreSQL18 required.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate             # Windows
source .venv/bin/activate          # Mac/Linux

pip install -r requirements.txt

# Create the database (one time)
createdb bilimge_bd

# Load the schema + seed data from the SQL dump
psql -U postgres -d bilimge_bd < full_dump.sql

# Run Django migrations for the managed apps
python manage.py migrate

# Start the dev server (default: http://127.0.0.1:8000)
python manage.py runserver
```

Configure via environment variables (defaults in `backend/backend/settings.py`):
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`.

## Frontend

Node 18+ required.

```bash
cd frontend
npm install

# Dev server (default: http://localhost:5173)
npm run dev

# Production build + preview
npm run build
npm run preview
```

## Updating the SQL dump

Regenerate `backend/full_dump.sql` from your local database after schema or seed changes:

```bash
pg_dump -U postgres -h localhost --encoding=UTF8 bilimge_bd > backend/full_dump.sql
```

Then commit the updated file so teammates can rebuild their DB with `psql -U postgres -d bilimge_bd < full_dump.sql`.
