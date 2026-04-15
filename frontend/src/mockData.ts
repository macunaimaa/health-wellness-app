import type {
  Checkin,
  Recommendation,
  Profile,
  ReminderConfig,
  AdminStats,
  HistoryEntry,
} from './types';

export const mockCheckin: Checkin = {
  id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
  userId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  energyLevel: 4,
  stressLevel: 2,
  sleepQuality: 4,
  availableTime: 45,
  dayContext: 'casa',
  equipmentAccess: ['dumbbells', 'mat'],
  notes: 'Dia livre, bem descansado',
  createdAt: new Date().toISOString(),
};

export const mockRecommendations: Recommendation[] = [
  {
    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    checkinId: mockCheckin.id,
    type: 'meal',
    title: 'Bowl Mediterrâneo de Atum',
    summary: 'Atum grelhado com quinoa, tomate, pepino, azeitonas e azeite',
    rationale: 'Refeição balanceada rica em proteína e ômega-3, ideal para manter energia',
    intensity: 'moderado',
    status: 'pending',
    metadata: {
      calories: 520,
      protein_g: 42,
      carbs_g: 45,
      fat_g: 18,
      prep_minutes: 15,
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a52',
    checkinId: mockCheckin.id,
    type: 'workout',
    title: 'Treino Funcional em Casa',
    summary: '30 minutos de exercícios funcionais com halteres e esteira',
    rationale: 'Treino completo para melhorar força e resistência cardiovascular',
    intensity: 'moderado',
    status: 'pending',
    metadata: {
      duration_minutes: 30,
      exercises: [
        { name: 'Agachamento com halteres', reps: 15, sets: 3 },
        { name: 'Flexões', reps: 12, sets: 3 },
        { name: 'Burpees', reps: 10, sets: 3 },
        { name: 'Prancha', duration_seconds: 45, sets: 3 },
      ],
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a53',
    checkinId: mockCheckin.id,
    type: 'recovery',
    title: 'Alongamento e Respiração',
    summary: '10 minutos de alongamento guiado com exercícios de respiração 4-7-8',
    rationale: 'Relaxamento profundo para reduzir o estresse e melhorar o sono',
    intensity: 'leve',
    status: 'pending',
    metadata: {
      duration_minutes: 10,
      techniques: [
        'alongamento pescoço/ombros',
        'respiração 4-7-8',
        'rotação de tronco',
      ],
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a54',
    checkinId: mockCheckin.id,
    type: 'hydration',
    title: 'Lembrete de Hidratação',
    summary: 'Beba 250ml de água a cada hora',
    rationale: 'Manter-se hidratado melhora energia, foco e recuperação muscular',
    status: 'pending',
    metadata: {
      frequency_minutes: 60,
      target_ml: 250,
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockProfile: Profile = {
  id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  userId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  primaryGoal: 'energia',
  dietaryRestrictions: ['sem_lactose'],
  physicalLimitations: ['nenhuma'],
  fitnessLevel: 'intermediario',
  travelFrequency: 'raramente',
  preferredWorkoutTypes: ['funcional', 'natacao', 'alongamento'],
  mealStyle: 'equilibrado',
  completedAt: new Date().toISOString(),
};

export const mockReminders: ReminderConfig = {
  hydration: true,
  movement: true,
  meal: true,
  recovery: true,
  workout: true,
};

export const mockAdminStats: AdminStats = {
  totalUsers: 156,
  activeToday: 42,
  recommendationsGenerated: 1284,
  completionRate: 78,
};

export const mockHistory: HistoryEntry[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  return {
    date: date.toISOString(),
    checkin: i < 5 ? mockCheckin : null,
    completedRecommendations: Math.floor(Math.random() * 4) + 1,
    totalRecommendations: 4,
  };
});
