// server/routes/ussd.routes.js

//importing the express framework, for routing the milldware, 
const express = require("express");
//controller for hundling the business logic
const ussdController = require("../controllers/ussd.controller");

//importing the router
const router = express.Router();
//router.post-when AT sends a POST request to /ussd
// express.urlencoded({ extended: false })--the milldware converts that form data not json like req.body.text, req.body.phoneNumber
//ussdController.handle--this fn runs when the request comes in
router.post("/", express.urlencoded({ extended: false }), ussdController.handle);


// So the whole line means:

//"When Africa's Talking sends a POST request to /ussd, first convert the form data, then run the handle function"

module.exports = router;