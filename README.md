# Mctaba CRM

## About the Project

Most small businesses in East Africa run their customer communication through WhatsApp. The problem is that WhatsApp was never built to be a CRM. When a real estate agency in Lavington or a car yard on Ngong Road receives hundreds of messages over a weekend, there is no way to track who asked what, who followed up, or who is ready to buy. Leads get lost in personal inboxes, deals fall through, and revenue walks out the door.

Mctaba CRM fixes this by turning every incoming WhatsApp message into a structured lead that lives in a database. The admin sees all leads in a clean dashboard, assigns them to agents, tracks their progress from first contact to payment, and can trigger an M-Pesa STK Push directly from the lead record. When the customer pays, a PDF receipt is automatically generated and a payment confirmation is sent back to the customer via WhatsApp.

It is one system that handles the full customer journey — from the first WhatsApp message to the final payment confirmation.

---

## How It Works

```
Customer sends WhatsApp message
        ↓
Bot replies automatically (24/7)
        ↓
Lead created in admin dashboard
        ↓
Admin assigns lead to an agent
        ↓
Agent follows up and qualifies the lead
        ↓
Admin sends M-Pesa STK Push from dashboard
        ↓
Customer enters PIN on their phone
        ↓
Payment confirmed → PDF receipt generated
        ↓
Customer receives WhatsApp confirmation + receipt
```

---

## Features

- **WhatsApp Bot** — Automatically replies to customers 24/7 and captures their inquiry
- **Lead Management** — Every WhatsApp message creates a structured lead in the dashboard
- **Agent Assignment** — Admin can assign leads to specific agents
- **Status Tracking** — Leads move through: New → Contacted → Qualified → Converted → Lost
- **M-Pesa Payments** — Admin triggers STK Push directly from the lead record
- **PDF Receipts** — Automatically generated on payment confirmation
- **WhatsApp Confirmation** — Customer receives payment confirmation on WhatsApp
- **First-time Setup** — New admins set up their account through a guided setup page
- **JWT Authentication** — Secure login with role-based access (admin / agent)
- **Real-time Dashboard** — Auto-refreshes every 10 seconds

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT + bcrypt |
| WhatsApp | Meta WhatsApp Cloud API |
| Payments | Safaricom Daraja API (M-Pesa STK Push) |
| PDF Generation | PDFKit |
| Tunneling (dev) | ngrok |

---

## Project Structure

```
Postgress-fundamental/
├── client/                          # React frontend
│   └── src/
│       ├── components/
│       │   ├── LeadDetail.js        # Lead slide-in panel with M-Pesa payment
│       │   ├── LeadsTable.js        # Leads data table
│       │   └── StatsCards.js        # Dashboard stat cards
│       ├── pages/
│       │   ├── Dashboard.js         # Main dashboard
│       │   ├── Login.js             # Login page
│       │   └── Setup.js             # First-time setup page
│       └── services/
│           └── api.js               # API helper functions
│
└── server/                          # Node.js + Express backend
    ├── config/
    │   ├── db.js                    # PostgreSQL connection pool
    │   └── env.js                   # Environment variable loader
    ├── controllers/                 # Route handlers
    ├── db/
    │   └── schema.sql               # Database schema
    ├── middleware/
    │   ├── asyncHandler.js          # Async error wrapper
    │   ├── errorHandler.js          # Global error handler
    │   └── requireAuth.js           # JWT auth middleware
    ├── receipts/                    # Generated PDF receipts
    ├── repositories/                # Database query layer
    │   ├── leads.repo.js            # Lead queries
    │   ├── messages.repo.js         # Message queries
    │   └── user.repo.js             # User queries
    ├── routes/
    │   ├── auth.routes.js           # Login / signup
    │   ├── leads.routes.js          # Lead CRUD
    │   ├── payments.routes.js       # M-Pesa STK Push + callback
    │   ├── users.routes.js          # User management
    │   └── webhook.routes.js        # WhatsApp webhook + bot
    ├── services/
    │   ├── auth.service.js          # JWT + bcrypt logic
    │   ├── leads.service.js         # Lead business logic
    │   ├── mpesa.service.js         # Safaricom Daraja API
    │   └── receipt.service.js       # PDF receipt generation
    └── index.js                     # App entry point
```

---

## Prerequisites

