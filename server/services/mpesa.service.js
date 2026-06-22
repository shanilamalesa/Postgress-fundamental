//importing axios-> for http request->how backend comminuicate with external APIs
const axios = require("axios");


// Sandbox URL -- in production, this changes to the live URL
const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

// We cache the token so we don't request a new one on every single payment
// This avoids unnecessary API calls and respects Safaricom's rate limits

//yoken-cache-> stores the O oath temporalily
let tokenCache = {
  token: null,
  //--> when the token expires in millisec
  expiresAt: 0,
};

/**
 * Get an OAuth access token from Safaricom.
 * Returns a cached token if it's still valid. Requests a new one if expired.
 */
async function getAccessToken() {
  const now = Date.now();

  // If we have a cached token that won't expire in the next 60 seconds, reuse it
  if (tokenCache.token && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  // Combine Consumer Key and Secret, then Base64-encode them
  // This is how HTTP Basic Authentication works
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  // Request a new token from Safaricom
  const response = await axios.get(
    `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  // Cache the token with its expiry time
  tokenCache = {
    token: response.data.access_token,
    expiresAt: now + response.data.expires_in * 1000,
  };

  return tokenCache.token;
}

/**
 * Initiate an STK Push request.
 * This triggers the M-Pesa payment prompt on the customer's phone.
 *
 * @param {string} phone   - Phone number in 254XXXXXXXXX format
 * @param {number} amount  - Amount in KES
 * @param {string} linkId  - Your internal reference (the payment link ID)-->
 * 
 */

//purple>-ttiggrres 
async function initiateSTKPush(phone, amount, linkId) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  // The password is a Base64 encoding of: Shortcode + Passkey + Timestamp
  // This is Safaricom's way of verifying you are authorized for this shortcode
  const password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(amount), // M-Pesa only accepts whole numbers, no decimals
    PartyA: phone,             // The phone number being charged (the customer)
    PartyB: shortcode,         // The business receiving the payment
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: linkId.slice(0, 12), // Max 12 characters -- Safaricom truncates longer strings
    TransactionDesc: `Payment for invoice ${linkId.slice(0, 8)}`,
  };

  const response = await axios.post(
    `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
    //metadata about the request
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/**
 * Generate a timestamp in the exact format Safaricom expects: YYYYMMDDHHmmss
 * For example: 20260329143022 means March 29, 2026 at 2:30:22 PM
 */
function generateTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) + // Months are 0-indexed in JavaScript
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

module.exports = { initiateSTKPush };