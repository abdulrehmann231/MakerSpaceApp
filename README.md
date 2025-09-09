# Makerspace App

## Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or self-hosted MongoDB)
- Gmail App Password 

## Environment Variables
Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
```

Required:
- `MONGODB_URI`: Your MongoDB connection string
  - In Atlas, click Connect → Drivers → copy the URI (replace username/password)
- `MONGODB_DB`: Database name (default `makerspace`)
- `NODE_ENV`: `development` or `production`

Email :
- Gmail SMTP
  - `EMAIL_USER`: your Gmail address
  - `EMAIL_PASSWORD`: an App Password from Google (Account → Security → 2‑Step Verification → App passwords)


JWT (required):
- `JWT_SECRET` – strong random string (e.g., `openssl rand -base64 32`)
- `JWT_EXPIRES_IN` – e.g. `30s`, `10m`, `1h`
- `JWT_REFRESH_SECRET` – strong random string (different from access secret)
- `JWT_REFRESH_EXPIRES_IN` – e.g. `5m`, `7d`

## Setup
1. Install deps
```bash
npm install
```
2. Seed settings ( creates default availability):
```bash
node setup-settings.js
```
3. Run locally
```bash
npm run dev
```
Open `http://localhost:3000`.

## API Notes
- Public calendar feed: `GET /prod?action=calendar` (ICS download)
- Auth is JWT-based; ensure access and refresh secrets are set in env.

## MongoDB Data Model

Collections used:

- `users`
  - Example document:
    ```json
    {
      "key": "alice@example.com",
      "hash": "<password-hash>",
      "salt": "<salt>",
      "token": "<session-token>",
      "userdata": {
        "firstname": "Alice",
        "lastname": "Doe",
        "user": "admin" // or "user"
      }
    }
    ```
  

- `bookings`
  - Example document:
    ```json
    {
      "id": 1717771234567,
      "user": "alice@example.com",
      "date": "2025-06-01",
      "start": 10,
      "end": 12,
      "npeople": 1,
      "description": "Optional"
    }
    ```
  

- `settings`
  - `availability` configuration document:
    ```json
    {
      "key": "availability",
      "spotsAvailable": [[/* 24 numbers */], /* 7 arrays total (Sun..Sat) */],
      "holidays": ["2025-12-25", "2025-01-01"],
      "recurHolidays": ["12-25", "01-01"]
    }
    ```

 - `password_reset_tokens`
   - Example document:
     ```json
     {
       "email": "alice@example.com",
       "token": "<random-reset-token>",
       "expiresAt": "2025-06-01T12:00:00.000Z",
       "createdAt": "2025-06-01T11:00:00.000Z",
       "used": false,
       "usedAt": null
     }
     ```

Seed script: `node setup-settings.js` creates/updates the `availability` document.

## Deploy
- Vercel: push to a repo and import the project. Add the `.env.local` variables in the Vercel dashboard (Project → Settings → Environment Variables).



