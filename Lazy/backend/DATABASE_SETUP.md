# Database Setup Guide

This guide will help you set up PostgreSQL for the Lazy backend.

## Option 1: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb lazy_db

# Create user (optional, you can use your default user)
# psql postgres
# CREATE USER lazy_user WITH PASSWORD 'your_password';
# GRANT ALL PRIVILEGES ON DATABASE lazy_db TO lazy_user;
```

### Update .env file
```bash
DATABASE_URL=postgresql+asyncpg://your_username@localhost:5432/lazy_db
# Or with password:
# DATABASE_URL=postgresql+asyncpg://lazy_user:your_password@localhost:5432/lazy_db
```

## Option 2: Docker PostgreSQL (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name lazy-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lazy_db \
  -p 5432:5432 \
  -d postgres:15

# Update .env file
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/lazy_db
```

## Option 3: SQLite (Quick Testing - No Setup Required)

For quick testing without PostgreSQL setup, you can use SQLite:

```bash
# Install SQLite driver
pip install aiosqlite

# Update .env file
DATABASE_URL=sqlite+aiosqlite:///./lazy.db
```

**Note:** SQLite is fine for development, but PostgreSQL is recommended for production.

## Initialize Database Tables

After setting up the database, run migrations:

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

## Verify Database Connection

Start the server and check the logs:
```bash
python main.py
```

You should see: `Database connection initialized` in the logs.

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `brew services list` (macOS) or `docker ps` (Docker)
- Check the port: default is 5432
- Verify DATABASE_URL format in .env

### Authentication Failed
- Check username and password in DATABASE_URL
- For local PostgreSQL, you might need to use your macOS username without a password

### Migration Errors
- Make sure you've run `alembic revision --autogenerate -m "Initial schema"` first
- Check that all models are imported in `alembic/env.py`

