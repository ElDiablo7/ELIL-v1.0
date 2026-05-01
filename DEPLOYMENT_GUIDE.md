# ENLIL™ v1.0 — Deployment Guide

## Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- Git (for cloning)

---

## Local Development

```bash
# 1. Clone repository
git clone https://github.com/ElDiablo7/ELIL-v1.0.git
cd ELIL-v1.0

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env as needed (defaults work for demo)

# 4. Start server
npm start

# 5. Open browser
# Navigate to http://localhost:3000
```

### Demo Mode Login
When `ENLIL_MODE=demo` (default), use these credentials:

| Username | Password | Role |
|---|---|---|
| owner | enlil-owner-2026 | OWNER |
| admin | enlil-admin-2026 | ADMIN |
| operator | enlil-operator | OPERATOR |
| viewer | enlil-viewer | VIEWER |

---

## Production Deployment

### Environment Variables (Required)

```bash
NODE_ENV=production
PORT=3000
ENLIL_MODE=production
JWT_SECRET=<64-character-random-string>
SESSION_SECRET=<64-character-random-string>
AUDIT_SECRET=<64-character-random-string>
ALLOWED_ORIGINS=https://your-domain.com
AUDIT_LOG_MODE=file
ENLIL_USERS={"admin":{"password":"your-secure-password","role":"ADMIN"},"owner":{"password":"owner-secure-password","role":"OWNER"}}
```

### Generate Secure Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Render Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from above
6. Deploy

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Verification After Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Smoke test (run locally against deployed URL)
PORT=443 node tests/smoke.js

# Audit verification
node scripts/verify-audit.js
```

---

## Security Checklist for Production

- [ ] Changed all secrets from defaults
- [ ] Set `NODE_ENV=production`
- [ ] Set `ENLIL_MODE=production`
- [ ] Configured `ENLIL_USERS` with strong passwords
- [ ] Set `ALLOWED_ORIGINS` to your domain only
- [ ] Deployed behind HTTPS (TLS)
- [ ] Verified no demo credentials work in production mode
- [ ] Tested `/api/health` returns correct mode
- [ ] Ran `npm test` against deployed instance

---

**Copyright © Zachary Charles Anthony Crockett. All rights reserved.**
