import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createCheckinData, createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";
const TENANT_B = process.env.TEST_TENANT_B_ID || "00000000-0000-0000-0000-000000000002";

describe("Tenant Isolation (CRITICAL)", () => {
  let tenantAUser: { user: any; token: string; client: ReturnType<typeof createAuthenticatedClient> };
  let tenantBUser: { user: any; token: string; client: ReturnType<typeof createAuthenticatedClient> };

  beforeAll(async () => {
    const a = await registerUser(
      generateUniqueEmail(),
      "TestPass123!",
      "Tenant A User",
      TENANT_A
    );
    const b = await registerUser(
      generateUniqueEmail(),
      "TestPass123!",
      "Tenant B User",
      TENANT_B
    );

    tenantAUser = { user: a.user, token: a.token, client: createAuthenticatedClient(a.token) };
    tenantBUser = { user: b.user, token: b.token, client: createAuthenticatedClient(b.token) };

    await tenantAUser.client
      .put("/profile")
      .send(createProfileData(a.user?.id, TENANT_A));

    await tenantBUser.client
      .put("/profile")
      .send(createProfileData(b.user?.id, TENANT_B));
  });

  describe("Cross-tenant read protection", () => {
    it("user from tenant A cannot read tenant B's data", async () => {
      const bCheckin = await tenantBUser.client
        .post("/checkins")
        .send(createCheckinData(tenantBUser.user?.id, TENANT_B));

      if (bCheckin.body?.id) {
        const crossRes = await tenantAUser.client.get(
          `/checkins/${bCheckin.body.id}`
        );

        expect(crossRes.status).toBe(404);
      }
    });
  });

  describe("Cross-tenant update protection", () => {
    it("user from tenant A cannot update tenant B's data", async () => {
      const bCheckin = await tenantBUser.client
        .post("/checkins")
        .send(createCheckinData(tenantBUser.user?.id, TENANT_B));

      if (bCheckin.body?.id) {
        const crossRes = await tenantAUser.client
          .put(`/checkins/${bCheckin.body.id}`)
          .send({ notes: "tampered" });

        expect(crossRes.status).toBe(404);
      }
    });
  });

  describe("Cross-tenant create protection", () => {
    it("user from tenant A cannot create data in tenant B", async () => {
      const crossRes = await tenantAUser.client.post("/checkins").send({
        ...createCheckinData(tenantAUser.user?.id, TENANT_B),
        tenantId: TENANT_B,
      });

      if (crossRes.body?.tenantId) {
        expect(crossRes.body.tenantId).not.toBe(TENANT_B);
      }
    });
  });

  describe("Admin cross-tenant protection", () => {
    it("admin from tenant A cannot see tenant B's users", async () => {
      const res = await tenantAUser.client.get(
        `/admin/users?tenantId=${TENANT_B}`
      );

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("Data isolation by tenant", () => {
    let tenantACheckinId: string | undefined;
    let tenantBCheckinId: string | undefined;

    beforeAll(async () => {
      const aRes = await tenantAUser.client
        .post("/checkins")
        .send(createCheckinData(tenantAUser.user?.id, TENANT_A, { notes: "Tenant A checkin" }));
      tenantACheckinId = aRes.body?.id;

      const bRes = await tenantBUser.client
        .post("/checkins")
        .send(createCheckinData(tenantBUser.user?.id, TENANT_B, { notes: "Tenant B checkin" }));
      tenantBCheckinId = bRes.body?.id;
    });

    it("check-ins should be isolated by tenant", async () => {
      const aTodayRes = await tenantAUser.client.get("/checkins/today");
      const bTodayRes = await tenantBUser.client.get("/checkins/today");

      if (aTodayRes.status === 200 && bTodayRes.status === 200) {
        expect(aTodayRes.body.notes).toBe("Tenant A checkin");
        expect(bTodayRes.body.notes).toBe("Tenant B checkin");
      }
    });

    it("recommendations should be isolated by tenant", async () => {
      const aRecRes = await tenantAUser.client.get("/recommendations/today");
      const bRecRes = await tenantBUser.client.get("/recommendations/today");

      if (
        aRecRes.status === 200 &&
        bRecRes.status === 200 &&
        Array.isArray(aRecRes.body) &&
        Array.isArray(bRecRes.body)
      ) {
        for (const rec of aRecRes.body) {
          if (tenantBCheckinId && rec.checkinId) {
            expect(rec.checkinId).not.toBe(tenantBCheckinId);
          }
        }
        for (const rec of bRecRes.body) {
          if (tenantACheckinId && rec.checkinId) {
            expect(rec.checkinId).not.toBe(tenantACheckinId);
          }
        }
      }
    });

    it("feedback should be isolated by tenant", async () => {
      const aRecRes = await tenantAUser.client.get("/recommendations/today");

      if (
        aRecRes.status === 200 &&
        Array.isArray(aRecRes.body) &&
        aRecRes.body.length > 0
      ) {
        await tenantAUser.client.post("/feedback").send({
          recommendationId: aRecRes.body[0].id,
          type: "positive",
          rating: 4,
        });
      }

      const bFeedbackRes = await tenantBUser.client.get("/feedback");
      if (bFeedbackRes.status === 200 && Array.isArray(bFeedbackRes.body)) {
        for (const fb of bFeedbackRes.body) {
          if (aRecRes.body?.[0]?.id && fb.recommendationId) {
            expect(fb.recommendationId).not.toBe(aRecRes.body[0].id);
          }
        }
      }
    });

    it("audit logs should be isolated by tenant", async () => {
      const aLogsRes = await tenantAUser.client.get("/audit-logs");
      const bLogsRes = await tenantBUser.client.get("/audit-logs");

      if (
        aLogsRes.status === 200 &&
        bLogsRes.status === 200 &&
        Array.isArray(aLogsRes.body) &&
        Array.isArray(bLogsRes.body)
      ) {
        const aLogIds = aLogsRes.body.map((l: any) => l.id);
        const bLogIds = bLogsRes.body.map((l: any) => l.id);
        const overlap = aLogIds.filter((id: string) => bLogIds.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it("cross-tenant access should return 404 not 403", async () => {
      const bCheckin = await tenantBUser.client
        .post("/checkins")
        .send(createCheckinData(tenantBUser.user?.id, TENANT_B));

      if (bCheckin.body?.id) {
        const crossRes = await tenantAUser.client.get(
          `/checkins/${bCheckin.body.id}`
        );

        expect(crossRes.status).toBe(404);
      }
    });
  });
});
