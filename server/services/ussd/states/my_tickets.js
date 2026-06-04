// server/services/ussd/states/my_tickets.js

//Show the user their open tickets from the database
//
const ticketsRepo = require("../../../repositories/tickets.repo");

//exports the async function my tickets
module.exports = async function myTickets({ phoneNumber }) {
  //call the ticketsRepo 
  const tickets = await ticketsRepo.findOpenByPhone(phoneNumber);

  //checks if no tickects exist
  if (tickets.length === 0) {
    return {
      response: "END You have no open tickets. Dial again to file one.",
      nextState: "done",
      nextContext: {},
    };
  }

  //building the display line, creating an array lines
  const lines = tickets
    .map((t, i) => `${i + 1}. ${t.category || "Ticket"} - ${t.status}`)
    //limits the number of tickets
    .slice(0, 4); // keep under 182 chars

    //returns the response back to Africas Talking
  return {
    response: `END Your tickets:\n${lines.join("\n")}`,//ensures all the tickects have in its on line
    //session has finished
    nextState: "done",
    //it removes any stored temporary data
    nextContext: {},
  };
};