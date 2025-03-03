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

### 3. Run the Application

To run the application, use the following command:

```bash
python -m flask run --port 8080
```

This will start the Flask development server and you should be able to access the application at `http://localhost:8080`.

