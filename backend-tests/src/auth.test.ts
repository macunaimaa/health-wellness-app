import request from "supertest";
import jwt from "jsonwebtoken";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

describe("Auth Endpoints", () => {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const validEmail = `auth-test-${uniqueSuffix}@test.com`;
  const validPassword = "TestPass123!";
  const validName = "Auth Test User";
  const validTenantId =
    process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

  describe("POST /auth/register", () => {
    it("should register with valid data and return 201 with user and token", async () => {
      const res = await request(API_URL).post("/auth/register").send({
        email: validEmail,
        password: validPassword,
        name: validName,
        tenantId: validTenantId,
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validEmail);
      expect(res.body.user.name).toBe(validName);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(API_URL).post("/auth/register").send({
        email: "not-an-email",
        password: validPassword,
        name: validName,
        tenantId: validTenantId,
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 for missing fields", async () => {
      const res = await request(API_URL).post("/auth/register").send({
        email: `missing-${uniqueSuffix}@test.com`,
      });

      expect(res.status).toBe(400);
    });

    it("should return 409 for duplicate email", async () => {
      const res = await request(API_URL).post("/auth/register").send({
        email: validEmail,
        password: validPassword,
        name: validName,
        tenantId: validTenantId,
      });

      expect(res.status).toBe(409);
    });

    it("should return 400 for invalid tenant", async () => {
      const res = await request(API_URL).post("/auth/register").send({
        email: `invalid-tenant-${uniqueSuffix}@test.com`,
        password: validPassword,
        name: validName,
        tenantId: "non-existent-tenant",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials and return 200 with token", async () => {
      const res = await request(API_URL).post("/auth/login").send({
        email: validEmail,
        password: validPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(API_URL).post("/auth/login").send({
        email: validEmail,
        password: "WrongPassword123!",
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(API_URL).post("/auth/login").send({
        email: `nonexistent-${uniqueSuffix}@test.com`,
        password: validPassword,
      });

      expect(res.status).toBe(401);
    });

    it("token should contain userId, tenantId, and role", async () => {
      const loginRes = await request(API_URL).post("/auth/login").send({
        email: validEmail,
        password: validPassword,
      });

      const decoded = jwt.decode(loginRes.body.token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBeDefined();
      expect(decoded.tenantId).toBeDefined();
      expect(decoded.role).toBeDefined();
    });
  });

  describe("Token-based access", () => {
    let validToken: string;

    beforeAll(async () => {
      const res = await request(API_URL).post("/auth/login").send({
        email: validEmail,
        password: validPassword,
      });
      validToken = res.body.token;
    });

    it("should return 401 when accessing protected route without token", async () => {
      const res = await request(API_URL).get("/profile");

      expect(res.status).toBe(401);
    });

    it("should return 401 when accessing protected route with expired token", async () => {
      const expiredToken = jwt.sign(
        { userId: "test", tenantId: "test", role: "user" },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "-1s" }
      );

      const res = await request(API_URL)
        .get("/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it("should return 200 when accessing protected route with valid token", async () => {
      const res = await request(API_URL)
        .get("/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
    });
  });
});
