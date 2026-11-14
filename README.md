# CollabSync

CollabSync is a full-stack, real-time team collaboration platform featuring workspace management, channel-based chat, announcements, notifications, and role-based access control.

---

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, Context API, Axios, Socket.IO Client, Lucide React
- **Backend:** Node.js, Express 5, Socket.IO 4, MongoDB, Mongoose 9, JWT, BcryptJS, Express Validator
- **Production & Containerization:** Docker, Docker Compose, Nginx (Alpine), Multi-stage builds

---

## Running with Docker Compose

### 1. Prerequisites
- Docker Engine installed (v24+)
- Docker Compose installed (v2+)

### 2. Configure Environment Variables
Copy the root `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your desired configuration:
```env
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CLIENT_URL=http://localhost:5173
```

### 3. Build and Start the Application
Build all container images and start services in detached mode:

```bash
docker compose up --build -d
```

Service mapping:
- **Client (Frontend):** `http://localhost:5173` (Nginx serving Vite production bundle)
- **Server (Backend API):** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`
- **Database:** MongoDB 7 (internal Docker network on port 27017 with persistent volume `mongo_data`)

### 4. View Container Logs
Follow logs across all services:
```bash
docker compose logs -f
```

Or view logs for a specific service:
```bash
# Backend server logs
docker compose logs -f server

# Frontend client logs
docker compose logs -f client

# Database logs
docker compose logs -f mongo
```

### 5. Check Service Status
```bash
docker compose ps
```

### 6. Stop the Application
Stop running containers without losing database data:
```bash
docker compose down
```

To stop containers and delete the database volume:
```bash
docker compose down -v
```

---

## How to Promote the First Admin

In CollabSync, all new user registrations default to `role: 'member'` to ensure security. The initial administrator must be promoted directly in MongoDB.

### Step 1: Register an Account
Navigate to `http://localhost:5173/register` in your browser and register your account (for example: `admin@company.com`).

### Step 2: Open MongoDB Shell Inside the Container
Run the following command to enter `mongosh` inside the running `mongo` container connected to the `collabsync` database:

```bash
docker compose exec mongo mongosh collabsync
```

### Step 3: Promote the User to Admin
Execute the update command:

```javascript
db.users.updateOne(
  { email: "admin@company.com" },
  { $set: { role: "admin" } }
);
```

### Step 4: Verify the Update
```javascript
db.users.findOne({ email: "admin@company.com" }, { name: 1, email: 1, role: 1 });
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "name": "Admin Name",
  "email": "admin@company.com",
  "role": "admin"
}
```

### Step 5: Exit mongosh
```bash
exit
```

Log out and log back in on `http://localhost:5173/login`. You will now see the **Admin** panel link in the navigation bar and have full administrative privileges to create workspaces, manage roles, and broadcast announcements.

