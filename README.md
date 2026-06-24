# WeatherGuard Admin & Alerts System

A secure, invite-only weather alert service connecting a web-based React admin dashboard to a live Telegram bot.

---

## System Design

### Database Schema

```
┌─────────────────────────────────────────────────┐
│                     users                        │
├──────────────────┬──────────────────────────────┤
│ _id              │ ObjectId (PK)                │
│ name             │ String (required)             │
│ email            │ String (unique, required)     │
│ avatar           │ String                        │
│ provider         │ Enum: google | github         │
│ providerId       │ String (required)             │
│ role             │ Enum: user | admin            │
│ status           │ Enum: pending | approved |    │
│                  │       rejected                │
│ telegramChatId   │ String (nullable)             │
│ telegramUsername │ String (nullable)             │
│ approvedAt       │ Date (nullable)               │
│ approvedBy       │ String → User._id (nullable)  │
│ createdAt        │ Date (auto)                   │
│ updatedAt        │ Date (auto)                   │
└──────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                     alerts                       │
├──────────────────┬──────────────────────────────┤
│ _id              │ ObjectId (PK)                │
│ city             │ String                        │
│ message          │ String (full formatted msg)   │
│ temperature      │ Number                        │
│ description      │ String                        │
│ recipientCount   │ Number                        │
│ triggeredAt      │ Date                          │
│ createdAt        │ Date (auto)                   │
└──────────────────┴──────────────────────────────┘
```

### Indexes
- `users`: `{ provider, providerId }` — for fast OAuth upsert lookups
- `users`: `{ status, telegramChatId }` — for broadcasting to approved+linked users

---

## Data Flow

### 1. Sign-up & Access Request
```
User → "Login with Google/GitHub"
  → OAuth redirect to /api/auth/google (or /github)
  → Passport validates OAuth token
  → UsersService.findOrCreate():
      • If ADMIN_EMAIL matches → role=admin, status=approved
      • Otherwise → role=user, status=pending
  → JWT issued → redirect to /auth/callback?token=...
  → Token stored in localStorage
```

### 2. Admin Approval Workflow
```
Admin → GET /api/users/pending  (JwtAuthGuard + AdminGuard)
  → sees list of pending users

Admin → PATCH /api/users/:id/approve
  → UsersService.approveUser() sets status=approved
  → If user has telegramChatId:
      TelegramService.sendApprovalNotification() fires immediately
  → Response returns updated user
```

### 3. Telegram Linking & Validation
```
User → opens Telegram, sends /start to @WeatherGuardBot
  → Bot replies with their numeric Chat ID
User → pastes Chat ID on dashboard (pre-validated for minimum 5 digits)
  → PATCH /api/users/:id  { telegramChatId: "123456789" }
  → Backend DTO validates /^\d+$/ → persists to DB

User can also Unlink Telegram:
  → DELETE /api/users/me/telegram → removes telegramChatId from user
```

### 4. Direct Weather Alert Delivery (No Redis/BullMQ Required)
```
node-cron (every 6h) → AlertsService.onModuleInit cron
  → AlertsService.processWeatherAlert() executes inline directly

AlertsService.processWeatherAlert():
  1. WeatherService.getCurrentWeather()  ← OpenWeatherMap API
  2. WeatherService.formatMessage()      ← builds Markdown string
  3. UsersService.findApprovedWithTelegram()
     ← MongoDB query: { status: "approved", telegramChatId: { $exists: true, $ne: null } }
     ← ONLY approved users with linked Telegram are included
  4. TelegramService.broadcastToMany()
     ← Promise.allSettled() → send to each chatId individually
  5. Alert record saved to DB (city, message, recipientCount)

Admin can also → POST /api/alerts/trigger → executes processWeatherAlert() immediately
```

**The gate that ensures only approved users receive alerts:**
`UsersService.findApprovedWithTelegram()` always queries `status: "approved"` — unapproved users are filtered at the DB query level, not application logic.

---

## Architecture

