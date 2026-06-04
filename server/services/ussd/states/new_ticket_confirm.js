// server/services/ussd/states/new_ticket_confirm.js

//hundles the confirmation, creating the ussd tickect 
const ticketsRepo = require("../../../repositories/tickets.repo");
const smsService = require("../../sms.service");

module.exports = async function newTicketConfirm({ input, context, phoneNumber }) {
  //if the 
  if (input === "2") {
    return {
      response: "CON Type a short message (max 160 chars):",
      nextState: "new_ticket_message",
      nextContext: { ...context, message: undefined },
    };
  }

  //invalid option for 1
  if (input !== "1") {
    return {
      response: `CON Invalid. Confirm?\n1. Yes, submit\n2. Re-type`,
      nextState: "new_ticket_confirm",
      nextContext: context,
    };
  }

  // Write the ticket synchronously -- it is fast.
  const ticket = await ticketsRepo.create({
    //values going to be sent
    phone: phoneNumber,
    category: context.category,
    message: context.message,
  });

  //slicing the ticket id, first 8 character
  const shortId = ticket.id.slice(0, 8);

  //returning a success response
  return {
    response: `END Ticket #${shortId} filed. You will get an SMS shortly.`,
    //make state as done
    nextState: "done",
    //clear the context
    nextContext: {},
    //calling the sms service before sending the sms back
    postSessionTask: async () => {
      await smsService.sendSMS(
        //using the post session task  to send them confirmation before 
        phoneNumber,
        `Jetlink: ticket #${shortId} received. Category: ${context.category}. An agent will contact you.`
      );
    },
  };
};