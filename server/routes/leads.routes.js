// server/routes/leads.routes.js
//router for leads endpoint
//
const express = require("express");

const controller = require("../controllers/leads.controller");
//middleware hundling error
const asyncHandler = require("../middleware/asyncHandler");
const leadsController = require("../controllers/leads.controller");

const router = express.Router();

//endpoints

//hundles the get method for api leads
router.get("/", asyncHandler(controller.list)); //GET/api/leads
//get for specific id
router.get("/stats", asyncHandler(controller.stats));//GET/api/leads/stats
router.get("/:id", asyncHandler(controller.getOne)); //GET/api/leads/abc123
router.patch("/:id/status", asyncHandler(controller.patchStatus));//PATCH/leads/abc/123/status
router.post("/", asyncHandler(controller.create)); // POST /api/leads

module.exports = router;