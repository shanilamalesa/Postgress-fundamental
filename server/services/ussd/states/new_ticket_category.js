// server/services/ussd/states/new_ticket_category.js

//it hundles new tickects and responsible for choosing the tickects category
const CATEGORIES = {
  "1": "billing",
  "2": "rider_complaint",
  "3": "lost_item",
  "4": "other",
};

//exporting the async function 
module.exports = async function newTicketCategory({ input, context }) {
  //if user response is 0
  if (input === "0") {
    return {
      response:
        "CON Jetlink Support\n1. My open tickets\n2. File a new ticket\n3. Call support",
      nextState: "welcome",
      //clearing the temporary data
      nextContext: {},
    };
  }

  //CATEGORIES[input === billing, ...]
  const category = CATEGORIES[input];
  //if invalid category 
  if (!category) {
    return {
      //bring back the welcome menu
      response:
        "CON Invalid. What is the issue about?\n1. Billing\n2. Rider complaint\n3. Lost item\n4. Other\n0. Back",
      nextState: "new_ticket_category",
      //keep the exist content
      nextContext: context,
    };
  }

  //
  return {
    response: "CON Type a short message (max 160 chars):",
    nextState: "new_ticket_message",
    //...spread oparator, -> saving the phone number and category since the user hasnt submitted it 
    nextContext: { ...context, category },
  };
};