# CU Fitness

Concordia fitness planning app.

## Team - Stacktrace

### Members

| Name | Role |
|------|------|
| Maxim Bacar | Scrum Master & Developer |
| Mahsa Khatibi | Developer |
| Rijja Fernandez | Developer |
| Zenil Mehta | Developer |

## Features

### Members
- Profile management with fitness goals, dietary restrictions, and physical stats
- Personalized workouts with progress tracking and visualization
- Nutrition tracking with meal suggestions and recipe database
- Coach booking with session management and history
- Real-time gym capacity and equipment availability
- FAQ assistant for policies, nutrition, and booking guidance

### Coaches
- Profile setup with biography, specializations, and availability
- Client and session management with booking approval workflow
- Workout creation and assignment with progress monitoring
- Equipment reservation and issue reporting
- Direct messaging and feedback system with clients

## Getting started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.14+ |
| Node.js | 22.16+ |

### 1. Clone the repository

```bash
git clone https://github.com/MaximBacar/stacktrace-coen6311.git
cd stacktrace-coen6311
```

### 2. Environment variables

Create the file `backend/.env` with the following content:

```
OPENAI_API_KEY=sk-proj-...
```

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key, used by the FAQ assistant. Get one at [platform.openai.com](https://platform.openai.com/api-keys). |

> `.env` is gitignored and must be created manually on each machine.

### 3. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

### 4. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

Developed as part of the Master's of Electrical & Computer Engineering program at Concordia University.