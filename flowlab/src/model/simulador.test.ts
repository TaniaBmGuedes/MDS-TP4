import { describe, expect, it } from 'vitest';
import { EQUIPA_INICIAL } from '../data/simulacao';
import { calcularThroughput, simular } from './simulador';

describe('calcularThroughput', () => {
  it('cresce com o WIP enquanto há pessoas livres', () => {
    expect(calcularThroughput(2, EQUIPA_INICIAL)).toBe(1);
    expect(calcularThroughput(4, EQUIPA_INICIAL)).toBe(2);
  });

  it('desce quando há mais tarefas a meio do que pessoas', () => {
    expect(calcularThroughput(12, EQUIPA_INICIAL)).toBeLessThan(calcularThroughput(4, EQUIPA_INICIAL));
  });
});

describe('simular', () => {
  it('não perde tarefas: tudo o que entra está na fila, a meio ou feito', () => {
    const r = simular(4, EQUIPA_INICIAL);
    const total = EQUIPA_INICIAL.filaInicial + EQUIPA_INICIAL.chegadasPorDia * EQUIPA_INICIAL.dias;
    expect(r.fila + r.meio + r.feitas).toBeCloseTo(total);
  });

  it('gera uma entrada por dia, mais o estado inicial', () => {
    const r = simular(4, EQUIPA_INICIAL);
    expect(r.entradas).toHaveLength(EQUIPA_INICIAL.dias + 1);
    expect(r.comecadas).toHaveLength(EQUIPA_INICIAL.dias + 1);
    expect(r.acabadas).toHaveLength(EQUIPA_INICIAL.dias + 1);
  });

  it('mantém as bandas do gráfico cumulativo na ordem certa', () => {
    const r = simular(12, EQUIPA_INICIAL);
    r.entradas.forEach((entrada, dia) => {
      expect(entrada).toBeGreaterThanOrEqual(r.comecadas[dia]!);
      expect(r.comecadas[dia]!).toBeGreaterThanOrEqual(r.acabadas[dia]!);
    });
  });

  it('tem o lead time mais baixo com uma tarefa por pessoa', () => {
    const melhor = simular(EQUIPA_INICIAL.pessoas, EQUIPA_INICIAL).leadTime;
    for (let wip = 1; wip <= 12; wip++) {
      expect(simular(wip, EQUIPA_INICIAL).leadTime).toBeGreaterThanOrEqual(melhor);
    }
  });

  it('o cycle time nunca é maior do que o lead time', () => {
    for (let wip = 1; wip <= 12; wip++) {
      const r = simular(wip, EQUIPA_INICIAL);
      expect(r.cycleTime).toBeLessThanOrEqual(r.leadTime);
    }
  });
});
