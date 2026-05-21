# SyncFlow ⚡ | Premium Team Task Manager

SyncFlow is a production-ready, highly polished, and fully responsive **Team Task Manager** inspired by the sleek aesthetics of premium modern work tools like **Linear**, **Notion**, and **Jira**. 

Designed for ultimate clarity, high-speed execution, and seamless team collaboration, SyncFlow is built with a powerful **MERN** (Node.js, Express, MongoDB, React, Vite) architecture, featuring bespoke **Vanilla CSS styling** to deliver a premium, lightweight, and zero-config user experience.

---

## 🎨 Key Features & Showcase Highlights

*   **🔒 Role-Based Access Control (RBAC)**: Supports distinct **Administrator** (Admin) and **Team Member** (Member) roles. The system automatically restricts navigation panels and restricts API routes on the backend.
*   **📊 Dynamic Role-Tailored Dashboard**:
    *   *Admins* see a system-wide overview of all metrics (Total, Completed, In Progress, Overdue tasks) and projects.
    *   *Members* see dashboard statistics automatically scoped down to their assigned projects.
*   **✅ "My Tasks" Quick-Checklist**: A dedicated task queue for logged-in members, automatically sorted by deadline. Members can mark tasks as completed in 1-click directly from the dashboard!
*   **📋 Kanban Workflow Board**: A beautiful, fluid drag-inspired list layout mapping task lifecycles across four statuses: *Todo*, *In Progress*, *Review*, and *Done*.
*   **🔔 Intelligent Overdue Visual Highlighter**: Tasks whose due date is in the past that are *not* completed automatically glow with red borders and receive caution badges on dashboards and boards.
*   **👥 Reactive Assignee Association**: When creating/editing a task, the assignee dropdown dynamically updates based on the selected project, showing *only* authorized members of that specific project.
*   **⚡ Recruiter One-Click Demo Login**: The login screen features interactive, glowing buttons that automatically populate and authenticate Admin or Member roles for quick recruiter testing.

---

## 🛠️ Technology Stack

*   **Frontend**: React (v18) + Vite (ultra-fast bundler) + React Router v6 + Axios + Lucide-react Icons.
*   **Backend**: Node.js + Express.js REST API + Mongoose ODM (MongoDB).
*   **Security & Encryption**: JSON Web Tokens (JWT) + Hashed Passwords (`bcryptjs`) + CORS headers.
*   **Styling**: Bespoke Vanilla CSS with modular properties, custom shadow states, glassmorphic filters, and fluid CSS transitions.

---

## 🔑 Demo Showcase Credentials

Use the glowing quick-autofill buttons on the login page, or manually enter these seeded accounts:

| Role | Email Address | Password | Permissions & Views |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskmanager.com` | `password123` | Create/edit/delete projects, tasks, authorize teammates, full stats view |
| **Regular Member** | `alice@taskmanager.com` | `password123` | View assigned projects, view assigned tasks, update task status |
| **Regular Member** | `bob@taskmanager.com` | `password123` | View assigned projects, view assigned tasks, update task status |

---

## 📂 Project Directory Structure

```
TASKMANAGER/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Sidebar drawer, breadcrumb Headers
│   │   ├── context/            # AuthContext (sessions), AppContext (CRUD & Toasts)
│   │   ├── pages/              # Login, Signup, Dashboard, Projects, Tasks
│   │   ├── styles/             # theme.css (Geist/Linear Design system tokens)
│   │   ├── App.jsx             # Routes & Route Guards
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                     # Express Backend
│   ├── controllers/            # Logic handlers (auth, projects, tasks, users)
│   ├── middleware/             # auth.js (JWT verify & RequireRole gates)
│   ├── models/                 # Mongoose schemas (User, Project, Task)
│   ├── routes/                 # REST endpoints
│   ├── db/                     # seed.js (Roster and task database initializer)
│   ├── .env.example            # Environment configuration template
│   └── server.js               # Express database binder and listener
│
└── README.md
```

---

## 🚀 Local Setup & Installation

Follow these steps to run the complete workspace locally on your computer:

### Prerequisites
Make sure your computer has:
*   [Node.js](https://nodejs.org/) (LTS Version 16 or newer)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (or have a remote MongoDB Atlas database URL).

---

### Step 1: Clone and Configure the Server

1. Open a terminal in the `/server` directory:
   ```bash
   cd server
   ```
2. Install the backend packages:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   *   Copy `.env.example` to a new file named `.env`:
       ```bash
       cp .env.example .env
       ```
   *   Ensure the configurations are correct:
       *   `PORT=5000`
       *   `DATABASE_URL=mongodb://127.0.0.1:27017/taskmanager` (your local MongoDB)
       *   `JWT_SECRET`=*(choose a strong secret word)*
       *   `CLIENT_URL=http://localhost:5173`

---

### Step 2: Seed the Database

SyncFlow features a powerful automatic seeding script that clears any leftover databases and seeds 1 Admin, 2 Members, 2 Projects, and 6 Tasks (representing done, in-progress, and overdue states) so the app looks complete immediately.

While still inside the `/server` folder, execute:
```bash
npm run seed
```
*Expected Output: "Database seeding process completed successfully!"*

---

### Step 3: Launch the Servers Concurrently

Now, launch the backend and frontend dev servers:

#### 1. Start the Backend API Server:
Inside `/server`, run:
```bash
npm run dev
```
*The server will start listening on `http://localhost:5000`*

#### 2. Start the Frontend Client Server:
1. Open a **new, separate terminal** in the `/client` directory:
   ```bash
   cd client
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Spin up the Vite dev server:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to: **`http://localhost:5173`**!
   *   *Test one-tap login buttons to check features instantly!*

---

## ⚡ Production Deployment (Railway)

To showcase this project live in your portfolio or resume, we recommend deploying to [Railway](https://railway.app/). Follow this guide:

### Backend Deployment (Express)
1. Deploy the `/server` folder as a separate service on Railway.
2. Spin up a **MongoDB database plug-in** directly within your Railway project.
3. Configure the **Environment Variables** under Railway Service Settings:
   *   `PORT`: `5000`
   *   `DATABASE_URL`: `mongodb://...` *(Railway will automatically supply this if you link their MongoDB plug-in!)*
   *   `JWT_SECRET`: *(A random strong secure key)*
   *   `CLIENT_URL`: `https://your-frontend-domain.up.railway.app` (your live React URL)

### Frontend Deployment (React + Vite)
1. Deploy the `/client` folder as a static/web service on Railway.
2. In `client/src/context/AuthContext.jsx`, you can configure the `API_URL` to point to your live backend domain:
   *   Change `export const API_URL = 'http://localhost:5000/api';` to:
       `export const API_URL = 'https://your-backend-domain.up.railway.app/api';`
       *(Or configure Vite `import.meta.env` for environment variables)*.
3. Railway build settings:
   *   Build Command: `npm run build`
   *   Publish directory: `dist`
