interface RecoverySuggestion {
  name: string;
  description: string;
  techniques: string[];
  durationMinutes: number;
  intensityLevel: string;
  bestFor: string[];
  contextFit: string[];
  tags: string[];
}

const RECOVERY_DATABASE: RecoverySuggestion[] = [
  {
    name: 'Respiração 4-7-8 com Alongamento',
    description: 'Técnica de respiração profunda combinada com alongamento de pescoço e ombros para redução imediata de estresse',
    techniques: ['respiração 4-7-8 (inspira 4s, segura 7s, expira 8s)', 'alongamento pescoço lateral', 'rotação de ombros', 'elevação e relaxamento de ombros'],
    durationMinutes: 8,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'low_sleep', 'low_energy', 'travel'],
    contextFit: ['home', 'office', 'hotel', 'airport', 'car'],
    tags: ['respiracao', 'estresse', 'rapido'],
  },
  {
    name: 'Meditação Guiada de 10 Minutos',
    description: 'Meditação focada em body scan e relaxamento progressivo muscular, ideal para pausas entre reuniões',
    techniques: ['body scan progressivo', 'respiração diafragmática', 'visualização de ambiente calmo', 'relaxamento muscular progressivo'],
    durationMinutes: 10,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'low_sleep', 'continuous_meetings'],
    contextFit: ['home', 'office', 'hotel', 'car'],
    tags: ['meditacao', 'estresse', 'mental'],
  },
  {
    name: 'Alongamento Noturno Completo',
    description: 'Sequência de alongamentos estáticos de corpo inteiro para relaxar antes de dormir',
    techniques: ['alongamento pescoço e trapézio', 'alongamento peitoral na parede', 'alongamento isquiotibiais sentado', 'alongamento quadríceps deitado', 'postura da criança', 'alongamento borboleta'],
    durationMinutes: 15,
    intensityLevel: 'low',
    bestFor: ['low_sleep', 'low_energy', 'recovery'],
    contextFit: ['home', 'hotel'],
    tags: ['alongamento', 'sono', 'noturno'],
  },
  {
    name: 'Pausa Ativa de 5 Minutos',
    description: 'Micro-pausa com movimentos de mobilidade e respiração para recuperar foco entre tarefas',
    techniques: ['rotação de pescoço (5x cada lado)', 'elevação de ombros 5x', 'rotação de tronco 10x', 'extensão de pulsos', '3 respirações profundas'],
    durationMinutes: 5,
    intensityLevel: 'low',
    bestFor: ['continuous_meetings', 'low_energy', 'high_stress'],
    contextFit: ['office', 'home', 'hotel', 'continuous_meetings'],
    tags: ['micro', 'pausa', 'escritorio'],
  },
  {
    name: 'Banho Relaxante com Tensão Progressiva',
    description: 'Banho morno seguido de técnica de relaxamento muscular progressivo de Jacobson',
    techniques: ['banho morno 5-10 min', 'tensão progressiva: pés→panturrilha→coxas→abdômen→mãos→braços→ombros→rosto', 'segurar tensão 5s, relaxar 15s cada grupo'],
    durationMinutes: 20,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'low_sleep', 'recovery'],
    contextFit: ['home', 'hotel'],
    tags: ['relaxamento', 'sono', 'muscular'],
  },
  {
    name: 'Caminhada de Recuperação ao Ar Livre',
    description: 'Caminhada lenta e consciente ao ar livre, focando na respiração e nos sentidos',
    techniques: ['caminhada consciente', 'respiração ritmada (4 passos inspira, 4 expira)', 'atenção aos sons ao redor', 'observação da natureza'],
    durationMinutes: 15,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'low_energy', 'low_sleep'],
    contextFit: ['home', 'travel', 'hotel'],
    tags: ['caminhada', 'natureza', 'mindfulness'],
  },
  {
    name: 'Power Nap 20 Minutos',
    description: 'Soneca curta e estratégica para recuperar energia sem atrapalhar o sono noturno',
    techniques: ['definir alarme para 20 min', 'respiração 4-7-8 para adormecer', 'posição confortável com pés elevados se possível'],
    durationMinutes: 20,
    intensityLevel: 'low',
    bestFor: ['low_energy', 'low_sleep'],
    contextFit: ['home', 'hotel', 'office', 'car'],
    tags: ['soneca', 'energia', 'rapido'],
  },
  {
    name: 'Rotação e Mobilidade de Quadril',
    description: 'Sequência de exercícios de mobilidade de quadril para aliviar tensão de sentar muitas horas',
    techniques: ['rotação de quadril em 4 direções', 'flexão de quadril em pé', 'abertura de quadril (cadeira 90/90)', 'flexão de quadril joelhos ao peito deitado', 'pombo no solo'],
    durationMinutes: 10,
    intensityLevel: 'low',
    bestFor: ['continuous_meetings', 'office', 'travel'],
    contextFit: ['home', 'office', 'hotel'],
    tags: ['mobilidade', 'quadril', 'escritorio'],
  },
  {
    name: 'Descompressão com Bola de Tênis',
    description: 'Auto-massagem com bola de tênis em pontos de tensão: planta do pé, glúteos, costas e pescoço',
    techniques: ['rolar bola na planta do pé 2 min cada', 'pressionar glúteos 2 min cada', 'rolar na lombar 2 min', 'pressionar base do crânio 2 min'],
    durationMinutes: 10,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'recovery', 'continuous_meetings'],
    contextFit: ['home', 'hotel'],
    tags: ['massagem', 'descompressao', 'muscular'],
  },
  {
    name: 'Visualização Criativa com Respiração',
    description: 'Técnica de visualização guiada combinada com respiração para reduzir ansiedade e recuperar clareza mental',
    techniques: ['fechar olhos, 5 respirações profundas', 'visualizar lugar tranquilo e seguro em detalhes', 'engajar todos os 5 sentidos na visualização', 'afirmação positiva silenciosa'],
    durationMinutes: 8,
    intensityLevel: 'low',
    bestFor: ['high_stress', 'low_energy', 'continuous_meetings'],
    contextFit: ['home', 'office', 'hotel', 'airport', 'car'],
    tags: ['visualizacao', 'estresse', 'mental'],
  },
  {
    name: 'Yoga Restaurativa Noturna',
    description: 'Posturas passivas de yoga sustentadas por 2-3 minutos cada para relaxamento profundo antes de dormir',
    techniques: ['postura das pernas na parede (3 min)', 'postura do butterfly reclinado (3 min)', 'torção espinhal suave deitado (2 min cada lado)', 'savasana com respiração (5 min)'],
    durationMinutes: 20,
    intensityLevel: 'low',
    bestFor: ['low_sleep', 'high_stress', 'low_energy'],
    contextFit: ['home', 'hotel'],
    tags: ['yoga', 'sono', 'relaxamento'],
  },
];

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
  getRecommendations(options: {
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
    contextType: string;
    availableMinutes: number;
    recentActivity: boolean;
  }): RecoveryRecommendation[] {
    let candidates = [...RECOVERY_DATABASE];

    if (options.availableMinutes <= 10) {
      candidates = candidates.filter(r => r.durationMinutes <= 10);
    } else if (options.availableMinutes <= 15) {
      candidates = candidates.filter(r => r.durationMinutes <= 15);
    }

    candidates = candidates.filter(r => r.contextFit.includes(options.contextType));

    const scored = candidates.map(recovery => {
      let score = 0;

      if (options.stressLevel >= 4) {
        if (recovery.bestFor.includes('high_stress')) score += 4;
      }

      if (options.sleepQuality <= 2) {
        if (recovery.bestFor.includes('low_sleep')) score += 3;
      }

      if (options.energyLevel <= 2) {
        if (recovery.bestFor.includes('low_energy')) score += 3;
      }

      if (options.contextType === 'continuous_meetings') {
        if (recovery.bestFor.includes('continuous_meetings')) score += 2;
      }

      if (!options.recentActivity && recovery.bestFor.includes('recovery')) {
        score += 1;
      }

      if (recovery.contextFit.includes(options.contextType)) score += 1;

      return { recovery, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 2).map(s => ({
      name: s.recovery.name,
      description: s.recovery.description,
      rationale: this.buildRationale(s.recovery, options),
      techniques: s.recovery.techniques,
      durationMinutes: s.recovery.durationMinutes,
      intensityLevel: s.recovery.intensityLevel,
      tags: s.recovery.tags,
    }));
  }

  private buildRationale(recovery: RecoverySuggestion, options: {
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
  }): string {
    const parts: string[] = [];

    if (options.stressLevel >= 4) {
      parts.push('estresse elevado indica necessidade de técnicas de relaxamento ativo');
    }

    if (options.sleepQuality <= 2) {
      parts.push('qualidade de sono baixa sugere foco em recuperação e preparação para descanso');
    }

    if (options.energyLevel <= 2) {
      parts.push('energia baixa pede técnicas restaurativas em vez de atividade intensa');
    }

    if (parts.length === 0) {
      parts.push('sugestão de recuperação preventiva para manter equilíbrio ao longo do dia');
    }

    return parts.join('. ') + '.';
  }
}
