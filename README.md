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

## Deploy
- Vercel: push to a repo and import the project. Add the `.env.local` variables in the Vercel dashboard (Project → Settings → Environment Variables).



