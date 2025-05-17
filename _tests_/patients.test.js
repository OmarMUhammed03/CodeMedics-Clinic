const express = require("express");
const request = require("supertest");

const patientRouter = require("../Backend/controllers/PatientController");

jest.mock("../Backend/services/PatientService");
const patientService = require("../Backend/services/PatientService");

describe("PatientController routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/patients", patientRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /patients - should return all patients", async () => {
    const mockPatients = [{ username: "john_doe" }];
    patientService.getPatients.mockResolvedValue(mockPatients);

    const res = await request(app).get("/patients");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPatients);
    expect(patientService.getPatients).toHaveBeenCalledTimes(1);
  });

  test("GET /patients/:username - should return a single patient", async () => {
    const mockPatient = { username: "john_doe" };
    patientService.getPatient.mockResolvedValue(mockPatient);

    const res = await request(app).get("/patients/john_doe");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPatient);
    expect(patientService.getPatient).toHaveBeenCalledWith("john_doe");
  });

  test("POST /patients - should create a new patient", async () => {
    const newPatient = { username: "jane_doe", name: "Jane Doe" };
    patientService.createPatient.mockResolvedValue(newPatient);

    const res = await request(app).post("/patients").send(newPatient);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(newPatient);
    expect(patientService.createPatient).toHaveBeenCalledWith(newPatient);
  });

  test("PATCH /patients/:username - should update a patient", async () => {
    const updateData = { name: "John Updated" };
    const updatedPatient = { username: "john_doe", ...updateData };
    patientService.updatePatient.mockResolvedValue(updatedPatient);

    const res = await request(app).patch("/patients/john_doe").send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updatedPatient);
    expect(patientService.updatePatient).toHaveBeenCalledWith(
      "john_doe",
      updateData
    );
  });

  test("PATCH /patients/:username/password - should update patient password", async () => {
    const updated = { message: "Password updated" };
    patientService.updatePatientPassword.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/patients/john_doe/password")
      .send({ password: "newpass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updated);
    expect(patientService.updatePatientPassword).toHaveBeenCalledWith(
      "john_doe",
      "newpass123"
    );
  });

  test("GET /patients/:username/appointments - should return appointments", async () => {
    const mockAppointments = [{ id: 1, status: "confirmed" }];
    patientService.getPatientAppointments.mockResolvedValue(mockAppointments);

    const res = await request(app).get(
      "/patients/john_doe/appointments?status=confirmed"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockAppointments);
    expect(patientService.getPatientAppointments).toHaveBeenCalledWith(
      "john_doe",
      "confirmed"
    );
  });
  test("PATCH /patients/:username/appointments/:appointmentId/cancel - should cancel an appointment", async () => {
    const cancelledAppointment = { id: "123", status: "cancelled" };
    patientService.cancelAppointment.mockResolvedValue(cancelledAppointment);

    const res = await request(app).patch(
      "/patients/john_doe/appointments/123/cancel"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(cancelledAppointment);
    expect(patientService.cancelAppointment).toHaveBeenCalledWith(
      "john_doe",
      "123"
    );
  });

  test("PATCH /patients/:username/appointments/:appointmentId - should update an appointment", async () => {
    const updatedAppointment = { id: "123", date: "2025-06-01" };
    patientService.updateAppointment.mockResolvedValue(updatedAppointment);

    const res = await request(app)
      .patch("/patients/john_doe/appointments/123")
      .send({ date: "2025-06-01" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updatedAppointment);
    expect(patientService.updateAppointment).toHaveBeenCalledWith(
      "john_doe",
      "123",
      { date: "2025-06-01" }
    );
  });

  test("GET /patients/:username/health-packages - should return available packages", async () => {
    const mockPackages = [{ id: 1, name: "Basic Health Plan" }];
    patientService.getAvailablePackages.mockResolvedValue(mockPackages);

    const res = await request(app).get("/patients/john_doe/health-packages");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPackages);
    expect(patientService.getAvailablePackages).toHaveBeenCalledWith(
      "john_doe"
    );
  });

  test("DELETE /patients/:username/health-packages/subscription - should unsubscribe package", async () => {
    patientService.unsubscribeHealthPackage.mockResolvedValue();

    const res = await request(app).delete(
      "/patients/john_doe/health-packages/subscription"
    );

    expect(res.statusCode).toBe(204);
    expect(patientService.unsubscribeHealthPackage).toHaveBeenCalledWith(
      "john_doe"
    );
  });

  test("GET /patients/:username/family-members - should return all family members", async () => {
    const members = [{ username: "relative1" }];
    const noAccountMembers = [{ name: "Unregistered Member" }];

    patientService.getFamilyMembers.mockResolvedValue(members);
    patientService.getFamilyMembersWithNoAccount.mockResolvedValue(
      noAccountMembers
    );

    const res = await request(app).get("/patients/john_doe/family-members");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({
      familyMembers: members,
      familyMembersNoAccount: noAccountMembers,
    });
    expect(patientService.getFamilyMembers).toHaveBeenCalledWith("john_doe");
    expect(patientService.getFamilyMembersWithNoAccount).toHaveBeenCalledWith(
      "john_doe"
    );
  });

  test("GET /patients/:username/family-members-no-account - should return family members without account", async () => {
    const noAccountMembers = [{ name: "Relative X" }];
    patientService.getFamilyMembersWithNoAccount.mockResolvedValue(
      noAccountMembers
    );

    const res = await request(app).get(
      "/patients/john_doe/family-members-no-account"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(noAccountMembers);
    expect(patientService.getFamilyMembersWithNoAccount).toHaveBeenCalledWith(
      "john_doe"
    );
  });

  test("POST /patients/:username/family-members - should add a family member", async () => {
    const newMember = { username: "relative1" };
    patientService.addFamilyMember.mockResolvedValue(newMember);

    const res = await request(app)
      .post("/patients/john_doe/family-members")
      .send(newMember);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(newMember);
    expect(patientService.addFamilyMember).toHaveBeenCalledWith(
      "john_doe",
      newMember
    );
  });

  test("POST /patients/:username/family-members-no-account - should add family member without account", async () => {
    const noAccountMember = { name: "Old Uncle" };
    patientService.addFamilyMemberWithNoAccount.mockResolvedValue(
      noAccountMember
    );

    const res = await request(app)
      .post("/patients/john_doe/family-members-no-account")
      .send(noAccountMember);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(noAccountMember);
    expect(patientService.addFamilyMemberWithNoAccount).toHaveBeenCalledWith(
      "john_doe",
      noAccountMember
    );
  });

  test("DELETE /patients/:username/family-members/:familyMemberUsername - should remove a family member", async () => {
    patientService.removeFamilyMember.mockResolvedValue();

    const res = await request(app).delete(
      "/patients/john_doe/family-members/relative1"
    );

    expect(res.statusCode).toBe(204);
    expect(patientService.removeFamilyMember).toHaveBeenCalledWith(
      "john_doe",
      "relative1"
    );
  });

  test("DELETE /patients/:username/family-members-no-account/:familyMemberId - should remove a family member without account", async () => {
    patientService.removeFamilyMemberWithNoAccount.mockResolvedValue();

    const res = await request(app).delete(
      "/patients/john_doe/family-members-no-account/456"
    );

    expect(res.statusCode).toBe(204);
    expect(patientService.removeFamilyMemberWithNoAccount).toHaveBeenCalledWith(
      "john_doe",
      "456"
    );
  });

  test("GET /patients/:username/health-records - should return health records", async () => {
    const mockRecords = [{ id: 1, type: "Lab Result" }];
    patientService.getHealthRecords.mockResolvedValue(mockRecords);

    const res = await request(app).get("/patients/john_doe/health-records");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockRecords);
    expect(patientService.getHealthRecords).toHaveBeenCalledWith("john_doe");
  });

  test("GET /patients/:username/doctors - should return doctors with appointments", async () => {
    const doctors = [{ id: 1, name: "Dr. Smith" }];
    patientService.getDoctorsWithAppointments.mockResolvedValue(doctors);

    const res = await request(app).get("/patients/john_doe/doctors");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(doctors);
    expect(patientService.getDoctorsWithAppointments).toHaveBeenCalledWith(
      "john_doe"
    );
  });
  test("GET /patients/:username/doctors/:doctorUsername - should return a doctor", async () => {
    const doctor = { username: "dr_smith" };
    patientService.getDoctor.mockResolvedValue(doctor);

    const res = await request(app).get("/patients/john_doe/doctors/dr_smith");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(doctor);
    expect(patientService.getDoctor).toHaveBeenCalledWith("dr_smith");
  });

  test("GET /patients/:username/doctors/:doctorUsername/appointments - should return doctor's appointments", async () => {
    const appointments = [{ id: "a1", status: "confirmed" }];
    patientService.getDoctorAppointments.mockResolvedValue(appointments);

    const res = await request(app).get(
      "/patients/john_doe/doctors/dr_smith/appointments?status=confirmed"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(appointments);
    expect(patientService.getDoctorAppointments).toHaveBeenCalledWith(
      "john_doe",
      "dr_smith",
      "confirmed"
    );
  });

  test("POST /patients/:username/payment/appointments/:appointmentId - should process appointment payment", async () => {
    const payment = { status: "paid" };
    patientService.payAppointment.mockResolvedValue(payment);

    const res = await request(app)
      .post("/patients/john_doe/payment/appointments/a1")
      .send({ paymentMethod: "credit_card" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(payment);
    expect(patientService.payAppointment).toHaveBeenCalledWith(
      "john_doe",
      "a1",
      "credit_card"
    );
  });

  test("POST /patients/:username/payment/health-packages/:packageName - should process package payment", async () => {
    const payment = { status: "paid" };
    patientService.payHealthPackage.mockResolvedValue(payment);

    const res = await request(app)
      .post("/patients/john_doe/payment/health-packages/BasicPlan")
      .send({ paymentMethod: "paypal" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(payment);
    expect(patientService.payHealthPackage).toHaveBeenCalledWith(
      "john_doe",
      "BasicPlan",
      "paypal"
    );
  });

  test("GET /patients/:username/prescriptions - should return prescriptions", async () => {
    const prescriptions = [{ id: "p1", medication: "Drug A" }];
    patientService.getPrescriptions.mockResolvedValue(prescriptions);

    const res = await request(app).get("/patients/john_doe/prescriptions");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(prescriptions);
    expect(patientService.getPrescriptions).toHaveBeenCalledWith("john_doe");
  });

  test("POST /patients/:username/prescriptions/download-prescription-pdf - should return a PDF file", async () => {
    const pdfBuffer = Buffer.from("PDF content");
    const prescription = { _id: "p1" };
    patientService.downloadPrescriptionPdf.mockResolvedValue(pdfBuffer);

    const res = await request(app)
      .post("/patients/john_doe/prescriptions/download-prescription-pdf")
      .send({ prescription });

    expect(res.statusCode).toBe(200);
    expect(res.header["content-type"]).toBe("application/pdf");
    expect(res.header["content-disposition"]).toContain("Prescription_p1.pdf");
    expect(patientService.downloadPrescriptionPdf).toHaveBeenCalledWith(
      "john_doe",
      prescription
    );
  });

  test("PATCH /patients/:username/prescriptions/:prescriptionId - should update prescription", async () => {
    const updated = { id: "p1", notes: "Take twice a day" };
    patientService.updatePrescription.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/patients/john_doe/prescriptions/p1")
      .send({ notes: "Take twice a day" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updated);
    expect(patientService.updatePrescription).toHaveBeenCalledWith(
      "john_doe",
      "p1",
      { notes: "Take twice a day" }
    );
  });

  test("GET /patients/:username/notifications - should return notifications", async () => {
    const notifications = [{ id: "n1", message: "Reminder" }];
    patientService.getNotifications.mockResolvedValue(notifications);

    const res = await request(app).get("/patients/john_doe/notifications");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(notifications);
    expect(patientService.getNotifications).toHaveBeenCalledWith("john_doe");
  });

  test("GET /patients/:username/chats - should return chats", async () => {
    const chats = [{ id: "c1", doctor: "dr_smith" }];
    patientService.getPatientChats.mockResolvedValue(chats);

    const res = await request(app).get("/patients/john_doe/chats");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(chats);
    expect(patientService.getPatientChats).toHaveBeenCalledWith("john_doe");
  });

  test("GET /patients/:username/chats/:chatId/messages - should return messages", async () => {
    const messages = [{ id: "m1", content: "Hello" }];
    patientService.getChatMessages.mockResolvedValue(messages);

    const res = await request(app).get("/patients/john_doe/chats/c1/messages");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(messages);
    expect(patientService.getChatMessages).toHaveBeenCalledWith(
      "john_doe",
      "c1"
    );
  });

  test("POST /patients/:username/chats/:chatId/messages - should send a message", async () => {
    const message = { id: "m1", content: "Hello" };
    patientService.sendMessage.mockResolvedValue(message);

    const res = await request(app)
      .post("/patients/john_doe/chats/c1/messages")
      .send({ content: "Hello" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(message);
    expect(patientService.sendMessage).toHaveBeenCalledWith(
      "john_doe",
      "c1",
      "Hello"
    );
  });

  test("DELETE /patients/:username/health-records/:documentId - should delete a document", async () => {
    patientService.removeDocument.mockResolvedValue();

    const res = await request(app).delete(
      "/patients/john_doe/health-records/doc1"
    );

    expect(res.statusCode).toBe(204);
    expect(patientService.removeDocument).toHaveBeenCalledWith(
      "john_doe",
      "doc1"
    );
  });
});
