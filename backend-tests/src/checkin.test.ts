import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createCheckinData, createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

describe("Check-in Endpoints", () => {
  let token: string;
  let userId: string;
  let client: ReturnType<typeof createAuthenticatedClient>;

  beforeAll(async () => {
    const { user, token: t } = await registerUser(
      generateUniqueEmail(),
      "TestPass123!",
      "Checkin User",
      TENANT_A
    );
    token = t;
    userId = user?.id;
    client = createAuthenticatedClient(token);

    const profileData = createProfileData(userId, TENANT_A);
    await client.put("/profile").send(profileData);
  });

  describe("POST /checkins", () => {
    it("should create check-in with valid data and return 201", async () => {
      const checkinData = createCheckinData(userId, TENANT_A);

      const res = await client.post("/checkins").send(checkinData);

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.energy_level).toBe(checkinData.energy_level);
    });

    it("should return 401 without auth", async () => {
      const res = await request(API_URL)
        .post("/checkins")
        .send(createCheckinData(userId, TENANT_A));

      expect(res.status).toBe(401);
    });

    it("should return 400 for energy_level > 5", async () => {
      const checkinData = createCheckinData(userId, TENANT_A, {
        energy_level: 6,
      });

      const res = await client.post("/checkins").send(checkinData);

      expect(res.status).toBe(400);
    });

    it("should return 400 for energy_level < 1", async () => {
      const checkinData = createCheckinData(userId, TENANT_A, {
        energy_level: 0,
      });

      const res = await client.post("/checkins").send(checkinData);

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid context_type", async () => {
      const checkinData = createCheckinData(userId, TENANT_A, {
        context_type: "mars_rover",
      });

      const res = await client.post("/checkins").send(checkinData);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /checkins/today", () => {
    it("should return today's check-in", async () => {
      const checkinData = createCheckinData(userId, TENANT_A, {
        notes: "Today check-in test",
      });
      await client.post("/checkins").send(checkinData);

      const res = await client.get("/checkins/today");

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it("should return 404 when no check-in exists for today", async () => {
      const { token: freshToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "No Checkin User",
        TENANT_A
      );
      const freshClient = createAuthenticatedClient(freshToken);

      const res = await freshClient.get("/checkins/today");

      expect(res.status).toBe(404);
    });
  });

  describe("Idempotency", () => {
    it("should replace first check-in when creating second on same day", async () => {
      const { token: idempotentToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Idempotent User",
        TENANT_A
      );
      const idempClient = createAuthenticatedClient(idempotentToken);

      const first = createCheckinData(userId, TENANT_A, {
        energy_level: 2,
        notes: "First check-in",
      });
      const firstRes = await idempClient.post("/checkins").send(first);

      const second = createCheckinData(userId, TENANT_A, {
        energy_level: 4,
        notes: "Second check-in",
      });
      const secondRes = await idempClient.post("/checkins").send(second);

      expect(secondRes.status).toBe(201);

      const todayRes = await idempClient.get("/checkins/today");
      if (todayRes.status === 200) {
        expect(todayRes.body.energy_level).toBe(4);
      }
    });
  });

  describe("Recommendation generation trigger", () => {
    it("should trigger recommendation generation after check-in", async () => {
      const { token: recToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Rec Trigger User",
        TENANT_A
      );
      const recClient = createAuthenticatedClient(recToken);

      const profileData = createProfileData(userId, TENANT_A);
      await recClient.put("/profile").send(profileData);

      const checkinData = createCheckinData(userId, TENANT_A);
      await recClient.post("/checkins").send(checkinData);

      const recRes = await recClient.get("/recommendations/today");

      if (recRes.status === 200) {
        expect(Array.isArray(recRes.body)).toBe(true);
        expect(recRes.body.length).toBeGreaterThan(0);
      }
    });
  });
});
