# VPS Ops Dashboard

MVP mono-admin pour piloter un VPS avec Next.js 16 App Router, NextAuth,
Prisma SQLite, Cloudflare DNS, Portainer et Nginx Proxy Manager.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

`ADMIN_EMAIL` et `ADMIN_PASSWORD` servent uniquement au bootstrap: au premier
login, si aucun utilisateur n'existe encore, l'admin local est cree avec ces
valeurs. Les credentials Cloudflare, Portainer et NPM restent en variables
d'environnement.

## Verification

```bash
npm run lint
npm run build
```

Le build Next.js 16 utilise Turbopack. Dans certains sandboxes, il faut lancer
`npm run build` hors sandbox parce que Turbopack bind un port interne.

## Docker

```bash
cp .env.example .env
docker compose up --build -d
```

L'image lance `npm run db:push` au demarrage, puis `next start`. La base SQLite
est persistee dans le volume Docker `vps_dashboard_data` via `DATABASE_URL=file:/data/app.db`.
