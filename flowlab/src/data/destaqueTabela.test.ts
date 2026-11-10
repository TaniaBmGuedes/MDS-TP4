import { describe, expect, it } from 'vitest';
import { celulasDestacadas, estaDestacada } from './destaqueTabela';

describe('celulasDestacadas', () => {
  it('sem destaque ou com fluxo estável não marca nada', () => {
    expect(celulasDestacadas(null, 15)).toEqual([]);
    expect(celulasDestacadas({ tipo: 'estavel', de: 1, ate: 15 }, 15)).toEqual([]);
  });

  it('regra 1 (altura): a banda «Em curso» no dia medido', () => {
    expect(celulasDestacadas({ tipo: 'altura', dia: 15, valor: 4 }, 15)).toEqual([{ dia: 15, banda: 'emCurso' }]);
  });

  it('regra 2 (horizontal): as linhas de entrada e de saída, com a saída arredondada', () => {
    expect(celulasDestacadas({ tipo: 'horizontal', diaEntrada: 3, nivel: 12, diaSaida: 7.6 }, 15)).toEqual([
      { dia: 3, banda: null },
      { dia: 8, banda: null },
    ]);
  });

  it('regra 2 sem saída (as tarefas ainda não acabaram): só a linha de entrada', () => {
    expect(celulasDestacadas({ tipo: 'horizontal', diaEntrada: 3, nivel: 12, diaSaida: null }, 15)).toEqual([{ dia: 3, banda: null }]);
  });

  it('regra 3 (alargar): a banda que alarga no primeiro e no último dia', () => {
    expect(celulasDestacadas({ tipo: 'alargar', banda: 'aFazer', de: 1, ate: 15, inicio: 2, fim: 20 }, 15)).toEqual([
      { dia: 1, banda: 'aFazer' },
      { dia: 15, banda: 'aFazer' },
    ]);
  });
});

describe('estaDestacada', () => {
  const celulas = celulasDestacadas({ tipo: 'horizontal', diaEntrada: 3, nivel: 12, diaSaida: 8 }, 15);

  it('uma linha inteira marca todas as bandas desse dia', () => {
    expect(estaDestacada(celulas, 3, 'aFazer')).toBe(true);
    expect(estaDestacada(celulas, 8, 'feito')).toBe(true);
  });

  it('não marca outros dias', () => {
    expect(estaDestacada(celulas, 4, 'emCurso')).toBe(false);
  });
});
