// server/services/sms.service.js
//load the environmental variable
const env = require("../config/env");

const AT_URL = "https://api.sandbox.africastalking.com/version1/messaging";

//
async function sendSMS(to, message) {
  //the request body
  const body = new URLSearchParams({
    username: env.AT_USERNAME,
    to,
    message,
    from: env.AT_SMS_FROM || "",
  }).toString();

  //sending a http request 
  const res = await fetch(AT_URL, {
    //method request POst- bcs we are sending a message
    method: "POST",
    //
    headers: {
      //apikey-it authonticating the application
      apiKey: env.AT_API_KEY,
      //tells AT sms api body is url-encoded
      "Content-Type": "application/x-www-form-urlencoded",
      //return the response as json
      Accept: "application/json",
    },
    body,
  });

  //
  const data = await res.json();
  //if response is false
  if (!res.ok) {
    console.error("SMS send failed:", data);
    //throw an exception error
    throw new Error("SMS failed");
  }
  //returning a successful response
  return data;
}

module.exports = { sendSMS };


// when a customer submit the tickets in ussd- dial ussd - send the sms- 