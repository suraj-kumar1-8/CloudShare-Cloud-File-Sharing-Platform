# ☁️ CloudShare – Cloud File Sharing Platform

A full-stack, production-ready **SaaS** cloud file sharing platform built with **React + Vite**, **Node.js + Express**, **MongoDB**, and local disk storage (S3-ready).

---

## ✨ Features

| Feature                    | Detail                                                                          |
| -------------------------- | ------------------------------------------------------------------------------- |
| 🔐 JWT Authentication      | Secure register / login with bcrypt-hashed passwords                            |
| 🌗 Dark / Light Mode       | Persisted theme toggle via ThemeContext + CSS variables                         |
| 🎨 Glassmorphism UI        | Modern glass cards, gradient banners, animated auth pages                       |
| 📤 Drag-and-Drop Upload    | react-dropzone with real-time queue & progress bars                             |
| 📁 Folder Management       | Nested folders with rename, delete, breadcrumb navigation                       |
| 🔗 Expiring Share Links    | Password-protected, time-limited public download links                          |
| 🔒 One-Time Download Links | Self-destructing links copied to clipboard                                      |
| 🏠 Collaboration Rooms     | Temporary file rooms with shareable room codes                                  |
| 🔍 Global Search           | Navbar search navigates to filtered My Files with URL param sync                |
| 📊 Analytics Dashboard     | Recharts PieChart (file types), BarChart (top downloads), upload timeline       |
| 🔔 Notification System     | Bell dropdown with unread badge, mark-all-read, per-notification clearing       |
| 👤 User Profile            | Avatar upload (3 MB limit), edit name/email, change password, stats             |
| ✏️ File Rename             | Inline rename with keyboard support (Enter/Escape)                              |
| 📂 Shared Files Page       | Live list of active share links with copy & open actions                        |
| ⚙️ Settings Page           | Dark mode toggle, notification prefs, account danger zone                       |
| 🗂️ Collapsible Sidebar     | Icon-only collapsed mode with smooth CSS transitions                            |
| 📧 Email Sharing           | Send share links via SMTP / Ethereal (no-config dev mode)                       |
| 🕒 Smart File Expiry       | Per-file TTL with countdown badges                                              |
| 📈 Activity Timeline       | Per-file audit log: upload, download, share, rename events                      |
| 💾 Storage Dashboard       | Visual storage bar with per-user quota tracking                                 |
| 🖼️ File Preview            | In-browser preview for images, video, audio, PDF                                |
| 🐳 Docker                  | Multi-stage Dockerfiles + docker-compose with MongoDB service                   |
| 📥 Folder & ZIP Import     | Import entire folders (preserving structure) and ZIP archives from dashboard    |
| 📮 Request Files via Rooms | Share a room link to collect files (assignments, documents, assets) from anyone |

---

## 🗂️ Project Structure

```
cloud-file-sharing/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── aws.js          # S3 client (optional)
│   │   │   └── db.js           # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── fileController.js
│   │   │   ├── folderController.js
│   │   │   ├── profileController.js
│   │   │   ├── notificationController.js
│   │   │   ├── roomController.js
│   │   │   └── storageController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT protect middleware
│   │   │   ├── errorHandler.js
│   │   │   ├── upload.js       # multer disk storage
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── File.js
│   │   │   ├── Folder.js
│   │   │   ├── Room.js
│   │   │   ├── ActivityLog.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── files.js
│   │   │   ├── folders.js
│   │   │   ├── profile.js
│   │   │   ├── notifications.js
│   │   │   ├── rooms.js
│   │   │   └── storage.js
│   │   └── server.js
│   ├── uploads/                # Local file storage (gitignored)
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── files.js
│   │   │   ├── folders.js
│   │   │   ├── notifications.js
│   │   │   ├── profile.js
│   │   │   ├── rooms.js
│   │   │   └── storage.js
│   │   ├── components/
│   │   │   ├── ui/             # primitive components
│   │   │   ├── FileCard.jsx    # with inline rename
│   │   │   ├── FolderCard.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx      # dark mode, search, notifications
│   │   │   ├── Sidebar.jsx     # collapsible with NavLink active states
│   │   │   ├── StorageBar.jsx
│   │   │   ├── ShareLinkModal.jsx
│   │   │   ├── PreviewModal.jsx
│   │   │   ├── ShareEmailModal.jsx
│   │   │   └── FileActivityModal.jsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyFiles.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Shared.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── RoomView.jsx
│   │   │   └── UploadFile.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js ≥ 20
- MongoDB (local or Atlas)
- AWS account with an S3 bucket
- Docker & Docker Compose (for containerised setup)

---

## 🚀 Local Development (without Docker)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/cloud-file-sharing.git
cd cloud-file-sharing
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env        # fill in your real values
npm install
npm run dev                 # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env.local  # optional – Vite proxy handles /api automatically
npm install
npm run dev                 # starts on http://localhost:5173
```

---

## 🧭 How to Use the App

### 1. Sign up and log in

- Visit the frontend dev URL (by default `http://localhost:5173`).
- Create an account on the Signup page, then log in.
- After login you land on the main Dashboard.

### 2. Upload and manage files

- Go to **Upload** or use the quick actions on the **Dashboard**.
- Drag and drop one or more files into the upload area, or click to browse.
- Uploaded files appear on **My Files** with:
  - Inline rename
  - Delete
  - Share link creation
  - Activity timeline and preview (images, video, audio, PDF).

### 3. Work with folders

- Create folders from the Dashboard or My Files.
- Click into a folder to see its contents; use the breadcrumb to navigate back.
- You can nest folders and rename / delete them.

### 4. Share files publicly

