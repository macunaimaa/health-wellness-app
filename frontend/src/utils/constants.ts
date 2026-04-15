export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Muito baixa',
  2: 'Baixa',
  3: 'Moderada',
  4: 'Alta',
  5: 'Muito alta',
};

export const STRESS_LABELS: Record<number, string> = {
  1: 'Muito baixo',
  2: 'Baixo',
  3: 'Moderado',
  4: 'Alto',
  5: 'Muito alto',
};

export const SLEEP_LABELS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Boa',
  5: 'Muito boa',
};

export const CONTEXT_LABELS: Record<string, { label: string; emoji: string }> = {
  casa: { label: 'Casa', emoji: '🏠' },
  escritorio: { label: 'Escritório', emoji: '🏢' },
  aeroporto: { label: 'Aeroporto', emoji: '✈️' },
  hotel: { label: 'Hotel', emoji: '🏨' },
  carro: { label: 'Carro', emoji: '🚗' },
  reunioes: { label: 'Reuniões seguidas', emoji: '📅' },
};

export const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export const EQUIPMENT_OPTIONS = [
  { value: 'academia', label: 'Academia' },
  { value: 'pesos', label: 'Pesos' },
  { value: 'yoga_mat', label: 'Yoga mat' },
  { value: 'nenhum', label: 'Nenhum' },
];

export const PRIMARY_GOALS = [
  { value: 'energia', label: 'Energia', description: 'Mais disposição no dia a dia' },
  { value: 'perda_de_peso', label: 'Perda de peso', description: 'Alcançar peso saudável' },
  { value: 'manutencao', label: 'Manutenção', description: 'Manter resultados atuais' },
  { value: 'sono', label: 'Sono', description: 'Dormir melhor e mais profundo' },
  { value: 'consistencia', label: 'Consistência', description: 'Criar hábitos saudáveis' },
  { value: 'reducao_estresse', label: 'Redução de estresse', description: 'Menos ansiedade e tensão' },
] as const;

export const DIETARY_RESTRICTIONS = [
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sem_gluten', label: 'Sem glúten' },
  { value: 'sem_lactose', label: 'Sem lactose' },
  { value: 'sem_frutos_do_mar', label: 'Sem frutos do mar' },
  { value: 'sem_nozes', label: 'Sem nozes' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'low_carb', label: 'Low carb' },
  { value: 'outro', label: 'Outro' },
] as const;

export const PHYSICAL_LIMITATIONS = [
  { value: 'lesao_ombro', label: 'Lesão no ombro' },
  { value: 'lesao_joelho', label: 'Lesão no joelho' },
  { value: 'lesao_costas', label: 'Lesão nas costas' },
  { value: 'problema_cardiaco', label: 'Problema cardíaco' },
  { value: 'gestante', label: 'Gestante' },
  { value: 'pos_cirurgico', label: 'Pós-cirúrgico' },
  { value: 'nenhuma', label: 'Nenhuma' },
] as const;

export const FITNESS_LEVELS = [
  { value: 'iniciante', label: 'Iniciante', description: 'Pouca ou nenhuma experiência' },
  { value: 'intermediario', label: 'Intermediário', description: 'Pratico exercícios às vezes' },
  { value: 'avancado', label: 'Avançado', description: 'Pratico exercícios regularmente' },
] as const;

export const TRAVEL_FREQUENCIES = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'raramente', label: 'Raramente' },
  { value: 'mensalmente', label: 'Mensalmente' },
  { value: 'semanalmente', label: 'Semanalmente' },
  { value: 'frequentemente', label: 'Frequentemente' },
] as const;

export const WORKOUT_TYPES = [
  { value: 'corrida', label: 'Corrida' },
  { value: 'musculacao', label: 'Musculação' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'natacao', label: 'Natação' },
  { value: 'ciclismo', label: 'Ciclismo' },
  { value: 'alongamento', label: 'Alongamento' },
  { value: 'meditacao', label: 'Meditação' },
] as const;

export const MEAL_STYLES = [
  { value: 'rapido_simples', label: 'Rápido e simples' },
  { value: 'equilibrado', label: 'Equilibrado' },
  { value: 'gourmet', label: 'Gourmet' },
  { value: 'performance', label: 'Performance' },
] as const;

export const RECOMMENDATION_COLORS: Record<string, string> = {
  meal: 'border-l-green-500',
  workout: 'border-l-blue-500',
  recovery: 'border-l-purple-500',
  hydration: 'border-l-cyan-500',
};

export const RECOMMENDATION_ICONS: Record<string, string> = {
  meal: '🍽️',
  workout: '💪',
  recovery: '🧘',
  hydration: '💧',
};

export const RECOMMENDATION_TITLES: Record<string, string> = {
  meal: 'Alimentação',
  workout: 'Treino',
  recovery: 'Recuperação',
  hydration: 'Hidratação',
};
