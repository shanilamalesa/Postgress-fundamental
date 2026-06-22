// server/routes/payments.routes.js
const express = require("express");
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

    // Check lead exists
    const { rows } = await query(
      "SELECT * FROM leads WHERE id = $1",
      [leadId]
    );
    if (!rows[0]) throw new AppError("Lead not found", 404);

    const formattedPhone = formatPhone(phone);

    // Create pending payment record
    await query(
      `INSERT INTO payments (lead_id, phone_number, amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [leadId, formattedPhone, amount]
    );

    // Trigger STK Push
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
  // Respond immediately so Safaricom doesn't retry
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const callback = req.body.Body?.stkCallback;
  if (!callback) return;

  const { ResultCode, ResultDesc, CallbackMetadata } = callback;

  if (ResultCode !== 0) {
    console.log("Payment failed or cancelled:", ResultDesc);
    return;
  }

  // Extract metadata
  const metadata = {};
  CallbackMetadata?.Item?.forEach((item) => {
    metadata[item.Name] = item.Value;
  });

  const mpesaReceipt = metadata.MpesaReceiptNumber;
  const amount = metadata.Amount;
  const phoneNumber = String(metadata.PhoneNumber);
  const transactionDate = String(metadata.TransactionDate);

  // Find matching pending payment
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

  // Update payment record
  await query(
    `UPDATE payments 
     SET mpesa_receipt = $1, transaction_date = $2, 
         status = 'completed', raw_callback = $3, updated_at = now()
     WHERE id = $4`,
    [mpesaReceipt, transactionDate, JSON.stringify(req.body), rows[0].id]
  );

  // Update lead status to converted
  await query(
    "UPDATE leads SET status = 'converted' WHERE id = $1",
    [rows[0].lead_id]
  );

  console.log(`Payment completed: ${mpesaReceipt}`);

  // Fetch lead name for receipt
  const { rows: leadRows } = await query(
    "SELECT name FROM leads WHERE id = $1",
    [rows[0].lead_id]
  );

  // Generate PDF receipt
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
  } catch (err) {
    console.error("Receipt generation failed:", err);
  }
});

// GET /api/payments/status/:leadId -- Check payment status for a lead
router.get("/status/:leadId", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM payments WHERE lead_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [req.params.leadId]
    );

    res.json({
      payment: rows[0] || null,
    });
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

// Helper: format phone to international format (any African country code)
function formatPhone(phone) {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }

  return cleaned;
}

module.exports = router;