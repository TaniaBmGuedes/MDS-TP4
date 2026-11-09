import { describe, expect, it } from 'vitest';
import { calcularEquipa, diferenca } from './equipa';

const inicial = calcularEquipa({ pessoas: 2, wip: 4 });

describe('calcularEquipa', () => {
  it('teste de referência: 4 pessoas e WIP 4 dão ~1,8 por dia e ~2,3 dias', () => {
    const r = calcularEquipa({ pessoas: 4, wip: 4 });
    expect(r.throughput).toBeCloseTo(1.76, 2);
    expect(r.leadTime).toBeCloseTo(2.27, 2);
    expect(diferenca(r.throughput, inicial.throughput, true).percentagem).toBe(118);
    expect(diferenca(r.leadTime, inicial.leadTime, false).percentagem).toBe(-54);
  });

  it('a lei de Little bate certo: lead time = WIP ÷ throughput', () => {
    for (let pessoas = 1; pessoas <= 6; pessoas++) {
      for (let wip = 1; wip <= 12; wip++) {
        const r = calcularEquipa({ pessoas, wip });
        expect(r.leadTime).toBeCloseTo(wip / r.throughput, 10);
      }
    }
  });

  it('mais WIP com as mesmas pessoas nunca baixa o lead time', () => {
    for (let pessoas = 1; pessoas <= 6; pessoas++) {
      for (let wip = 1; wip < 12; wip++) {
        const antes = calcularEquipa({ pessoas, wip }).leadTime;
        const depois = calcularEquipa({ pessoas, wip: wip + 1 }).leadTime;
        expect(depois).toBeGreaterThanOrEqual(antes - 1e-9);
      }
    }
  });

  it('com WIP igual ou menor que as pessoas, ninguém salta entre tarefas', () => {
    expect(calcularEquipa({ pessoas: 2, wip: 2 }).throughput).toBeCloseTo(0.96, 2);
    expect(calcularEquipa({ pessoas: 2, wip: 1 }).throughput).toBeCloseTo(0.48, 2);
  });

  it('o foco não cai abaixo de metade, por muito WIP que haja', () => {
    const r = calcularEquipa({ pessoas: 2, wip: 12 });
    expect(r.throughput).toBeCloseTo(2 * 0.5 * 0.5 * 0.96, 5);
  });

  it('rejeita equipas ou WIP inválidos', () => {
    expect(() => calcularEquipa({ pessoas: 0, wip: 4 })).toThrow(RangeError);
    expect(() => calcularEquipa({ pessoas: 2, wip: 0 })).toThrow(RangeError);
    expect(() => calcularEquipa({ pessoas: 2, wip: 2.5 })).toThrow(RangeError);
  });
});

describe('diferenca', () => {
  it('diz se a mudança é melhor ou pior, conforme a métrica', () => {
    expect(diferenca(1.2, 1, true)).toEqual({ percentagem: 20, melhor: true });
    expect(diferenca(1.2, 1, false)).toEqual({ percentagem: 20, melhor: false });
    expect(diferenca(0.5, 1, false)).toEqual({ percentagem: -50, melhor: true });
  });

  it('sem diferença não há melhor nem pior', () => {
    expect(diferenca(2, 2, true)).toEqual({ percentagem: 0, melhor: null });
    expect(diferenca(2.001, 2, false)).toEqual({ percentagem: 0, melhor: null });
  });
});
