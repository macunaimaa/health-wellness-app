import { generateWorkoutRecommendations } from './openai.service';

export interface WorkoutRecommendation {
  name: string;
  description: string;
  rationale: string;
  durationMinutes: number;
  intensityLevel: string;
  exercises: Array<{
    name: string;
    duration_minutes?: number;
    sets?: number;
    reps?: number;
    rest_seconds?: number;
  }>;
  calorieBurn: number;
  tags: string[];
}

export class WorkoutService {
  async getRecommendations(options: {
    contextType: string;
    availableMinutes: number;
    energyLevel: number;
    sleepQuality: number;
    stressLevel: number;
    fitnessLevel: string;
    preferredWorkoutTypes: string[];
    physicalLimitations: string[];
    equipment: string[];
    daysSinceLastActivity: number;
  }): Promise<WorkoutRecommendation[]> {
    return generateWorkoutRecommendations(options);
  }
}
