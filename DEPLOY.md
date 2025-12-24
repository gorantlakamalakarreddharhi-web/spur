# Deployment Guide

This project is structured as a monorepo with a `server` (Node.js/Express) and `client` (SvelteKit). Here is how to deploy them.

## 1. Deploying the Backend (Render.com)
The backend requires a persistent environment (for SQLite) or a standard Node.js environment if you switch to PostgreSQL (recommended).

1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repository.
3.  Settings:
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Environment Variables**:
        *   `GEMINI_API_KEY`: Your Google Gemini API Key.
        *   `Device`: `sqlite` (or configure a Disk if using SQLite, otherwise use `DATABASE_URL` for Postgres).

## 2. Deploying the Frontend (Vercel)
Vercel is the easiest way to deploy SvelteKit.

1.  Install the Vercel CLI or go to [vercel.com/new](https://vercel.com/new).
2.  Import your repository.
3.  Settings:
    *   **Root Directory**: `client`
    *   **Framework Preset**: SvelteKit (should auto-detect).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `build` (standard SvelteKit output).
4.  **Environment Variables**:
    *   You might need to adjust the API URL in `client/src/lib/api.ts` to point to your deployed Render backend URL (e.g., `https://your-app.onrender.com`).

### connecting Frontend to Backend
In `client/src/lib/api.ts`, change:
```typescript
const API_BASE = 'http://localhost:3000';
```
to:
```typescript
const API_BASE = 'https://your-backend-service.onrender.com'; // Your actual backend URL
```
(Or use an environment variable `PUBLIC_API_URL` in SvelteDescription).
