# Deployment Notes (Render + Railway + Netlify)

## Folder structure

```text
code-and-conquer-saas/
├── server.js
├── .env.example
├── database/
│   └── schema.sql
├── frontend/
│   ├── config.js
│   ├── common.js
│   ├── login.js
│   ├── courses.js
│   ├── students.js
│   └── *.html
└── docs/
    └── DEPLOYMENT.md
```

## Common deployment fixes

1. **MySQL connection error**
   - Ensure Render env vars are set exactly: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
   - Do not use a single URI string. This app uses split connection variables.

2. **JWT auth failures**
   - Set `JWT_SECRET` on Render. If missing, tokens generated before restart may fail verification.

3. **CORS errors (Netlify -> Render)**
   - Set `CORS_ORIGIN` to a comma-separated list including your Netlify domain and local dev domain.
   - Example: `https://your-app.netlify.app,http://localhost:5500`

4. **Frontend unable to hit backend**
   - Set `frontend/config.js` API URL to Render API URL.
   - Confirm backend route is reachable: `GET /api/health`.

5. **Railway schema issues**
   - Run `database/schema.sql` once in Railway MySQL.
   - Check table indexes exist for tenant filters to avoid slow queries.
