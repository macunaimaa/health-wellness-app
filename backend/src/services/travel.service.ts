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
  getTravelMeals(contextType: string, dietaryRestrictions: string[]): TravelMealOption[] {
    const allOptions: Record<string, TravelMealOption[]> = {
      airport: [
        {
          name: 'Wrap de frango na cafeteria',
          description: 'Wrap integral com frango grelhado e salada, disponível na maioria dos aeroportos',
          where: 'Cafeterias e quiosques de alimentação',
          rationale: 'Opção portátil e equilibrada, fácil de encontrar em aeroportos',
        },
        {
          name: 'Mix de castanhas e frutas da banca',
          description: 'Pacote de mix de castanhas com frutas secas ou frescas da banca de conveniência',
          where: 'Lojas de conveniência e bancas',
          rationale: 'Snack rápido e nutritivo para comer entre voos',
        },
        {
          name: 'Iogurte com granola do café',
          description: 'Iogurte natural com granola e frutas frescas, disponível em cafeterias de aeroporto',
          where: 'Cafeterias (Starbucks, Copa Café, etc.)',
          rationale: 'Refeição leve e proteica para manter energia durante espera',
        },
        {
          name: 'Salada com proteína no restaurante',
          description: 'Salada verde com frango grelhado ou atum, pedir molho à parte',
          where: 'Restaurantes do terminal',
          rationale: 'Opção completa e balanceada quando há mais tempo entre conexões',
        },
      ],
      hotel: [
        {
          name: 'Café da manhã do hotel',
          description: 'Priorize ovos, frutas, iogurte e pão integral. Evite doces e frituras pesadas',
          where: 'Restaurante do hotel',
          rationale: 'Aproveite o café incluído escolhendo opções nutritivas',
        },
        {
          name: 'Room service fitness',
          description: 'Peça peito de frango grelhado com legumes e arroz integral, ou salada Caesar',
          where: 'Room service',
          rationale: 'Muitos hotéis têm menu fitness ou podem adaptar pratos',
        },
        {
          name: 'Restaurante próximo ao hotel',
          description: 'Busque restaurantes com opções grelhadas e saladas. Evite fast food e buffets livres',
          where: 'Arredores do hotel',
          rationale: 'Refeição mais variada e controlada fora do hotel',
        },
        {
          name: 'Lanche prático do minibar ou conveniência',
          description: 'Castanhas, iogurte, barras de cereais integrais e água',
          where: 'Minibar ou loja de conveniência próxima',
          rationale: 'Opções rápidas para lanches intermediários sem sair do hotel',
        },
      ],
      travel: [
        {
          name: 'Marmita térmica preparada antes',
          description: 'Frango grelhado com arroz integral e legumes em recipiente térmico',
          where: 'Preparada em casa/hotel',
          rationale: 'Controle total sobre ingredientes e porções durante a viagem',
        },
        {
          name: 'Lanche natural em padaria',
          description: 'Sanduíche integral de frango ou atum em padarias e lanchonetes de estrada',
          where: 'Padarias e postos de combustível',
          rationale: 'Opção prática para viagens de carro ou ônibus',
        },
        {
          name: 'Frutas e castanhas da estrada',
          description: 'Banana, maçã, mix de castanhas e água comprados em paradas',
          where: 'Paradas de estrada e feiras',
          rationale: 'Alimentos naturais e nutritivos para manter energia na estrada',
        },
      ],
    };

    const options = allOptions[contextType] || allOptions['travel'];

    return options.filter(opt => {
      if (dietaryRestrictions.includes('lactose_intolerant') && opt.name.toLowerCase().includes('iogurte')) return false;
      if (dietaryRestrictions.includes('frutos_do_mar') && opt.name.toLowerCase().includes('atum')) return false;
      return true;
    });
  }

  getTravelTips(contextType: string): TravelTip[] {
    const allTips: Record<string, TravelTip[]> = {
      airport: [
        {
          category: 'movimento',
          tip: 'Caminhe entre os portões em vez de usar esteiras rolantes',
          rationale: 'Acumule passos e melhore circulação durante espera no aeroporto',
        },
        {
          category: 'hidratacao',
          tip: 'Beba 250ml de água a cada hora de espera no aeroporto',
          rationale: 'Ar condicionado do aeroporto desidrata, mantenha garrafa sempre cheia',
        },
        {
          category: 'alongamento',
          tip: 'Alongamento em pé: panturrilha, quadríceps e pescoço no portão de embarque',
          rationale: 'Previne rigidez muscular antes e entre voos longos',
        },
      ],
      hotel: [
        {
          category: 'exercicio',
          tip: 'Use a academia do hotel pela manhã antes do café da manhã',
          rationale: 'Exercício em jejum moderado queima gordura e energia para o dia',
        },
        {
          category: 'recuperacao',
          tip: 'Banho quente seguido de alongamento leve antes de dormir',
          rationale: 'Relaxa musculatura e melhora qualidade do sono em ambiente diferente',
        },
        {
          category: 'alimentacao',
          tip: 'Escolha pratos grelhados e evite frituras no jantar de negócios',
          rationale: 'Refeições leves à noite melhoram sono e disposição no dia seguinte',
        },
      ],
      travel: [
        {
          category: 'movimento',
          tip: 'Pare a cada 2 horas para caminhar 5 minutos',
          rationale: 'Evita rigidez e melhora circulação em viagens longas de carro',
        },
        {
          category: 'alimentacao',
          tip: 'Faça lanches a cada 3 horas em vez de refeições pesadas',
          rationale: 'Mantém energia estável e evita sonolência ao volante',
        },
        {
          category: 'hidratacao',
          tip: 'Beba água regularmente, evite refrigerante e álcool durante a viagem',
          rationale: 'Hidratação adequada previne fadiga e melhora concentração',
        },
      ],
    };

    return allTips[contextType] || allTips['travel'];
  }

  isTravelContext(contextType: string): boolean {
    return ['airport', 'hotel', 'travel', 'car'].includes(contextType);
  }
}
