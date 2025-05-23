const adminRepo = require("../repositories/AdminRepository");
const patientRepo = require("../repositories/PatientRepository");
const doctorRepo = require("../repositories/DoctorRepository");
const packageRepo = require("../repositories/PackageRepository");

exports.getAdmins = async () => {
  const admins = await adminRepo.getAdmins();
  return admins;
};

exports.getAdmin = async (adminUsername) => {
  await adminRepo.validateAdmin(adminUsername);
  const admin = await adminRepo.getAdmin(adminUsername);
  return admin;
};

exports.createAdmin = async (adminData) => {
  const admin = await adminRepo.createAdmin(adminData);
  return admin;
};

exports.updateAdmin = async (adminUsername, adminData) => {
  await adminRepo.validateAdmin(adminUsername);
  const admin = await adminRepo.updateAdmin(adminUsername, adminData);
  return admin;
};

exports.updatePassword = async (adminUsername, password) => {
  await adminRepo.validateAdmin(adminUsername);
  const admin = await adminRepo.updateAdminPassword(adminUsername, password);
  return admin;
};

exports.deleteAdmin = async (adminUsername) => {
  await adminRepo.validateAdmin(adminUsername);
  const admin = await adminRepo.deleteAdmin(adminUsername);
  return admin;
};

exports.getPackages = async () => {
  const packages = await packageRepo.getPackages();
  return packages;
};

exports.createPackage = async (packageData) => {
  const patientPackage = await packageRepo.createPackage(packageData);
  return patientPackage;
};

exports.updatePackage = async (packageName, packageData) => {
  await packageRepo.validatePackage(packageName);
  const patientPackage = await packageRepo.updatePackage(packageName, packageData);
  return patientPackage;
};

exports.deletePackage = async (packageName) => {
  await packageRepo.validatePackage(packageName);
  const patientPackage = await packageRepo.deletePackage(packageName);
  return patientPackage;
};

exports.getDoctors = async () => {
  const doctors = await doctorRepo.getDoctors();
  return doctors;
};

exports.getDoctorApplications = async () => {
  const applications = await doctorRepo.getDoctorApplications();
  return applications;
};

exports.acceptDoctor = async (doctorUsername) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.updateDoctor(doctorUsername, {
    status: "contract",
  });
  return doctor;
};

exports.updateDoctorApplication = async (doctorUsername, doctorData) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.updateDoctor(doctorUsername, doctorData);
  return doctor;
}

exports.rejectDoctor = async (doctorUsername) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.deleteDoctor(doctorUsername);
  return doctor;
};

exports.downloadContract = async (doctorUsername) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.getDoctor(doctorUsername);
  const pdf = await doctorRepo.generateContract(doctor);
  return pdf;
}

exports.getDoctor = async (doctorUsername) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.getDoctor(doctorUsername);
  return doctor;
};

exports.createDoctor = async (doctorData) => {
  const doctor = await doctorRepo.createDoctor(doctorData);
  return doctor;
};

exports.updateDoctor = async (doctorUsername, doctorData) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.updateDoctor(doctorUsername, doctorData);
  return doctor;
};

exports.deleteDoctor = async (doctorUsername) => {
  await doctorRepo.validateDoctor(doctorUsername);
  const doctor = await doctorRepo.deleteDoctor(doctorUsername);
  return doctor;
};

exports.getPatients = async () => {
  const patients = await patientRepo.getPatients();
  return patients;
};

exports.getPatient = async (patientUsername) => {
  await patientRepo.validatePatient(patientUsername);
  const patient = await patientRepo.getPatient(patientUsername);
  return patient;
};

exports.deletePatient = async (patientUsername) => {
  await patientRepo.validatePatient(patientUsername);
  const patient = await patientRepo.deletePatient(patientUsername);
  return patient;
};
