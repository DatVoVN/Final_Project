const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cvController");
router.post("/analyze", cvController.uploadCV, cvController.analyzeCV);

module.exports = router;
