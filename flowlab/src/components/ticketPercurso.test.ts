import { describe, expect, it } from 'vitest';
import { CAMINHO, estadoDoPasso, posicaoHorizontal } from './ticketPercurso';

describe('estadoDoPasso', () => {
  it('começa em Backlog e acaba em Concluído com 6 passos', () => {
    expect([0, 1, 2, 3, 4, 5].map((p) => estadoDoPasso(p, 6))).toEqual([
      'Backlog', 'A fazer', 'Em curso', 'Em revisão', 'Em teste', 'Concluído',
    ]);
  });

  it('o último passo é sempre Concluído, mesmo com menos passos', () => {
    expect(estadoDoPasso(3, 4)).toBe('Concluído');
    expect(estadoDoPasso(2, 4)).toBe('Em curso');
  });

  it('com mais passos do que estados, os do meio ficam em Em teste', () => {
    expect(estadoDoPasso(6, 8)).toBe('Em teste');
    expect(estadoDoPasso(7, 8)).toBe('Concluído');
  });
});

describe('posicaoHorizontal', () => {
  it('passa pela direita, pelo meio e pela esquerda, um ponto por passo', () => {
    expect([0, 1, 2, 3, 4, 5].map(posicaoHorizontal)).toEqual([...CAMINHO]);
  });

  it('entre dois passos fica a meio caminho', () => {
    expect(posicaoHorizontal(0.5)).toBeCloseTo(0.75);
    expect(posicaoHorizontal(1.5)).toBeCloseTo(0.25);
  });

  it('fica sempre entre a esquerda e a direita', () => {
    for (let p = -1; p <= 12; p += 0.25) {
      const x = posicaoHorizontal(p);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
    }
  });
});
