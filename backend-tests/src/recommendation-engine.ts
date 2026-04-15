interface RecommendationInput {
  energy_level: number;
  stress_level: number;
  sleep_quality: number;
  mood: number;
  context_type: string;
  available_minutes: number;
  dietary_restrictions: string[];
  physical_limitations: string[];
  fitness_level: string;
  goal: string;
  historical_feedback?: Array<{
    type: string;
    category: string;
    title: string;
    sentiment: string;
  }>;
  days_since_last_activity?: number;
  yesterday_workout?: string;
  yesterday_feedback_positive?: boolean;
}

interface Recommendation {
  type: string;
  title: string;
  summary: string;
  rationale: string;
  intensity: string;
  estimated_minutes: number;
  context_specific: boolean;
}

function generateRecommendations(input: RecommendationInput): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const maxIntensity = calculateMaxIntensity(input);
  const maxMinutes = input.available_minutes;

  const canIncludeWorkout = maxIntensity !== "recovery-only";
  const canIncludeHighIntensity = ["moderate", "high"].includes(maxIntensity);

  if (canIncludeWorkout) {
    recommendations.push(...generateWorkoutRecommendations(input, maxIntensity, maxMinutes));
  }

  recommendations.push(...generateMealRecommendations(input, maxMinutes));
  recommendations.push(...generateRecoveryRecommendations(input, maxMinutes));

  if (input.days_since_last_activity && input.days_since_last_activity >= 3) {
    recommendations.push({
      type: "workout",
      title: "Gentle Return to Movement",
      summary: "A light session to ease back into activity after a break.",
      rationale: `It's been ${input.days_since_last_activity} days since your last activity. Starting light helps prevent injury.`,
      intensity: "low",
      estimated_minutes: Math.min(15, maxMinutes),
      context_specific: false,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "recovery",
      title: "Rest and Recharge",
      summary: "Focus on rest today. Your body needs recovery.",
      rationale: "Based on your current state, rest is the best option.",
      intensity: "minimal",
      estimated_minutes: Math.min(5, maxMinutes),
      context_specific: false,
    });
  }

  for (const rec of recommendations) {
    rec.estimated_minutes = Math.min(rec.estimated_minutes, maxMinutes);
  }

  return recommendations;
}

function calculateMaxIntensity(input: RecommendationInput): string {
  const { energy_level, stress_level, sleep_quality } = input;
  const fatigueScore = (6 - energy_level) + stress_level + (6 - sleep_quality);

  if (fatigueScore >= 12) return "recovery-only";
  if (fatigueScore >= 9) return "low";
  if (fatigueScore >= 6) return "moderate";
  return "high";
}

function generateWorkoutRecommendations(
  input: RecommendationInput,
  maxIntensity: string,
  maxMinutes: number
): Recommendation[] {
  const workouts: Recommendation[] = [];
  const limitations = input.physical_limitations;
  const context = input.context_type;

  if (maxIntensity === "low" || maxIntensity === "moderate") {
    if (!limitations.includes("knee_injury") && !limitations.includes("ankle_injury")) {
      workouts.push({
        type: "workout",
        title: "Light Walking Session",
        summary: "A gentle walking session to get your body moving.",
        rationale: "Low-impact cardio suitable for your current energy level.",
        intensity: "low",
        estimated_minutes: Math.min(20, maxMinutes),
        context_specific: context === "travel" || context === "airport",
      });
    }
  }

  if (maxIntensity === "high") {
    if (!limitations.includes("knee_injury")) {
      workouts.push({
        type: "workout",
        title: "High Intensity Interval Training",
        summary: "A quick HIIT session to maximize your energy.",
        rationale: "Your energy is high - time to push it!",
        intensity: "high",
        estimated_minutes: Math.min(25, maxMinutes),
        context_specific: false,
      });
    }
  }

  if (context === "hotel" || context === "travel") {
    if (!limitations.includes("shoulder_injury") && !limitations.includes("wrist_injury")) {
      workouts.push({
        type: "workout",
        title: "Bodyweight Room Workout",
        summary: "A complete bodyweight routine you can do in your room.",
        rationale: "No equipment needed - perfect for hotel stays.",
        intensity: maxIntensity === "high" ? "moderate" : "low",
        estimated_minutes: Math.min(20, maxMinutes),
        context_specific: true,
      });
    }
  }

  if (context === "airport") {
    workouts.push({
      type: "workout",
      title: "Gate Area Stretch Routine",
      summary: "Quick stretches and movements you can do at your gate.",
      rationale: "Stay active during travel with these discrete exercises.",
      intensity: "low",
      estimated_minutes: Math.min(5, maxMinutes),
      context_specific: true,
    });
  }

  return filterByLimitations(workouts, limitations);
}

