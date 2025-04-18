const express = require("express");
const router = express.Router();

// ==========================
// Controllers
// ==========================
const LoginController = require("../controllers/Login.js");
const { resetPassword } = require("../controllers/ResetPassword.js");
const { getMe } = require("../controllers/GetMe.js");
const {
  createPaymentIntent,
} = require("../controllers/Payment/CreatePaymentIntent.js");

// ==========================
// Routes
// ==========================
router.get("/getMe", getMe);
router.post("/login", LoginController.login);
router.post("/logout", LoginController.logout);
router.post("/resetPassword", resetPassword);
router.post("/payment/payment-intent", createPaymentIntent);

module.exports = router;
