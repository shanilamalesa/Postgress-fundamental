// server/repositories/users.repo.js

//this file is implimanting the repository pattern
//importing the query(helper function)
const { query } = require("../config/db");

//finding the user using their emails, 
// used during login or regestartion or user authentication
async function findByEmail(email) {
  const { rows } = await query(
    //select from user with emails
    "SELECT * FROM users WHERE email = $1",
    //case in sesintive to email
    [email.toLowerCase()]
  );
  return rows[0] || null;
}

//find the user using their id
async function findById(id) {
  const { rows } = await query(
    //
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [id]
  );
  //return the user object or null
  return rows[0] || null;
}

//defaul role as agent
async function insert({ email, passwordHash, name, role = "agent" }) {
    
    const { rows } = await query(
        `INSERT INTO users (email, password_hash, name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role, created_at`,
        [email.toLowerCase(), passwordHash, name, role]
    );
    return rows[0];
}

module.exports = { findByEmail, findById, insert };