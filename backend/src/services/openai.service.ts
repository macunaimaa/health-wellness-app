import OpenAI from 'openai';
import { MealRecommendation } from './meal.service';
import { WorkoutRecommendation } from './workout.service';
import { RecoveryRecommendation } from './recovery.service';
import { TravelMealOption, TravelTip } from './travel.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');
  return JSON.parse(content) as T;
}

export async function generateMealRecommendations(options: {
  contextType: string;
  availableMinutes: number;
  energyLevel: number;
  dietaryPreferences: string[];
  dietaryRestrictions: string[];
  mealWindow?: string;
  equipment: string[];
}): Promise<MealRecommendation[]> {
  const systemPrompt = `Você é um nutricionista especializado em saúde para executivos ocupados.
Gere recomendações de refeições personalizadas em português brasileiro.
Responda APENAS com JSON válido no formato: { "meals": [array de refeições] }
Cada refeição deve ter: name, description, rationale, prepMinutes, calories, proteinG, carbsG, fatG, intensityLevel (low/moderate/high), tags (array de strings)`;

  const userPrompt = `Gere 3 sugestões de refeição para:
- Contexto: ${options.contextType}
- Tempo disponível: ${options.availableMinutes} minutos
- Nível de energia: ${options.energyLevel}/5
- Preferências alimentares: ${options.dietaryPreferences.join(', ') || 'nenhuma'}
- Restrições alimentares: ${options.dietaryRestrictions.join(', ') || 'nenhuma'}
- Período: ${options.mealWindow || 'qualquer'}
- Equipamentos disponíveis: ${options.equipment.join(', ') || 'nenhum'}

As sugestões devem ser práticas, nutritivas e adequadas ao perfil de executivo ocupado.`;

  const result = await askJSON<{ meals: MealRecommendation[] }>(systemPrompt, userPrompt);
  return result.meals || [];
}

export async function generateWorkoutRecommendations(options: {
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
  const systemPrompt = `Você é um personal trainer especializado em treinos para executivos.
Gere recomendações de treino personalizadas em português brasileiro.
Responda APENAS com JSON válido no formato: { "workouts": [array de treinos] }
Cada treino deve ter: name, description, rationale, durationMinutes, intensityLevel (low/moderate/high), exercises (array com name, e opcionalmente duration_minutes, sets, reps, rest_seconds), calorieBurn, tags (array de strings)`;

  const userPrompt = `Gere 2 sugestões de treino para:
- Contexto: ${options.contextType}
- Tempo disponível: ${options.availableMinutes} minutos
- Nível de energia: ${options.energyLevel}/5
- Qualidade do sono: ${options.sleepQuality}/5
- Nível de estresse: ${options.stressLevel}/5
- Nível de condicionamento: ${options.fitnessLevel}
- Tipos preferidos: ${options.preferredWorkoutTypes.join(', ') || 'qualquer'}
- Limitações físicas: ${options.physicalLimitations.join(', ') || 'nenhuma'}
- Equipamentos: ${options.equipment.join(', ') || 'nenhum'}
- Dias sem atividade: ${options.daysSinceLastActivity}

Os treinos devem ser seguros, realistas e adaptados ao perfil de executivo com agenda apertada.`;

  const result = await askJSON<{ workouts: WorkoutRecommendation[] }>(systemPrompt, userPrompt);
  return result.workouts || [];
}

export async function generateRecoveryRecommendations(options: {
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  contextType: string;
  availableMinutes: number;
  recentActivity: boolean;
}): Promise<RecoveryRecommendation[]> {
  const systemPrompt = `Você é um especialista em recuperação e bem-estar para executivos.
Gere recomendações de recuperação personalizadas em português brasileiro.
Responda APENAS com JSON válido no formato: { "recoveries": [array de técnicas] }
Cada técnica deve ter: name, description, rationale, techniques (array de strings com passos práticos), durationMinutes, intensityLevel (sempre "low"), tags (array de strings)`;

  const userPrompt = `Gere 2 técnicas de recuperação para:
- Contexto: ${options.contextType}
- Tempo disponível: ${options.availableMinutes} minutos
- Nível de energia: ${options.energyLevel}/5
- Nível de estresse: ${options.stressLevel}/5
- Qualidade do sono: ${options.sleepQuality}/5
- Atividade física recente: ${options.recentActivity ? 'sim' : 'não'}

As técnicas devem ser simples, eficazes e praticáveis no ambiente indicado.`;

  const result = await askJSON<{ recoveries: RecoveryRecommendation[] }>(systemPrompt, userPrompt);
  return result.recoveries || [];
}

export async function generateTravelMeals(
  contextType: string,
  dietaryRestrictions: string[],
): Promise<TravelMealOption[]> {
  const systemPrompt = `Você é um nutricionista especializado em alimentação saudável durante viagens.
Gere sugestões práticas de refeição para viajantes executivos em português brasileiro.
Responda APENAS com JSON válido no formato: { "meals": [array de opções] }
Cada opção deve ter: name, description, where (onde encontrar), rationale`;

  const userPrompt = `Gere 3 sugestões de refeição para contexto: ${contextType}
Restrições alimentares: ${dietaryRestrictions.join(', ') || 'nenhuma'}

As sugestões devem ser práticas e realistas para o contexto de viagem.`;

  const result = await askJSON<{ meals: TravelMealOption[] }>(systemPrompt, userPrompt);
  return result.meals || [];
}

export async function generateTravelTips(contextType: string): Promise<TravelTip[]> {
  const systemPrompt = `Você é um especialista em saúde e bem-estar para executivos viajantes.
Gere dicas práticas de saúde para viagens em português brasileiro.
Responda APENAS com JSON válido no formato: { "tips": [array de dicas] }
Cada dica deve ter: category (ex: movimento, hidratacao, alimentacao, recuperacao), tip (dica prática), rationale (por que seguir)`;

  const userPrompt = `Gere 3 dicas de saúde e bem-estar para contexto: ${contextType}

As dicas devem ser acionáveis e relevantes para executivos ocupados em viagem.`;

  const result = await askJSON<{ tips: TravelTip[] }>(systemPrompt, userPrompt);
  return result.tips || [];
}

export async function generateHydrationRecommendation(energyLevel: number): Promise<{
  summary: string;
  rationale: string;
  tips: string[];
  targetLiters: number;
}> {
  const systemPrompt = `Você é um nutricionista especializado em hidratação para performance executiva.
Gere uma recomendação de hidratação personalizada em português brasileiro.
Responda APENAS com JSON válido com: summary, rationale, tips (array de 4 dicas), targetLiters (número)`;

  const userPrompt = `Gere uma recomendação de hidratação para nível de energia ${energyLevel}/5.
A recomendação deve ser personalizada e prática para o dia a dia de um executivo.`;

  return askJSON(systemPrompt, userPrompt);
}
