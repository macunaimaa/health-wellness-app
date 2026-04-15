import OpenAI from 'openai';
import { MealRecommendation } from './meal.service';
import { WorkoutRecommendation } from './workout.service';
import { RecoveryRecommendation } from './recovery.service';
import { TravelMealOption, TravelTip } from './travel.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const response = await openai.chat.completions.create({
    model: 'gpt-5.4-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');
  return JSON.parse(content) as T;
}

const AGENT_IDENTITY = `Você é um agente de saúde e bem-estar pessoal especializado em executivos de alta performance.
Você conhece profundamente nutrição, exercício físico, recuperação e gestão do estresse.
Suas recomendações são práticas, personalizadas, baseadas no estado atual do usuário e no contexto do dia.
Você fala em português brasileiro de forma direta, calorosa e motivadora — como um coach pessoal de elite.
Nunca dê recomendações genéricas. Cada sugestão deve ser específica para o momento e perfil do usuário.
Sempre responda APENAS com JSON válido conforme o formato solicitado.`;

function buildHealthContext(options: {
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  contextType: string;
  availableMinutes: number;
}): string {
  const energy = ['sem energia', 'energia baixa', 'energia moderada', 'boa energia', 'cheio de energia'][options.energyLevel - 1] || 'moderada';
  const stress = ['muito tranquilo', 'tranquilo', 'estresse moderado', 'bem estressado', 'muito estressado'][options.stressLevel - 1] || 'moderado';
  const sleep = ['péssimo', 'ruim', 'regular', 'bom', 'excelente'][options.sleepQuality - 1] || 'regular';

  const contextMap: Record<string, string> = {
    casa: 'em casa com acesso a cozinha completa',
    escritorio: 'no escritório/trabalho',
    aeroporto: 'em aeroporto ou viajando de avião',
    hotel: 'em hotel em viagem a trabalho',
    carro: 'viajando de carro',
    reunioes: 'em dia com reuniões seguidas',
    home: 'em casa',
    office: 'no escritório',
    airport: 'no aeroporto',
    travel: 'em viagem',
    car: 'viajando de carro',
    continuous_meetings: 'em reuniões o dia todo',
  };

  return `Estado atual do usuário:
- Energia: ${options.energyLevel}/5 (${energy})
- Estresse: ${options.stressLevel}/5 (${stress})
- Qualidade do sono: ${options.sleepQuality}/5 (${sleep})
- Contexto: ${contextMap[options.contextType] || options.contextType}
- Tempo disponível: ${options.availableMinutes} minutos`;
}

