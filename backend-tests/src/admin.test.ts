import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";
const TENANT_B = process.env.TEST_TENANT_B_ID || "00000000-0000-0000-0000-000000000002";

async function createAdminUser(tenantId: string) {
  const { user, token } = await registerUser(
    generateUniqueEmail(),
    "TestPass123!",
    "Admin User",
    tenantId
  );
  return { user, token };
}

async function createRegularUser(tenantId: string) {
  const { user, token } = await registerUser(
    generateUniqueEmail(),
    "TestPass123!",
    "Regular User",
    tenantId
  );
  return { user, token };
}

describe("Admin Endpoints", () => {
  let adminToken: string;
  let regularToken: string;

  beforeAll(async () => {
    const admin = await createAdminUser(TENANT_A);
    adminToken = admin.token;

    const regular = await createRegularUser(TENANT_A);
    regularToken = regular.token;
  });

  describe("GET /admin/users", () => {
    it("admin should be able to list users for own tenant", async () => {
      const adminClient = createAuthenticatedClient(adminToken);

      const res = await adminClient.get("/admin/users");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("regular user should not access admin endpoints", async () => {
      const regularClient = createAuthenticatedClient(regularToken);

      const res = await regularClient.get("/admin/users");

      expect(res.status).toBe(403);
    });

    it("admin should not be able to list users from other tenant", async () => {
      const adminClient = createAuthenticatedClient(adminToken);

      const res = await adminClient.get(
        `/admin/users?tenantId=${TENANT_B}`
      );

      expect(res.status).toBe(403);
    });
  });

  describe("GET /admin/engagement", () => {
    it("should return aggregated engagement stats", async () => {
      const adminClient = createAuthenticatedClient(adminToken);

      const res = await adminClient.get("/admin/engagement");

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      if (res.body.totalUsers !== undefined) {
        expect(typeof res.body.totalUsers).toBe("number");
      }
    });
  });

  describe("Pagination", () => {
    it("should paginate results correctly", async () => {
      const adminClient = createAuthenticatedClient(adminToken);

      const page1 = await adminClient.get("/admin/users?page=1&limit=2");

      expect(page1.status).toBe(200);
      if (Array.isArray(page1.body)) {
        expect(page1.body.length).toBeLessThanOrEqual(2);
      }

      const page2 = await adminClient.get("/admin/users?page=2&limit=2");

      expect(page2.status).toBe(200);

      if (
        Array.isArray(page1.body) &&
        Array.isArray(page2.body) &&
        page1.body.length > 0 &&
        page2.body.length > 0
      ) {
        expect(page1.body[0].id).not.toBe(page2.body[0].id);
      }
    });
  });
});
