// server/repositories/leads.repo.js
//this file talks to the postgress SQL
//data access layer
//to tals to business SQL for (encapitalasion)

//import the Query helper(pg. pool.query)
const { query } = require("../config/db");

//it futches a ingle lead by primary key
async function findById(id) {
  const { rows } = await query(
    //$1-> parametised pattern-postgress SQl binding
    "SELECT * FROM leads WHERE id = $1",
    [id]
  );
  //frist row->0 or null when not found
  return rows[0] || null;
}

//finding a lead using whatspp whatspp phone number
async function findByPhone(waPhone) {
  const { rows } = await query(
    "SELECT * FROM leads WHERE wa_phone = $1",
    [waPhone]
  );
c  //frist row->0 or null when not found
  return rows[0] || null;
}

//fetch multiples leads with filterinf, search
async function list({ status, search, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    //ILIKE-> case sensitive
    conditions.push(`(name ILIKE $${params.length} OR wa_phone ILIKE $${params.length})`);
  }
  //
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  //pagination params
  params.push(limit);
  params.push(offset);

  //
  const { rows } = await query(
    //enforces the latest leads first
    `SELECT * FROM leads ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
     //limit->parameter indexing trick
    params
  );
  //return the whole row
  return rows;
}


async function insert({ waPhone, name, email, inquiryType }) {
  const { rows } = await query(
    `INSERT INTO leads (wa_phone, name, email, inquiry_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
     //modify raw
    [waPhone, name, email, inquiryType]
  );
  return rows[0];
}

//automatically update the lead status
async function updateStatus(id, status) {
  const { rows } = await query(
    `UPDATE leads SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
}

//
async function statsByStatus() {
  const { rows } = await query(
    `SELECT status, COUNT(*)::int AS total
     FROM leads
     GROUP BY status`
  );
  return rows;
}

//exports all the function
module.exports = {
  findById,
  findByPhone,
  list,
  insert,
  updateStatus,
  statsByStatus,
};