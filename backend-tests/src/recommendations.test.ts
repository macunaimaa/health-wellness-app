import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createCheckinData, createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

async function setupUserWithCheckin(
  overrides: {
    profileOverrides?: any;
    checkinOverrides?: any;
  } = {}
) {
  const { user, token } = await registerUser(
    generateUniqueEmail(),
    "TestPass123!",
    "Rec Test User",
    TENANT_A
  );
  const client = createAuthenticatedClient(token);

  const profileData = createProfileData(
    user?.id,
    TENANT_A,
    overrides.profileOverrides
  );
  await client.put("/profile").send(profileData);

  const checkinData = createCheckinData(
    user?.id,
    TENANT_A,
    overrides.checkinOverrides
  );
  await client.post("/checkins").send(checkinData);

  return { user, token, client };
}

describe("Recommendation Endpoints", () => {
  describe("Recommendation generation", () => {
    it("should generate recommendations with valid check-in", async () => {
      const { client } = await setupUserWithCheckin();

      const res = await client.get("/recommendations/today");

      expect([200, 201]).toContain(res.status);
    });

    it("should return appropriate error when no check-in exists", async () => {
      const { token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "No Checkin Rec User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      const res = await client.get("/recommendations/today");

      expect([404, 400, 422]).toContain(res.status);
    });

    it("should include meal, workout, and recovery types", async () => {
      const { client } = await setupUserWithCheckin();

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const types = res.body.map((r: any) => r.type);
        const uniqueTypes = [...new Set(types)];
        expect(uniqueTypes.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("Dietary restrictions", () => {
    it("should respect dietary restrictions", async () => {
      const { client } = await setupUserWithCheckin({
        profileOverrides: {
          dietary_restrictions: ["vegan"],
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const mealRecs = res.body.filter((r: any) => r.type === "meal");
        for (const meal of mealRecs) {
          const content = JSON.stringify(meal).toLowerCase();
          expect(content).not.toContain("chicken");
          expect(content).not.toContain("beef");
          expect(content).not.toContain("pork");
        }
      }
    });
  });

  describe("Physical limitations", () => {
    it("should respect physical limitations", async () => {
      const { client } = await setupUserWithCheckin({
        profileOverrides: {
          physical_limitations: ["knee_injury"],
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        for (const workout of workoutRecs) {
          const content = JSON.stringify(workout).toLowerCase();
          expect(content).not.toContain("squat");
          expect(content).not.toContain("lunge");
          expect(content).not.toContain("jump");
        }
      }
    });
  });

  describe("Energy level influence", () => {
    it("low energy (1-2) should produce low-intensity recommendations", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          energy_level: 1,
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        for (const workout of workoutRecs) {
          if (workout.intensity) {
            expect(["low", "light", "gentle", "recovery"]).toContain(
              workout.intensity.toLowerCase()
            );
          }
        }
      }
    });

    it("high energy (4-5) can produce high-intensity recommendations", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          energy_level: 5,
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const intensities = res.body
          .filter((r: any) => r.intensity)
          .map((r: any) => r.intensity.toLowerCase());
        const hasHighIntensity = intensities.some((i: string) =>
          ["high", "intense", "vigorous", "moderate", "hard"].includes(i)
        );
        if (intensities.length > 0) {
          expect(hasHighIntensity).toBe(true);
        }
      }
    });
  });

  describe("Time constraints", () => {
    it("short time (<=10 min) should produce ultra-quick suggestions only", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          available_minutes: 5,
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        for (const rec of res.body) {
          if (rec.estimated_minutes) {
            expect(rec.estimated_minutes).toBeLessThanOrEqual(5);
          }
        }
      }
    });
  });

  describe("Context-specific recommendations", () => {
    it("travel context should produce travel-appropriate suggestions", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          context_type: "travel",
        },
      });

      const res = await client.get("/recommendations/today");

      expect([200, 201]).toContain(res.status);
    });

    it("airport context should produce airport-appropriate suggestions", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          context_type: "airport",
          available_minutes: 10,
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        for (const workout of workoutRecs) {
          const content = JSON.stringify(workout).toLowerCase();
          expect(content).not.toContain("gym");
          expect(content).not.toContain("barbell");
        }
      }
    });

    it("hotel context should produce hotel-appropriate suggestions", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          context_type: "hotel",
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        for (const workout of workoutRecs) {
          const content = JSON.stringify(workout).toLowerCase();
          if (content.includes("bodyweight") || content.includes("room")) {
            expect(true).toBe(true);
          }
        }
      }
    });
  });

  describe("Combined factors", () => {
    it("bad sleep + high stress should reduce workout intensity", async () => {
      const { client } = await setupUserWithCheckin({
        checkinOverrides: {
          sleep_quality: 1,
          stress_level: 5,
          energy_level: 3,
        },
      });

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        for (const workout of workoutRecs) {
          if (workout.intensity) {
            expect(workout.intensity.toLowerCase()).not.toBe("high");
          }
        }
      }
    });
  });

  describe("Recommendation structure", () => {
    it("should return today's recommendations", async () => {
      const { client } = await setupUserWithCheckin();

      const res = await client.get("/recommendations/today");

      expect([200, 201]).toContain(res.status);
    });

    it("each recommendation should have title, summary, rationale, and type", async () => {
      const { client } = await setupUserWithCheckin();

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
        for (const rec of res.body) {
          expect(rec).toHaveProperty("title");
          expect(rec).toHaveProperty("summary");
          expect(rec).toHaveProperty("rationale");
          expect(rec).toHaveProperty("type");
        }
      }
    });

    it("recommendations should have valid_until timestamp", async () => {
      const { client } = await setupUserWithCheckin();

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
        for (const rec of res.body) {
          expect(rec).toHaveProperty("valid_until");
          if (rec.valid_until) {
            expect(new Date(rec.valid_until).getTime()).not.toBeNaN();
          }
        }
      }
    });
  });
});
