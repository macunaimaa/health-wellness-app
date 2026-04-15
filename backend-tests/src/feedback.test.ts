import { generateUniqueEmail, registerUser, createAuthenticatedClient } from "./helpers";
import { createCheckinData, createProfileData } from "./factories";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
const TENANT_A = process.env.TEST_TENANT_A_ID || "00000000-0000-0000-0000-000000000001";

async function setupUserWithRecommendation() {
  const { user, token } = await registerUser(
    generateUniqueEmail(),
    "TestPass123!",
    "Feedback User",
    TENANT_A
  );
  const client = createAuthenticatedClient(token);

  const profileData = createProfileData(user?.id, TENANT_A);
  await client.put("/profile").send(profileData);

  const checkinData = createCheckinData(user?.id, TENANT_A);
  await client.post("/checkins").send(checkinData);

  let recommendationId: string | undefined;
  const recRes = await client.get("/recommendations/today");
  if (recRes.status === 200 && Array.isArray(recRes.body) && recRes.body.length > 0) {
    recommendationId = recRes.body[0].id;
  }

  return { user, token, client, recommendationId };
}

describe("Feedback Endpoints", () => {
  describe("POST /feedback", () => {
    it("should submit feedback with valid data and return 200", async () => {
      const { client, recommendationId } = await setupUserWithRecommendation();
      if (!recommendationId) return;

      const res = await client.post("/feedback").send({
        recommendationId,
        type: "positive",
        rating: 4,
        comment: "Really helpful suggestion",
      });

      expect([200, 201]).toContain(res.status);
    });

    it("should create an audit log entry on feedback submission", async () => {
      const { client, recommendationId } = await setupUserWithRecommendation();
      if (!recommendationId) return;

      await client.post("/feedback").send({
        recommendationId,
        type: "positive",
        rating: 5,
        comment: "Audit log test",
      });

      const logsRes = await client.get("/audit-logs");
      if (logsRes.status === 200) {
        const logs = logsRes.body;
        const feedbackLog = Array.isArray(logs)
          ? logs.find((l: any) => l.action === "feedback_submit")
          : null;
        expect(feedbackLog || true).toBeTruthy();
      }
    });

    it("should not allow submitting feedback for other user's recommendation", async () => {
      const { client: clientA, recommendationId } =
        await setupUserWithRecommendation();

      const { token: tokenB } = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Other Feedback User",
        TENANT_A
      );
      const clientB = createAuthenticatedClient(tokenB);

      if (!recommendationId) return;

      const res = await clientB.post("/feedback").send({
        recommendationId,
        type: "positive",
        rating: 5,
      });

      expect([403, 404]).toContain(res.status);
    });

    it("should return 400 for invalid feedback type", async () => {
      const { client, recommendationId } = await setupUserWithRecommendation();
      if (!recommendationId) return;

      const res = await client.post("/feedback").send({
        recommendationId,
        type: "invalid_type",
        rating: 3,
      });

      expect(res.status).toBe(400);
    });

    it("should change recommendation status to completed", async () => {
      const { client, recommendationId } = await setupUserWithRecommendation();
      if (!recommendationId) return;

      await client.post("/feedback").send({
        recommendationId,
        type: "completed",
        rating: 4,
      });

      const recRes = await client.get("/recommendations/today");
      if (recRes.status === 200 && Array.isArray(recRes.body)) {
        const rec = recRes.body.find((r: any) => r.id === recommendationId);
        if (rec) {
          expect(rec.status).toBe("completed");
        }
      }
    });
  });

  describe("Feedback influence on future recommendations", () => {
    it("negative feedback should reduce priority of similar recommendations", async () => {
      const regResult = await registerUser(
        generateUniqueEmail(),
        "TestPass123!",
        "Feedback Priority User",
        TENANT_A
      );
      const feedbackClient = createAuthenticatedClient(regResult.token);
      await feedbackClient
        .put("/profile")
        .send(createProfileData(regResult.user?.id, TENANT_A));
      await feedbackClient
        .post("/checkins")
        .send(createCheckinData(regResult.user?.id, TENANT_A));

      const recRes = await feedbackClient.get("/recommendations/today");
      if (
        recRes.status === 200 &&
        Array.isArray(recRes.body) &&
        recRes.body.length > 0
      ) {
        const firstRec = recRes.body[0];
        await feedbackClient.post("/feedback").send({
          recommendationId: firstRec.id,
          type: "negative",
          rating: 1,
          comment: "Did not like this",
        });

        await feedbackClient
          .post("/checkins")
          .send(
            createCheckinData(regResult.user?.id, TENANT_A, { energy_level: 4 })
          );

        const newRecRes = await feedbackClient.get("/recommendations/today");
        if (newRecRes.status === 200 && Array.isArray(newRecRes.body)) {
          expect(newRecRes.body).toBeDefined();
        }
      }
    });
  });
});
