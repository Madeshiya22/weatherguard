# WeatherGuard Admin — Complete Setup Guide

This guide walks you through every step to get the project running locally from scratch.

---

## What You Need to Install First

| Tool | Version | Check if installed |
|------|---------|--------------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| MongoDB | 7+ | (installed as a service) |
| Redis (Memurai on Windows) | any | (installed as a service) |

---

## Step 1 — Install MongoDB

1. Go to **https://www.mongodb.com/try/download/community**
2. Select: **Platform → Windows**, **Package → msi**
3. Click **Download** and run the installer
4. Choose **Complete** installation
5. Keep **"Install MongoDB as a Service"** checked — it will auto-start on boot
6. Finish the installation

To verify MongoDB is running, open PowerShell and run:
```powershell
Get-Service -Name MongoDB
```
You should see `Status: Running`.

---

## Step 2 — Install Redis (Memurai)

Redis does not have an official Windows build. Use **Memurai**, which is a full Redis-compatible server for Windows.

1. Go to **https://www.memurai.com/get-memurai**
2. Download the `.msi` installer (free developer edition)
3. Run the installer — it installs as a Windows service on port **6379**
4. It starts automatically, no extra steps needed

To verify:
```powershell
redis-cli ping
```
Should print `PONG`.

> If you prefer not to install Redis, skip to the **"No Redis option"** section at the bottom of this guide.

---

## Step 3 — Get Google OAuth Credentials

1. Go to **https://console.cloud.google.com**
2. Create a new project (top-left dropdown → New Project)
3. In the left menu go to **APIs & Services → OAuth consent screen**
   - Choose **External** → fill in App name and your email → Save
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** — you'll need them in Step 7

---

## Step 4 — Get GitHub OAuth Credentials

1. Go to **https://github.com/settings/developers**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: WeatherGuard
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

---

## Step 5 — Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send: `/newbot`
3. Follow the prompts:
   - Choose a display name: e.g. `WeatherGuard`
   - Choose a username (must end in `bot`): e.g. `weatherguard_alertbot`
4. BotFather will send you a **bot token** — copy it (looks like `7123456789:ABCdef...`)

---

## Step 6 — Get OpenWeatherMap API Key (Free)

1. Go to **https://openweathermap.org** and sign up for a free account
2. After logging in, go to your profile → **My API Keys**
3. Copy the **Default** key shown there

> **Note:** New API keys take about 10 minutes to activate. If you get a 401 error when the app first runs, just wait a few minutes and try again.

---

## Step 7 — Configure the Environment File

Navigate to the `api/` folder and create your `.env` file:

```powershell
Copy-Item "C:\path\to\project\api\.env.example" "C:\path\to\project\api\.env"
```

Then open `api/.env` in any text editor and fill in every value:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/weatherguard

# Generate any long random string for this — e.g. open https://generate-secret.vercel.app/64
JWT_SECRET=paste_a_long_random_string_here
JWT_EXPIRY=7d

# From Step 3
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# From Step 4
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# From Step 5
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# From Step 6
OPENWEATHER_API_KEY=your_openweathermap_key_here
OPENWEATHER_CITY=London

REDIS_HOST=localhost
REDIS_PORT=6379

# IMPORTANT: Set this to the email of the Google/GitHub account you will
# use to log in first. That account will automatically become the admin.
ADMIN_EMAIL=your.email@gmail.com

FRONTEND_URL=http://localhost:5173
```

> **The `ADMIN_EMAIL` field is critical.** Whatever email you put here — when that user logs in via Google or GitHub for the first time, they are automatically given admin role. All other users start as "pending" and must be approved.

---

## Step 8 — Install Dependencies

Open **two separate terminal windows** (PowerShell or any terminal).

**Terminal 1 — API:**
```powershell
cd path\to\project\api
npm install
```

**Terminal 2 — Admin Panel:**
```powershell
cd path\to\project\admin
npm install
```

Wait for both to finish before moving on.

---

## Step 9 — Run the Project

Keep both terminals open.

**Terminal 1 — Start the API:**
```powershell
cd path\to\project\api
npm run start:dev
```

You should see output ending with:
```
WeatherGuard API running on http://localhost:3000/api
[TelegramService] Telegram bot started
[AlertsService] Weather alert cron scheduled (every 6 hours)
```

**Terminal 2 — Start the Admin Panel:**
```powershell
cd path\to\project\admin
npm run dev
```

You should see:
```
  VITE ready in Xs

  ➜  Local:   http://localhost:5173/