- On a file card, click **Share** to generate an expiring public link.
- Copy the link and open it in an incognito window – you’ll see a minimal public download page.
- All active links are listed on the **Shared** page so you can revoke or re-copy them.

### 5. Collaboration rooms

- Go to **Rooms** (inside the authenticated app) to create a new room.
- Each room has:
  - A human-friendly `roomName`
  - A short `roomId` code
  - An expiry time (rooms and files auto-clean up after expiry).
- From the room detail page you can:
  - Copy a **public room link** (`/rooms/:roomId`).
  - See the list of files uploaded to this room.

### 6. Collect files via rooms (assignments, documents, anything)

- As the **room owner / host**:
  - Create a room (e.g. "Project Assets", "Client Documents", or "Assignment 1").
  - Open the room detail page and click **Copy link**.
  - Share this link with anyone you need files from – they do **not** need an account.
- As a **guest** using the public room link:
  - Open the shared `/rooms/:roomId` link.
  - Enter your name in the **Your name** field.
  - Drag & drop your file(s) (PDF, DOCX, images, etc.).
  - Upload progress and success/failure toasts are shown in real time.
- Back as **room owner** on the same room page (logged in):
  - Scroll down to the **Submissions** table.
  - For each submission you can:
    - See sender name, file name, and submitted time.
    - Preview / open the file in a new tab.
    - Download the file.
    - Delete the submission (removes record + underlying file).

### 7. Import folders and ZIP files

- On the **Dashboard**, use the quick actions:
  - **Import Folder** – choose a folder from your machine.
  - **Import ZIP** – select one or more `.zip` archives.
- The backend will:
  - Preserve the folder structure when importing a folder.
  - Extract ZIP archives into nested folders before creating file records.
- After import finishes, the Dashboard reloads recent folders/files and activity.

### 8. Dashboard & analytics

- The main **Dashboard** shows:
  - High-level stats (total files, storage, recent activity).
  - Recent folders and recent files.
  - A unified activity feed (uploads, shares, folder actions).
  - **My Rooms** section for quick access to active rooms.

### 9. Notifications, profile & settings

- Notification bell shows recent events; you can mark all as read.
- Profile page lets you update avatar, name/email, and password.
- Settings page provides theme (dark/light) and notification preferences.

## 🐳 Docker Compose (full stack)

```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with real AWS credentials and JWT secret

# 2. Build and start
docker compose up --build -d

# Access:
#   Frontend  → http://localhost:80
#   Backend   → http://localhost:5000
#   MongoDB   → localhost:27017
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint             | Description             | Auth |
| ------ | -------------------- | ----------------------- | ---- |
| POST   | `/api/auth/register` | Create a new account    | ❌   |
| POST   | `/api/auth/login`    | Sign in and receive JWT | ❌   |
| GET    | `/api/auth/me`       | Get current user        | ✅   |

### Files

| Method | Endpoint                  | Description                 | Auth |
| ------ | ------------------------- | --------------------------- | ---- |
| POST   | `/api/files/upload`       | Upload a file to S3         | ✅   |
| GET    | `/api/files`              | List all your files         | ✅   |
| DELETE | `/api/files/:id`          | Delete a file               | ✅   |
| GET    | `/api/files/download/:id` | Get pre-signed download URL | ✅   |

All protected endpoints require: `Authorization: Bearer <token>`

---

## ☁️ AWS S3 Setup

1. Create an S3 bucket (e.g. `my-cloudshare-bucket`)
2. **Block public access**: disable "Block all public access" if you want direct share links, **or** keep it blocked and rely on pre-signed URLs
3. Create an IAM user with the following policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::my-cloudshare-bucket/*"
    }
  ]
}
```

4. Generate an **Access Key ID** and **Secret Access Key** for that user
5. Add them to your `.env`

---

## 🚀 CI/CD – GitHub Actions → EC2

### Required GitHub Secrets

| Secret                  | Description                                 |
| ----------------------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM key with ECR + EC2 access               |
| `AWS_SECRET_ACCESS_KEY` | IAM secret                                  |
| `AWS_REGION`            | e.g. `us-east-1`                            |
| `AWS_S3_BUCKET_NAME`    | S3 bucket name                              |
| `JWT_SECRET`            | Random secret string                        |
| `ECR_REGISTRY`          | ECR registry URL                            |
| `EC2_HOST`              | Public IP / DNS of your EC2 instance        |
| `EC2_USER`              | SSH user (typically `ec2-user` or `ubuntu`) |
| `EC2_SSH_KEY`           | Private SSH key content (PEM)               |

### Pipeline stages

```
Push to main
  ├── test-backend  (npm lint)
  ├── test-frontend (npm lint + build)
  ├── build-and-push (Docker build → ECR)
  └── deploy (SSH → EC2 → docker compose up)
```

---

## 🛡️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cloud_file_sharing
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=...
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Tech Stack

| Layer            | Technology                                               |
| ---------------- | -------------------------------------------------------- |
| Frontend         | React 18, Vite, Tailwind CSS, ShadCN UI, React Router v6 |
| HTTP Client      | Axios                                                    |
| File Upload      | react-dropzone                                           |
| Notifications    | react-hot-toast                                          |
| Backend          | Node.js, Express 4                                       |
| Authentication   | JWT + bcryptjs                                           |
| Validation       | express-validator                                        |
| File Handling    | multer (local disk) + optional multer-s3                 |
| Database         | MongoDB + Mongoose                                       |
| File Storage     | Local disk (`backend/uploads`) + optional AWS S3         |
| Containerisation | Docker, Docker Compose                                   |
| CI/CD            | GitHub Actions                                           |
| Deployment       | AWS EC2 + ECR                                            |

---

## 📄 License

MIT
# CloudShare-Cloud-File-Sharing-Platform
