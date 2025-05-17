const express = require("express");
const request = require("supertest");

const adminRouter = require("../Backend/controllers/AdminController");

jest.mock("../Backend/services/AdminService");
const adminService = require("../Backend/services/AdminService");

describe(" AdminController routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/admins", adminRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET  /admins              → 200 + { data: [...] }", async () => {
    adminService.getAdmins.mockResolvedValue([{ username: "alice" }]);

    const res = await request(app).get("/admins");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [{ username: "alice" }] });
    expect(adminService.getAdmins).toHaveBeenCalled();
  });

  test("GET  /admins/packages     → 200 + { data: [...] }", async () => {
    adminService.getPackages.mockResolvedValue([{ name: "Basic" }]);

    const res = await request(app).get("/admins/packages");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [{ name: "Basic" }] });
  });

  test("POST /admins/packages     → 201 + { data: {…} }", async () => {
    const payload = { name: "Pro", price: 99 };
    adminService.createPackage.mockResolvedValue(payload);

    const res = await request(app).post("/admins/packages").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: payload });
    expect(adminService.createPackage).toHaveBeenCalledWith(payload);
  });

  test("PATCH /admins/packages/:name → 200 + { data: {…} }", async () => {
    const updated = { name: "Basic", price: 49 };
    adminService.updatePackage.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/admins/packages/Basic")
      .send({ price: 49 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });
    expect(adminService.updatePackage).toHaveBeenCalledWith("Basic", {
      price: 49,
    });
  });

  test("DELETE /admins/packages/:name → 204", async () => {
    adminService.deletePackage.mockResolvedValue();

    const res = await request(app).delete("/admins/packages/Basic");

    expect(res.status).toBe(204);
    expect(adminService.deletePackage).toHaveBeenCalledWith("Basic");
  });

  test("GET  /admins/:username    → 200 + { data: {…} }", async () => {
    const a = { username: "bob" };
    adminService.getAdmin.mockResolvedValue(a);

    const res = await request(app).get("/admins/bob");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: a });
  });

  test("PATCH /admins/:username   → 200 + { data: {…} }", async () => {
    const updated = { username: "bob", role: "super" };
    adminService.updateAdmin.mockResolvedValue(updated);

    const res = await request(app).patch("/admins/bob").send({ role: "super" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });
  });

  test("PATCH /admins/:username/password → 200 + { data: {…} }", async () => {
    const out = { username: "bob" };
    adminService.updatePassword.mockResolvedValue(out);

    const res = await request(app)
      .patch("/admins/bob/password")
      .send({ password: "newpass" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: out });
  });

  test("DELETE /admins/:username → 204", async () => {
    adminService.deleteAdmin.mockResolvedValue();

    const res = await request(app).delete("/admins/bob");

    expect(res.status).toBe(204);
  });

  test("GET  /admins/doctors     → 200 + { data: [...] }", async () => {
    adminService.getDoctors.mockResolvedValue([{ username: "charlie" }]);

    const res = await request(app).get("/admins/doctors");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [{ username: "charlie" }] });
  });

  test("GET  /admins/doctors/applications → 200 + { data: [...] }", async () => {
    adminService.getDoctorApplications.mockResolvedValue([
      { username: "charlie" },
    ]);
    const res = await request(app).get("/admins/doctors/applications");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [{ username: "charlie" }] });
  });

  test("DELETE /admins/doctors/:username → 204", async () => {
    adminService.deleteDoctor.mockResolvedValue();

    const res = await request(app).delete("/admins/doctors/charlie");

    expect(res.status).toBe(204);
  });

  test("GET  /admins/patients     → 200 + { data: [...] }", async () => {
    adminService.getPatients.mockResolvedValue([{ username: "alice" }]);
    const res = await request(app).get("/admins/patients");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [{ username: "alice" }] });
  });

  test("DELETE /admins/patients/:username → 204", async () => {
    adminService.deletePatient.mockResolvedValue();

    const res = await request(app).delete("/admins/patients/alice");

    expect(res.status).toBe(204);
  });

});