export async function generateMealRecommendations(options: {
  contextType: string;
  availableMinutes: number;
  energyLevel: number;
  stressLevel?: number;
  sleepQuality?: number;
  dietaryPreferences: string[];
  dietaryRestrictions: string[];
  mealWindow?: string;
  equipment: string[];
}): Promise<MealRecommendation[]> {
  const context = buildHealthContext({
    energyLevel: options.energyLevel,
    stressLevel: options.stressLevel || 3,
    sleepQuality: options.sleepQuality || 3,
    contextType: options.contextType,
    availableMinutes: options.availableMinutes,
  });

  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { "meals": [array com exatamente 3 refeições] }
Cada refeição: { name, description, rationale, prepMinutes (número), calories (número), proteinG (número), carbsG (número), fatG (número), intensityLevel ("low"|"moderate"|"high"), tags (array de strings) }`;

  const userPrompt = `${context}
- Preferências: ${options.dietaryPreferences.join(', ') || 'nenhuma especificada'}
- Restrições alimentares: ${options.dietaryRestrictions.join(', ') || 'nenhuma'}
- Período da refeição: ${options.mealWindow || 'qualquer momento do dia'}
- Equipamentos de cozinha: ${options.equipment.join(', ') || 'básicos disponíveis'}

Sugira 3 refeições diferentes (café da manhã, almoço ou lanche dependendo do contexto) que sejam:
1. Realmente viáveis para o contexto atual (${options.contextType})
2. Adaptadas ao nível de energia e tempo disponível
3. Nutricionalmente adequadas para a situação
4. Variadas entre si (não sugira variações do mesmo prato)

O "rationale" deve ser uma frase pessoal e direta explicando POR QUE essa refeição faz sentido agora, considerando o estado atual.`;

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
  const context = buildHealthContext({
    energyLevel: options.energyLevel,
    stressLevel: options.stressLevel,
    sleepQuality: options.sleepQuality,
    contextType: options.contextType,
    availableMinutes: options.availableMinutes,
  });

  const fitnessMap: Record<string, string> = {
    sedentary: 'sedentário',
    light: 'iniciante',
    moderate: 'intermediário',
    active: 'ativo',
    athlete: 'atleta',
    iniciante: 'iniciante',
    intermediario: 'intermediário',
    avancado: 'avançado',
  };

  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { "workouts": [array com exatamente 2 treinos] }
Cada treino: { name, description, rationale, durationMinutes (número), intensityLevel ("low"|"moderate"|"high"), exercises (array de { name, duration_minutes?, sets?, reps?, rest_seconds? }), calorieBurn (número estimado), tags (array de strings) }`;

  const userPrompt = `${context}
- Nível de condicionamento: ${fitnessMap[options.fitnessLevel] || options.fitnessLevel}
- Tipos de treino preferidos: ${options.preferredWorkoutTypes.join(', ') || 'qualquer'}
- Limitações físicas: ${options.physicalLimitations.join(', ') || 'nenhuma'}
- Equipamentos disponíveis: ${options.equipment.join(', ') || 'sem equipamento'}
- Dias desde última atividade: ${options.daysSinceLastActivity} dias

Sugira 2 treinos diferentes e complementares que sejam:
1. Seguros e apropriados para o estado físico e mental atual
2. Executáveis no contexto atual (${options.contextType}) com os equipamentos disponíveis
3. Com duração realista para o tempo disponível
4. Com exercícios detalhados e práticos (séries, repetições, tempo)

${options.daysSinceLastActivity >= 3 ? 'ATENÇÃO: Usuário ficou alguns dias sem atividade — comece com intensidade mais baixa e progressão gradual.' : ''}
${options.energyLevel <= 2 ? 'ATENÇÃO: Energia muito baixa — priorize movimento leve, alongamento e mobilidade.' : ''}
${options.stressLevel >= 4 ? 'ATENÇÃO: Estresse elevado — inclua componentes de mindfulness ou yoga se possível.' : ''}

O "rationale" deve explicar de forma pessoal por que esses treinos fazem sentido agora.`;

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
  const context = buildHealthContext({
    energyLevel: options.energyLevel,
    stressLevel: options.stressLevel,
    sleepQuality: options.sleepQuality,
    contextType: options.contextType,
    availableMinutes: options.availableMinutes,
  });

  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { "recoveries": [array com exatamente 2 técnicas] }
Cada técnica: { name, description, rationale, techniques (array de strings com passos claros e práticos), durationMinutes (número), intensityLevel ("low"), tags (array de strings) }`;

  const userPrompt = `${context}
- Atividade física recente: ${options.recentActivity ? 'sim, se exercitou recentemente' : 'não, sem atividade recente'}

Sugira 2 técnicas de recuperação diferentes que sejam:
1. Praticáveis no contexto atual (${options.contextType})
2. Adequadas ao tempo disponível (${options.availableMinutes} min)
3. Com passos claros e executáveis (não genéricos)
4. Realmente eficazes para o estado atual do usuário

${options.stressLevel >= 4 ? 'Foco principal: redução de estresse e ativação do sistema nervoso parassimpático.' : ''}
${options.sleepQuality <= 2 ? 'Foco principal: técnicas que auxiliem a preparação para um sono reparador.' : ''}
${options.energyLevel <= 2 ? 'Foco principal: restauração de energia e técnicas de revitalização.' : ''}

O "rationale" deve ser uma explicação direta e pessoal do porquê essa técnica é a certa agora.`;

  const result = await askJSON<{ recoveries: RecoveryRecommendation[] }>(systemPrompt, userPrompt);
  return result.recoveries || [];
}

export async function generateTravelMeals(
  contextType: string,
  dietaryRestrictions: string[],
): Promise<TravelMealOption[]> {
  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { "meals": [array com 3 opções] }
Cada opção: { name, description, where (onde encontrar especificamente), rationale }`;

  const userPrompt = `Contexto de viagem: ${contextType}
Restrições alimentares: ${dietaryRestrictions.join(', ') || 'nenhuma'}

Sugira 3 opções de alimentação saudável e realistas para quem está ${contextType === 'airport' ? 'em um aeroporto' : contextType === 'hotel' ? 'hospedado em hotel a trabalho' : 'em viagem'}.
Cada sugestão deve indicar exatamente onde encontrar ou como conseguir essa opção.
Seja específico e prático — nada de sugestões impossíveis de executar nesse contexto.`;

  const result = await askJSON<{ meals: TravelMealOption[] }>(systemPrompt, userPrompt);
  return result.meals || [];
}

export async function generateTravelTips(contextType: string): Promise<TravelTip[]> {
  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { "tips": [array com 3 dicas] }
Cada dica: { category (ex: movimento, hidratação, alimentação, sono, postura), tip (instrução clara e acionável), rationale (benefício específico) }`;

  const userPrompt = `Sugira 3 dicas práticas de saúde e bem-estar para um executivo que está ${
    contextType === 'airport' ? 'aguardando em aeroporto ou em voo' :
    contextType === 'hotel' ? 'hospedado em hotel a trabalho' :
    contextType === 'car' ? 'em viagem longa de carro' :
    'viajando'
  }.
Cada dica deve ser acionável imediatamente, sem equipamento especial, e relevante para o contexto.`;

  const result = await askJSON<{ tips: TravelTip[] }>(systemPrompt, userPrompt);
  return result.tips || [];
}

export async function generateHydrationRecommendation(
  energyLevel: number,
  stressLevel: number,
  contextType: string,
): Promise<{
  summary: string;
  rationale: string;
  tips: string[];
  targetLiters: number;
}> {
  const systemPrompt = `${AGENT_IDENTITY}
Formato de resposta: { summary (string), rationale (string), tips (array de 4 strings), targetLiters (número com uma casa decimal) }`;

  const userPrompt = `Crie uma recomendação de hidratação personalizada para:
- Nível de energia: ${energyLevel}/5
- Nível de estresse: ${stressLevel}/5
- Contexto: ${contextType}

A meta de litros deve ser calculada considerando o contexto e estado do usuário (mínimo 1.5L, máximo 3.5L).
As dicas devem ser específicas e acionáveis para o contexto atual.
O "summary" deve ser uma frase motivadora e direta.
O "rationale" deve explicar por que a hidratação é especialmente importante hoje.`;

  return askJSON(systemPrompt, userPrompt);
}