```
api/
├── src/
│   ├── auth/                   # OAuth + JWT
│   │   ├── strategies/
│   │   │   ├── google.strategy.ts
│   │   │   ├── github.strategy.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                  # User schema + CRUD + approval
│   │   ├── dto/
│   │   │   └── update-user.dto.ts
│   │   ├── user.schema.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.module.ts
│   ├── alerts/                 # Direct cron alerts scheduler
│   │   ├── alert.schema.ts
│   │   ├── alerts.service.ts
│   │   ├── alerts.controller.ts
│   │   └── alerts.module.ts
│   ├── telegram/               # Telegraf bot + Status/Test endpoints
│   │   ├── telegram.controller.ts
│   │   ├── telegram.service.ts
│   │   └── telegram.module.ts
│   ├── weather/                # OpenWeatherMap integration
│   │   ├── weather.service.ts
│   │   └── weather.module.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── admin.guard.ts
│   │   └── decorators/
│   │       └── current-user.decorator.ts
│   ├── app.module.ts
│   └── main.ts
admin/
├── src/
│   ├── api/           # Typed API client (axios)
│   ├── components/    # Layout, TelegramIntegration, guards, shared UI
│   ├── hooks/         # useAuth
│   ├── pages/         # LoginPage, Dashboard, PendingUsers, AllUsers, Alerts
│   ├── App.tsx
│   └── main.tsx
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API Framework | NestJS 10 (Modular) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | Passport.js (Google OAuth2, GitHub OAuth2) + JWT |
| Scheduler | node-cron (Direct inline execution) |
| Telegram Bot | Telegraf |
| Weather Data | OpenWeatherMap API |
| State Management | TanStack Query (React Query) |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials
- GitHub OAuth App
- Telegram Bot Token (from @BotFather)
- OpenWeatherMap API key (free tier)

### 1. Clone & install

```bash
git clone https://github.com/your-username/weatherguard-admin.git
cd weatherguard-admin

# Install API deps
cd api && npm install

# Install admin deps
cd ../admin && npm install
```

### 2. Configure the API

```bash
cd api
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/weatherguard

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRY=7d

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# GitHub OAuth — github.com/settings/developers
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Telegram — @BotFather on Telegram → /newbot
TELEGRAM_BOT_TOKEN=...

# openweathermap.org → free API key
OPENWEATHER_API_KEY=...
OPENWEATHER_CITY=London

# This email gets admin role automatically on first login
ADMIN_EMAIL=your-email@example.com

FRONTEND_URL=http://localhost:5173
```

### 3. Run the API

```bash
cd api
npm run start:dev
```

API runs at `http://localhost:3000/api`

### 4. Run the Admin Panel

```bash
cd admin
npm run dev
```

Frontend runs at `http://localhost:5173`

### 5. Set up the Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the bot token into `TELEGRAM_BOT_TOKEN`
4. Users send `/start` to your bot to get their Chat ID

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/auth/google | — | Start Google OAuth |
| GET | /api/auth/github | — | Start GitHub OAuth |
| GET | /api/users/me | JWT | Get current user |
| GET | /api/users/pending | JWT + Admin | List pending users |
| GET | /api/users/approved | JWT + Admin | List approved users |
| GET | /api/users | JWT + Admin | List all users |
| PATCH | /api/users/:id/approve | JWT + Admin | Approve user |
| PATCH | /api/users/:id/reject | JWT + Admin | Reject user |
| PATCH | /api/users/:id | JWT | Update user (e.g. telegramChatId) |
| DELETE | /api/users/me/telegram | JWT | Unlink Telegram Chat ID |
| GET | /api/telegram/status | — | Check Telegram Bot status |
| POST | /api/telegram/test | — | Send test message to a specific Chat ID |
| GET | /api/alerts | JWT + Admin | List recent alerts |
| POST | /api/alerts/trigger | JWT + Admin | Trigger manual alert |

---

## Key Design Decisions

- **Direct Cron Alerts (No Redis/BullMQ)**: To eliminate infrastructure overhead and simplify deployment across environments (like Windows without Redis), alerts are processed directly in memory via `node-cron` every 6 hours and manually via `POST /api/alerts/trigger`.
- **forwardRef circular dependency** between `UsersModule` and `TelegramModule` is handled with NestJS's `forwardRef()` — the Telegram service needs the Users service to broadcast, and the Users controller needs Telegram to send approval notifications.
- **Status gate at query level**: alerts are never filtered in application code — MongoDB query `{ status: "approved", telegramChatId: { $ne: null } }` is the single source of truth for who gets alerts.
- **Admin bootstrap**: the first user whose email matches `ADMIN_EMAIL` env var gets `role=admin` and `status=approved` automatically — no manual DB seeding required.
