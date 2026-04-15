import request from "supertest";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

interface RegisterResponse {
  body: {
    user?: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      role: string;
    };
    token?: string;
    error?: string;
    message?: string;
  };
  status: number;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  tenantId: string
): Promise<{ user: any; token: string }> {
  const res = await request(API_URL)
    .post("/auth/register")
    .send({ email, password, name, tenantId });
  return {
    user: res.body.user,
    token: res.body.token,
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<string> {
  const res = await request(API_URL)
    .post("/auth/login")
    .send({ email, password });
  return res.body.token;
}

export function createAuthenticatedClient(token: string) {
  const agent = request(API_URL);
  return {
    get: (url: string) =>
      agent.get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) =>
      agent.post(url).set("Authorization", `Bearer ${token}`),
    put: (url: string) =>
      agent.put(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) =>
      agent.patch(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) =>
      agent.delete(url).set("Authorization", `Bearer ${token}`),
  };
}

export async function cleanDatabase(): Promise<void> {
  try {
    await request(API_URL).post("/_test/cleanup");
  } catch {
    console.warn("Cleanup endpoint not available");
  }
}

export async function seedTestData(): Promise<{
  tenantA: { id: string };
  tenantB: { id: string };
  adminA: { user: any; token: string };
  userA: { user: any; token: string };
  userB: { user: any; token: string };
}> {
  const tenantAId =
    process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";
  const tenantBId =
    process.env.TEST_TENANT_B_ID || "00000000-0000-0000-0000-000000000002";

  const adminA = await registerUser(
    `admin-a-${Date.now()}@test.com`,
    "TestPass123!",
    "Admin A",
    tenantAId
  );

  const userA = await registerUser(
    `user-a-${Date.now()}@test.com`,
    "TestPass123!",
    "User A",
    tenantAId
  );

  const userB = await registerUser(
    `user-b-${Date.now()}@test.com`,
    "TestPass123!",
    "User B",
    tenantBId
  );

  return {
    tenantA: { id: tenantAId },
    tenantB: { id: tenantBId },
    adminA,
    userA,
    userB,
  };
}

export function generateUniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}
