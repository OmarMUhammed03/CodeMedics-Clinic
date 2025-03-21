const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/Admin/AdminController");
const viewDoctorApplications = require("../controllers/Admin/DoctorsApplications");
const { getPackages } = require("../controllers/Admin/AdminController");
const {
  changePassword,
  acceptRejectDoctorRequest,
} = require("../controllers/Admin/AdminController");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const adminModel = require("../models/Administrator");
const viewDoctors = require("../controllers/Admin/viewDoctors");
const viewPatients = require("../controllers/Admin/viewPatients");
const removePatient = require("../controllers/Admin/removePatient");
const removeDoctor = require("../controllers/Admin/removeDoctor");
const viewAdmins = require("../controllers/Admin/viewAdmins");
const removeAdmin = require("../controllers/Admin/removeAdmin");
const addAdmin = require("../controllers/Admin/addAdmin");
const {
  createAndDownloadContract,
} = require("../controllers/Admin/acceptDoctor");
const Doctor = require("../models/Doctor");
//const JWTAuth = require('../config/JWTAuth.js');

//const isAuth = JWTAuth.isAuth;

// Middleware to check authentication for the routes below
//router.use(isAuth);
//admin

router.get("/", viewAdmins);
router.get("/packages", getPackages);
router.get("/viewDoctorApplications", viewDoctorApplications);
router.get("/doctors", viewDoctors);
router.get("/doctors/applications", AdminController.getDoctorsReg);
router.get("/patients", viewPatients);

router.post("/", addAdmin);
router.patch("/:adminUsername", changePassword);
router.delete("patients/:patientUsername", removePatient);
router.delete("/doctors/:doctorUsername", removeDoctor);
router.delete("/:adminUsername", removeAdmin);

router.post("/createAdmin", (req, res) => {
  AdminController.createAdmin(req, res).then();
});

router.delete("/removeUser", (req, res) => {
  AdminController.removeUser(req, res).then();
});
router.patch("/updateAdmin", (req, res) => {
  AdminController.updateAdmin(req, res).then();
});

router.get("/getAllAdmins", (req, res) => {
  AdminController.getAllAdmins(req, res).then();
});

//doctor

router.patch(
  "/doctors/:doctorUsername/accept",
  AdminController.acceptDoctorRequest
);
router.patch(
  "/doctors/:doctorUsername/reject",
  AdminController.rejectDoctorRequest
);

router.post("/download-contract", async (req, res) => {
  try {
    const doctorUsername = req.body.doctor;
    // Fetch the doctor object based on the username (doctorUsername) from your data source
    const doctor = await Doctor.findOne({ Username: doctorUsername });

    // Create and download the contract based on the doctor object
    const pdfBuffer = await createAndDownloadContract(doctor);

    // Send the PDF buffer as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Contract.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//packages

router.post("/packages", (req, res) => {
  AdminController.addPackage(req, res).then();
});
router.delete("/packages/:packageName", (req, res) => {
  AdminController.removePackage(req, res).then();
});
router.patch("/packages/:packageName", (req, res) => {
  AdminController.updatePackage(req, res).then();
});

module.exports = router;
