const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const patientController = require("../controllers/Patient/PatientController");
const {
  getDoctor,
  getDoctors,
} = require("../controllers/Patient/getDoctor.js");
const {
  addFamilyMember,
  viewFamilyMembers,
  removeFamilyMember,
  addFamilyMemberNoAccount,
  removeFamilyMemberNoAccount,
} = require("../controllers/Patient/FamilyMembersController");
const {
  uploadDocument,
  addDocument,
  removeDocument,
} = require("../controllers/Patient/MedicalHistory");
const { getMessages, sendMessage } = require("../controllers/Chat/Messages");
const {
  getPatientAppointments,
} = require("../controllers/Patient/Appointment/getPatientAppointments.js");
const {
  bookAppointment,
} = require("../controllers/Patient/Appointment/bookAppointment.js");
const {
  CancelAppointment,
} = require("../controllers/Patient/CancelAppointment");
const {
  getAvailableAppointments,
} = require("../controllers/Patient/viewAvailableAppointments");
const {
  getPatientMessages,
} = require("../controllers/Patient/getPatientMessages");

const {
  getPrescriptions,
  addPrescription,
  fillPrescription,
  downloadPrescription,
} = require("../controllers/Patient/PrescriptionList");
const app = require("../app.js");
const {
  filterAppointmentsPatient,
} = require("../controllers/Patient/filterAppointmentsPatient");

const { payAppointment } = require("../controllers/Payment/payAppointment");
const { payHealthPackage } = require("../controllers/Payment/payHealthPackage");
const {
  getAppointmentAmount,
} = require("../controllers/Patient/Appointment/getAppointmentAmount.js");
const {
  getPatientDoctorAppointments,
} = require("../controllers/Patient/getPatientDoctorAppointments.js");
const {
  viewHealthRecords,
} = require("../controllers/Patient/viewHealthRecords");

const {
  updateAppointment,
} = require("../controllers/Patient/updateAppointment");
const {
  getAllFamilyAppointments,
} = require("../controllers/Patient/getAllFamilyAppointments");
const {
  getDoctorsAndAppointments,
} = require("../controllers/Doctor/GetDoctors.js");
const { getPatientChats } = require("../controllers/Chat/PatientChats.js");

function verifyToken(req, res, next) {
  const token = req.headers["token"];
  try {
    const model = jwt.verify(token, process.env.SECRET_KEY);
    res.locals.token = model;
    next();
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
}

// GET Requests

router.get("/", patientController.getPatients);
router.get("/packages", patientController.getAvailablePackages);
router.get("/:patientUsername", patientController.getPatient);
router.get("/:patientUsername/appointments", getPatientAppointments);
router.get("/:patientUsername/messages", getPatientMessages);
router.get(
  "/doctors/:doctorUsername/appointments",
  getPatientDoctorAppointments
);
router.get("/:patientUsername/doctors", getDoctorsAndAppointments);
router.get("/doctors/:doctorUsername", getDoctor);
router.get("/:patientUsername/family-members", viewFamilyMembers);
router.get("/:patientUsername/prescriptions", getPrescriptions);
router.get(
  "/:patientUsername/family-members/appointments",
  getAllFamilyAppointments
);
router.get("/:patientUsername/health-records", viewHealthRecords);
router.get("/:patientUsername/chats", getPatientChats);
router.get("/chats/:chatId/messages", getMessages);

// POST Requests

router.post("/chats/:chatId/messages", sendMessage);
router.patch("/:patientUsername", patientController.updatePatient);
router.post("/", patientController.createPatient);
router.patch(
  "/:patientUsername/prescriptions/:prescriptionId",
  fillPrescription
);
router.patch("/:patientUsername/appointments/:appointmentId", bookAppointment);
router.patch("/appointments/:appointmentId", updateAppointment);
router.post(
  "/:patientUsername/payment/appointments/:appointmentId",
  payAppointment
);
router.post(
  "/:patientUsername/payment/health-packages/:packageName",
  payHealthPackage
);
router.post(
  "/:patientUsername/health-packages/subscription",
  patientController.healthPackageSubscription
);
router.post("/:patientUsername/family-members", addFamilyMember);
router.post(
  "/:patientUsername/family-members-no-account",
  addFamilyMemberNoAccount
);
router.post("/:patientUsername/prescriptions", addPrescription);
router.patch("/appointments/:appointmentId/cancel", CancelAppointment);
router.post("/:patientUsername/medical-history", uploadDocument, addDocument);

// DELETE Requests

router.delete(
  "/:patientUsername/health-packages/subscription",
  patientController.healthPackageUnsubscription
);
router.delete("/:patientUsername/medical-history/:documentId", removeDocument);
router.delete(
  "/:patientUsername/family-members/:familyMemberUsername",
  removeFamilyMember
);
router.delete(
  "/:patientUsername/family-members-no-account/:familyMemberId",
  removeFamilyMemberNoAccount
);

/*
 general, to be moved
*/

router.get("/appointments/:appointmentId/amount", getAppointmentAmount);
router.get("/appointments", getAvailableAppointments);
router.get("/packages/package-name", patientController.getPackage);
router.get("/prescriptions", getPrescriptions);

router.post("/download-prescription-pdf", downloadPrescription);

module.exports = router;
