// server/routes/webhook.routes.js
const express = require("express");
const axios = require("axios");
const leadsRepo = require("../repositories/leads.repo");
const messagesRepo = require("../repositories/messages.repo");

const router = express.Router();

// GET /webhook -- Meta verification handshake
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// POST /webhook -- Incoming WhatsApp messages
router.post("/", async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const waPhone = message.from;
    const messageText = message.text?.body || "";
    const metaMessageId = message.id;
    const contact = value?.contacts?.[0];
    const name = contact?.profile?.name || "Unknown";

    console.log(`Message from ${waPhone}: ${messageText}`);

    // Find or create lead
    let lead = await leadsRepo.findByPhone(waPhone);
    const isNewLead = !lead;

    if (!lead) {
      lead = await leadsRepo.insert({
        waPhone,
        name,
        email: null,
        inquiryType: detectInquiryType(messageText),
      });
      console.log(`New lead created: ${lead.id}`);
    } else {
      console.log(`Existing lead found: ${lead.id}`);
    }

    // Save incoming message
    await messagesRepo.insert({
      leadId: lead.id,
      direction: "in",
      body: messageText,
      rawPayload: body,
      metaMessageId,
    });

    // Generate and send bot reply
    const replyText = generateReply(messageText, isNewLead, name);
    await sendWhatsAppMessage(waPhone, replyText);

    // Save outgoing message
    await messagesRepo.insert({
      leadId: lead.id,
      direction: "out",
      body: replyText,
      rawPayload: null,
      metaMessageId: null,
    });

  } catch (err) {
    console.error("Webhook error:", err.message);
  }
});

// Send WhatsApp message via Meta Cloud API
async function sendWhatsAppMessage(to, text) {
     console.log("Using token:", process.env.META_ACCESS_TOKEN?.slice(0, 20) + "...");
        console.log("Using phone ID:", process.env.META_PHONE_NUMBER_ID);
  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(`Reply sent to ${to}`);
}

// Generate reply based on message
function generateReply(text, isNewLead, name) {
  const t = text.toLowerCase().trim();

  // New customer - first time messaging
  if (isNewLead) {
    return `Hello ${name}! 👋 Thank you for reaching out.\n\nWe've received your message and one of our agents will get back to you shortly.\n\nIn the meantime, please tell us:\n\n📌 What are you looking for?\n📌 Your budget (if applicable)\n📌 Your preferred location (if applicable)\n\nThe more details you share, the faster we can help you! 😊`;
  }

  // MENU keyword
  if (t === "menu" || t === "0") {
    return `Here's what we can help you with:\n\n1️⃣ New inquiry\n2️⃣ Follow up on existing inquiry\n3️⃣ Make a payment\n4️⃣ Speak to an agent\n\nReply with a number 👆`;
  }

  // Option 1 - New inquiry
  if (t === "1" || t.includes("new inquiry") || t.includes("inquiry")) {
    return `Sure! Please describe what you're looking for and we'll get back to you as soon as possible. 😊\n\nInclude details like:\n📌 What you need\n📌 Your budget\n📌 Your preferred location`;
  }

  // Option 2 - Follow up
  if (t === "2" || t.includes("follow up") || t.includes("followup") || t.includes("update")) {
    return `Thank you for following up! 🙏\n\nOur team is working on your inquiry. An agent will contact you within *24 hours* on this number.\n\nIf it's urgent, reply *4* to speak to an agent directly.`;
  }

  // Option 3 - Payment
  if (t === "3" || t.includes("payment") || t.includes("pay") || t.includes("mpesa") || t.includes("lipa")) {
    return `💳 To make a payment, please let us know the amount and our agent will send you an M-Pesa payment request directly to this number.\n\nYou'll receive an STK Push prompt on your phone to complete the payment. ✅`;
  }

  // Option 4 - Speak to agent
  if (t === "4" || t.includes("agent") || t.includes("talk") || t.includes("human") || t.includes("speak")) {
    return `👤 Connecting you to an agent...\n\nOur team will reach out to you shortly.\n\nAverage response time: *30 minutes* during business hours (8AM - 6PM EAT). 🕐`;
  }

  // Greetings
  if (t.includes("hello") || t.includes("hi") || t.includes("hujambo") || t.includes("habari") || t.includes("hey")) {
    return `Hello ${name}! 👋 Great to hear from you again.\n\nHow can we help you today? Reply *MENU* to see our options or just tell us what you need. 😊`;
  }

  // Customer shares details (longer message)
  if (text.length > 30) {
    return `Thank you ${name}! ✅\n\nWe've noted your inquiry:\n────────────────────\n📋 ${text}\n────────────────────\n\nOur team will contact you within *24 hours* on this number.\n\nReply *MENU* at any time to see our options. 🙏`;
  }

  // Default reply
  return `Thank you for your message! 🙏\n\nOur team has received your inquiry and will get back to you shortly.\n\nReply *MENU* to see how we can help you. 😊`;
}

// Detect inquiry type from message
function detectInquiryType(text) {
  const t = text.toLowerCase();
  if (t.includes("price") || t.includes("cost") || t.includes("how much")) return "pricing";
  if (t.includes("house") || t.includes("property") || t.includes("rent") || t.includes("buy")) return "property";
  if (t.includes("car") || t.includes("vehicle")) return "vehicle";
  if (t.includes("insur")) return "insurance";
  return "general";
}

module.exports = router;