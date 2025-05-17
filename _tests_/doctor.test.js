const express = require("express");
const request = require("supertest");

const doctorRouter = require("../Backend/controllers/DoctorController");

jest.mock("../Backend/services/DoctorService");
const doctorService = require("../Backend/services/DoctorService");

describe("DoctorController routes", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/doctors", doctorRouter);
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDoctor = { username: "drsmith", name: "Dr. Smith" };
  const username = "drsmith";

  test("GET /doctors - should return all doctors", async () => {
    doctorService.getDoctors.mockResolvedValue([mockDoctor]);

    const res = await request(app).get("/doctors");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([mockDoctor]);
    expect(doctorService.getDoctors).toHaveBeenCalled();
  });

  test("GET /doctors/:username - should return a doctor", async () => {
    doctorService.getDoctor.mockResolvedValue(mockDoctor);

    const res = await request(app).get("/doctors/drsmith");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockDoctor);
    expect(doctorService.getDoctor).toHaveBeenCalledWith("drsmith");
  });

  test("PATCH /doctors/:username - should update a doctor", async () => {
    const updatedDoctor = { ...mockDoctor, name: "Dr. John Smith" };
    doctorService.updateDoctor.mockResolvedValue(updatedDoctor);

    const res = await request(app)
      .patch("/doctors/drsmith")
      .send({ name: "Dr. John Smith" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updatedDoctor);
    expect(doctorService.updateDoctor).toHaveBeenCalledWith("drsmith", {
      name: "Dr. John Smith",
    });
  });

  test("PATCH /doctors/:username/password - should update password", async () => {
    doctorService.updateDoctorPassword.mockResolvedValue(mockDoctor);

    const res = await request(app)
      .patch("/doctors/drsmith/password")
      .send({ password: "newPass123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockDoctor);
    expect(doctorService.updateDoctorPassword).toHaveBeenCalledWith(
      "drsmith",
      "newPass123"
    );
  });

  test("GET /doctors/:username/patients - should return patients", async () => {
    const patients = [{ username: "patient1" }];
    doctorService.getPatients.mockResolvedValue(patients);

    const res = await request(app).get("/doctors/drsmith/patients");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(patients);
    expect(doctorService.getPatients).toHaveBeenCalledWith("drsmith");
  });

  test("GET /doctors/:username/appointments - should return appointments", async () => {
    const appointments = [{ id: "a1", status: "scheduled" }];
    doctorService.getAppointments.mockResolvedValue(appointments);

    const res = await request(app).get("/doctors/drsmith/appointments");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(appointments);
    expect(doctorService.getAppointments).toHaveBeenCalledWith(
      "drsmith",
      undefined
    );
  });

  test("POST /doctors/:username/appointments - should add appointment", async () => {
    const appointment = { id: "a2" };
    doctorService.addAppointment.mockResolvedValue(appointment);

    const res = await request(app)
      .post("/doctors/drsmith/appointments")
      .send({ patientUsername: "patient1" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(appointment);
    expect(doctorService.addAppointment).toHaveBeenCalledWith("drsmith", {
      patientUsername: "patient1",
    });
  });

  test("PATCH /doctors/:username/appointments/:appointmentId - should update appointment", async () => {
    const updated = { id: "a1", status: "rescheduled" };
    doctorService.updateAppointment.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/doctors/drsmith/appointments/a1")
      .send({ status: "rescheduled" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(updated);
    expect(doctorService.updateAppointment).toHaveBeenCalledWith(
      "drsmith",
      "a1",
      { status: "rescheduled" }
    );
  });

  test("PATCH /doctors/:username/appointments/:appointmentId/cancel", async () => {
    const cancelled = { id: "a1", status: "cancelled" };
    doctorService.cancelAppointment.mockResolvedValue(cancelled);

    const res = await request(app).patch(
      "/doctors/drsmith/appointments/a1/cancel"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(cancelled);
    expect(doctorService.cancelAppointment).toHaveBeenCalledWith(
      "drsmith",
      "a1"
    );
  });

  test("PATCH /doctors/:username/appointments/:appointmentId/complete", async () => {
    const completed = { id: "a1", status: "completed" };
    doctorService.completeAppointment.mockResolvedValue(completed);

    const res = await request(app).patch(
      "/doctors/drsmith/appointments/a1/complete"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(completed);
    expect(doctorService.completeAppointment).toHaveBeenCalledWith(
      "drsmith",
      "a1"
    );
  });

  test("DELETE /doctors/:username/appointments/:appointmentId - should delete appointment", async () => {
    const mockResponse = { success: true };
    doctorService.deleteAppointment.mockResolvedValue(mockResponse);

    const res = await request(app).delete(
      `/doctors/${username}/appointments/appt123`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockResponse);
    expect(doctorService.deleteAppointment).toHaveBeenCalledWith(
      username,
      "appt123"
    );
  });

  test("GET /doctors/:username/prescriptions - should get prescriptions", async () => {
    const mockPrescriptions = [{ id: "p1" }];
    doctorService.getPrescriptions.mockResolvedValue(mockPrescriptions);

    const res = await request(app).get(`/doctors/${username}/prescriptions`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPrescriptions);
    expect(doctorService.getPrescriptions).toHaveBeenCalledWith(username);
  });

  test("POST /doctors/:username/prescriptions - should add prescription", async () => {
    const prescriptionData = { patient: "john" };
    const mockPrescription = { id: "presc123", ...prescriptionData };
    doctorService.addPrescription.mockResolvedValue(mockPrescription);

    const res = await request(app)
      .post(`/doctors/${username}/prescriptions`)
      .send(prescriptionData);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(mockPrescription);
    expect(doctorService.addPrescription).toHaveBeenCalledWith(
      username,
      prescriptionData
    );
  });

  test("POST /doctors/:username/prescriptions/:prescriptionId/drugs - should add drug", async () => {
    const mockPrescription = { id: "presc123" };
    const drugData = { name: "Aspirin" };
    doctorService.addMedicineToPrescription.mockResolvedValue(mockPrescription);

    const res = await request(app)
      .post(`/doctors/${username}/prescriptions/presc123/drugs`)
      .send(drugData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPrescription);
    expect(doctorService.addMedicineToPrescription).toHaveBeenCalledWith(
      username,
      "presc123",
      drugData
    );
  });

  test("DELETE /doctors/:username/prescriptions/:prescriptionId/drugs/:drugName - should remove drug", async () => {
    const mockPrescription = { id: "presc123", removed: true };
    doctorService.removeMedicineFromPrescription.mockResolvedValue(
      mockPrescription
    );

    const res = await request(app).delete(
      `/doctors/${username}/prescriptions/presc123/drugs/Aspirin`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPrescription);
    expect(doctorService.removeMedicineFromPrescription).toHaveBeenCalledWith(
      username,
      "presc123",
      "Aspirin"
    );
  });

  test("PATCH /doctors/:username/prescriptions/:prescriptionId - should update prescription", async () => {
    const updateData = { notes: "Take with food" };
    const mockPrescription = { id: "presc123", ...updateData };
    doctorService.updatePrescription.mockResolvedValue(mockPrescription);

    const res = await request(app)
      .patch(`/doctors/${username}/prescriptions/presc123`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockPrescription);
    expect(doctorService.updatePrescription).toHaveBeenCalledWith(
      username,
      "presc123",
      updateData
    );
  });

  test("POST /doctors/:username/prescriptions/:prescriptionId/download - should download prescription", async () => {
    const mockFile = { file: "file.pdf" };
    doctorService.downloadPrescription.mockResolvedValue(mockFile);

    const res = await request(app).post(
      `/doctors/${username}/prescriptions/presc123/download`
    );

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(mockFile);
    expect(doctorService.downloadPrescription).toHaveBeenCalledWith(
      username,
      "presc123"
    );
  });

  test("GET /doctors/:username/patients/:patientUsername/health-records - should get health records", async () => {
    const mockRecords = [{ id: "hr1" }];
    doctorService.getHealthRecords.mockResolvedValue(mockRecords);

    const res = await request(app).get(
      `/doctors/${username}/patients/johndoe/health-records`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockRecords);
    expect(doctorService.getHealthRecords).toHaveBeenCalledWith(
      username,
      "johndoe"
    );
  });

  test("POST /doctors/:username/patients/:patientUsername/health-records - should add health record", async () => {
    const mockRecord = { id: "hr1", description: "X-ray" };
    doctorService.addHealthRecord.mockResolvedValue(mockRecord);

    const res = await request(app)
      .post(`/doctors/${username}/patients/johndoe/health-records`)
      .attach("document", Buffer.from("test content"), "xray.pdf")
      .field("description", "X-ray");

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(mockRecord);
    expect(doctorService.addHealthRecord).toHaveBeenCalled();
  });

  test("GET /doctors/:username/chats - should get chats", async () => {
    const mockChats = ["chat1"];
    doctorService.getChats.mockResolvedValue(mockChats);

    const res = await request(app).get(`/doctors/${username}/chats`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockChats);
    expect(doctorService.getChats).toHaveBeenCalledWith(username);
  });

  test("GET /doctors/:username/chats/:chatId/messages - should get chat messages", async () => {
    const mockMessages = ["message1"];
    doctorService.getChatMessages.mockResolvedValue(mockMessages);

    const res = await request(app).get(
      `/doctors/${username}/chats/chat123/messages`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockMessages);
    expect(doctorService.getChatMessages).toHaveBeenCalledWith(
      username,
      "chat123"
    );
  });

  test("POST /doctors/:username/chats/:chatId/messages - should send message", async () => {
    const content = "Hello!";
    const mockMessage = { content };
    doctorService.sendMessage.mockResolvedValue(mockMessage);

    const res = await request(app)
      .post(`/doctors/${username}/chats/chat123/messages`)
      .send({ content });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toEqual(mockMessage);
    expect(doctorService.sendMessage).toHaveBeenCalledWith(
      username,
      "chat123",
      content
    );
  });

  test("GET /doctors/:username/notifications - should get notifications", async () => {
    const mockNotifications = ["notif1"];
    doctorService.getNotifications.mockResolvedValue(mockNotifications);

    const res = await request(app).get(`/doctors/${username}/notifications`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockNotifications);
    expect(doctorService.getNotifications).toHaveBeenCalledWith(username);
  });
});
