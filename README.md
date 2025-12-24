# Spur Chat Agent

A full-stack AI customer support agent built for the Spur founding engineer take-home assignment.
Built with **Node.js/Express**, **SvelteKit**, **SQLite**, and **OpenAI**.

## Key Features
- **Live Chat Interface**: Responsive, modern UI built with SvelteKit and vanilla CSS (glassmorphism details).
- **AI Integration**: Uses OpenAI to answer customer queries with e-commerce context (shipping, updates, etc.).
- **Persistence**: SQLite database stores all conversations and messages.
- **Robustness**: Handles errors gracefully, input validation with Zod, and self-recovering sessions.

## Quick Start

### Prerequisites
- Node.js (v18+)
- OpenAI API Key

### 1. Backend Setup
The backend handles LLM interaction and data persistence.

```bash
cd server
npm install

# Create environment file
# Add: OPENAI_API_KEY=your_key_here
# Optional: PORT=3000 (default)
echo "OPENAI_API_KEY=sk-..." > .env

# Initialize Database
npm run db:push

# Start Server
npm run dev
```

### 2. Frontend Setup
The frontend is a SvelteKit app providing the chat widget.

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to chat!

## Architecture Overview

### Backend (`/server`)
- **Framework**: Express.js with TypeScript. Chosen for simplicity and speed of development.
- **Database**: SQLite with **Drizzle ORM**.
  - Why? SQLite requires zero setup (great for take-homes/prototypes), but Drizzle allows swapping to PostgreSQL easily for production.
- **API Structure**:
  - `POST /chat/message`: Stateless-ish endpoint. Accepts a session ID (or creates one) and a message. Returns the AI response.
  - **Service Layer**: `services/llm.ts` encapsulates OpenAI logic, making it easy to swap for Claude or others.

### Frontend (`/client`)
- **Framework**: SvelteKit.
  - Why? Extremely fast, little boilerplate, and reactive state management is perfect for chat UIs.
- **Styling**: Vanilla CSS with CSS Variables (`app.css`).
  - No Tailwind (per prompt reference "if you're faster there" / "No fancy design system"), but I implemented a clean, professional design system ("Inter" font, consistent spacing/colors).

## Trade-offs & Future Improvements
- **Security**: There is currently no rigorous auth or rate limiting. In production, I'd add `express-rate-limit` and perhaps turnstile/captcha.
- **Database**: SQLite is file-based. For a real high-scale app, I'd use PostgreSQL (Drizzle makes this migration easy) and Redis for caching LLM responses.
- **LLM Context**: Currently, we just dump the last 10 messages. For longer chats, a RAG (Retrieval Augmented Generation) approach or summary-based context window would be better to save tokens.
- **Real-time**: Currently uses HTTP request/response. For a "typing" indicator that is true to life, Server-Sent Events (SSE) or WebSockets (`socket.io`) would provide a streaming experience.

## "Idiot-Proofing"
- **Validation**: Uses `zod` to validate all incoming requests.
- **Error Handling**: The UI gracefully shows error banners if the backend is down or the LLM fails, without crashing the page.
- **Session Recovery**: Stores session ID in `localStorage` so refreshing the page doesn't lose your conversation context (backend history loading logic is prepared).
