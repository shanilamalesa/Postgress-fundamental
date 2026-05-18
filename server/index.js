// server/index.js
//main entry point to our server that wire the entire backend everywhere

const express = require("express");//backend frameoker
const cors = require("cors");//
const env = require("./config/env");//importung environment configaration

//regerster the router
const leadsRoutes = require("./routes/leads.routes");//crm lead enpoint
const webhookRoutes = require("./routes/webhook.routes");//external webhook intergartion
const errorHandler = require("./middleware/errorHandler");//centralised global ware hundler


const app = express();//starting the actual app

//control the fronted origin may accept the api(fronted to talk to the backend)
app.use(cors({ origin: process.env.APP_URL || "http://localhost:3000" }));
//json paertn middleware->passes the incoming json body and converts them to

app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

//health checkpoint
app.get("/health", (req, res) => res.json({ ok: true }));

//mounting the lead  routes
app.use("/api/leads", leadsRoutes);

// app.use("/webhook", webhookRoutes);

//regester the error middlerware
app.use(errorHandler);

//starts the http server
app.listen(env.PORT, () => {
  console.log(`CRM server running on :${env.PORT}`);
});