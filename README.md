# WeatherGuard

WeatherGuard is a full-stack weather alert platform that enables secure user onboarding through social authentication, administrator-controlled access approval, and automated weather notifications via Telegram.

##  Features

* Google and GitHub OAuth Authentication
* Request Access Workflow
* Admin Approval Dashboard
* Role-Based Access Control (Admin/User)
* Telegram Bot Integration
* Automated Weather Alert Notifications
* User Management System
* Secure JWT Authentication
* Real-time Approval Notifications

---

# System Design

## Architecture

The application follows a modular architecture consisting of:

### Frontend (/admin)

* React + TypeScript
* Vite
* React Router
* Axios
* Context API / State Management

### Backend (/api)

* NestJS
* MongoDB
* Passport.js OAuth Strategies
* JWT Authentication
* Telegram Bot API

---

#  Database Schema

## User Schema

```ts
User {
  _id: ObjectId
  name: string
  email: string
  avatar: string

  provider: 'google' | 'github'
  providerId: string

  role: 'admin' | 'user'

  status: 'pending' | 'approved' | 'rejected'

  telegramChatId?: string

  createdAt: Date
  updatedAt: Date
}
```

## Access Flow States

```txt
Pending  →  Approved
Pending  →  Rejected
```

---

# Data Flow
## 1. Social Login

1. User signs in using Google or GitHub.
2. Backend authenticates using Passport strategies.
3. If user does not exist, a new user is created with:

```txt
status = "pending"
role = "user"
```

4. User cannot receive weather alerts until approved.

---

## 2. Request Access Flow

1. Newly authenticated users are redirected to the Request Access page.
2. User requests platform access.
3. User remains in "pending" state.

---

## 3. Admin Approval Flow

1. Admin logs into dashboard.
2. Admin views all pending users.
3. Admin approves or rejects a user.

If approved:

```txt
status = "approved"
```

The backend immediately sends a Telegram notification informing the user that access has been granted.

---

## 4. Weather Alert Flow

A scheduled background process periodically checks weather conditions.

Before sending alerts, the system performs:

```ts
User.find({
  status: 'approved',
  telegramChatId: { $exists: true }
})
```

Only users satisfying both conditions receive alerts:

* status = approved
* Telegram account connected

This ensures pending or rejected users never receive notifications.

---

# Project Structure

```txt
weatherguard/
│
├── api/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── alerts/
│   │   ├── telegram/
│   │   ├── weather/
│   │   └── common/
│
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── context/
│
└── README.md
```

---

# Setup Instructions

## Clone Repository

```bash
git clone https://github.com/Madeshiya22/weatherguard.git
```

---

## Backend Setup

```bash
cd api
npm install
```

Create `.env`

```env
PORT=3000

MONGODB_URI=

JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

TELEGRAM_BOT_TOKEN=

FRONTEND_URL=
```

Run Backend

```bash
npm run start:dev
```

---

## Frontend Setup

```bash
cd admin
npm install
npm run dev
```

Create `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

#  Demo

The demo video covers:

* Social Login
* Request Access Flow
* Admin Dashboard Approval Workflow
* Telegram Approval Notification
* Simulated Weather Alert Delivery

---

#  Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Axios

## Backend

* NestJS
* MongoDB
* Mongoose
* Passport.js
* JWT

## Integrations

* Google OAuth
* GitHub OAuth
* Telegram Bot API

---

#  Author

Rahul Madeshiya
