// server/services/ussd/states/new_ticket_message.js

//exporting the hundler
//this point user has ready choose the category 
module.exports = async function newTicketMessage({ input, context }) {
  //validating the message length and if the input is too short, < 3 char
  if (!input || input.length < 3) {
    //invalid message response
    return {
      response: "CON Message too short. Type a short message (3-160 chars):",
      nextState: "new_ticket_message",
      nextContext: context,
    };
  }

  //limit the message to 160 character
  const truncated = input.slice(0, 160);
  return {
    //truncated.slice(0, 60) -> going to show the first 60 characters
    response: `CON Confirm? "${truncated.slice(0, 60)}..."\n1. Yes, submit\n2. Re-type`,
    nextState: "new_ticket_confirm",
    nextContext: { ...context, message: truncated },
  };
};

//i left my bag pack in the bus yestareday afternoon because i was in a hurry
//i left my bag pack in the bus yestareday afternoon because i...., the user will see this 