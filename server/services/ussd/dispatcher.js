// server/services/ussd/dispatcher.js

//disaptcher - ussd conversation is managed

//importing the session manager backed by redis
const session = require("./session");
//importing an object conataing all the hundlers
const states = require("./states");

//fn receives the request from the controller
async function run({ sessionId, phoneNumber, rawText }) {
  //the breadcrumb trail (1*2*3)- grab the last thing the user typed
  const parts = rawText.split("*");
  //
  const latestInput = rawText === "" ? "" : parts[parts.length - 1];

  //loading the current session the user is right now
  //gets something like this, then picks the right state hundler
  //{ "state": "new_ticket_category", "context": { "category": "billing" } }
  const current = await session.get(sessionId);
  const handlerName = current.state || "welcome";
  const handler = states[handlerName] || states.welcome;

  //runs the hundler and get the response
  const result = await handler({
    input: latestInput,
    context: current.context,
    phoneNumber,
  });

  //if session is ending --delete from redis , if continuing -- save ne state to Redis
  if (result.response.startsWith("END")) {
    await session.destroy(sessionId);
    if (result.postSessionTask) {
      // Fire and forget -- do not block the USSD reply.
      result.postSessionTask().catch((err) =>
        console.error("post-session task failed:", err)
      );
    }
  } else {
    await session.set(sessionId, {
      state: result.nextState,
      context: result.nextContext,
    });
  }
//return response to controller
  return result.response;
}

module.exports = { run };

//full flow of dis[atcher.js]
// Get latest input - Load session from Redis - Pick the right handler- Run the handler - Save or destroy session - Return response to controller







//Day 4

// // server/services/ussd/dispatcher.js
// const session = require("./session");
// const states = require("./states");
// const { t } = require("./i18n");

// async function run({ sessionId, phoneNumber, rawText }) {
//   try {
//     const parts = rawText.split("*");
//     const latestInput = rawText === "" ? "" : parts[parts.length - 1];

//     const current = await session.get(sessionId);
//     const lang = current.context?.lang || "en";

//     const handlerName = current.state || "welcome";
//     const handler = states[handlerName] || states.welcome;

//     const result = await handler({
//       input: latestInput,
//       context: current.context,
//       phoneNumber,
//       lang,
//     });

//     if (result.response.startsWith("END")) {
//       await session.destroy(sessionId);
//       if (result.postSessionTask) {
//         result.postSessionTask().catch((err) =>
//           console.error("post-session task failed:", err)
//         );
//       }
//     } else {
//       await session.set(sessionId, {
//         state: result.nextState,
//         context: result.nextContext,
//       });
//     }

//     return clampResponse(result.response);
//   } catch (err) {
//     console.error("ussd dispatcher error:", err);
//     await session.destroy(sessionId).catch(() => {});
//     return `END ${t("en", "generic_error")}`;
//   }
// }

// function clampResponse(response) {
//   if (response.length <= 180) return response;
//   const prefix = response.startsWith("END") ? "END " : "CON ";
//   const body = response.slice(prefix.length);
//   return prefix + body.slice(0, 176 - prefix.length) + "...";
// }

// module.exports = { run };