// server/controllers/ussd.controller.js

//controller receives the request from AT, and pass it to the right place
const dispatcher = require("../services/ussd/dispatcher");

//this fn exacutes whenevr post ussd is called
async function handle(req, res) {
  //takes what the AT sent and unpacks it
  const { sessionId, phoneNumber, text } = req.body;

  //pass to service--handle it to the dispatcher(service layer to do the thinking)
  const response = await dispatcher.run({
    sessionId,
    phoneNumber,
    rawText: text || "",
  });

  //takes whatever the disaptcher returns the sends it back to AT
  res.set("Content-Type", "text/plain");
  res.send(response);
}

//the Controller- Receives- Passes - Sends back

module.exports = { handle };