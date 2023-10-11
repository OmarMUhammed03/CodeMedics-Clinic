const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const patientController = require('../controllers/Patient/PatientController');
const {addFamilyMember, viewFamilyMembers} = require('../controllers/Patient/FamilyMembersController');

const {
    getPrescriptions,
    getPrescriptionsByDate,
    getPrescriptionsByDoctor,
    getPrescriptionsByStatus,
    filterPrescriptions
} = require('../controllers/Patient/PrescriptionList');
const app = require('../app.js');
const {filterAppointmentsPatient} = require('../controllers/Patient/filterAppointmentsPatient');
const {createPatient, viewPatientRegister} = require("../controllers/Patient/PatientController");

function verifyToken(req, res, next) {
    const token = req.headers['token'];
    try {
        const model = jwt.verify(token, process.env.SECRET_KEY);
        res.locals.token = model;
        next();
    } catch (e) {
        res.status(401).json({message: e.message});
    }
}

router.post('/register', createPatient);
router.get('/register', viewPatientRegister);
// app.use(verifyToken);

router.post('/family-members', addFamilyMember);
router.get('/family-members', viewFamilyMembers);
//router.get('/prescriptions', getPrescriptions);
//router.get('/prescriptions/date', getPrescriptionsByDate);
//router.get('/prescriptions/doctor', getPrescriptionsByDoctor);
//router.get('/prescriptions/status', getPrescriptionsByStatus);
router.get('/prescriptions/filter', filterPrescriptions);
router.get('/viewappointments', filterAppointmentsPatient);

module.exports = router;