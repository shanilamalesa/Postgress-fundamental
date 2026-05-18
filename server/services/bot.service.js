// server/services/leads.service.js
const leadsRepo = require("../repositories/leads.repo");
//custome application error
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];


const VALID_TRANSITIONS = {
  new: ["contacted", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["converted", "lost"],
  converted: [],
  lost: [],
};

//it retrieve a lead safley
async function getLead(id) {
  const lead = await leadsRepo.findById(id);
  //if no lead found
  if (!lead) throw new AppError("Lead not found", 404);
  return lead;
}

//pass trough query method
async function listLeads(filters) {
  return leadsRepo.list(filters);
}

// it validates the requested transition and enforce the work root
async function changeStatus(id, nextStatus) {
    //validate the valid status
  if (!VALID_STATUSES.includes(nextStatus)) {
    //bad request bcs the client sends a bad input
    throw new AppError(`Invalid status: ${nextStatus}`, 400);
  }

  //checks for the existance and retrieve current state
  const lead = await getLead(id);
  const allowed = VALID_TRANSITIONS[lead.status];
  //invalid TransitionEvent, (cantstatus FormData, contacted to new)
  if (!allowed.includes(nextStatus)) {
    //409 -> conflict error
    throw new AppError(
      `Cannot move from ${lead.status} to ${nextStatus}`,
      409
    );
  }
  //retrieve the status
  return leadsRepo.updateStatus(id, nextStatus);
}

//to Aggregate the lead statics
async function getStats() {
    //
  const rows = await leadsRepo.statsByStatus();
  //get the total
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  //it returns an object, the total number of rows, then byStatus(an array that takes actual status and number of status)
  return { total, byStatus: rows };
}

//exporting to enable the lead module to be used
module.exports = { getLead, listLeads, changeStatus, getStats };