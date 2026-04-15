import { generateTravelMeals, generateTravelTips } from './openai.service';

export interface TravelMealOption {
  name: string;
  description: string;
  where: string;
  rationale: string;
}

export interface TravelTip {
  category: string;
  tip: string;
  rationale: string;
}

export class TravelService {
  async getTravelMeals(contextType: string, dietaryRestrictions: string[]): Promise<TravelMealOption[]> {
    return generateTravelMeals(contextType, dietaryRestrictions);
  }

  async getTravelTips(contextType: string): Promise<TravelTip[]> {
    return generateTravelTips(contextType);
  }

  isTravelContext(contextType: string): boolean {
    return ['airport', 'hotel', 'travel', 'car'].includes(contextType);
  }
}
