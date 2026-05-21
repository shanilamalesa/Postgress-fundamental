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

// //fetch multiples leads with filterinf, search
// async function list({ status, search, limit = 50, offset = 0 }) {
//   const conditions = [];
//   const params = [];

//   if (status) {
//     params.push(status);
//     conditions.push(`status = $${params.length}`);
//   }
//   if (search) {
//     params.push(`%${search}%`);
//     //ILIKE-> case sensitive
//     conditions.push(`(name ILIKE $${params.length} OR wa_phone ILIKE $${params.length})`);
//   }
//   //
//   const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

//   //pagination params
//   params.push(limit);
//   params.push(offset);

//   //
//   const { rows } = await query(
//     //enforces the latest leads first
//     `SELECT * FROM leads ${where}
//      ORDER BY created_at DESC
//      LIMIT $${params.length - 1} OFFSET $${params.length}`,
//      //limit->parameter indexing trick
//     params
//   );
//   //return the whole row
//   return rows;
// }

//fetch multiples leads with filterinf, search
async function list({ status, search, assignedTo, limit = 50, offset = 0 }) {
  //condition stores the SQL condition
  //params stores the status value
  console.log("repo.list assignedTo:", assignedTo);
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`l.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(l.name ILIKE $${params.length} OR l.wa_phone ILIKE $${params.length})`);
  }
  //the assigment filter
  if (assignedTo === "unassigned") {
    //IS NULL-SQL
    conditions.push("l.assigned_to IS NULL");
    //
  } else if (assignedTo === "me" /* handled by caller -> user id */) {
    // caller passes a uuid instead
  } else if (assignedTo) {
    params.push(assignedTo);
    // conditions.push(`l.assigned_to = $${params.length}`);
    conditions.push(`l.assigned_to = $${params.length}::uuid`);
  }

  //if the condition exist , status going to be $1, 
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  params.push(offset);

  // LEFT JOIN users u ON u.id = l.assigned_to  
  const sql = `SELECT l.*, u.name AS assigned_to_name
      FROM leads l
      LEFT JOIN users u ON u.id = l.assigned_to  
      ${where}
      ORDER BY l.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    console.log("SQL:", sql, "\nPARAMS:", params);
    const { rows } = await query(sql, params);
    return rows;
}

async function assign(leadId, userId) {
  const { rows } = await query(
    `UPDATE leads SET assigned_to = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [userId, leadId]
  );
  return rows[0] || null;
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
  assign
};