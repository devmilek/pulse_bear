# PulseBear - Real‑Time SaaS insights

> **Real‑Time SaaS insights — delivered straight to your Discord.**

Short, focused, and fast. PulseBear lets you log any event (sales, sign‑ups, milestones, …) and get instant alerts in Discord while you watch a clean dashboard update in real time.

![Project Image](https://github.com/devmilek/pulse_bear/blob/main/public/thumbnail.png)

---

## ✨ Features

- ✉️ **Real-time event messages via Discord** (webhooks/bot)
- 🖥️ **Clean & intuitive monitoring dashboard**
- 💳 **Secure payments with Stripe** (subscriptions / one‑time)
- 🔐 **Auth with Better Auth** (sessions, email/password or OAuth-ready)
- 🗄️ **Typed DB layer with Drizzle ORM + PostgreSQL**
- ⚡ **Modern Next.js SaaS** (App Router, RSC-ready)
- 🔁 **TanStack Query for data fetching & caching**
- 🧩 **shadcn/ui components** (tuned to PulseBear branding)
- 🧪 **Easy local setup with Bun**
- 🧵 **Event payloads accept any custom fields you need**
- 📈 **Revenue milestones & growth pings** straight to Discord

> Have more ideas? Open an issue/PR — suggestions welcome!

---

## 🧰 Tech Stack

- **Framework:** Next.js
- **Runtime & tooling:** Bun
- **DB & ORM:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth
- **Payments:** Stripe
- **UI:** shadcn/ui
- **Data fetching:** TanStack Query
- **Language:** TypeScript

---

## 🚀 Quick Start

```bash
# 1) Clone the repo
git clone <your-repo-url> pulsebear
cd pulsebear

# 2) Copy environment file
cp .env.example .env

# 3) Install deps
bun install

# 4) Push the schema to DB
bun run db:push

# 5) Start dev server
bun run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and you’re in.

---

## 🔐 Environment Variables

Rename `.env.example` → `.env` and fill in:

```bash
# Database
DATABASE_URL="postgres://user:password@host:5432/pulsebear"

# Auth
BETTER_AUTH_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Discord
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
# or
DISCORD_BOT_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PULSEBEAR_API_KEY="dev_..."
```

---

## 🔭 Log an Event (API example)

```ts
await fetch("/api/v1/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PULSEBEAR_API_KEY}`,
  },
  body: JSON.stringify({
    category: "sale",
    fields: {
      plan: "PRO",
      email: "zoe.martinez2001@email.com",
      amount: 49.0,
    },
  }),
});
```

**What you’ll see in Discord**

```
💰 Payment received
Amount: $49.00
Email: zoe.martinez2001@email.com
Plan: PRO
```

---

## 🧱 Database

- **Migrations / schema** are managed with **Drizzle ORM**.
- Apply schema to your DB:

```bash
bun run db:push
```

---

## 🧾 Scripts

```bash
bun run dev        # start dev server
bun run build      # build for production
bun run start      # start production server
bun run db:push    # push Drizzle schema to DB
```

---

## 📦 Deployment

You can deploy anywhere Next.js runs (Vercel, Fly.io, Railway, …). Make sure to set all env vars and Stripe/Discord webhooks in your hosting provider.

---

## 🗺️ Roadmap

- [ ] Team & roles (orgs, multi-tenant)
- [ ] Fine-grained rate limiting / quotas
- [ ] In-app notifications center
- [ ] Web (and maybe Slack) integrations
- [ ] Audit log UI

---

## 🤝 Contributing

Issues and PRs are welcome. Keep PRs small, focused, and with a clear description.

---

## 📄 License

MIT — do whatever you want, just don’t remove the license.

---

## 📬 Support

Spotted a bug, have a question, or want a feature? Open an issue — we read everything.
