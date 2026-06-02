// server/services/ussd/states/new_ticket_category.js
const CATEGORIES = {
  "1": "billing",
  "2": "rider_complaint",
  "3": "lost_item",
  "4": "other",
};

module.exports = async function newTicketCategory({ input, context }) {
  if (input === "0") {
    return {
      response:
        "CON Jetlink Support\n1. My open tickets\n2. File a new ticket\n3. Call support",
      nextState: "welcome",
      nextContext: {},
    };
  }

  const category = CATEGORIES[input];
  if (!category) {
    return {
      response:
        "CON Invalid. What is the issue about?\n1. Billing\n2. Rider complaint\n3. Lost item\n4. Other\n0. Back",
      nextState: "new_ticket_category",
      nextContext: context,
    };
  }

  return {
    response: "CON Type a short message (max 160 chars):",
    nextState: "new_ticket_message",
    nextContext: { ...context, category },
  };
};