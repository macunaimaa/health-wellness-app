interface WorkoutSuggestion {
  name: string;
  description: string;
  tags: string[];
  equipmentRequired: string[];
  physicalLimitationsConflict: string[];
  contextFit: string[];
  durationMinutes: number;
  intensityLevel: string;
  exercises: Array<{
    name: string;
    duration_minutes?: number;
    sets?: number;
    reps?: number;
    rest_seconds?: number;
  }>;
  fitnessLevelMin: string;
  calorieBurn: number;
}

const FITNESS_LEVEL_ORDER = ['sedentary', 'light', 'moderate', 'active', 'athlete'];

const WORKOUT_DATABASE: WorkoutSuggestion[] = [
  {
    name: 'Caminhada Rápida Energética',
    description: '30 minutos de caminhada em ritmo acelerado ao ar livre, intercalando 2 min rápido com 1 min normal',
    tags: ['cardio', 'caminhada', 'ao_ar_livre', 'iniciante'],
    equipmentRequired: [],
    physicalLimitationsConflict: [],
    contextFit: ['home', 'office', 'hotel', 'travel'],
    durationMinutes: 30,
    intensityLevel: 'low',
    exercises: [
      { name: 'Caminhada rápida', duration_minutes: 30 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 180,
  },
  {
    name: 'HIIT Corporal 15 Minutos',
    description: 'Treino intervalado de alta intensidade usando apenas o peso do corpo: agachamento, flexão, burpee, prancha',
    tags: ['hiit', 'corporal', 'rapido', 'intenso'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho', 'ombro', 'coluna'],
    contextFit: ['home', 'hotel', 'office'],
    durationMinutes: 15,
    intensityLevel: 'high',
    exercises: [
      { name: 'Agachamento', sets: 3, reps: 15, rest_seconds: 15 },
      { name: 'Flexão de braço', sets: 3, reps: 10, rest_seconds: 15 },
      { name: 'Burpee', sets: 3, reps: 8, rest_seconds: 20 },
      { name: 'Prancha abdominal', sets: 3, duration_minutes: 1, rest_seconds: 15 },
    ],
    fitnessLevelMin: 'light',
    calorieBurn: 200,
  },
  {
    name: 'Alongamento Dinâmico de Mesa',
    description: 'Sequência de alongamentos para pescoço, ombros, costas e pulsos que podem ser feitos sentado',
    tags: ['alongamento', 'escritorio', 'rapido', 'recuperacao'],
    equipmentRequired: [],
    physicalLimitationsConflict: [],
    contextFit: ['office', 'continuous_meetings', 'airport', 'car'],
    durationMinutes: 5,
    intensityLevel: 'low',
    exercises: [
      { name: 'Rotação de pescoço', sets: 2, reps: 5, rest_seconds: 0 },
      { name: 'Elevação de ombros', sets: 3, reps: 10, rest_seconds: 5 },
      { name: 'Alongamento de pulso', sets: 2, reps: 10, rest_seconds: 5 },
      { name: 'Torção de tronco sentado', sets: 2, reps: 8, rest_seconds: 5 },
      { name: 'Alongamento de peitoral na cadeira', sets: 2, duration_minutes: 1, rest_seconds: 5 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 20,
  },
  {
    name: 'Treino de Força com Halteres',
    description: 'Circuito de exercícios com halteres: desenvolvimento, remada, curl, agachamento com peso',
    tags: ['forca', 'halteres', 'musculacao'],
    equipmentRequired: ['dumbbells'],
    physicalLimitationsConflict: ['ombro', 'coluna'],
    contextFit: ['home', 'hotel'],
    durationMinutes: 30,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'Desenvolvimento com halteres', sets: 3, reps: 12, rest_seconds: 45 },
      { name: 'Remada curvada', sets: 3, reps: 12, rest_seconds: 45 },
      { name: 'Curl de bíceps', sets: 3, reps: 12, rest_seconds: 30 },
      { name: 'Agachamento com halteres', sets: 3, reps: 15, rest_seconds: 45 },
      { name: 'Elevação lateral', sets: 3, reps: 12, rest_seconds: 30 },
    ],
    fitnessLevelMin: 'light',
    calorieBurn: 280,
  },
  {
    name: 'Yoga Flow Matinal',
    description: 'Sequência de yoga suave com saudação ao sol, guerreiro, árvore e posturas de equilíbrio',
    tags: ['yoga', 'flexibilidade', 'equilibrio', 'mental'],
    equipmentRequired: ['mat'],
    physicalLimitationsConflict: [],
    contextFit: ['home', 'hotel'],
    durationMinutes: 25,
    intensityLevel: 'low',
    exercises: [
      { name: 'Saudação ao sol', sets: 3, duration_minutes: 3, rest_seconds: 15 },
      { name: 'Postura do guerreiro I', sets: 2, duration_minutes: 1, rest_seconds: 10 },
      { name: 'Postura do guerreiro II', sets: 2, duration_minutes: 1, rest_seconds: 10 },
      { name: 'Postura da árvore', sets: 2, duration_minutes: 1, rest_seconds: 10 },
      { name: 'Postura da criança', duration_minutes: 2 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 120,
  },
  {
    name: 'Treino Quick 7 Minutos',
    description: '7 exercícios de 45 segundos com 15 segundos de descanso: agachamento, flexão, prancha, lunge, etc.',
    tags: ['rapido', 'corporal', 'hiit', 'micro'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho'],
    contextFit: ['home', 'hotel', 'office'],
    durationMinutes: 7,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'Agachamento', duration_minutes: 1 },
      { name: 'Flexão de braço', duration_minutes: 1 },
      { name: 'Prancha abdominal', duration_minutes: 1 },
      { name: 'Lunge alternado', duration_minutes: 1 },
      { name: 'Tríceps no banco', duration_minutes: 1 },
      { name: 'Abdominal bicicleta', duration_minutes: 1 },
      { name: 'Prancha lateral', duration_minutes: 1 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 90,
  },
  {
    name: 'Circuito de Escada',
    description: 'Subida e descida de escadas em ritmo variado para cardio e pernas, com pausas ativas',
    tags: ['cardio', 'escada', 'pernas', 'intenso'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho', 'coluna'],
    contextFit: ['home', 'hotel', 'office'],
    durationMinutes: 20,
    intensityLevel: 'high',
    exercises: [
      { name: 'Subida de escada rápida', sets: 5, duration_minutes: 2, rest_seconds: 30 },
      { name: 'Agachamento na escada', sets: 3, reps: 10, rest_seconds: 20 },
    ],
    fitnessLevelMin: 'moderate',
    calorieBurn: 250,
  },
  {
    name: 'Mobilidade e Ativação Matinal',
    description: 'Rotina de 10 minutos com foam rolling, ativação glútea, rotação de quadril e alongamento dinâmico',
    tags: ['mobilidade', 'ativacao', 'matinal', 'recuperacao'],
    equipmentRequired: [],
    physicalLimitationsConflict: [],
    contextFit: ['home', 'hotel', 'office'],
    durationMinutes: 10,
    intensityLevel: 'low',
    exercises: [
      { name: 'Rotação de quadril', sets: 2, reps: 10, rest_seconds: 5 },
      { name: 'Ativação glútea (bridge)', sets: 2, reps: 15, rest_seconds: 10 },
      { name: 'Alongamento dinâmico pernas', sets: 2, reps: 8, rest_seconds: 5 },
      { name: 'Gato-vaca', sets: 2, reps: 10, rest_seconds: 5 },
      { name: 'Rotação torácica', sets: 2, reps: 8, rest_seconds: 5 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 40,
  },
  {
    name: 'Treino Tabata 4 Minutos',
    description: '4 rounds de 20s esforço / 10s descanso: agachamento com salto, flexão, mountain climber, prancha',
    tags: ['tabata', 'rapido', 'intenso', 'micro'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho', 'ombro', 'coluna'],
    contextFit: ['home', 'hotel'],
    durationMinutes: 4,
    intensityLevel: 'high',
    exercises: [
      { name: 'Agachamento com salto', sets: 8, reps: 1, rest_seconds: 0 },
      { name: 'Flexão de braço', sets: 8, reps: 1, rest_seconds: 0 },
      { name: 'Mountain climber', sets: 8, reps: 1, rest_seconds: 0 },
      { name: 'Prancha com toque no ombro', sets: 8, reps: 1, rest_seconds: 0 },
    ],
    fitnessLevelMin: 'moderate',
    calorieBurn: 70,
  },
  {
    name: 'Treino Completo de Hotel',
    description: 'Circuito corporal completo para quarto de hotel: flexão, agachamento, lunge, dips, prancha, burpee',
    tags: ['corporal', 'hotel', 'completo'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho', 'ombro'],
    contextFit: ['hotel'],
    durationMinutes: 20,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'Flexão de braço', sets: 3, reps: 12, rest_seconds: 30 },
      { name: 'Agachamento', sets: 3, reps: 15, rest_seconds: 30 },
      { name: 'Lunge alternado', sets: 3, reps: 12, rest_seconds: 30 },
      { name: 'Tríceps no banco/cama', sets: 3, reps: 12, rest_seconds: 30 },
      { name: 'Prancha abdominal', sets: 3, duration_minutes: 1, rest_seconds: 20 },
    ],
    fitnessLevelMin: 'light',
    calorieBurn: 200,
  },
  {
    name: 'Caminhada entre Voos',
    description: 'Caminhada moderada pelo aeroporto entre portões, combinada com alongamentos em pé',
    tags: ['caminhada', 'aeroporto', 'leve', 'recuperacao'],
    equipmentRequired: [],
    physicalLimitationsConflict: [],
    contextFit: ['airport'],
    durationMinutes: 10,
    intensityLevel: 'low',
    exercises: [
      { name: 'Caminhada moderada', duration_minutes: 7 },
      { name: 'Alongamento em pé (pernas)', duration_minutes: 3 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 50,
  },
  {
    name: 'Treino de Resistência com Banda Elástica',
    description: 'Exercícios com elástico: remada, abertura de peito, leg press, rotação externa de ombro',
    tags: ['resistencia', 'banda', 'portatil'],
    equipmentRequired: ['band'],
    physicalLimitationsConflict: [],
    contextFit: ['home', 'hotel', 'travel'],
    durationMinutes: 20,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'Remada com elástico', sets: 3, reps: 15, rest_seconds: 30 },
      { name: 'Abertura de peito', sets: 3, reps: 12, rest_seconds: 30 },
      { name: 'Leg press com elástico', sets: 3, reps: 15, rest_seconds: 30 },
      { name: 'Rotação externa de ombro', sets: 3, reps: 12, rest_seconds: 20 },
      { name: 'Curl de bíceps com elástico', sets: 3, reps: 12, rest_seconds: 20 },
    ],
    fitnessLevelMin: 'light',
    calorieBurn: 160,
  },
  {
    name: 'Corrida Leve 20 Minutos',
    description: 'Corrida em ritmo conversacional, 5 min aquecimento + 12 min ritmo + 3 min desaceleração',
    tags: ['cardio', 'corrida', 'ao_ar_livre'],
    equipmentRequired: [],
    physicalLimitationsConflict: ['joelho', 'coluna'],
    contextFit: ['home', 'hotel', 'travel'],
    durationMinutes: 20,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'Aquecimento (caminhada → trote)', duration_minutes: 5 },
      { name: 'Corrida ritmo conversacional', duration_minutes: 12 },
      { name: 'Desaceleração (trote → caminhada)', duration_minutes: 3 },
    ],
    fitnessLevelMin: 'moderate',
    calorieBurn: 240,
  },
  {
    name: 'Pilates Solo Core',
    description: 'Série de exercícios de pilates no solo focando core: hundred, roll-up, single leg circle, swan',
    tags: ['pilates', 'core', 'flexibilidade', 'postura'],
    equipmentRequired: ['mat'],
    physicalLimitationsConflict: ['coluna'],
    contextFit: ['home', 'hotel'],
    durationMinutes: 25,
    intensityLevel: 'moderate',
    exercises: [
      { name: 'The Hundred', sets: 1, duration_minutes: 2, rest_seconds: 15 },
      { name: 'Roll-up', sets: 3, reps: 8, rest_seconds: 15 },
      { name: 'Single leg circle', sets: 2, reps: 8, rest_seconds: 10 },
      { name: 'Swan dive', sets: 3, reps: 8, rest_seconds: 15 },
      { name: 'Shoulder bridge', sets: 3, reps: 10, rest_seconds: 15 },
    ],
    fitnessLevelMin: 'light',
    calorieBurn: 150,
  },
  {
    name: 'Alongamento Noturno de Recuperação',
    description: 'Sequência relaxante de alongamentos estáticos para todo o corpo antes de dormir',
    tags: ['alongamento', 'recuperacao', 'noturno', 'relaxamento'],
    equipmentRequired: [],
    physicalLimitationsConflict: [],
    contextFit: ['home', 'hotel'],
    durationMinutes: 15,
    intensityLevel: 'low',
    exercises: [
      { name: 'Alongamento pescoço/ombros', duration_minutes: 2 },
      { name: 'Alongamento peitoral na parede', sets: 2, duration_minutes: 1, rest_seconds: 5 },
      { name: 'Alongamento isquiotibiais', sets: 2, duration_minutes: 2, rest_seconds: 5 },
      { name: 'Alongamento quadríceps em pé', sets: 2, duration_minutes: 1, rest_seconds: 5 },
      { name: 'Postura da criança', duration_minutes: 2 },
      { name: 'Alongamento borboleta', duration_minutes: 2 },
      { name: 'Savasana com respiração', duration_minutes: 3 },
    ],
    fitnessLevelMin: 'sedentary',
    calorieBurn: 30,
  },
];

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
  getRecommendations(options: {
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
  }): WorkoutRecommendation[] {
    let candidates = [...WORKOUT_DATABASE];

    candidates = candidates.filter(w =>
      !w.physicalLimitationsConflict.some(l =>
        options.physicalLimitations.some(pl => pl.toLowerCase().includes(l.toLowerCase()))
      )
    );

    if (options.energyLevel <= 2) {
      candidates = candidates.filter(w => w.intensityLevel !== 'high');
    }

    if (options.sleepQuality <= 2 && options.stressLevel >= 4) {
      candidates = candidates.filter(w => w.intensityLevel === 'low');
    }

    if (options.availableMinutes <= 10) {
      candidates = candidates.filter(w => w.durationMinutes <= 10);
    } else if (options.availableMinutes <= 20) {
      candidates = candidates.filter(w => w.durationMinutes <= 20);
    }

    if (options.equipment.length === 0) {
      candidates = candidates.filter(w => w.equipmentRequired.length === 0);
    } else {
      candidates = candidates.filter(w =>
        w.equipmentRequired.length === 0 ||
        w.equipmentRequired.every(eq => options.equipment.includes(eq))
      );
    }

    const userFitnessIdx = FITNESS_LEVEL_ORDER.indexOf(options.fitnessLevel);
    candidates = candidates.filter(w => {
      const workoutIdx = FITNESS_LEVEL_ORDER.indexOf(w.fitnessLevelMin);
      return userFitnessIdx >= workoutIdx;
    });

    if (options.daysSinceLastActivity >= 2) {
      candidates = candidates.filter(w => w.intensityLevel !== 'high');
    }

    if (options.contextType === 'airport' || options.contextType === 'car') {
      candidates = candidates.filter(w =>
        w.contextFit.includes(options.contextType) || w.tags.includes('alongamento')
      );
    }

    const scored = candidates.map(workout => {
      let score = 0;

      if (workout.contextFit.includes(options.contextType)) score += 3;

      if (options.preferredWorkoutTypes.some(pt => workout.tags.includes(pt))) score += 2;

      if (options.energyLevel >= 4 && workout.intensityLevel === 'high') score += 2;
      if (options.energyLevel <= 2 && workout.intensityLevel === 'low') score += 2;

      if (options.daysSinceLastActivity >= 2 && workout.intensityLevel === 'low') score += 1;
      if (options.daysSinceLastActivity >= 2 && workout.tags.includes('mobilidade')) score += 1;

      if (options.stressLevel >= 4 && workout.tags.includes('mental')) score += 2;
      if (options.stressLevel >= 4 && workout.tags.includes('relaxamento')) score += 1;

      return { workout, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 2).map(s => ({
      name: s.workout.name,
      description: s.workout.description,
      rationale: this.buildRationale(s.workout, options),
      durationMinutes: s.workout.durationMinutes,
      intensityLevel: s.workout.intensityLevel,
      exercises: s.workout.exercises,
      calorieBurn: s.workout.calorieBurn,
      tags: s.workout.tags,
    }));
  }

  private buildRationale(workout: WorkoutSuggestion, options: {
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
    availableMinutes: number;
    daysSinceLastActivity: number;
    contextType: string;
  }): string {
    const parts: string[] = [];

    if (options.energyLevel <= 2) {
      parts.push('Com energia baixa, priorizamos um treino leve para não sobrecarregar');
    } else if (options.energyLevel >= 4) {
      parts.push('Com boa energia, aproveite para um treino mais intenso');
    }

    if (options.sleepQuality <= 2 && options.stressLevel >= 4) {
      parts.push('sono ruim e estresse alto indicam treino suave e foco em recuperação');
    }

    if (options.daysSinceLastActivity >= 2) {
      parts.push('retorno gradual após período sem atividade');
    }

    if (options.availableMinutes <= 10) {
      parts.push(`treino rápido de ${workout.durationMinutes} min adaptado ao tempo disponível`);
    }

    if (options.contextType === 'travel' || options.contextType === 'airport') {
      parts.push('adaptado para contexto de viagem');
    } else if (options.contextType === 'office') {
      parts.push('pode ser feito no ambiente de trabalho');
    }

    if (parts.length === 0) {
      parts.push('treino recomendado baseado no seu perfil e condições do dia');
    }

    return parts.join('. ') + '.';
  }
}
