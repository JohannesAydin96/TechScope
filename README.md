# TechScope

A full-stack project and task management application built with React, TypeScript, FastAPI, and PostgreSQL.

TechScope provides a centralized workspace for managing projects and tasks, tracking progress and deadlines, and keeping project-related information organized in one place.

The application includes project and task management, task filtering and search, deadline tracking, dashboard analytics, comments, file attachments, activity history, and project-scoped notifications. It also includes JWT-based authentication, database migrations with Alembic, and an automated backend test suite.

TechScope was built as a full-stack software development project with a focus on clear separation between frontend and backend, structured API design, data integrity, and practical project management functionality.

## Key Features

- **Project Management** – Create, rename, select, and delete projects with project-specific data management.
- **Task Management** – Create, view, edit, and delete tasks with status, priority, due dates, descriptions, and labels.
- **Search, Filtering & Sorting** – Search tasks by title or description, filter by status and labels, and sort by date, priority, status, or deadline.
- **Dashboard Analytics** – Track project progress, task status and priority distributions, deadline metrics, and overall project insights.
- **Deadline Tracking** – Identify overdue, due-today, upcoming, and completed tasks through visual indicators and dashboard summaries.
- **Comments & Activity History** – Add and manage task comments while keeping track of task-related activity.
- **File Attachments** – Upload, download, and delete files associated with individual tasks.
- **Notifications** – Project-scoped notifications with unread states, mark-as-read functionality, and notification management.
- **Authentication** – User registration and login with JWT-based authentication and protected frontend routes.
- **Responsive Interface** – Dashboard and task management interfaces designed to adapt across different screen sizes.
- **Automated Testing** – Backend test suite covering core application functionality and data behavior.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- FastAPI
- Python
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication

### Database

- PostgreSQL

### Testing

- pytest
- FastAPI TestClient

### Development

- Git
- Docker Compose

## Project Structure

```text
techscope/
├── backend/
│   ├── alembic/             # Database migrations
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Configuration, security, and error handling
│   │   ├── db/              # Database setup and dependencies
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Application and business logic
│   │   └── main.py          # FastAPI application entry point
│   ├── tests/               # Backend automated tests
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/             # Shared API client
│       ├── components/      # Reusable UI and dashboard components
│       ├── context/         # Shared dashboard state
│       ├── hooks/           # Reusable React hooks
│       ├── pages/           # Application pages
│       ├── services/        # Frontend API services
│       ├── styles/          # Application styles
│       ├── types/           # Shared TypeScript types
│       ├── App.tsx          # Application routing
│       └── main.tsx         # React entry point
│
├── docs/
│   └── screenshots/         # README application screenshots
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Application Preview

### Dashboard Overview

The main dashboard provides an overview of the selected project, including task statistics, deadline information, project progress, and quick access to project and task management.

<p align="center">
  <img src="docs/screenshots/dashboard-overview.png" alt="TechScope dashboard overview" width="850">
</p>

### Project Analytics

Project progress, task status distribution, and dashboard insights provide a quick overview of the current state of the project.

<p align="center">
  <img src="docs/screenshots/dashboard-analytics.png" alt="TechScope dashboard analytics" width="850">
</p>

### Upcoming Deadlines

Tasks that require attention are highlighted based on their due dates, including overdue, due-today, and upcoming tasks.

<p align="center">
  <img src="docs/screenshots/dashboard-deadlines.png" alt="TechScope upcoming deadlines" width="850">
</p>

### Task Management

Tasks can be searched, filtered, sorted, updated, and managed directly from the dashboard.

<p align="center">
  <img src="docs/screenshots/dashboard-tasks.png" alt="TechScope task management" width="850">
</p>

### Task Details

The task details view brings together task information, deadline insights, activity history, comments, attachments, and quick actions.

<p align="center">
  <img src="docs/screenshots/task-details-overview.png" alt="TechScope task details overview" width="750">
</p>

<p align="center">
  <img src="docs/screenshots/task-details-activity.png" alt="TechScope task activity history" width="750">
</p>

<p align="center">
  <img src="docs/screenshots/task-details-comments-attachments.png" alt="TechScope task comments and attachments" width="750">
</p>

### Authentication

TechScope includes user authentication with registration, login, and protected application routes.

<p align="center">
  <img src="docs/screenshots/login.png" alt="TechScope login" width="600">
</p>

## Backend & API

The TechScope backend is built with FastAPI and provides a REST API for the application's core functionality.

The backend handles:

- User registration and JWT-based authentication
- Project creation, retrieval, updates, and deletion
- Task CRUD operations with status, priority, due dates, and labels
- Task search, filtering, and sorting
- Dashboard statistics and deadline-related metrics
- Task comments and activity history
- File attachment management
- Project-scoped notifications
- Database persistence through SQLAlchemy
- Database schema migrations through Alembic

The API is organized into separate routes, schemas, models, and service layers to keep request handling, data validation, persistence, and application logic clearly separated.

## Frontend

The TechScope frontend is built with React and TypeScript and provides the user interface for managing projects, tasks, and project-related information.

The frontend includes:

- Login and registration pages with protected and public routes
- Project selection and project management controls
- Task creation, editing, deletion, and detailed task views
- Task search, filtering, and sorting
- Status, priority, label, and deadline indicators
- Dashboard statistics, progress tracking, and project insights
- Upcoming deadline and recent task views
- Task comments, file attachments, and activity history
- Project-scoped notification management
- Responsive layouts for different screen sizes

Frontend API communication is separated into service modules, while shared dashboard state is managed through React Context. Reusable components and hooks are used to keep the interface organized and reduce duplication.

## Database & Migrations

TechScope uses PostgreSQL as its relational database, with SQLAlchemy handling database models, relationships, and persistence.

Database schema changes are managed through Alembic migrations, allowing the database structure to evolve alongside the application while keeping schema changes versioned and reproducible.

The data model includes users, projects, tasks, comments, attachments, task activity, notifications, and notes. Relationships and cascade behavior are configured to maintain data integrity when related records are updated or deleted.

## Authentication & Security

TechScope uses JWT-based authentication to protect user-specific application data and API endpoints.

Users can register and log in through the frontend, with authenticated requests including the user's access token when communicating with protected backend endpoints.

The application includes:

- Password hashing before credentials are stored
- JWT access token generation and validation
- Protected backend endpoints for authenticated users
- Protected and public route handling in the frontend
- User ownership checks for project and task-related operations
- Environment-based configuration for sensitive values such as the JWT secret and database connection details

Sensitive configuration is kept outside the source code through environment variables and is excluded from version control.

## Testing

The backend includes an automated pytest test suite covering the application's core API functionality and data behavior.

The test suite covers areas including:

- Authentication and user-related functionality
- Project and task operations
- Dashboard data and analytics
- Task comments and attachments
- Task activity history
- Project-scoped notifications
- Database relationships and data integrity

The current backend test suite contains 43 tests, all passing after the final application verification.

## Installation & Local Setup

### Prerequisites

Before running TechScope locally, make sure the following are installed:

- Python 3.11 or later
- Node.js and npm
- Docker Desktop

### 1. Start the PostgreSQL Database

From the project root, start the PostgreSQL 17 database using Docker Compose:

```bash
docker compose up -d
```

The Docker configuration creates a PostgreSQL database with the following local development settings:

- Database: `techscope_db`
- Host: `localhost`
- Port: `5433`
- User: `postgres`

Database data is stored in a persistent Docker volume.

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory using `.env.example` as a template.

The backend requires the following environment variables:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/techscope_db
SECRET_KEY=replace-with-a-secure-secret-key
```

