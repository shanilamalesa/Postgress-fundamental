// server/repositories/tickets.repo.js

//it isolates all the database oparation that are related to the supports tickets
//importing the database query function from the db configuration
const { query } = require("../config/db");

//create async function thats accept s a phone number
async function findOpenByPhone(waPhone) {

  const { rows } = await query(
    `SELECT id, category, status, notes, created_at
     FROM leads
     WHERE wa_phone = $1
       AND channel = 'ussd'
       AND status NOT IN ('converted', 'lost')
     ORDER BY created_at DESC
     LIMIT 5`,
    [waPhone]
  );
  //return an object
  return rows;
}

//accept phone, category, message query
async function create({ phone, category, message }) {
  //insert , adding a new raw into leads
  const { rows } = await query(
    `INSERT INTO leads (wa_phone, name, inquiry_type, category, notes, channel, status)
     VALUES ($1, $2, $3, $4, $5, 'ussd', 'new')
     RETURNING *`,
    [phone, `USSD caller ${phone}`, category, category, message]
  );
  return rows[0];
}

module.exports = { findOpenByPhone, create };