function generateMealRecommendations(
  input: RecommendationInput,
  maxMinutes: number
): Recommendation[] {
  const meals: Recommendation[] = [];
  const restrictions = input.dietary_restrictions;
  const context = input.context_type;

  if (restrictions.includes("vegan")) {
    meals.push({
      type: "meal",
      title: "Plant-Based Power Bowl",
      summary: "A nutrient-dense bowl with quinoa, chickpeas, and roasted vegetables.",
      rationale: "High-protein vegan meal to fuel your day.",
      intensity: "n/a",
      estimated_minutes: Math.min(15, maxMinutes),
      context_specific: false,
    });
  } else {
    meals.push({
      type: "meal",
      title: "Balanced Protein Plate",
      summary: "Grilled chicken with sweet potato and steamed vegetables.",
      rationale: "Complete protein with complex carbs for sustained energy.",
      intensity: "n/a",
      estimated_minutes: Math.min(20, maxMinutes),
      context_specific: false,
    });
  }

  if (context === "airport" || context === "travel") {
    if (restrictions.includes("vegan")) {
      meals.push({
        type: "meal",
        title: "Portable Trail Mix & Fruit",
        summary: "Energy-boosting snacks you can carry anywhere.",
        rationale: "Travel-friendly vegan options for on-the-go nutrition.",
        intensity: "n/a",
        estimated_minutes: Math.min(2, maxMinutes),
        context_specific: true,
      });
    } else {
      meals.push({
        type: "meal",
        title: "Protein Bar and Banana",
        summary: "Quick portable nutrition for travel.",
        rationale: "Easy to carry, no preparation needed.",
        intensity: "n/a",
        estimated_minutes: Math.min(2, maxMinutes),
        context_specific: true,
      });
    }
  }

  return meals;
}

function generateRecoveryRecommendations(
  input: RecommendationInput,
  maxMinutes: number
): Recommendation[] {
  const recovery: Recommendation[] = [];

  if (input.stress_level >= 4) {
    recovery.push({
      type: "recovery",
      title: "Guided Meditation",
      summary: "A 5-10 minute guided meditation to reduce stress.",
      rationale: "Your stress levels are elevated. Taking a moment to center yourself can help.",
      intensity: "minimal",
      estimated_minutes: Math.min(10, maxMinutes),
      context_specific: false,
    });
  }

  if (input.sleep_quality <= 2) {
    recovery.push({
      type: "recovery",
      title: "Sleep Preparation Routine",
      summary: "A calming routine to improve sleep quality tonight.",
      rationale: "Poor sleep quality detected. This routine can help you rest better.",
      intensity: "minimal",
      estimated_minutes: Math.min(15, maxMinutes),
      context_specific: false,
    });
  }

  recovery.push({
    type: "recovery",
    title: "Deep Breathing Exercise",
    summary: "Box breathing technique for immediate relaxation.",
    rationale: "Always beneficial, takes just a few minutes.",
    intensity: "minimal",
    estimated_minutes: Math.min(3, maxMinutes),
    context_specific: false,
  });

  return recovery;
}

function filterByLimitations(
  workouts: Recommendation[],
  limitations: string[]
): Recommendation[] {
  const forbiddenPatterns: Record<string, string[]> = {
    knee_injury: ["squat", "lunge", "jump", "run", "sprint", "burpee"],
    shoulder_injury: ["push-up", "pull-up", "press", "plank to push-up"],
    ankle_injury: ["jump", "run", "sprint", "hop"],
    back_injury: ["deadlift", "bend", "heavy lift", "squat"],
    wrist_injury: ["push-up", "plank", "pull-up", "burpee"],
  };

  return workouts.filter((workout) => {
    const content = workout.title.toLowerCase() + " " + workout.summary.toLowerCase();
    for (const limitation of limitations) {
      const patterns = forbiddenPatterns[limitation] || [];
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          return false;
        }
      }
    }
    return true;
  });
}

function prioritizeRecommendations(
  recommendations: Recommendation[],
  input: RecommendationInput
): Recommendation[] {
  let filtered = [...recommendations];

  if (input.historical_feedback) {
    for (const fb of input.historical_feedback) {
      if (fb.sentiment === "negative") {
        filtered = filtered.filter(
          (r) => !r.title.toLowerCase().includes(fb.title.toLowerCase())
        );
      }
    }
  }

  if (
    input.yesterday_workout &&
    !input.yesterday_feedback_positive
  ) {
    filtered = filtered.filter(
      (r) =>
        r.type !== "workout" ||
        !r.title.toLowerCase().includes(input.yesterday_workout!.toLowerCase())
    );
  }

  return filtered;
}

export {
  generateRecommendations,
  prioritizeRecommendations,
  calculateMaxIntensity,
  filterByLimitations,
  generateWorkoutRecommendations,
  generateMealRecommendations,
  generateRecoveryRecommendations,
};
export type { RecommendationInput, Recommendation };