The `.env` file is excluded from version control and should not contain credentials intended for public distribution.

### 4. Apply Database Migrations

From the `backend` directory, apply all Alembic migrations:

```bash
python -m alembic upgrade head
```

### 5. Start the Backend

Start the FastAPI development server:

```bash
python -m uvicorn app.main:app --reload
```

### 6. Set Up the Frontend

Open a second terminal and navigate to the frontend directory from the project root:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The terminal will display the local URL where the frontend is available.

### 7. Run the Backend Tests

The backend tests use a separate PostgreSQL database named `techscope_test`.

Create the test database once from the project root:

```bash
docker exec techscope_db createdb -U postgres techscope_test
```

Create a `.env.test` file inside the `backend` directory using `.env.test.example` as a template:

```env
TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5433/techscope_test
```

With the backend virtual environment activated and the PostgreSQL container running, navigate to the `backend` directory and run:

```bash
python -m pytest
```

The test suite automatically resets the test database between tests and refuses to run if the configured database URL does not reference `techscope_test`.

## API Documentation

FastAPI automatically generates interactive API documentation from the application's routes and schemas.

With the backend running locally, the API documentation is available at:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

The OpenAPI schema is also available at:

- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

The API is organized around resources including authentication, users, projects, tasks, dashboard data, comments, attachments, task activity, notifications, and notes.

Protected endpoints require a valid JWT access token. Swagger UI can be used to explore the available endpoints, inspect request and response schemas, and test API operations during local development.

## Development Commands

Once the project has been set up, the following commands are useful during local development:

### Database

Start the PostgreSQL container:

```bash
docker compose up -d
```

Stop the containers:

```bash
docker compose down
```

### Backend

Start the FastAPI development server from the `backend` directory:

```bash
python -m uvicorn app.main:app --reload
```

Apply pending database migrations:

```bash
python -m alembic upgrade head
```

Run the backend test suite:

```bash
python -m pytest
```

### Frontend

Start the frontend development server from the `frontend` directory:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

## License

Copyright © 2026 Johannes Aydin. All rights reserved.

This project is publicly available for portfolio and demonstration purposes.

You may view, clone, and run the project locally for personal evaluation and demonstration purposes.

You may not modify, redistribute, sublicense, sell, or use the source code or substantial portions of it as part of your own project or for commercial purposes without explicit permission from the copyright holder.