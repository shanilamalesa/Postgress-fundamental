// server/services/ussd/session.js
const { getClient } = require("../../config/redis");

const SESSION_TTL = 300;
const key = (id) => `ussd:session:${id}`;

async function get(sessionId) {
  const client = await getClient();
  const raw = await client.get(key(sessionId));
  return raw ? JSON.parse(raw) : { state: "welcome", context: {} };
}

async function set(sessionId, data) {
  const client = await getClient();
  await client.set(key(sessionId), JSON.stringify(data), { EX: SESSION_TTL });
}

async function destroy(sessionId) {
  const client = await getClient();
  await client.del(key(sessionId));
}

module.exports = { get, set, destroy };