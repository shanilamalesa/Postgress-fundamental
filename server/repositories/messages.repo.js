// server/repositories/messages.repo.js
const { query } = require("../config/db");

// Save an incoming or outgoing message
async function insert({ leadId, direction, body, rawPayload, metaMessageId }) {
  const { rows } = await query(
    `INSERT INTO messages (lead_id, direction, body, raw_payload, meta_message_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [leadId, direction, body, rawPayload ? JSON.stringify(rawPayload) : null, metaMessageId || null]
  );
  return rows[0];
}

// Get all messages for a lead ordered by time
async function findByLeadId(leadId) {
  const { rows } = await query(
    `SELECT * FROM messages WHERE lead_id = $1 ORDER BY created_at ASC`,
    [leadId]
  );
  return rows;
}

module.exports = { insert, findByLeadId };