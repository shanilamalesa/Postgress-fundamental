// server/config/db.js
//cetralises the database connection
//importing the pool that manage the database connection
const { Pool } = require("pg");
//loads the environment variable 
const env = require("./env");

//it creates a reusable connection
const pool = new Pool({
  //postgress SQL sever address
  host: env.DB_HOST,
  //default port 5432
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  //postgress 
  database: env.DB_NAME,
  //maximum  
  max: 10,                      // up to 10 concurrent connections
  //limit 10 database simultaniously
  idleTimeoutMillis: 30000,     // close idle connections after 30s
  //idle connect-> connection that exist but not in use
});

//an event emitter
//pool error hundling (listen for an expexted error)

pool.on("error", (err) => { //subcribe to pool level error
  console.error("Unexpected pg pool error", err);
  process.exit(1);
});

//a querry helper function
//text-> SQL query string
//params -> parametised query values(that prevent query injections)
async function query(text, params) {
  //query timing
  const start = Date.now();
  //pool gets conection, send to SQL, 
  const result = await pool.query(text, params);
  //calculate query exacution time
  const ms = Date.now() - start;
  //enables logging when configure
  if (process.env.DB_LOG === "true") {
    //
    console.log(`[db] ${ms}ms ${text.split("\n")[0]}`);
  }
  return result;
}

//retrieves dedicated connection to pool//
// pool.query ->simple one of queries(it aquears connection, exacute querirs, release connection)
//pool.connection-> used when you need transaction, multiple queries
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { pool, query, getClient };