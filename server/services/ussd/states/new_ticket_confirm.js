// server/services/ussd/states/new_ticket_confirm.js
const ticketsRepo = require("../../../repositories/tickets.repo");
const smsService = require("../../sms.service");

module.exports = async function newTicketConfirm({ input, context, phoneNumber }) {
  if (input === "2") {
    return {
      response: "CON Type a short message (max 160 chars):",
      nextState: "new_ticket_message",
      nextContext: { ...context, message: undefined },
    };
  }

  if (input !== "1") {
    return {
      response: `CON Invalid. Confirm?\n1. Yes, submit\n2. Re-type`,
      nextState: "new_ticket_confirm",
      nextContext: context,
    };
  }

  // Write the ticket synchronously -- it is fast.
  const ticket = await ticketsRepo.create({
    phone: phoneNumber,
    category: context.category,
    message: context.message,
  });

  const shortId = ticket.id.slice(0, 8);

  return {
    response: `END Ticket #${shortId} filed. You will get an SMS shortly.`,
    nextState: "done",
    nextContext: {},
    postSessionTask: async () => {
      await smsService.sendSMS(
        phoneNumber,
        `Jetlink: ticket #${shortId} received. Category: ${context.category}. An agent will contact you.`
      );
    },
  };
};