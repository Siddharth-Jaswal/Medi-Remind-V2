# Local Run Guide

This project features a completely unified local execution environment. You can launch both the Next.js frontend and the FastAPI backend simultaneously with a single command from the root of the repository!

## Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Running locally on `mongodb://localhost:27017`)

## 1. Initial Setup

First, you need to install the dependencies for both parts of the application.

### Frontend
Navigate to the frontend folder and install Node modules:
```bash
cd frontend
npm install
cd ..
```

### Backend
Navigate to the backend folder, create a virtual environment, and install the Python requirements:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # On Windows
# source .venv/bin/activate # On Mac/Linux
pip install -r requirements.txt
cd ..
```

## 2. Environment Configuration

Ensure that your `backend/.env.development` file is configured correctly. By default, it points to your local MongoDB and your local LMStudio AI setup:

```env
MONGODB_URL="mongodb://localhost:27017"
DATABASE_NAME="mediremind_dev"
TELEGRAM_BOT_TOKEN="your_test_telegram_bot_token"

# Local LMStudio Configuration
LLM_SERVICE_URL="http://localhost:1234/v1/chat/completions"
LLM_API_KEY="lm-studio"
LLM_MODEL="local-model"
```

## 3. Running the Application

You do not need to open separate terminal windows for the frontend and backend. We have configured a root `package.json` to handle everything.

From the **root directory** of the repository, simply run:

```bash
npm run dev
```

**What this does:**
1. It automatically boots the Next.js frontend on `http://localhost:3000`.
2. It sets the `APP_ENV=development` flag for the backend.
3. It boots the FastAPI backend on `http://localhost:8001`, activating your `.venv` and enabling hot-reloading.

You can now visit `http://localhost:3000` to interact with your local development environment!
