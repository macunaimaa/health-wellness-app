import { generateRecoveryRecommendations } from './openai.service';

export interface RecoveryRecommendation {
  name: string;
  description: string;
  rationale: string;
  techniques: string[];
  durationMinutes: number;
  intensityLevel: string;
  tags: string[];
}

export class RecoveryService {
  async getRecommendations(options: {
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
    contextType: string;
    availableMinutes: number;
    recentActivity: boolean;
  }): Promise<RecoveryRecommendation[]> {
    return generateRecoveryRecommendations(options);
  }
}
