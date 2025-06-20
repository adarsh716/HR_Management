const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

router.post("/create", candidateController.createCandidate);

router.get("/fetch", candidateController.getAllCandidates);

router.delete("/delete/:id", candidateController.deleteCandidate);

router.get("/download-resume/:candidateId", candidateController.downloadResume);

router.patch("/updatestatus/:id", candidateController.changeCandidateStatus);

module.exports = router;
