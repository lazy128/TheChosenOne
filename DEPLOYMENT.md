# Deploy CINEMAX

## Backend: Railway

1. Create a Railway project and add a MySQL database.
2. Add the `expressjs` folder as the backend service.
3. Set the Railway service root directory to `expressjs`.
4. Add these environment variables to the backend service:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
ACCESS_TOKEN_SECRET=replace-with-a-long-random-string
REFRESH_TOKEN_SECRET=replace-with-another-long-random-string
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
NODE_ENV=production
PORT=5000
```

5. Deploy the backend.
6. Seed the database once from Railway shell:

```bash
npm run seed:assignment
```

The backend health check is available at:

```text
https://your-railway-domain.up.railway.app/health
```

## Frontend: Vercel

1. Import the GitHub repo into Vercel.
2. Set the project root directory to `FE`.
3. Add this environment variable:

```env
VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api
```

4. Deploy.
5. Copy the Vercel production URL and update Railway backend:

```env
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

Then redeploy the Railway backend.

## Local Docker

For local full-stack testing:

```bash
docker compose down -v
docker compose up --build
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`
