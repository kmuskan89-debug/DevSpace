# DevSpace Production Deployment Guide

This guide outlines the step-by-step instructions to deploy **DevSpace** to production using **Vercel** for the frontend, **Render** for the backend, **MongoDB Atlas** for the database, and **Cloudinary** for media storage.

---

## 1. Architecture Overview

- **Frontend:** React 19 SPA + Vite + Tailwind CSS v4 hosted on **Vercel Edge Network**.
- **Backend:** Express 5.2.1 REST API hosted as a **Render Web Service**.
- **Database:** **MongoDB Atlas** M0/M10+ Replica Set.
- **File Storage:** **Cloudinary** (optional image and asset uploads).

---

## 2. Environment Variables Inventory

### 2.1 Backend Environment Variables (Render)

Configure these in **Render Dashboard > Web Service > Environment**:

| Variable Name | Required | Default / Format | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables strict CORS enforcement, sanitized errors, and rate limits. |
| `PORT` | Auto | `10000` | Injected automatically by Render. |
| `MONGO_URI` | **Yes** | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/DevSpace?retryWrites=true&w=majority` | Connection string for MongoDB Atlas replica set. |
| `JWT_SECRET` | **Yes** | 64+ char random hex | Secret key used to sign and verify JWT authentication tokens. |
| `CLIENT_URL` | **Yes** | `https://<your-app>.vercel.app` | Primary production domain of the Vercel frontend. |
| `ALLOWED_ORIGINS`| **Yes** | `https://<your-app>.vercel.app` | Comma-separated list of allowed CORS origins (include custom domains). |
| `CLOUDINARY_CLOUD_NAME` | No | `<your-cloud-name>` | Cloudinary account name (only if direct uploads are configured). |
| `CLOUDINARY_API_KEY` | No | `<your-api-key>` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | No | `<your-api-secret>` | Cloudinary API Secret. |
| `SMTP_HOST` | No | `smtp.mailgun.org` | Transactional email provider for password recovery. |
| `SMTP_PORT` | No | `587` | SMTP port. |
| `SMTP_USER` | No | `<smtp-user>` | SMTP username. |
| `SMTP_PASS` | No | `<smtp-password>` | SMTP password. |
| `EMAIL_FROM` | No | `DevSpace <noreply@yourdomain.com>` | Sender address for system emails. |

> [!TIP]
> Generate a cryptographically secure 64-character JWT secret locally using:  
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### 2.2 Frontend Environment Variables (Vercel)

Configure these in **Vercel Dashboard > Project Settings > Environment Variables**:

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `https://<your-backend>.onrender.com/api` | Full URL to the backend Express API. Must include `/api` suffix. |

---

## 3. Cloud Services Configuration

### 3.1 MongoDB Atlas Setup

1. **Create Cluster:** Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and deploy a shared (M0) or dedicated cluster.
2. **Database User:**
   - Navigate to **Security > Database Access**.
   - Create a database user (e.g. `devspace_app`).
   - Grant role: **Read and write to any database** (or restrict to `DevSpace`).
   - Save the password securely. If the password contains special characters (`@`, `:`, `/`, `#`), ensure it is URL-encoded.
3. **Network Access (IP Whitelist):**
   - Navigate to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) with description `Render Dynamic Outbound`.
4. **Obtain Connection String:**
   - Under **Deployment > Database**, click **Connect > Drivers (Node.js)**.
   - Copy the connection URI:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/DevSpace?retryWrites=true&w=majority`
   - Ensure the database name in the path is explicitly set to `DevSpace`.

---

### 3.2 Render Backend Deployment

1. **Create Web Service:**
   - Log into [Render](https://render.com) and click **New > Web Service**.
   - Connect your GitHub repository.
2. **Build & Runtime Settings:**
   - **Name:** `devspace-api` (or preferred name).
   - **Region:** Select the region closest to your MongoDB Atlas cluster (e.g., Frankfurt, Oregon, Ohio).
   - **Root Directory:** `Backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/health`
3. **Set Environment Variables:**
   - Add all required variables listed in Section 2.1 (`NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, etc.).
   - *Note on Initial Deploy:* Set `CLIENT_URL` and `ALLOWED_ORIGINS` to `http://localhost:5173` temporarily until your Vercel domain is created in the next step.
4. **Deploy & Verify:**
   - Trigger manual deploy.
   - Once deployed, visit `https://<your-render-service>.onrender.com/health`.
   - Confirm it returns: `{"status":"ok","database":"connected"}`.

---

### 3.3 Vercel Frontend Deployment

1. **Import Project:**
   - Log into [Vercel](https://vercel.com) and click **Add New > Project**.
   - Import your GitHub repository.
2. **Project Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit to `Frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variables:**
   - Add `VITE_API_BASE_URL`: `https://<your-render-service>.onrender.com/api`.
4. **Deploy:**
   - Click **Deploy**.
   - Verify deployment succeeds and copy the production URL (e.g. `https://devspace-app.vercel.app`).
5. **SPA Routing Verification:**
   - `Frontend/vercel.json` contains:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/" }
       ]
     }
     ```
   - Test navigating to `/dashboard` or `/workspace/<id>/board` and performing a hard browser refresh (`Ctrl+F5`). The page will load without 404 errors.

---

### 3.4 Bind Vercel Domain to Render CORS

Now that your Vercel URL is established:

1. Return to **Render Dashboard > `devspace-api` > Environment**.
2. Update:
   - `CLIENT_URL`: `https://<your-app>.vercel.app`
   - `ALLOWED_ORIGINS`: `https://<your-app>.vercel.app`
3. Save changes. Render will automatically redeploy the backend with the updated CORS whitelist.

---

## 4. Recommended Deployment Sequence

```
Step 1: Provision MongoDB Atlas Cluster & create user + allowlist 0.0.0.0/0
   │
   ▼
Step 2: Deploy Backend to Render (Root: Backend, Start: node server.js)
   │
   ▼
Step 3: Verify Backend health: GET https://<render-service>.onrender.com/health
   │
   ▼
Step 4: Deploy Frontend to Vercel (Root: Frontend, VITE_API_BASE_URL=https://<render-service>.onrender.com/api)
   │
   ▼
Step 5: Update Render CLIENT_URL & ALLOWED_ORIGINS with final Vercel domain
   │
   ▼
Step 6: Run End-to-End Smoke Tests on production Vercel URL
```

---

## 5. Post-Deployment Verification Checklist

- [ ] `GET /health` returns `{ "status": "ok", "database": "connected" }`.
- [ ] User registration and login succeeds with JWT stored in `localStorage`.
- [ ] Workspace creation and project creation work smoothly.
- [ ] Kanban drag-and-drop task movements persist across page refreshes.
- [ ] Backlog issue reordering and sprint lifecycles function properly.
- [ ] Direct page refresh on `/workspace/:id/board` returns the app without 404.
- [ ] Requests from unlisted domains receive HTTP 403 CORS rejection.
- [ ] CSV exports for tasks, projects, and team workload download successfully.

