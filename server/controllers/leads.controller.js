// // server/controllers/leads.controller.js


// //contollers->it receive http request, extract request data, to call businesss logic in the service layer, to send http request
// //require-> node js module syntax, loads a file, and exacute once

// //without services , talk to the services directly
// //with services-> for clean architecture
// const leadsService = require("../services/leads.service");

// //defining Assychronous express hundler
// //using asnyc func bcs databe are Assychronous
// async function list(req, res) {
//     //req.query-> object passed to service
//   const { status, search, limit, offset } = req.query;
//   const leads = await leadsService.listLeads({
//     status,
//     search,
//     //if limit===10, else limit undefined
//     //passint-> bcs query params are in string format
//     limit: limit ? parseInt(limit, 10) : undefined,
    
//     offset: offset ? parseInt(offset, 10) : undefined,
//   });
//   //wrapping the leads and passing in json(wrapping in curly baces(to maintain consinstency))
//   res.json({ leads });
// }

// //hundle fetching a single lead
// async function getOne(req, res) {
//   const lead = await leadsService.getLead(req.params.id);
//   res.json({ lead }); //app.get("lead/:id", getOne)
// }

// //hundling updating lead status
// async function patchStatus(req, res) {
//     //usingpatch-> partial upadate->modify part of the response     |request body
//   const lead = await leadsService.changeStatus(req.params.id, req.body.status);
//   res.json({ lead });
// }

// //fetch the stats data
// async function stats(req, res) {
//     //returns an object(an array of total, new leade, qualified lead)
//   const data = await leadsService.getStats();
//   res.json(data);
// }

// async function create(req, res) {
//   const { waPhone, name, email, inquiryType } = req.body;
//   const lead = await leadsService.createLead({ waPhone, name, email, inquiryType });
//   res.status(201).json({ lead });
// }

// //export function to be used somewhere 
// module.exports = { list, getOne, patchStatus, stats, create };



//is the ci=ontroller layer
//imported the leads service
const leadsService = require("../services/leads.service");

//hundles the get leads
async function list(req, res) {
  console.log("filters:", req.query);
  // req.user-->injected by the auth 
  const leads = await leadsService.listForUser(req.user, {
    status: req.query.status,
    search: req.query.search,
    assignedTo: req.query.assignedTo,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined,
  });
  res.json({ leads });
}

async function getOne(req, res) {
  const lead = await leadsService.getLeadForUser(req.user, req.params.id);
  res.json({ lead });
}

async function patchStatus(req, res) {
  const lead = await leadsService.changeStatus(req.user, req.params.id, req.body.status);
  res.json({ lead });
}

//hundles the endpoint that looks like //POST leads/:id/claim
async function claim(req, res) {
  console.log("CLAIM HIT", req.params.id, req.user);
  const lead = await leadsService.claimLead(req.user, req.params.id);
  res.json({ lead });
}

//hundles PATCH/leads/:id/reassign
async function reassign(req, res) {
  console.log("REASSIGN HIT", req.params.id, req.body);
  const lead = await leadsService.reassignLead(req.user, req.params.id, req.body.assignedTo);
  res.json({ lead });
}

//hundles check for the admin pammission
async function stats(req, res) {
  const data = await leadsService.getStats(req.user);
  res.json(data);
}

async function create(req, res) {
  const { waPhone, name, email, inquiryType } = req.body;
  const lead = await leadsService.createLead({ waPhone, name, email, inquiryType });
  res.status(201).json({ lead });
}

module.exports = { list, getOne, patchStatus, claim, reassign, stats, create };