Make sure you have these installed before cloning:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v15 or higher
- [ngrok](https://ngrok.com/) for local development
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

Then create all tables using the schema file:

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

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# WhatsApp Cloud API (Meta Developer Console)
META_VERIFY_TOKEN=your_custom_verify_token
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_APP_SECRET=your_app_secret

# M-Pesa Daraja API (Safaricom Developer Portal)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/payments/callback
```

> **Never commit your `.env` file to GitHub.** It is already in `.gitignore`.

### 5. Start the backend server

```bash
node index.js
```

You should see:
```
CRM server running on :5000
```

### 6. Install and start the frontend

Open a new terminal:

```bash
cd client
npm install
npm start
```

The app opens at `http://localhost:3001`.

---

## First Time Setup

When you open the app for the first time with an empty database, the **Setup page** appears automatically. Fill in:

1. Your business name
2. Your full name
3. Your email address
4. Your password

This creates the first admin account. After setup the page is permanently disabled — only admins can add new agents from the dashboard.

---

## WhatsApp Webhook Setup

### Start ngrok

```bash
ngrok http 5000
```

Copy the ngrok URL e.g. `https://abc123.ngrok-free.app`

### Configure Meta

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Your App → WhatsApp → Configuration
3. Set Callback URL to: `https://abc123.ngrok-free.app/webhook`
4. Set Verify Token to match `META_VERIFY_TOKEN` in your `.env`
5. Click **Verify and save**
6. Subscribe to **messages**

---

## M-Pesa Setup

1. Create an app at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Get your **Consumer Key**, **Consumer Secret** and **Passkey**
3. Use shortcode `174379` for sandbox testing
4. Use a Kenyan number (`254XXXXXXXXX`) for sandbox STK Push tests
5. Set `MPESA_CALLBACK_URL` to your ngrok URL

---

## Key API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/setup/status` | Public | Check if system is configured |
| POST | `/api/setup` | Public | First-time admin setup |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/leads` | JWT | List all leads |
| GET | `/api/leads/:id` | JWT | Get single lead with messages |
| PATCH | `/api/leads/:id` | JWT | Update lead status |
| POST | `/api/leads/:id/claim` | JWT | Claim an unassigned lead |
| POST | `/api/payments/pay` | JWT | Trigger M-Pesa STK Push |
| POST | `/api/payments/callback` | Public | Safaricom payment callback |
| GET | `/api/payments/receipt/:leadId` | JWT | Download PDF receipt |
| GET | `/webhook` | Public | WhatsApp webhook verification |
| POST | `/webhook` | Public | Incoming WhatsApp messages |
| GET | `/health` | Public | Health check |

---

## User Roles

| Role | Permissions |
|---|---|
| `admin` | See all leads, reassign agents, trigger payments, view stats |
| `agent` | See assigned leads, update status, claim unassigned leads |

---

## WhatsApp Bot Flow

```
Customer: "Hello"
Bot: "Hello [Name]! 👋 Thank you for reaching out.
     We've received your message and one of our agents 
     will get back to you shortly.
     
     In the meantime, please tell us:
     📌 What are you looking for?
     📌 Your budget (if applicable)
     📌 Your preferred location (if applicable)"

Customer: "MENU"
Bot: "Here's what we can help you with:
     1️⃣ New inquiry
     2️⃣ Follow up on existing inquiry
     3️⃣ Make a payment
     4️⃣ Speak to an agent"

Customer: "3"
Bot: "💳 To make a payment, please let us know the amount 
     and our agent will send you an M-Pesa payment request 
     directly to this number."
```

---

## Payment Flow

1. Admin opens a lead in the dashboard
2. Admin enters the phone number and amount
3. Admin clicks **Send STK Push**
4. Customer receives M-Pesa prompt on their phone
5. Customer enters their PIN
6. Safaricom sends callback to the server
7. Payment saved in database
8. Lead status updated to **converted**
9. PDF receipt generated automatically
10. Customer receives WhatsApp confirmation with receipt number

---

## Built By

Shanila Malesa — Mctaba Labs Full-Stack Marathon Bootcamp
University of Birmingham, BSc Computer Science Year 1

GitHub: [shanilamalesa](https://github.com/shanilamalesa)

---

*Powered by Mctaba Labs · East Africa's WhatsApp + M-Pesa CRM*
