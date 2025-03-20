# HonkSpotter Flask Backend

## Prerequisites

- Python 3.x installed
- `pip` installed

## Getting Started

### 1. Set Up a Virtual Environment

It is highly recommended that you use a virtual environment to isolate your project dependencies.

#### Create the Virtual Environment

```bash
python3 -m venv .venv
```

#### Activate the Virtual Environment

```bash
source .venv/Scripts/activate
```

After activation, your shell prompt should indicate that you're working inside the `.venv` environment. To deactivate the environment, simply run:

```bash
deactivate
```

### 2. Install Dependencies

Install the required dependencies for the project:

```bash
pip install -r requirements.txt
```

To update the required dependencies, update the `requirements.in` file and run `pip-compile` to generate a new `requirements.txt` file.

### 3. Setup environment variables

Copy the `.env.example` file to `.env` and replace `YOUR_SECRET_KEY`

```bash
cp .env.example .env
```

### 4. Set up the Database

The easiest way to set up a PostgreSQL database is to use Docker.

```bash
docker pull postgres

docker run --name honkspotter_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=honkspotter_db \
  -p 5432:5432 -d postgres
```

To create a new migration, update the models in `app/models` and run:

```bash
python -m flask db migrate -m "<Migration Name>"
```

After creating the migration, upgrade the database:

```bash
python -m flask db upgrade
```

An easy way to view interact with the database is to run pgAdmin in docker:

```bash
docker run --name pgadmin4 -p 8080:80 -e "PGADMIN_DEFAULT_EMAIL=user@example.com" -e "PGADMIN_DEFAULT_PASSWORD=admin" -d dpage/pgadmin4
```

Alternatively, if you can't get pgAdmin to work, you can inspect the database through command line:

```bash
docker exec -it "<postgres container name>" bash
psql -U postgres
\c honkspotter_db
```

### 5. Run the Application

To run the application, use the following command:

```bash
python -m flask run --port 8000
```

This will start the Flask development server and you should be able to access the application at `http://localhost:8000`.

## Testing

To run the tests, use the following command:

```bash
pytest
```

This will run all tests in the `tests` directory and generate a report in the terminal.

You can also run specific tests by providing the test file name:

```bash
pytest tests/test_auth.py
```
