// server/services/ussd/states/welcome.js
module.exports = async function welcome({ input, context }) {
  if (input === "") {
    return {
      response:
        "CON Jetlink Support\n1. My open tickets\n2. File a new ticket\n3. Call support",
      nextState: "welcome",
      nextContext: context,
    };
  }

  if (input === "1") {
    return {
      response: "CON Loading your tickets...", // this is a dummy; my_tickets handles the first hit
      nextState: "my_tickets",
      nextContext: context,
    };
  }

  if (input === "2") {
    return {
      response:
        "CON What is the issue about?\n1. Billing\n2. Rider complaint\n3. Lost item\n4. Other\n0. Back",
      nextState: "new_ticket_category",
      nextContext: context,
    };
  }

  if (input === "3") {
    return {
      response: "END Call +254712000000 or dial again. Asante.",
      nextState: "done",
      nextContext: {},
    };
  }

  return {
    response:
      "CON Invalid. Jetlink Support\n1. My open tickets\n2. File a new ticket\n3. Call support",
    nextState: "welcome",
    nextContext: context,
  };
};