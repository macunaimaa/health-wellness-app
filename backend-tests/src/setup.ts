import { execSync } from "child_process";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/saude_test";

process.env.API_URL = API_URL;
process.env.DATABASE_URL = DATABASE_URL;

beforeAll(async () => {
  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL },
      stdio: "pipe",
    });
  } catch {
    console.warn("Migration deploy skipped - assuming DB is already migrated");
  }
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
});

export { API_URL, DATABASE_URL };
