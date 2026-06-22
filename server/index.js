// server/index.js
//main entry point to our server that wire the entire backend everywhere

const express = require("express");//backend frameoker
const cors = require("cors");//
const env = require("./config/env");//importung environment configaration

//regerster the router
const leadsRoutes = require("./routes/leads.routes");//crm lead enpoint
const webhookRoutes = require("./routes/webhook.routes");//external webhook intergartion
const errorHandler = require("./middleware/errorHandler");//centralised global ware hundler
const authRoutes = require("./routes/auth.routes");
const requireAuth = require("./middleware/requireAuth");
const usersRoutes = require("./routes/users.routes")


const app = express();//starting the actual app

//control the fronted origin may accept the api(fronted to talk to the backend)
app.use(cors({ origin: process.env.APP_URL || "http://localhost:3000" }));
//json paertn middleware->passes the incoming json body and converts them to

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

//health checkpoint
app.get("/health", (req, res) => res.json({ ok: true }));

//mounting the lead  routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", requireAuth, leadsRoutes);
// app.use("/webhook", webhookRoutes);

app.use("/api/users", requireAuth, require("./routes/users.routes"));

app.use("/api/payments/callback", require("./routes/payments.routes"));

app.use("/api/payments", requireAuth, require("./routes/payments.routes"));

app.use("/ussd", require("./routes/ussd.routes"));


// Public setup check -- is the system configured yet?
app.get("/api/setup/status", async (req, res) => {
  const { query } = require("./config/db");
  const { rows } = await query(
    "SELECT COUNT(*) FROM users WHERE role = 'admin'"
  );
  res.json({ configured: parseInt(rows[0].count) > 0 });
});

// Public setup route -- register first admin
app.post("/api/setup", async (req, res, next) => {
  try {
    const { query } = require("./config/db");
    
    // Check no admin exists yet
    const { rows } = await query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'"
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(403).json({ error: { message: "System already configured" } });
    }

    const { businessName, name, email, password } = req.body;
    if (!businessName || !name || !email || !password) {
      return res.status(400).json({ error: { message: "All fields are required" } });
    }

    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");
    const passwordHash = await bcrypt.hash(password, 12);

    const { rows: newUser } = await query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, email, name, role`,
      [email.toLowerCase(), passwordHash, name]
    );

    const token = jwt.sign(
      { sub: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ user: newUser[0], token });
  } catch (err) {
    next(err);
  }
});

//regester the error middlerware
app.use(errorHandler);


//starts the http server
app.listen(env.PORT, () => {
  console.log(`CRM server running on :${env.PORT}`);
});

// app.use("/api/auth", authRoutes);
// app.use("/api/leads", requireAuth, leadsRoutes);  // <-- protected!
// app.use("/webhook", webhookRoutes);                // <-- still public (Meta calls it)

