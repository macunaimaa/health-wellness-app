import type { Recommendation } from '../types';
import { RecommendationCard } from './RecommendationCard';

interface MealCardProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSwap?: (id: string) => void;
}

export function MealCard(props: MealCardProps) {
  return <RecommendationCard {...props} />;
}

interface WorkoutCardProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSwap?: (id: string) => void;
}

export function WorkoutCard(props: WorkoutCardProps) {
  return <RecommendationCard {...props} />;
}

interface RecoveryCardProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onSwap?: (id: string) => void;
}

export function RecoveryCard(props: RecoveryCardProps) {
  return <RecommendationCard {...props} />;
}
