interface MealSuggestion {
  name: string;
  description: string;
  tags: string[];
  dietaryFlags: string[];
  restrictedBy: string[];
  contextFit: string[];
  prepMinutes: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const MEAL_DATABASE: MealSuggestion[] = [
  {
    name: 'Bowl Mediterrâneo de Atum',
    description: 'Atum grelhado com quinoa, tomate-cereja, pepino, azeitonas pretas, cebola roxa e azeite extra virgem',
    tags: ['almoco', 'jantar', 'proteina', 'peixe', 'mediterranea'],
    dietaryFlags: ['high_protein', 'mediterranean', 'sem_gluten'],
    restrictedBy: ['pesces', 'seafood'],
    contextFit: ['office', 'home', 'hotel'],
    prepMinutes: 15,
    calories: 520,
    proteinG: 42,
    carbsG: 45,
    fatG: 18,
  },
  {
    name: 'Omelete de Espinafre e Cottage',
    description: 'Omelete de 3 claras e 1 gema com espinafre salteado, queijo cottage e tomate picado',
    tags: ['cafe_manha', 'proteina', 'rapido', 'ovo'],
    dietaryFlags: ['high_protein', 'low_carb', 'sem_gluten'],
    restrictedBy: ['ovos', 'lactose_intolerant'],
    contextFit: ['home', 'hotel', 'office'],
    prepMinutes: 8,
    calories: 320,
    proteinG: 28,
    carbsG: 6,
    fatG: 20,
  },
  {
    name: 'Wrap Integral de Frango com Abacate',
    description: 'Tortilha integral com peito de frango grelhado, abacate fatiado, rúcula, cenoura ralada e molho de mostarda e mel',
    tags: ['almoco', 'rapido', 'portatil', 'frango'],
    dietaryFlags: ['high_protein', 'balanced'],
    restrictedBy: ['gluten'],
    contextFit: ['office', 'travel', 'airport', 'hotel'],
    prepMinutes: 10,
    calories: 480,
    proteinG: 35,
    carbsG: 38,
    fatG: 22,
  },
  {
    name: 'Smoothie Verde Proteico',
    description: 'Banana, espinafre, whey protein, pasta de amendoim, leite de amêndoas e chia',
    tags: ['cafe_manha', 'rapido', 'liquido', 'snack'],
    dietaryFlags: ['high_protein', 'sem_lactose_opcao'],
    restrictedBy: ['amendoim', 'nozes'],
    contextFit: ['home', 'hotel', 'office', 'airport', 'travel', 'car'],
    prepMinutes: 5,
    calories: 380,
    proteinG: 30,
    carbsG: 40,
    fatG: 14,
  },
  {
    name: 'Salmão Grelhado com Legumes Assados',
    description: 'Filé de salmão com crosta de ervas, brócolis, abobrinha e batata-doce assados',
    tags: ['jantar', 'proteina', 'peixe', 'premium'],
    dietaryFlags: ['high_protein', 'omega3', 'sem_gluten', 'mediterranean'],
    restrictedBy: ['peixes', 'seafood'],
    contextFit: ['home', 'hotel'],
    prepMinutes: 30,
    calories: 580,
    proteinG: 40,
    carbsG: 35,
    fatG: 28,
  },
  {
    name: 'Salada Caesar com Frango',
    description: 'Alface romana, peito de frango grelhado, croutons integrais, parmesão e molho caesar light',
    tags: ['almoco', 'salada', 'proteina', 'leve'],
    dietaryFlags: ['high_protein', 'low_carb'],
    restrictedBy: ['gluten', 'lactose_intolerant'],
    contextFit: ['office', 'home', 'hotel', 'restaurant'],
    prepMinutes: 10,
    calories: 420,
    proteinG: 38,
    carbsG: 18,
    fatG: 22,
  },
  {
    name: 'Overnight Oats com Frutas Vermelhas',
    description: 'Aveia demolhada no leite de amêndoas com chia, mel, frutas vermelhas e granola',
    tags: ['cafe_manha', 'prep_anterior', 'fibra'],
    dietaryFlags: ['high_fiber', 'vegetarian', 'sem_lactose_opcao'],
    restrictedBy: ['gluten', 'aveia'],
    contextFit: ['home', 'hotel', 'office', 'travel'],
    prepMinutes: 5,
    calories: 380,
    proteinG: 14,
    carbsG: 55,
    fatG: 12,
  },
  {
    name: 'Frango Xadrez com Arroz Integral',
    description: 'Frango em cubos com pimentão, brócolis, cenoura e molho de soja light, servido com arroz integral',
    tags: ['almoco', 'jantar', 'proteina', 'asiatica'],
    dietaryFlags: ['high_protein', 'balanced'],
    restrictedBy: ['soja'],
    contextFit: ['home', 'hotel'],
    prepMinutes: 25,
    calories: 520,
    proteinG: 38,
    carbsG: 52,
    fatG: 14,
  },
  {
    name: 'Tosta de Abacate com Ovo Poché',
    description: 'Pão integral tostado com abacate amassado, ovo pochê, flocos de pimenta e microverdes',
    tags: ['cafe_manha', 'almoco', 'rapido'],
    dietaryFlags: ['balanced', 'vegetarian'],
    restrictedBy: ['gluten', 'ovos'],
    contextFit: ['home', 'hotel', 'office'],
    prepMinutes: 10,
    calories: 420,
    proteinG: 18,
    carbsG: 35,
    fatG: 26,
  },
  {
    name: 'Sopa de Lentilha com Legumes',
    description: 'Sopa cremosa de lentilhas com cenoura, cebola, alho, cominho e azeite',
    tags: ['jantar', 'conforto', 'fibra', 'vegetariano'],
    dietaryFlags: ['high_fiber', 'high_protein', 'vegetarian', 'sem_gluten', 'vegano'],
    restrictedBy: [],
    contextFit: ['home', 'hotel'],
    prepMinutes: 35,
    calories: 340,
    proteinG: 20,
    carbsG: 45,
    fatG: 8,
  },
  {
    name: 'Barraca de Proteina Caseira',
    description: 'Barra energética feita com aveia, whey protein, pasta de amendoim, mel e frutas secas',
    tags: ['snack', 'portatil', 'prep_anterior'],
    dietaryFlags: ['high_protein', 'high_fiber'],
    restrictedBy: ['gluten', 'amendoim', 'nozes'],
    contextFit: ['airport', 'travel', 'car', 'office', 'hotel'],
    prepMinutes: 5,
    calories: 280,
    proteinG: 20,
    carbsG: 30,
    fatG: 10,
  },
  {
    name: 'Bowl de Quinoa com Grão-de-Bico',
    description: 'Quinoa com grão-de-bico assado, vegetais grelhados, tahine e limão',
    tags: ['almoco', 'vegetariano', 'fibra'],
    dietaryFlags: ['high_protein', 'high_fiber', 'vegetarian', 'vegano', 'sem_gluten'],
    restrictedBy: [],
    contextFit: ['home', 'office', 'hotel'],
    prepMinutes: 20,
    calories: 460,
    proteinG: 22,
    carbsG: 58,
    fatG: 16,
  },
  {
    name: 'Crepioca com Frango Desfiado',
    description: 'Crepe de goma de tapioca recheado com frango desfiado, queijo minas e tomate',
    tags: ['cafe_manha', 'almoco', 'rapido', 'proteina'],
    dietaryFlags: ['sem_gluten', 'high_protein'],
    restrictedBy: ['lactose_intolerant'],
    contextFit: ['home', 'hotel'],
    prepMinutes: 10,
    calories: 380,
    proteinG: 32,
    carbsG: 28,
    fatG: 14,
  },
  {
    name: 'Mix de Castanhas e Frutas Secas',
    description: 'Porção de mix de castanhas (caju, pará, amêndoas) com damasco e uva-passa',
    tags: ['snack', 'portatil', 'rapido'],
    dietaryFlags: ['high_fiber', 'vegano'],
    restrictedBy: ['nozes', 'castanhas'],
    contextFit: ['airport', 'travel', 'car', 'office', 'hotel', 'continuous_meetings'],
    prepMinutes: 0,
    calories: 250,
    proteinG: 8,
    carbsG: 22,
    fatG: 16,
  },
  {
    name: 'Iogurte Grego com Granola e Mel',
    description: 'Iogurte grego natural com granola artesanal, mel e blueberries',
    tags: ['cafe_manha', 'snack', 'rapido'],
    dietaryFlags: ['high_protein', 'probioticos'],
    restrictedBy: ['lactose_intolerant'],
    contextFit: ['home', 'hotel', 'office'],
    prepMinutes: 3,
    calories: 340,
    proteinG: 22,
    carbsG: 40,
    fatG: 10,
  },
  {
    name: 'Sanduíche de Pão Sueco com Peru e Ricota',
    description: 'Pão sueco integral com peito de peru, ricota temperada, alface e tomate',
    tags: ['almoco', 'rapido', 'portatil'],
    dietaryFlags: ['high_protein', 'low_fat'],
    restrictedBy: ['gluten', 'lactose_intolerant'],
    contextFit: ['office', 'travel', 'airport', 'car'],
    prepMinutes: 5,
    calories: 320,
    proteinG: 28,
    carbsG: 32,
    fatG: 8,
  },
  {
    name: 'Patê de Atum com Biscottes',
    description: 'Patê de atum com iogurte natural, ervas e limão servido com biscottes integrais',
    tags: ['snack', 'rapido', 'portatil'],
    dietaryFlags: ['high_protein', 'sem_gluten_opcao'],
    restrictedBy: ['peixes', 'gluten'],
    contextFit: ['office', 'hotel', 'travel', 'continuous_meetings'],
    prepMinutes: 5,
    calories: 280,
    proteinG: 22,
    carbsG: 24,
    fatG: 12,
  },
  {
    name: 'Arroz de Forno com Legumes e Ovo',
    description: 'Arroz integral refogado com legumes variados, ovo frito e molho de pimenta',
    tags: ['jantar', 'conforto', 'rapido'],
    dietaryFlags: ['balanced', 'vegetarian'],
    restrictedBy: ['ovos'],
    contextFit: ['home', 'hotel'],
    prepMinutes: 15,
    calories: 440,
    proteinG: 16,
    carbsG: 55,
    fatG: 16,
  },
  {
    name: 'Salada de Frango com Manga e Abacate',
    description: 'Mix de folhas com frango grelhado, manga em cubos, abacate, amêndoas e molho de maracujá',
    tags: ['almoco', 'salada', 'tropical', 'leve'],
    dietaryFlags: ['high_protein', 'sem_gluten'],
    restrictedBy: ['nozes'],
    contextFit: ['home', 'office', 'hotel'],
    prepMinutes: 12,
    calories: 450,
    proteinG: 35,
    carbsG: 30,
    fatG: 22,
  },
  {
    name: 'Bolinho Fit de Batata-Doce e Frango',
    description: 'Bolinhos de batata-doce amassada com frango desfiado, aveia e temperos, assados no forno',
    tags: ['snack', 'almoco', 'prep_anterior'],
    dietaryFlags: ['high_protein', 'sem_gluten_opcao'],
    restrictedBy: [],
    contextFit: ['home', 'office', 'travel'],
    prepMinutes: 30,
    calories: 220,
    proteinG: 18,
    carbsG: 22,
    fatG: 6,
  },
  {
    name: 'Caldo Verde Fit',
    description: 'Caldo de couve com batata, frango desfiado e azeite, versão leve e proteica',
    tags: ['jantar', 'conforto', 'brasileira', 'leve'],
    dietaryFlags: ['high_protein', 'sem_gluten'],
    restrictedBy: [],
    contextFit: ['home', 'hotel'],
    prepMinutes: 25,
    calories: 320,
    proteinG: 28,
    carbsG: 30,
    fatG: 8,
  },
  {
    name: 'Tapioca Recheada com Queijo e Presunto de Peru',
    description: 'Tapioca crocante com queijo muçarela light e presunto de peru, com tomate e orégano',
    tags: ['cafe_manha', 'almoco', 'rapido'],
    dietaryFlags: ['sem_gluten', 'high_protein'],
    restrictedBy: ['lactose_intolerant'],
    contextFit: ['home', 'hotel', 'office'],
    prepMinutes: 8,
    calories: 360,
    proteinG: 26,
    carbsG: 30,
    fatG: 14,
  },
];

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
  getRecommendations(options: {
    contextType: string;
    availableMinutes: number;
    energyLevel: number;
    dietaryPreferences: string[];
    dietaryRestrictions: string[];
    mealWindow?: string;
    equipment: string[];
  }): MealRecommendation[] {
    let candidates = [...MEAL_DATABASE];

    candidates = candidates.filter(m =>
      !m.restrictedBy.some(r =>
        options.dietaryRestrictions.some(d => d.toLowerCase().includes(r.toLowerCase()))
      )
    );

    if (options.contextType === 'airport' || options.contextType === 'car') {
      candidates = candidates.filter(m =>
        m.contextFit.includes(options.contextType) || m.tags.includes('portatil')
      );
    }

    if (options.availableMinutes <= 10) {
      candidates = candidates.filter(m => m.prepMinutes <= 10);
    } else if (options.availableMinutes <= 20) {
      candidates = candidates.filter(m => m.prepMinutes <= 20);
    }

    const scored = candidates.map(meal => {
      let score = 0;

      if (options.dietaryPreferences.some(p => meal.dietaryFlags.includes(p))) {
        score += 3;
      }

      if (meal.contextFit.includes(options.contextType)) {
        score += 2;
      }

      if (options.energyLevel <= 2) {
        if (meal.calories < 400) score += 1;
        if (meal.tags.includes('leve')) score += 1;
      } else if (options.energyLevel >= 4) {
        if (meal.proteinG >= 30) score += 1;
      }

      if (options.mealWindow === 'cafe_manha' && meal.tags.includes('cafe_manha')) score += 3;
      if (options.mealWindow === 'almoco' && meal.tags.includes('almoco')) score += 3;
      if (options.mealWindow === 'jantar' && meal.tags.includes('jantar')) score += 3;
      if (options.mealWindow === 'snack' && meal.tags.includes('snack')) score += 3;

      if (options.equipment.length === 0 && meal.prepMinutes <= 10) score += 1;

      return { meal, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map(s => ({
      name: s.meal.name,
      description: s.meal.description,
      rationale: this.buildRationale(s.meal, options),
      prepMinutes: s.meal.prepMinutes,
      calories: s.meal.calories,
      proteinG: s.meal.proteinG,
      carbsG: s.meal.carbsG,
      fatG: s.meal.fatG,
      intensityLevel: s.meal.calories > 500 ? 'high' : s.meal.calories > 350 ? 'moderate' : 'low',
      tags: s.meal.tags,
    }));
  }

  private buildRationale(meal: MealSuggestion, options: { contextType: string; energyLevel: number; availableMinutes: number }): string {
    const parts: string[] = [];
    parts.push(`Refeição com ${meal.proteinG}g de proteína em ${meal.prepMinutes} min de preparo`);

    if (options.contextType === 'travel' || options.contextType === 'airport') {
      parts.push('opção prática para viagem');
    } else if (options.contextType === 'office') {
      parts.push('ideal para o ambiente de trabalho');
    }

    if (options.energyLevel <= 2) {
      parts.push('opção leve para baixa energia');
    } else if (options.energyLevel >= 4) {
      parts.push('refeição nutritiva para manter a energia alta');
    }

    return parts.join(', ') + '.';
  }
}
