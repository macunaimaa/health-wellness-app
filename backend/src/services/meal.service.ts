import { generateMealRecommendations } from './openai.service';

export interface MealRecommendation {
  name: string;
  description: string;
  rationale: string;
  prepMinutes: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  intensityLevel: string;
  tags: string[];
}

export class MealService {
  async getRecommendations(options: {
    contextType: string;
    availableMinutes: number;
    energyLevel: number;
    dietaryPreferences: string[];
    dietaryRestrictions: string[];
    mealWindow?: string;
    equipment: string[];
  }): Promise<MealRecommendation[]> {
    return generateMealRecommendations(options);
  }
}
