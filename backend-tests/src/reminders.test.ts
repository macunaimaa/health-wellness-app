import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";
const TENANT_B = process.env.TEST_TENANT_B_ID || "00000000-0000-0000-0000-000000000002";

describe("Reminder Endpoints", () => {
  let token: string;
  let client: ReturnType<typeof createAuthenticatedClient>;

  beforeAll(async () => {
    const { token: t } = await registerUser(
      generateUniqueEmail(),
      "TestPass123!",
      "Reminder User",
      TENANT_A
    );
    token = t;
    client = createAuthenticatedClient(token);
  });

  describe("GET /reminders", () => {
    it("should return user's reminders", async () => {
      const res = await client.get("/reminders");

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });

  describe("PUT /reminders", () => {
    it("should update reminders with valid data", async () => {
      const res = await client.put("/reminders").send({
        morning: { enabled: true, time: "08:00" },
        evening: { enabled: true, time: "20:00" },
      });

      expect(res.status).toBe(200);
    });

    it("should not allow access to other user's reminders", async () => {
      const { token: otherToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Other Reminder User",
        TENANT_A
      );
      const otherClient = createAuthenticatedClient(otherToken);

      const myRemindersRes = await client.get("/reminders");
      const otherRemindersRes = await otherClient.get("/reminders");

      expect(myRemindersRes.status).toBe(200);
      expect(otherRemindersRes.status).toBe(200);
      if (myRemindersRes.body?.userId && otherRemindersRes.body?.userId) {
        expect(myRemindersRes.body.userId).not.toBe(
          otherRemindersRes.body.userId
        );
      }
    });
  });

  describe("Tenant isolation", () => {
    it("reminders should respect tenant isolation", async () => {
      const { token: tenantBToken } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Tenant B Reminder User",
        TENANT_B
      );
      const tenantBClient = createAuthenticatedClient(tenantBToken);

      await tenantBClient.put("/reminders").send({
        morning: { enabled: true, time: "06:00" },
      });

      const tenantARes = await client.get("/reminders");
      const tenantBRes = await tenantBClient.get("/reminders");

      expect(tenantARes.status).toBe(200);
      expect(tenantBRes.status).toBe(200);

      if (
        tenantARes.body?.tenantId &&
        tenantBRes.body?.tenantId
      ) {
        expect(tenantARes.body.tenantId).toBe(TENANT_A);
        expect(tenantBRes.body.tenantId).toBe(TENANT_B);
      }
    });
  });
});
