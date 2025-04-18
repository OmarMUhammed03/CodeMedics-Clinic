const bcrypt = require("bcryptjs");
const Patient = require("../../models/Patient");
const Chat = require("../../models/Chat");
const Message = require("../../models/Message");

exports.validatePatient = async (patientUsername) => {
  const patient = await this.getPatient(patientUsername);
  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }
  return patient;
};

exports.getPatients = async () => {
  const patients = await Patient.find({});
  return patients;
};

exports.getPatient = async (patientUsername) => {
  const patient = await Patient.findOne({ username: patientUsername });
  return patient;
};

exports.createPatient = async (patientData) => {
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
  } = patientData;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const patient = new Patient({
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
  await patient.save();

  return patient;
};

exports.updatePatient = async (patientUsername, patientData) => {
  const {
    firstName,
    lastName,
    username,
    email,
    dateOfBirth,
    gender,
    number,
    emergencyContact
  } = patientData;

  console.log("patientData", patientData);

  const updatedPatient = await Patient.findOneAndUpdate(
    { username: patientUsername },
    {
      $set: {
        firstName,
        lastName,
        username,
        email,
        dateOfBirth,
        number,
        gender,
        emergencyContact
      },
    },
    { new: true }
  );

  return updatedPatient;
};

exports.updatePatientPassword = async (patientUsername, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const updatedPatient = await Patient.findOneAndUpdate(
    { username: patientUsername },
    { $set: { password: hashedPassword } },
    { new: true }
  );

  return updatedPatient;
};

exports.subscribeHealthPackage = async (patientUsername, package) => {
  const patient = await Patient.findOneAndUpdate(
    { username: patientUsername },
    { $set: { healthPackage: package } },
    { new: true }
  );
  return patient;
};

exports.unsubscribeHealthPackage = async (patientUsername) => {
  const patient = await Patient.findOneAndUpdate(
    { username: patientUsername },
    { healthPackage: FREE_PACKAGE },
    { new: true }
  );
  return patient;
};

exports.getFamilyMembers = async (patientUsername) => {
  const patient = await Patient.findOne({ username: patientUsername });
  return patient.familyMembers;
};

exports.getFamilyMembersWithNoAccount = async (patientUsername) => {
  const patient = await Patient.find({ username: patientUsername });
  return patient.familyMembersNoAccount;
};

exports.addFamilyMember = async (patientUsername, familyMemberUsername) => {
  const patient = await Patient.find({ username: patientUsername });
  const familyMember = await Patient.find({ username: familyMemberUsername });
  patient.familyMembers.push(familyMemberUsername);
  familyMember.linked = patient._id;
  await patient.save();
  await familyMember.save();
  return familyMember;
};

exports.removeFamilyMember = async (patientUsername, familyMemberUsername) => {
  const patient = await Patient.find({ username: patientUsername });
  const familyMember = await Patient.find({ username: familyMemberUsername });
  patient.familyMembers = patient.familyMembers.filter(
    (member) => member.username !== familyMemberUsername
  );
  familyMember.linked = null;
  await patient.save();
  await familyMember.save();
  return familyMember;
};

exports.addFamilyMemberWithNoAccount = async (
  patientUsername,
  familyMemberData
) => {
  const patient = await Patient.find({ username: patientUsername });
  patient.familyMembersNoAccount.push(familyMemberData);
  await patient.save();
  return familyMemberData;
};

exports.removeFamilyMemberWithNoAccount = async (
  patientUsername,
  familyMemberId
) => {
  const patient = await Patient.find({ username: patientUsername });
  patient.familyMembersNoAccount = patient.familyMembersNoAccount.filter(
    (member) => member._id.toString() !== familyMemberId
  );
  await patient.save();
  return familyMemberId;
};

exports.getHealthRecords = async (patientUsername) => {
  const patient = await Patient.find({ username: patientUsername });
  return patient.healthRecords;
};

exports.addHealthRecord = async (patientUsername, healthRecord) => {
  const patient = await Patient.find({ username: patientUsername });
  patient.healthRecords.push(healthRecord);
  await patient.save();
  return healthRecord;
};

exports.removeHealthRecord = async (patientUsername, healthRecordId) => {
  const patient = await Patient.find({ username: patientUsername });
  patient.healthRecords = patient.healthRecords.filter(
    (record) => record._id.toString() !== healthRecordId
  );
  await patient.save();
  return healthRecordId;
};

exports.getNotifications = async (patientUsername) => {
  const patient = await Patient.find({ username: patientUsername });
  return patient.messages;
};

exports.getChatMessages = async (chatId) => {
  const messages = await Message.find({ chat: chatId }).sort({
    createdAt: 1,
  });
  return messages;
};

exports.sendMessage = async (chatId, sender, content) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new Error("Chat not found");
    error.statusCode = 404;
    throw error;
  }
  const newMessage = new Message({
    chat: chatId,
    sender,
    content,
  });
  await newMessage.save();
  chat.latestMessage = newMessage._id;
  await chat.save();
  return newMessage;
};

exports.getLatestMessage = async (chatId) => {
  const latestMessage = await Message.findOne({ chat: chatId }).sort({
    createdAt: -1,
  });
  return latestMessage;
};

exports.getPharmacyChat = async (patientUsername) => {
  const pharmacyChat = await Chat.findOne({
    users: [patientUsername, "admin"],
  });
  if (!pharmacyChat) {
    const newChat = new Chat({
      users: [patientUsername, "admin"],
    });
    await newChat.save();
    return { pharmacy: true, chat: newChat, latestMessage: null };
  }
  const latestMessage = await this.getLatestMessage(pharmacyChat._id);
  return { pharmacy: true, chat: pharmacyChat, latestMessage };
};

exports.getChat = async (patientUsername, doctorUsername) => {
  const chat = await Chat.findOne({
    users: [patientUsername, doctorUsername],
  });
  return chat;
};

exports.createChat = async (patientUsername, doctorUsername) => {
  const chat = new Chat({
    users: [patientUsername, doctorUsername],
  });
  await chat.save();
  return chat;
};
