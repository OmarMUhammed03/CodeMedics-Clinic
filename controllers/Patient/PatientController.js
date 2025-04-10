const Patient = require("../../models/Patient");
const adminModel = require("../../models/Administrator");
const doctorModel = require("../../models/Doctor");
const Package = require("../../models/Package");
const { getUsername } = require("../../config/infoGetter.js");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { validatePatient } = require("../../utils/validator.js");

function getDiscountAmountForHealthPackage(package) {
  if (package == "Free") {
    return 0;
  } else if (package == "Silver") {
    return 0.1;
  } else if (package == "Gold") {
    return 0.15;
  } else if (package == "Platinum") {
    return 0.2;
  } else {
    console.error("Invalid package");
  }
}

function getPackagePrice(packageName) {
  if (packageName == "Silver") {
    return 3600;
  } else if (packageName == "Gold") {
    return 6000;
  } else if (packageName == "Platinum") {
    return 9000;
  } else {
    console.error("Invalid package name");
  }
}

const maxAge = 3 * 24 * 60 * 60;

const createToken = (username) => {
  return jwt.sign({ username }, "supersecret", {
    expiresIn: maxAge,
  });
};

const createPatient = asyncHandler(async (req, res) => {
  const requiredVariables = [
    "firstName",
    "lastName",
    "username",
    "password",
    "email",
    "dateOfBirth",
    "gender",
    "number",
    "emergencyContactName",
    "emergencyContactNumber",
  ];

  for (const variable of requiredVariables) {
    console.log(req.body[variable]);
    if (!req.body[variable]) {
      return res
        .status(400)
        .json({ message: `please fill the missing fields` });
    }
  }
  const {
    firstName,
    lastName,
    username,
    password,
    email,
    dateOfBirth,
    gender,
    number,
    emergencyContactName,
    emergencyContactNumber,
    emergencyContactRelation,
  } = req.body;

  const existingUser =
    (await adminModel.findOne({ username: username })) ||
    (await doctorModel.findOne({ username: username })) ||
    (await Patient.findOne({ username: username }));
  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }

  const existingEmail =
    (await adminModel.findOne({ email: email })) ||
    (await doctorModel.findOne({ email: email })) ||
    (await Patient.findOne({ email: email }));
  if (existingEmail) {
    return res.status(400).json({ message: "Email already taken" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newPatient = new Patient({
    firstName: firstName,
    lastName: lastName,
    username: username,
    password: hashedPassword,
    email: email,
    dateOfBirth: dateOfBirth,
    number: number,
    gender: gender,
    emergencyContact: {
      name: emergencyContactName,
      number: emergencyContactNumber,
      relation: emergencyContactRelation,
    },
  });
  await newPatient.save();
  const token = createToken(username);
  res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  return res.status(201).json("Patient created successfully!");
});

const getPatients = asyncHandler(async (req, res) => {
  try {
    const patients = await Patient.find();
    return res.status(200).json({ data: patients });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

const updateFamilyMembers = async (patient) => {
  for (const member of patient.familyMembers) {
    const familyMember = await Patient.findOne({ _id: member.id });
    if (familyMember) {
      familyMember.healthPackage.discount =
        getDiscountAmountForHealthPackage(membership);
      familyMember.healthPackage.discountEndDate = Date.now();
      familyMember.healthPackage.discountEndDate.setFullYear(
        familyMember.healthPackage.discountEndDate.getFullYear() + 1
      );
      await familyMember.save();
    }
  }
};

const healthPackageSubscription = asyncHandler(async (req, res) => {
  const { patientUsername } = req.params;
  const patient = await validatePatient(patientUsername, res);
  const { packageName } = req.body;
  if (patient.healthPackage.name !== packageName) {
    patient.healthPackage.name = packageName;
    patient.healthPackage.date = Date.now();
    patient.healthPackage.date.setFullYear(
      patient.healthPackage.date.getFullYear() + 1
    );
    patient.healthPackage.status = "Active";
    updateFamilyMembers(patient);
    await patient.save();
    return res
      .status(204)
      .json({ message: "Health Package Subscription Successful!" });
  } else {
    return res
      .status(400)
      .json({ message: "Patient already subscribed to health package!" });
  }
});

const healthPackageUnsubscription = asyncHandler(async (req, res) => {
  const { patientUsername } = req.params;
  const patient = await validatePatient(patientUsername, res);
  if (patient.healthPackage.name !== "Free") {
    patient.healthPackage = {
      name: "Free",
      price: 0,
      discount: 0,
      status: "Inactive",
      date: null,
      discountEndDate: null,
    };
    await patient.save();
    return res
      .status(200)
      .json({ message: "Health Package Unsubscription Successful!" });
  } else {
    return res
      .status(400)
      .json({ message: "Patient already unsubscribed to health package!" });
  }
});

const viewHealthPackage = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({
    Username: await getUsername(req, res),
  });
  if (patient) {
    return res.status(200).json(patient.healthPackage);
  } else {
    return res.status(400).json({ message: "Patient not found!" });
  }
});

const getPatient = asyncHandler(async (req, res) => {
  const patientUsername = req.params.patientUsername;
  console.log(req.params, patientUsername);
  const patient = await Patient.findOne({ username: patientUsername });
  if (patient) {
    return res.status(200).json({ data: patient });
  } else {
    return res.status(400).json({ message: "Patient not found!" });
  }
});

const updatePatient = asyncHandler(async (req, res) => {
  const { patientUsername } = req.params;
  const patient = await Patient.findOne({ username: patientUsername });
  if (patient) {
    const {
      firstName,
      lastName,
      email,
      number,
      dateOfBirth,
      emergencyContact,
      password,
      wallet,
    } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      patient.password = hashedPassword;
    }
    if (firstName) patient.firstName = firstName;
    if (lastName) patient.lastName = lastName;
    if (email) patient.email = email;
    if (number) patient.number = number;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (wallet) patient.wallet = wallet;
    await patient.save();
    return res
      .status(200)
      .json({ message: "Patient details updated successfully!" });
  } else {
    return res.status(400).json({ message: "Patient not found!" });
  }
});

const getAvailablePackages = asyncHandler(async (req, res) => {
  const packages = await Package.find();
  console.log("in the get packages");
  if (packages) {
    return res.status(200).json({ data: packages });
  } else {
    return res.status(400).json({ message: "packages model is empty!" });
  }
});

const getPackage = asyncHandler(async (req, res) => {
  const { packageName } = req.query;
  const package = await Package.findOne({ Name: packageName });
  if (package) {
    return res.status(200).json(package);
  } else {
    return res.status(400).json({ message: "package not found!" });
  }
});

const payWithWalletPackage = async (req, res) => {
  try {
    const Username = await getUsername(req, res);
    const { membership } = req.body;
    const price = getPackagePrice(membership);
    const patient = await Patient.findOne({ Username });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    if (patient.Wallet < price) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    patient.Wallet -= price;
    await patient.save();

    res.status(200).json({ message: "Payment Succeeded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  payWithWalletPackage,
  getPackage,
  getAvailablePackages,
  updatePatient,
  getPatient,
  createPatient,
  healthPackageSubscription,
  healthPackageUnsubscription,
  viewHealthPackage,
  getPatients,
};
