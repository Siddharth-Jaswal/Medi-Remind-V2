# Deployment Guide

This guide provides step-by-step instructions for deploying the MediRemind system to production using **Vercel** for the frontend and **Render** for the backend.

---

## 1. Backend Deployment (Render)

We will use Render to host the FastAPI backend and its background scheduler.

1. **Create a Web Service on Render:**
   - Log into Render and click **New > Web Service**.
   - Connect your GitHub repository.

2. **Configure the Service:**
   - **Name:** `mediremind-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables:**
   Add the following secrets to the Render environment variables matching your `.env.production`:
   - `APP_ENV`: `production`
   - `MONGODB_URL`: Your MongoDB Atlas connection string.
   - `DATABASE_NAME`: `mediremind_prod`
   - `TELEGRAM_BOT_TOKEN`: Your bot token from BotFather.
   - `LLM_SERVICE_URL`: `https://api.groq.com/openai/v1/chat/completions`
   - `LLM_API_KEY`: Your Groq API Key.
   - `LLM_MODEL`: `qwen/qwen3.6-27b`
   - `UPLOAD_PASSWORD`: The secret password required to upload prescriptions (e.g., `secret`)

4. **Deploy:**
   - Click **Create Web Service**. 
   - Render will build and deploy your FastAPI application. Copy the resulting URL (e.g., `https://mediremind-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

We will deploy the Next.js frontend to Vercel.

1. **Import the Project:**
   - Log into Vercel and click **Add New > Project**.
   - Import your GitHub repository.

2. **Configure the Project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (Click edit and select the `frontend` folder).
   
3. **Set Environment Variables:**
   - Expand the **Environment Variables** section.
   - Add your backend URL so the frontend knows where to send API requests:
     - `NEXT_PUBLIC_API_URL`: The URL you copied from Render in step 1 (e.g., `https://mediremind-backend.onrender.com`).

4. **Deploy:**
   - Click **Deploy**. Vercel will automatically build the Next.js application and provide you with a live, production-ready URL!
