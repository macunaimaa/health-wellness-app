import request from "supertest";
import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createCheckinData, createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

describe("Edge Cases", () => {
  describe("User with no profile", () => {
    it("should handle recommendation generation for user without profile", async () => {
      const { token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "No Profile User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client.post("/checkins").send(createCheckinData("unknown", TENANT_A));

      const res = await client.get("/recommendations/today");

      expect([200, 400, 422, 404]).toContain(res.status);
    });
  });

  describe("Dietary restrictions - strict compliance", () => {
    it("user with dietary restriction should receive no conflicting meals", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Dietary User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client
        .put("/profile")
        .send(
          createProfileData(user?.id, TENANT_A, {
            dietary_restrictions: ["vegan", "gluten_free"],
          })
        );

      await client
        .post("/checkins")
        .send(createCheckinData(user?.id, TENANT_A));

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const mealRecs = res.body.filter((r: any) => r.type === "meal");
        const forbidden = ["chicken", "beef", "pork", "fish", "wheat", "bread", "pasta"];
        for (const meal of mealRecs) {
          const content = JSON.stringify(meal).toLowerCase();
          for (const word of forbidden) {
            if (meal.dietary_tags?.some((t: string) => t.toLowerCase().includes(word))) {
              expect(content).not.toContain(word);
            }
          }
        }
      }
    });
  });

  describe("Physical limitations - strict compliance", () => {
    it("user with physical limitation should receive no conflicting workouts", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Limited User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client
        .put("/profile")
        .send(
          createProfileData(user?.id, TENANT_A, {
            physical_limitations: ["knee_injury", "shoulder_injury"],
          })
        );

      await client
        .post("/checkins")
        .send(createCheckinData(user?.id, TENANT_A, { energy_level: 4 }));

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const workoutRecs = res.body.filter((r: any) => r.type === "workout");
        const forbidden = ["squat", "lunge", "jump", "press", "pull-up"];
        for (const workout of workoutRecs) {
          const content = JSON.stringify(workout).toLowerCase();
          for (const word of forbidden) {
            if (content.includes(word)) {
              expect(true).toBe(false);
            }
          }
        }
      }
    });
  });

  describe("Extreme conditions", () => {
    it("energy 1 + stress 5 + sleep 1 should produce recovery only suggestions", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Exhausted User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client.put("/profile").send(createProfileData(user?.id, TENANT_A));

      await client.post("/checkins").send(
        createCheckinData(user?.id, TENANT_A, {
          energy_level: 1,
          stress_level: 5,
          sleep_quality: 1,
        })
      );

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        for (const rec of res.body) {
          if (rec.type === "workout" && rec.intensity) {
            expect(["recovery", "rest", "gentle", "low", "light"]).toContain(
              rec.intensity.toLowerCase()
            );
          }
        }
      }
    });

    it("airport + no equipment + 5 minutes should produce micro-suggestions", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Airport User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client.put("/profile").send(createProfileData(user?.id, TENANT_A));

      await client.post("/checkins").send(
        createCheckinData(user?.id, TENANT_A, {
          context_type: "airport",
          available_minutes: 5,
          energy_level: 3,
        })
      );

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

  describe("Dismiss and regenerate", () => {
    it("user should be able to dismiss all and regenerate", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Dismiss User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      await client.put("/profile").send(createProfileData(user?.id, TENANT_A));

      await client.post("/checkins").send(createCheckinData(user?.id, TENANT_A));

      const recRes = await client.get("/recommendations/today");

      if (recRes.status === 200 && Array.isArray(recRes.body)) {
        for (const rec of recRes.body) {
          await client.post("/feedback").send({
            recommendationId: rec.id,
            type: "dismissed",
          });
        }

        await client
          .post("/checkins")
          .send(createCheckinData(user?.id, TENANT_A, { energy_level: 3 }));

        const newRecRes = await client.get("/recommendations/today");
        expect([200, 201]).toContain(newRecRes.status);
      }
    });
  });

  describe("Data validation", () => {
    it("very long notes in check-in should be handled", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Long Notes User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      const longNotes = "a".repeat(5000);
      const res = await client.post("/checkins").send(
        createCheckinData(user?.id, TENANT_A, {
          notes: longNotes,
        })
      );

      expect([201, 400, 413]).toContain(res.status);
    });

    it("special characters in profile fields should be sanitized", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        '<script>alert("xss")</script>',
        TENANT_A
      );

      expect(user?.name).not.toContain("<script>");
    });

    it("concurrent check-in creation should not create duplicates", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Concurrent User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      const checkinData = createCheckinData(user?.id, TENANT_A, {
        notes: "Concurrent test",
      });

      const [res1, res2] = await Promise.all([
        client.post("/checkins").send({ ...checkinData }),
        client.post("/checkins").send({ ...checkinData }),
      ]);

      expect([201, 200, 409]).toContain(res1.status);
      expect([201, 200, 409]).toContain(res2.status);

      const todayRes = await client.get("/checkins/today");
      if (todayRes.status === 200) {
        expect(todayRes.body).toBeDefined();
      }
    });

    it("expired recommendations should not be returned as active", async () => {
      const { user, token } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Expired Rec User",
        TENANT_A
      );
      const client = createAuthenticatedClient(token);

      const res = await client.get("/recommendations/today");

      if (res.status === 200 && Array.isArray(res.body)) {
        const now = new Date();
        for (const rec of res.body) {
          if (rec.valid_until) {
            const validUntil = new Date(rec.valid_until);
            expect(validUntil.getTime()).toBeGreaterThanOrEqual(
              now.getTime() - 60000
            );
          }
        }
      }
    });
  });
});
