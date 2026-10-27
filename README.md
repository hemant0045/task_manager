# React + PostgreSQL Task Manager (Offline / Local)

A full-stack task manager using React 19.3, TypeScript, Vite, Node.js, Express, and PostgreSQL.

## Requirements
- Node.js LTS and npm
- PostgreSQL installed and running locally
- A terminal (PowerShell or VS Code terminal)

## 1. Create the database
Open pgAdmin or SQL Shell (psql), then run:

```sql
CREATE DATABASE task_manager;
```

Connect to `task_manager` and run the SQL in `database/schema.sql`.

## 2. Configure the backend
Open a terminal in the `backend` folder:

```powershell
Copy-Item .env.example .env
npm install
```

Edit `backend/.env` and set `PGUSER`, `PGPASSWORD`, and `PGPORT` to match your local PostgreSQL installation. The default PostgreSQL port is usually 5432.

Start the API:

```powershell
npm run dev
```

The API runs at http://localhost:5000. Keep this terminal open.

## 3. Configure the frontend
Open a second terminal in the `frontend` folder:

```powershell
npm install
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173.

## 4. Verify
- Add a task.
- Mark it complete.
- Edit it.
- Delete it.
- Refresh the page; tasks should remain because they are saved in PostgreSQL.

## API routes
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task
- `PUT /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task
- `GET /api/health` — API health check

## Offline note
Once Node.js, PostgreSQL, and npm packages are installed, the app runs on your computer without a cloud service. npm install normally needs internet the first time. To set up a fully offline computer, copy this project and its installed `node_modules` folders from a compatible machine, and install PostgreSQL locally.

## Security note
This is a learning/demo app. Keep `.env` private, do not commit credentials, and add authentication and production hardening before exposing it to a network.

## Run the full application with Docker Compose

### Requirements
Install Docker Desktop for Windows and make sure Docker Desktop is running.

### Start
From the project root (the folder containing `compose.yaml`), run in PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and change `POSTGRES_PASSWORD` to a password for this local development environment. Then run:

```powershell
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Open the frontend at http://localhost:5173. The API is at http://localhost:5000/api/health.

### Stop and restart
Stop containers but keep the database data:

```powershell
docker compose down
```

Start again:

```powershell
docker compose up -d
```

### Reset the database (DELETES SAVED TASKS)
To remove all saved database data and reinitialize the database schema:

```powershell
docker compose down -v
docker compose up --build -d
```

The schema in `database/schema.sql` is automatically executed only when PostgreSQL initializes an empty data volume. If you already have an existing `postgres_data` volume, changes to the schema file will not automatically run.

### Offline use
The first build normally needs internet to download the Docker base images and npm packages. After images and dependencies have been downloaded, you can run the containers offline with `docker compose up -d` as long as the needed images and packages remain available locally. Docker Desktop itself must be installed and running.
