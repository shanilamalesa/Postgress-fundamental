## About the Project

Most small businesses in East Africa run their customer communication through WhatsApp. The problem is that WhatsApp was never built to be a CRM. When a real estate agency in Lavington or a car yard on Ngong Road receives hundreds of messages over a weekend, there is no way to track who asked what, who followed up, or who is ready to buy. Leads get lost in personal inboxes, deals fall through, and revenue walks out the door.

Mctaba CRM fixes this by turning every incoming WhatsApp message into a structured lead that lives in a database. The admin sees all leads in a clean dashboard, assigns them to agents, tracks their progress from first contact to payment, and can trigger an M-Pesa STK Push directly from the lead record. When the customer pays, a PDF receipt is automatically generated.

It is one system that handles the full customer journey — from the first WhatsApp message to the final payment confirmation.

---

## What It Does

Mctaba CRM captures every WhatsApp message as a lead, lets your team manage and assign them, and allows admins to collect M-Pesa payments directly from the dashboard — all in one place.

- Captures WhatsApp leads automatically via webhook
- Assigns leads to agents
- Triggers M-Pesa STK Push payments from the dashboard
- Generates PDF receipts on payment confirmation
- JWT-protected admin and agent roles
- First-time setup flow (no manual DB seeding needed)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Payments | Safaricom Daraja API (M-Pesa STK Push) |
| WhatsApp | Meta WhatsApp Cloud API |
| PDF | PDFKit |

---

## Prerequisites

Make sure you have these installed before cloning:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v15 or higher
- [ngrok](https://ngrok.com/) (for WhatsApp webhook and M-Pesa callback in development)
- A [Meta Developer Account](https://developers.facebook.com/) with WhatsApp Cloud API access
- A [Safaricom Daraja Account](https://developer.safaricom.co.ke/) (sandbox is free)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shanilamalesa/Postgress-fundamental.git
cd Postgress-fundamental
```

### 2. Set up the database

Open psql and run:

```sql
CREATE DATABASE crm;
CREATE USER crm_user WITH PASSWORD 'crm_dev_password';
GRANT ALL PRIVILEGES ON DATABASE crm TO crm_user;
\c crm
GRANT ALL ON SCHEMA public TO crm_user;
```

Then run the schema to create all tables:

```bash
psql -U crm_user -d crm -f server/db/schema.sql
```

### 3. Install server dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` folder:

```env
# Server
PORT=5000
APP_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=crm_user
DB_PASSWORD=crm_dev_password
DB_NAME=crm
DB_LOG=false

# Auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# WhatsApp Cloud API
WHATSAPP_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=your_custom_verify_token

# M-Pesa Daraja API (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/callback
```

> **Never commit your `.env` file to GitHub.** It is already in `.gitignore`.

### 5. Start the backend server

```bash
npm run dev
```

You should see:
```
CRM server running on :5000
```

### 6. Install frontend dependencies

Open a new terminal:

```bash
cd client
npm install
npm start
```

The app will open at `http://localhost:3001`.

---

## First Time Setup

When you open the app for the first time (empty database), you will see the **Setup page**. Fill in:

1. Your business name
2. Your admin name, email, and password

This creates the first admin account. After that, the setup page is disabled — only admins can invite new agents.

---

## WhatsApp Webhook Setup

1. Start ngrok:
```bash
ngrok http 5000
```

2. Copy your ngrok URL (e.g. `https://abc123.ngrok-free.app`)

3. In your Meta Developer Console:
   - Go to WhatsApp → Configuration
   - Set Webhook URL to: `https://abc123.ngrok-free.app/webhook`
   - Set Verify Token to match `WEBHOOK_VERIFY_TOKEN` in your `.env`
   - Subscribe to `messages`

4. Update `MPESA_CALLBACK_URL` in your `.env` to use the same ngrok URL.

---

## M-Pesa Setup

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. Get your **Consumer Key**, **Consumer Secret**, and **Passkey** from the sandbox
3. Use shortcode `174379` for sandbox testing
4. Use a Kenyan number (`254XXXXXXXXX`) for sandbox STK Push tests

---

## Project Structure

```
Postgress-fundamental/
├── client/                  # React frontend
│   └── src/
│       ├── components/
│       │   ├── LeadDetail.js    # Lead slide-in panel with M-Pesa payment
│       │   ├── LeadsTable.js    # Leads data table
│       │   └── StatsCards.js    # Dashboard stat cards
│       ├── pages/
│       │   ├── Dashboard.js     # Main dashboard
│       │   ├── Login.js         # Login page
│       │   └── Setup.js         # First-time setup page
│       └── services/
│           └── api.js           # API helper functions
│
└── server/                  # Node.js + Express backend
    ├── config/
    │   ├── db.js                # PostgreSQL connection pool
    │   └── env.js               # Environment variable loader
    ├── controllers/             # Route handlers
    ├── db/
    │   └── schema.sql           # Database schema
    ├── middleware/
    │   ├── asyncHandler.js      # Async error wrapper
    │   ├── errorHandler.js      # Global error handler
    │   └── requireAuth.js       # JWT auth middleware
    ├── receipts/                # Generated PDF receipts
    ├── repositories/            # Database query layer
    ├── routes/
    │   ├── auth.routes.js       # Login / signup
    │   ├── leads.routes.js      # Lead CRUD
    │   ├── payments.routes.js   # M-Pesa STK Push + callback
    │   ├── users.routes.js      # User management
    │   └── webhook.routes.js    # WhatsApp webhook
    ├── services/
    │   ├── auth.service.js      # JWT + bcrypt logic
    │   ├── leads.service.js     # Lead business logic
    │   ├── mpesa.service.js     # Safaricom Daraja API
    │   └── receipt.service.js   # PDF receipt generation
    └── index.js                 # App entry point
```

---

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/setup` | Public | First-time admin setup |
| GET | `/api/setup/status` | Public | Check if system is configured |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/leads` | JWT | List leads |
| POST | `/api/payments/pay` | JWT | Trigger STK Push |
| POST | `/api/payments/callback` | Public | M-Pesa callback |
| GET | `/api/payments/receipt/:leadId` | JWT | Download PDF receipt |
| GET | `/health` | Public | Health check |

---

## User Roles

| Role | Permissions |
|---|---|
| `admin` | See all leads, reassign agents, trigger payments, view stats |
| `agent` | See assigned leads, update status, claim unassigned leads |

---

## Contributing

This project was built as part of the **Mctaba Labs Full-Stack Marathon** bootcamp.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## License

MIT — free to use and modify.

---

*Built with by Shanila Malesa · Mctaba Labs · Dar es Salaam*
