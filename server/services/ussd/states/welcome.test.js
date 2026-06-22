// server/services/ussd/states/welcome.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const welcome = require("./welcome");

test("first hit returns welcome menu in english by default", async () => {
  const result = await welcome({ input: "", context: {}, phoneNumber: "+254700000000" });
  assert.ok(result.response.startsWith("CON "));
  assert.match(result.response, /Jetlink Support/);
  assert.equal(result.nextState, "welcome");
});

test("language toggle switches to kiswahili", async () => {
  const result = await welcome({
    input: "4",
    context: { lang: "en" },
    phoneNumber: "+254700000000",
  });
  assert.match(result.response, /Jetlink Msaada/);
  assert.equal(result.nextContext.lang, "sw");
});

test("invalid input re-renders menu with CON", async () => {
  const result = await welcome({ input: "9", context: {}, phoneNumber: "+254700000000" });
  assert.ok(result.response.startsWith("CON "));
  assert.match(result.response, /Invalid/);
  assert.equal(result.nextState, "welcome");
});

test("option 3 ends session with support contact", async () => {
  const result = await welcome({ input: "3", context: {}, phoneNumber: "+254700000000" });
  assert.ok(result.response.startsWith("END "));
  assert.match(result.response, /\+254712000000/);
});