```

---

## Step 10 — Use the App

### First login (Admin setup)

1. Open **http://localhost:5173** in your browser
2. Click **"Continue with Google"** (or GitHub) using the account whose email matches `ADMIN_EMAIL`
3. You'll be redirected to your Dashboard — your account is already approved and has admin role

### Testing the approval flow

1. Open an **incognito window** (or a different browser)
2. Go to **http://localhost:5173/request-access**
3. Sign in with a **different** Google or GitHub account
4. That user lands on Dashboard with status: **pending**

In your main browser (admin):
1. Go to **Pending Users** in the sidebar
2. You'll see the new user listed
3. Click **Approve** — the user's status changes to approved

### Linking Telegram

After a user is approved:
1. Open Telegram and find the bot you created in Step 5 (search by its username)
2. Send `/start` — the bot replies with your **Chat ID** (a number like `123456789`)
3. Go back to the Dashboard on the web app
4. Paste the Chat ID into the Telegram field and click **Save**

### Triggering a weather alert

1. In the admin browser, go to **Alerts** in the sidebar
2. Click **"Trigger Manual Alert"**
3. Within a few seconds the bot sends a weather message to all approved + linked Telegram users

Scheduled alerts also fire automatically every 6 hours via cron.

---

## Troubleshooting

### MongoDB won't connect
```powershell
# Run PowerShell as Administrator
Start-Service MongoDB
```
If the service doesn't exist, re-run the MongoDB installer.

### Redis won't connect
Check Memurai is running in your system tray (bottom-right of taskbar). If not:
```powershell
# Run PowerShell as Administrator
Start-Service Memurai
```

### Google/GitHub OAuth gives "redirect_uri_mismatch"
The callback URL in your Google Console or GitHub OAuth App settings must **exactly** match the value in your `.env`. Copy-paste carefully — no trailing slashes.

### Telegram bot not responding
- Double-check `TELEGRAM_BOT_TOKEN` in `.env` has no spaces
- Make sure the API server (`npm run start:dev`) is running
- You can only have **one** instance of the bot running at a time

### OpenWeatherMap returns 401
Your API key takes ~10 minutes to activate after signing up. Wait and retry.

### Port already in use
If port 3000 is taken, change `PORT=3001` in `api/.env` and update `admin/vite.config.ts`:
```ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // change this
    changeOrigin: true,
  },
},
```

### Admin panel shows blank page after login
Open browser DevTools (F12) → Console tab. If you see a 401 error, your JWT_SECRET might be empty. Make sure `.env` is saved and restart the API.

---

## No Redis Option (Skip Redis entirely)

If you don't want to install Redis, you can switch the alert scheduling to use only `node-cron` without BullMQ.

In `api/src/app.module.ts`, remove the `BullModule` block:
```ts
// Delete this entire block:
BullModule.forRootAsync({
  ...
}),
```

In `api/src/alerts/alerts.module.ts`, remove:
```ts
BullModule.registerQueue({ name: ALERT_QUEUE }),
```

In `api/src/alerts/alerts.service.ts`, replace the queue-based trigger with a direct call to run the job inline. This is simpler but loses retry-on-failure.

> Easiest path: just install Memurai — it takes 2 minutes and requires zero configuration.

---

## Project Structure

```
weatherguard-admin/
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── auth/               # Google + GitHub OAuth, JWT
│   │   ├── users/              # User schema, approval workflow
│   │   ├── alerts/             # BullMQ queue, cron scheduler, alert history
│   │   ├── telegram/           # Telegraf bot
│   │   ├── weather/            # OpenWeatherMap integration
│   │   └── common/             # Guards (JWT, Admin), decorators
│   ├── .env.example            # Copy this to .env and fill in values
│   └── package.json
├── admin/                      # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/                # Typed axios client
│   │   ├── components/         # Layout, ProtectedRoute, AdminRoute
│   │   ├── hooks/              # useAuth
│   │   └── pages/              # Login, Dashboard, PendingUsers, AllUsers, Alerts
│   └── package.json
└── README.md                   # System design and architecture docs
```

---

## Quick Reference

| What | URL |
|------|-----|
| Admin panel | http://localhost:5173 |
| API base | http://localhost:3000/api |
| Google OAuth start | http://localhost:3000/api/auth/google |
| GitHub OAuth start | http://localhost:3000/api/auth/github |
| Pending users (API) | http://localhost:3000/api/users/pending |
| Trigger alert (API) | POST http://localhost:3000/api/alerts/trigger |
