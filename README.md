# MediRemind AI - Project Architecture

MediRemind is an AI-powered smart prescription reminder system. It allows users to upload images of their medical prescriptions, automatically extracts the prescribed medicines and dosages using state-of-the-art Vision AI, and schedules automated push notifications via Telegram to remind users to take their medicines on time.

## High-Level Architecture

The project is built on a decoupled architecture, separating the client-side user interface from the heavy backend AI processing and scheduling tasks.

```mermaid
graph TD
    User([User]) -->|Interacts with UI| Frontend[Next.js Frontend]
    User -->|Receives Notifications| Telegram[Telegram App]
    
    Frontend -->|Uploads Image & Syncs Data| Backend[FastAPI Backend]
    
    subgraph Backend Infrastructure
        Backend -->|Saves/Reads Data| DB[(MongoDB)]
        Backend -->|Schedules Tasks| Scheduler[APScheduler]
        Scheduler -->|Triggers Messages| TelegramBot[Telegram Bot API]
    end
    
    subgraph AI Extraction Layer
        Backend -->|Sends Image (Base64)| Groq[Groq API / Qwen Vision]
        Backend -.->|Optional Local Fallback| LMStudio[LMStudio Local API]
        Groq -->|Returns Structured JSON| Backend
    end
    
    TelegramBot -->|Sends Message| Telegram
```

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **DB Client:** Motor (Async MongoDB Driver)
- **Task Scheduling:** APScheduler (Background task runner for medication reminders)
- **Integrations:** Telegram Bot API (python-telegram-bot)

### AI Services
- **Primary Production OCR:** Groq Cloud API using the blazing fast **`qwen/qwen3.6-27b`** multimodal vision model.
- **Local Fallback:** LMStudio (Exposes an OpenAI-compatible endpoint for localized, privacy-first inference).

## Core Workflows

### 1. Prescription Parsing
When a user uploads a prescription image, the Next.js frontend sends it to the FastAPI backend. The backend encodes the image to Base64 and constructs a standard OpenAI-compatible JSON payload. It passes this to the Groq Vision API (or LMStudio) with strict prompt instructions. The AI model reads the image and returns a clean, structured JSON array of medicines, dosages, and duration.

### 2. Reminder Scheduling
When a user saves a prescription to their profile, the medicines are stored in MongoDB. The backend runs an asynchronous background process via `APScheduler`. Every minute, it checks the database for medicines whose schedule matches the current time and dispatches an alert through the Telegram Bot API directly to the user's connected Telegram Chat ID.
