 //server/services/leads.service.js
//is the bussness logic layer , it enforce the rule, 


const leadsRepo = require("../repositories/leads.repo");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

//to define states machine transtions
const VALID_TRANSITIONS = {
  new: ["contacted", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["converted", "lost"],
  converted: [],
  lost: [],
};

//
async function getLead(id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  return lead;
}

//
async function listLeads(filters) {
  return leadsRepo.list(filters);
}

async function changeStatus(id, nextStatus) {
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new AppError(`Invalid status: ${nextStatus}`, 400);
  }
  const lead = await getLead(id);
  const allowed = VALID_TRANSITIONS[lead.status];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Cannot move from ${lead.status} to ${nextStatus}`,
      409
    );
  }
  return leadsRepo.updateStatus(id, nextStatus);
}

async function getStats() {
  const rows = await leadsRepo.statsByStatus();
  const total = rows.reduce((sum, r) => sum + r.total, 0);
  return { total, byStatus: rows };
}
//add
async function createLead({ waPhone, name, email, inquiryType }) {
  return leadsRepo.insert({ waPhone, name, email, inquiryType });
}

//authorization function 
async function listForUser(user, filters) {
  console.log("listForUser", user.role, user.id, filters.assignedTo);
  //if user is admin
  if (user.role === "admin") {
    return leadsRepo.list(filters);
  }
  // Agents see their own + (if explicitly asked) unassigned leads
  if (filters.assignedTo === "unassigned") {
    return leadsRepo.list({ ...filters, assignedTo: "unassigned" });
  }
  //otherwise can see their own leads
  return leadsRepo.list({ ...filters, assignedTo: user.id });
}

//
async function getLeadForUser(user, id) {
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);

  if (user.role !== "admin" && lead.assigned_to && lead.assigned_to !== user.id) {
    throw new AppError("Lead not found", 404);
  }
  return lead;
}

//lets the agent assigned the leads by themselves
async function claimLead(user, id) {
  const lead = await leadsRepo.findById(id);
  // if lead not assigned
  if (!lead) throw new AppError("Lead not found", 404);
  //if the user is already assigned
  if (lead.assigned_to) {
    throw new AppError("Lead is already assigned", 409);
  }
  return leadsRepo.assign(id, user.id);
}

//
async function reassignLead(user, id, newOwnerId) {
  //if user is not admin
  if (user.role !== "admin") {
    throw new AppError("Only admins can reassign leads", 403);
  }
  const lead = await leadsRepo.findById(id);
  if (!lead) throw new AppError("Lead not found", 404);
  return leadsRepo.assign(id, newOwnerId); // null means unassign
}

//to validating the status
async function changeStatus(user, id, nextStatus) {
  const lead = await getLeadForUser(user, id); // enforces visibility
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new AppError(`Invalid status: ${nextStatus}`, 400);
  }
  const allowed = VALID_TRANSITIONS[lead.status];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Cannot move from ${lead.status} to ${nextStatus}`, 409);
  }
  return leadsRepo.updateStatus(id, nextStatus);
}

module.exports = { 
  getLead, 
  listLeads, 
  changeStatus, 
  getStats, 
  createLead,
  listForUser,
  getLeadForUser,
  claimLead,
  reassignLead,
  changeStatus,
  //the admin only version
  getStats: async (user) => {
    // Stats are admin-only for now. Agents see their own numbers tomorrow.
    if (user.role !== "admin") {
      throw new AppError("Admins only", 403);
    }
    const rows = await leadsRepo.statsByStatus();
    const total = rows.reduce((sum, r) => sum + r.total, 0);
    return { total, byStatus: rows };
  }, }; //add ceateLead