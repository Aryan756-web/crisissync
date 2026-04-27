console.log("✅ emergencyRoutes loaded");
const express = require("express");
const router = express.Router();

const { createEmergency } = require("../controllers/emergencyController");
const authMiddleware = require("../middleware/authMiddleware");
const { getAllEmergencies } = require("../controllers/emergencyController");
const { resolveEmergency } = require("../controllers/emergencyController");

router.get("/", getAllEmergencies);

router.post("/", authMiddleware, createEmergency);

router.patch("/:id/resolve", authMiddleware, resolveEmergency);

module.exports = router;