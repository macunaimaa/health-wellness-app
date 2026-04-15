import {
  generateRecommendations,
  prioritizeRecommendations,
  calculateMaxIntensity,
  filterByLimitations,
} from "./recommendation-engine";
import type { RecommendationInput, Recommendation } from "./recommendation-engine";

function baseInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    energy_level: 3,
    stress_level: 2,
    sleep_quality: 3,
    mood: 3,
    context_type: "home",
    available_minutes: 30,
    dietary_restrictions: [],
    physical_limitations: [],
    fitness_level: "intermediate",
    goal: "general_health",
    ...overrides,
  };
}

describe("Recommendation Engine - Unit Tests", () => {
  describe("Energy level influence", () => {
    it("given energy=1, returns only recovery and light suggestions", () => {
      const recs = generateRecommendations(baseInput({ energy_level: 1 }));

      const workoutRecs = recs.filter((r) => r.type === "workout");
      for (const workout of workoutRecs) {
        expect(workout.intensity).toMatch(/^(low|light|minimal|gentle)$/i);
      }
      const recoveryRecs = recs.filter((r) => r.type === "recovery");
      expect(recoveryRecs.length).toBeGreaterThan(0);
    });

    it("given energy=5, can return high intensity workout", () => {
      const recs = generateRecommendations(
        baseInput({ energy_level: 5, stress_level: 1, sleep_quality: 5 })
      );

      const workoutRecs = recs.filter((r) => r.type === "workout");
      const hasHighIntensity = workoutRecs.some(
        (r) => r.intensity === "high"
      );
      expect(hasHighIntensity).toBe(true);
    });
  });

  describe("Context-specific recommendations", () => {
    it("given context=airport, meal suggestions include portable options", () => {
      const recs = generateRecommendations(
        baseInput({ context_type: "airport", available_minutes: 10 })
      );

      const mealRecs = recs.filter((r) => r.type === "meal");
      const hasPortable = mealRecs.some(
        (r) =>
          r.context_specific === true ||
          r.title.toLowerCase().includes("portable") ||
          r.title.toLowerCase().includes("bar") ||
          r.title.toLowerCase().includes("trail")
      );
      expect(hasPortable).toBe(true);
    });

    it("given context=hotel, workout includes bodyweight exercises", () => {
      const recs = generateRecommendations(
        baseInput({ context_type: "hotel", available_minutes: 20 })
      );

      const workoutRecs = recs.filter((r) => r.type === "workout");
      const hasBodyweight = workoutRecs.some(
        (r) =>
          r.title.toLowerCase().includes("bodyweight") ||
          r.title.toLowerCase().includes("room") ||
          r.context_specific === true
      );
      expect(hasBodyweight).toBe(true);
    });
  });

  describe("Dietary restrictions", () => {
    it('given dietary_restriction includes "vegan", no animal products in meals', () => {
      const recs = generateRecommendations(
        baseInput({ dietary_restrictions: ["vegan"] })
      );

      const mealRecs = recs.filter((r) => r.type === "meal");
      const animalProducts = ["chicken", "beef", "pork", "fish", "dairy", "egg", "milk", "cheese", "whey"];
      for (const meal of mealRecs) {
        const content = (meal.title + " " + meal.summary).toLowerCase();
        for (const product of animalProducts) {
          expect(content).not.toContain(product);
        }
      }
    });
  });

  describe("Physical limitations", () => {
    it('given physical_limitation includes "knee_injury", no jumping/running exercises', () => {
      const recs = generateRecommendations(
        baseInput({
          physical_limitations: ["knee_injury"],
          energy_level: 5,
          stress_level: 1,
          sleep_quality: 5,
        })
      );

      const workoutRecs = recs.filter((r) => r.type === "workout");
      const forbidden = ["squat", "lunge", "jump", "run", "sprint", "burpee"];
      for (const workout of workoutRecs) {
        const content = (workout.title + " " + workout.summary).toLowerCase();
        for (const word of forbidden) {
          expect(content).not.toContain(word);
        }
      }
    });
  });

  describe("Time constraints", () => {
    it("given available_minutes=5, all suggestions take <=5 min", () => {
      const recs = generateRecommendations(
        baseInput({ available_minutes: 5 })
      );

      for (const rec of recs) {
        expect(rec.estimated_minutes).toBeLessThanOrEqual(5);
      }
    });

    it("given available_minutes=30, can include full workout", () => {
      const recs = generateRecommendations(
        baseInput({
          available_minutes: 30,
          energy_level: 5,
          stress_level: 1,
          sleep_quality: 5,
        })
      );

      const workoutRecs = recs.filter((r) => r.type === "workout");
      const hasFullWorkout = workoutRecs.some((r) => r.estimated_minutes >= 15);
      expect(hasFullWorkout).toBe(true);
    });
  });

  describe("Combined fatigue factors", () => {
    it("given sleep_quality=1 AND stress=5, workout intensity is reduced", () => {
      const recs = generateRecommendations(
        baseInput({
          sleep_quality: 1,
          stress_level: 5,
          energy_level: 3,
        })
      );

      const workoutRecs = recs.filter((r) => r.type === "workout");
      for (const workout of workoutRecs) {
        expect(workout.intensity).not.toBe("high");
      }
    });
  });

  describe("Historical feedback influence", () => {
    it('given historical negative feedback on "running", running is deprioritized', () => {
      const recs = generateRecommendations(
        baseInput({
          energy_level: 5,
          stress_level: 1,
          sleep_quality: 5,
        })
      );

      const prioritized = prioritizeRecommendations(recs, {
        ...baseInput({
          energy_level: 5,
          stress_level: 1,
          sleep_quality: 5,
        }),
        historical_feedback: [
          {
            type: "workout",
            category: "cardio",
            title: "running",
            sentiment: "negative",
          },
        ],
      });

      const hasRunning = prioritized.some(
        (r) => r.title.toLowerCase().includes("running")
      );
      expect(hasRunning).toBe(false);
    });

    it("recommendation never suggests exact same workout as yesterday without positive feedback", () => {
      const recs = generateRecommendations(
        baseInput({
          energy_level: 4,
          stress_level: 2,
          sleep_quality: 4,
        })
      );

      const prioritized = prioritizeRecommendations(recs, {
        ...baseInput({
          energy_level: 4,
          stress_level: 2,
          sleep_quality: 4,
        }),
        yesterday_workout: "Light Walking Session",
        yesterday_feedback_positive: false,
      });

      const hasSameWorkout = prioritized.some(
        (r) => r.title === "Light Walking Session"
      );
      expect(hasSameWorkout).toBe(false);
    });
  });

  describe("Inactivity recovery", () => {
    it("given 3+ days without activity, suggests gradual return", () => {
      const recs = generateRecommendations(
        baseInput({
          days_since_last_activity: 4,
          energy_level: 3,
        })
      );

      const hasGradualReturn = recs.some(
        (r) =>
          r.title.toLowerCase().includes("gentle return") ||
          r.title.toLowerCase().includes("ease back") ||
          r.title.toLowerCase().includes("gradual")
      );
      expect(hasGradualReturn).toBe(true);
    });
  });

  describe("Intensity calculation", () => {
    it("should return 'recovery-only' for extreme fatigue", () => {
      const intensity = calculateMaxIntensity(
        baseInput({
          energy_level: 1,
          stress_level: 5,
          sleep_quality: 1,
        })
      );
      expect(intensity).toBe("recovery-only");
    });

    it("should return 'high' for optimal conditions", () => {
      const intensity = calculateMaxIntensity(
        baseInput({
          energy_level: 5,
          stress_level: 1,
          sleep_quality: 5,
        })
      );
      expect(intensity).toBe("high");
    });

    it("should return 'low' for slightly below-average conditions", () => {
      const intensity = calculateMaxIntensity(
        baseInput({
          energy_level: 3,
          stress_level: 3,
          sleep_quality: 3,
        })
      );
      expect(intensity).toBe("low");
    });

    it("should return 'moderate' for truly average conditions", () => {
      const intensity = calculateMaxIntensity(
        baseInput({
          energy_level: 3,
          stress_level: 2,
          sleep_quality: 3,
        })
      );
      expect(intensity).toBe("moderate");
    });
  });

  describe("Filter by limitations", () => {
    it("should filter out workouts containing forbidden patterns", () => {
      const workouts: Recommendation[] = [
        {
          type: "workout",
          title: "Jump Squat Challenge",
          summary: "High-intensity jump squats",
          rationale: "Test",
          intensity: "high",
          estimated_minutes: 15,
          context_specific: false,
        },
        {
          type: "workout",
          title: "Gentle Yoga Flow",
          summary: "A calming yoga session",
          rationale: "Test",
          intensity: "low",
          estimated_minutes: 20,
          context_specific: false,
        },
      ];

      const filtered = filterByLimitations(workouts, ["knee_injury"]);
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe("Gentle Yoga Flow");
    });

    it("should return all workouts when no limitations", () => {
      const workouts: Recommendation[] = [
        {
          type: "workout",
          title: "Full Body Workout",
          summary: "Complete workout",
          rationale: "Test",
          intensity: "high",
          estimated_minutes: 30,
          context_specific: false,
        },
      ];

      const filtered = filterByLimitations(workouts, []);
      expect(filtered.length).toBe(1);
    });
  });
});
