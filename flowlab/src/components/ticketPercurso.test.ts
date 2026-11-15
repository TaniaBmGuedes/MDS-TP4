import { describe, expect, it } from 'vitest';
import { estadoDoPasso, ladoDoPasso, ladoNaLinha } from './ticketPercurso';

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

describe('ladoNaLinha', () => {
  // Três passos seguidos, com um intervalo de 100 px entre o 2.º e o 3.º.
  const passos = [{ top: 0, bottom: 500 }, { top: 500, bottom: 1000 }, { top: 1100, bottom: 1600 }];

  it('os passos alternam: direita, esquerda, direita, …', () => {
    expect([0, 1, 2, 3].map(ladoDoPasso)).toEqual([1, 0, 1, 0]);
  });

  it('dentro de um passo, o cartão fica do lado desse passo', () => {
    expect(ladoNaLinha(passos, 250)).toBe(1);
    expect(ladoNaLinha(passos, 700)).toBe(0);
    expect(ladoNaLinha(passos, 1300)).toBe(1);
  });

  it('num intervalo entre passos, fica a meio caminho', () => {
    expect(ladoNaLinha(passos, 1050)).toBeCloseTo(0.5);
  });

  it('antes do primeiro e depois do último passo, fica do lado deles', () => {
    expect(ladoNaLinha(passos, -50)).toBe(1);
    expect(ladoNaLinha(passos, 2000)).toBe(1);
    expect(ladoNaLinha([], 10)).toBe(1);
  });
});
