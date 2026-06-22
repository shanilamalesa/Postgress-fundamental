// server/services/ussd/session.js

//this module remember each user is in the USSD menu like (bookmark)
const { getClient } = require("../../config/redis");
const DRAFT_TTL = 600;
const draftKey = (phone) => `ussd:draft:${phone}`;

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

async function saveDraft(phone, data) {
  const client = await getClient();
  await client.set(draftKey(phone), JSON.stringify(data), { EX: DRAFT_TTL });
}

async function getDraft(phone) {
  const client = await getClient();
  const raw = await client.get(draftKey(phone));
  return raw ? JSON.parse(raw) : null;
}

async function clearDraft(phone) {
  const client = await getClient();
  await client.del(draftKey(phone));
}


module.exports = { get, set, destroy, saveDraft, getDraft, clearDraft };