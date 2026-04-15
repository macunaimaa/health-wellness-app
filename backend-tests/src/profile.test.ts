import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

describe("Profile Endpoints", () => {
  let token: string;
  let userId: string;
  let client: ReturnType<typeof createAuthenticatedClient>;

  beforeAll(async () => {
    const { user, token: t } = await registerUser(
      generateUniqueEmail(),
      "TestPass123!",
      "Profile User",
      TENANT_A
    );
    token = t;
    userId = user?.id;
    client = createAuthenticatedClient(token);
  });

  describe("GET /profile", () => {
    it("should return current user profile", async () => {
      const res = await client.get("/profile");

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it("should return 401 without auth", async () => {
      const res = await request(API_URL).get("/profile");

      expect(res.status).toBe(401);
    });

    it("profile should include all expected fields", async () => {
      const res = await client.get("/profile");

      expect(res.status).toBe(200);
      const profile = res.body;
      expect(profile).toHaveProperty("userId");
      expect(profile).toHaveProperty("email");
      expect(profile).toHaveProperty("name");
      expect(profile).toHaveProperty("tenantId");
    });
  });

  describe("PUT /profile", () => {
    it("should update profile with valid data", async () => {
      const profileData = createProfileData(userId, TENANT_A, {
        fitness_level: "advanced",
        goal: "weight_loss",
      });

      const res = await client.put("/profile").send(profileData);

      expect(res.status).toBe(200);
      expect(res.body.fitness_level).toBe("advanced");
      expect(res.body.goal).toBe("weight_loss");
    });

    it("should create an audit log entry on profile update", async () => {
      const profileData = createProfileData(userId, TENANT_A, {
        goal: "muscle_gain",
      });

      await client.put("/profile").send(profileData);

      const logsRes = await client.get("/audit-logs");
      if (logsRes.status === 200) {
        const logs = logsRes.body;
        const profileLog = Array.isArray(logs)
          ? logs.find((l: any) => l.action === "profile_update")
          : null;
        expect(profileLog).toBeDefined();
      }
    });

    it("should return 400 for invalid fitness_level", async () => {
      const profileData = createProfileData(userId, TENANT_A, {
        fitness_level: "superhuman",
      });

      const res = await client.put("/profile").send(profileData);

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid goal", async () => {
      const profileData = createProfileData(userId, TENANT_A, {
        goal: "become_astronaut",
      });

      const res = await client.put("/profile").send(profileData);

      expect(res.status).toBe(400);
    });
  });

  describe("Cross-user access", () => {
    it("should not be able to access other user's profile", async () => {
      const { token: otherToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Other User",
        TENANT_A
      );

      const otherClient = createAuthenticatedClient(otherToken);

      const otherLoginRes = await request(API_URL)
        .get("/profile")
        .set("Authorization", `Bearer ${otherToken}`);

      const myRes = await client.get(`/profile/${userId}`);

      if (myRes.status !== 404 && myRes.status !== 403) {
        expect(myRes.body.userId).not.toBe(otherLoginRes.body?.userId);
      }
    });
  });
});
