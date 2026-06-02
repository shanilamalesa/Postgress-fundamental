// config/redis.js
// communication bridge btw nodemon.js and redis server
const { createClient } = require("redis");

//creating redis client
const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

//listening for eror
client.on("error", (err) => {
  console.error("Redis error:", err);
});

//a flag vr->that prevents multiple unnecesary redis connections
let connected = false;

//resable getter function-safely returns the Redis client
async function getClient() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

module.exports = { getClient };