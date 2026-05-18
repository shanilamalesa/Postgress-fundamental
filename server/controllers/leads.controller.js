// server/controllers/leads.controller.js


//contollers->it receive http request, extract request data, to call businesss logic in the service layer, to send http request
//require-> node js module syntax, loads a file, and exacute once

//without services , talk to the services directly
//with services-> for clean architecture
const leadsService = require("../services/leads.service");

//defining Assychronous express hundler
//using asnyc func bcs databe are Assychronous
async function list(req, res) {
    //req.query-> object passed to service
  const { status, search, limit, offset } = req.query;
  const leads = await leadsService.listLeads({
    status,
    search,
    //if limit===10, else limit undefined
    //passint-> bcs query params are in string format
    limit: limit ? parseInt(limit, 10) : undefined,
    
    offset: offset ? parseInt(offset, 10) : undefined,
  });
  //wrapping the leads and passing in json(wrapping in curly baces(to maintain consinstency))
  res.json({ leads });
}

//hundle fetching a single lead
async function getOne(req, res) {
  const lead = await leadsService.getLead(req.params.id);
  res.json({ lead }); //app.get("lead/:id", getOne)
}

//hundling updating lead status
async function patchStatus(req, res) {
    //usingpatch-> partial upadate->modify part of the response     |request body
  const lead = await leadsService.changeStatus(req.params.id, req.body.status);
  res.json({ lead });
}

//fetch the stats data
async function stats(req, res) {
    //returns an object(an array of total, new leade, qualified lead)
  const data = await leadsService.getStats();
  res.json(data);
}

async function create(req, res) {
  const { waPhone, name, email, inquiryType } = req.body;
  const lead = await leadsService.createLead({ waPhone, name, email, inquiryType });
  res.status(201).json({ lead });
}

//export function to be used somewhere 
module.exports = { list, getOne, patchStatus, stats, create };
