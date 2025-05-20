const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchCVToAllJobsController");

router.post("/cv-to-all-jobs", matchController.matchCVToAllJobs);

module.exports = router;
