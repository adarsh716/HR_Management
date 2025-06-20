const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/api/auth/check-session", auth, authController.checkSession);

module.exports = router;
