// server/routes/payments.routes.js
const express = require("express");
const axios = require("axios");
const { query } = require("../config/db");
const { initiateSTKPush } = require("../services/mpesa.service");
const AppError = require("../utils/AppError");
const { generateReceipt } = require("../services/receipt.service");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// POST /api/payments/pay -- Trigger STK Push for a lead
router.post("/pay", async (req, res, next) => {
  try {
    const { leadId, phone, amount } = req.body;

    if (!leadId || !phone || !amount) {
      throw new AppError("leadId, phone, and amount are required", 400);
    }

    const { rows } = await query(
      "SELECT * FROM leads WHERE id = $1",
      [leadId]
    );
    if (!rows[0]) throw new AppError("Lead not found", 404);

    const formattedPhone = formatPhone(phone);

    await query(
      `INSERT INTO payments (lead_id, phone_number, amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [leadId, formattedPhone, amount]
    );

    const result = await initiateSTKPush(formattedPhone, amount, leadId);

    if (result.ResponseCode === "0") {
      res.json({
        message: "STK push sent. Check your phone.",
        checkoutRequestId: result.CheckoutRequestID,
      });
    } else {
      throw new AppError("Failed to initiate payment", 400);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/callback -- Safaricom calls this with payment result
router.post("/callback", async (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const callback = req.body.Body?.stkCallback;
  if (!callback) return;

  const { ResultCode, ResultDesc, CallbackMetadata } = callback;

  if (ResultCode !== 0) {
    console.log("Payment failed or cancelled:", ResultDesc);
    return;
  }

  const metadata = {};
  CallbackMetadata?.Item?.forEach((item) => {
    metadata[item.Name] = item.Value;
  });

  const mpesaReceipt = metadata.MpesaReceiptNumber;
  const amount = metadata.Amount;
  const phoneNumber = String(metadata.PhoneNumber);
  const transactionDate = String(metadata.TransactionDate);

  const { rows } = await query(
    `SELECT * FROM payments 
     WHERE phone_number = $1 AND amount = $2 AND status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [phoneNumber, amount]
  );

  if (!rows[0]) {
    console.error("No matching pending payment found");
    return;
  }

  await query(
    `UPDATE payments 
     SET mpesa_receipt = $1, transaction_date = $2, 
         status = 'completed', raw_callback = $3, updated_at = now()
     WHERE id = $4`,
    [mpesaReceipt, transactionDate, JSON.stringify(req.body), rows[0].id]
  );

  await query(
    "UPDATE leads SET status = 'converted' WHERE id = $1",
    [rows[0].lead_id]
  );

  console.log(`Payment completed: ${mpesaReceipt}`);

  const { rows: leadRows } = await query(
    "SELECT name, wa_phone FROM leads WHERE id = $1",
    [rows[0].lead_id]
  );

  try {
    await generateReceipt({
      receiptNumber: mpesaReceipt,
      clientName: leadRows[0]?.name || "Customer",
      amount: amount,
      phone: phoneNumber,
      description: "Payment via M-Pesa STK Push",
      date: transactionDate,
      linkId: rows[0].lead_id,
    });
    console.log(`Receipt generated: ${mpesaReceipt}`);

    // Send WhatsApp confirmation to client
    await sendWhatsAppConfirmation(phoneNumber, {
      name: leadRows[0]?.name || "Customer",
      amount,
      mpesaReceipt,
    });

  } catch (err) {
    console.error("Receipt/confirmation failed:", err.message);
  }
});

// GET /api/payments/status/:leadId
router.get("/status/:leadId", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM payments WHERE lead_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [req.params.leadId]
    );
    res.json({ payment: rows[0] || null });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/receipt/:leadId -- Download PDF receipt
router.get("/receipt/:leadId", async (req, res) => {
  const filePath = path.join(
    __dirname, "..", "receipts", `${req.params.leadId}.pdf`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: { message: "Receipt not found yet" } });
  }

  res.download(filePath, `mctaba-receipt-${req.params.leadId.slice(0, 8)}.pdf`);
});

// Helper: format phone
function formatPhone(phone) {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }
  return cleaned;
}

// Send WhatsApp payment confirmation to client
async function sendWhatsAppConfirmation(phone, { name, amount, mpesaReceipt }) {
  try {
    const message =
      `Hello ${name}! 🎉\n\nYour payment has been received successfully.\n\n` +
      `────────────────────\n` +
      `✅ Amount Paid: *KES ${Number(amount).toLocaleString()}*\n` +
      `📋 Receipt No: *${mpesaReceipt}*\n` +
      `────────────────────\n\n` +
      `Thank you for your payment! Our team will be in touch shortly. 🙏\n\n` +
      `Powered by Mctaba CRM`;

    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Payment confirmation sent to ${phone}`);
  } catch (err) {
    console.error("Failed to send WhatsApp confirmation:", err.message);
  }
}

module.exports = router;