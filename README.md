# Spur Chat Agent

A full-stack AI customer support agent built for the Spur founding engineer take-home assignment.
This monorepo contains a Node.js/Express backend and a SvelteKit frontend.

**Live Demo**: [Add your Vercel/Render URL here after deploying]

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### 1. Setup Backend
The backend handles the LLM integration and SQLite database.

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `server` directory:
   ```bash
   # server/.env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```
4. Initialize the Database:
   This runs the Drizzle migrations to set up your SQLite file.
   ```bash
   npm run db:push
   ```
5. Start the Server:
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:3000`.

### 2. Setup Frontend
The frontend is a SvelteKit application providing the chat interface.

1. Open a **new terminal** and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Frontend:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` to chat!

---

## 🛠 Architecture Overview

### Backend (`/server`)
Structuring for simplicity and extensibility was the goal.

- **Framework**: **Express.js** with **TypeScript**.
  - *Why?* Lightweight, well-understood by every JS developer, and perfect for a stateless API.
- **Database**: **SQLite** (via `better-sqlite3`) interacting through **Drizzle ORM**.
  - *Design Decision*: Used SQLite for zero-config local development, but formatted the schema such that switching to PostgreSQL in production is just changing the driver line in Drizzle.
- **Folder Structure**:
  - `routes/`: API endpoint definitions (separation of concerns).
  - `services/`: Business logic. `llm.ts` handles the AI API, allowing us to easily swap providers (e.g., switch from Gemini to OpenAI) without touching the route handlers.
  - `db/`: Database schema and migration logic.

### Frontend (`/client`)
- **Framework**: **SvelteKit**.
  - *Why?* Svelte's reactivity model is ideal for real-time chat interfaces (fewer re-renders than React), and it ships less JS to the browser.
- **Styling**: **Vanilla CSS**.
  - *Design Decision*: Created a clean, "glassmorphism" aesthetic with custom CSS variables. Avoided heavy UI libraries to demonstrate CSS proficiency and keep the bundle small.

---

## 🤖 LLM Notes

- **Provider**: **Google Gemini (Model: `gemini-1.5-flash`)**.
  - *Why?* It offers extremely fast inference speed (crucial for chat) and a generous free tier compared to OpenAI.
- **Prompting Strategy**:
  - **System Prompt**: Functions as the "Constitution" for the agent. It enforces the persona (Friendly Support Agent), defines shipping policies, and restricts the AI from hallucinating policies (e.g., "Do not make up facts").
  - **History Management**: We pass the last N messages to the API to maintain conversation context.
- **Format Sanitization**: The prompt explicitly asks for short, concise replies to mimick a real chat agent, rather than generating long essay-style paragraphs.

---

## ⚖️ Trade-offs & "If I had more time..."

1. **Database Scalability**:
   - *Current*: SQLite files are great for dev but bad for containers (Render/Heroku usually have ephemeral filesystems).
   - *Improvement*: Switch to a managed PostgreSQL (e.g., Supabase/Neon). Drizzle ORM setup makes this very easy.

2. **Wait Times / Typewriter Effect**:
   - *Current*: Standard HTTP Request -> Response. The user waits for the full generation locally.
   - *Improvement*: Implement **Server-Sent Events (SSE)** to stream the response token-by-token. This makes the app feel much faster.

3. **Authentication**:
   - *Current*: Session based on `localStorage` ID.
   - *Improvement*: Add JWT-based auth or signed cookies to prevent users from spoofing other sessions.

4. **Context Awareness**:
   - *Current*: Raw text history.
   - *Improvement*: Implement RAG (Retrieval Augmented Generation). Store the "Knowledge Base" (shipping info, FAQs) in a vector DB (Pinecone/pgvector) and search only relevant info to inject into the context. This reduces token cost and increases accuracy for large docs.
