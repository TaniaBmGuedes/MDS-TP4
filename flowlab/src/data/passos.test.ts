import { describe, expect, it } from 'vitest';
import { PASSOS, indicePorAncora, textoProgresso, vizinhos } from './passos';

describe('indicePorAncora', () => {
  it('encontra o passo pela âncora, com ou sem #', () => {
    expect(indicePorAncora('#simular')).toBe(0);
    expect(indicePorAncora('metricas')).toBe(3);
  });

  it('devolve null para âncoras vazias ou desconhecidas', () => {
    expect(indicePorAncora('')).toBeNull();
    expect(indicePorAncora('#app')).toBeNull();
  });
});

describe('textoProgresso', () => {
  it('diz o passo, o total e o tempo que falta', () => {
    expect(textoProgresso(0)).toBe(`Passo 1 de ${PASSOS.length} · faltam ~10 min`);
    expect(textoProgresso(PASSOS.length - 1)).toBe(`Passo ${PASSOS.length} de ${PASSOS.length} · faltam ~1 min`);
  });
});

describe('vizinhos', () => {
  it('o primeiro passo não tem anterior e o último não tem seguinte', () => {
    expect(vizinhos(0).anterior).toBeNull();
    expect(vizinhos(0).seguinte).toBe(PASSOS[1]);
    expect(vizinhos(PASSOS.length - 1).seguinte).toBeNull();
    expect(vizinhos(PASSOS.length - 1).anterior).toBe(PASSOS[PASSOS.length - 2]);
  });

  it('um passo do meio tem os dois vizinhos pela ordem do percurso', () => {
    expect(vizinhos(1)).toEqual({ anterior: PASSOS[0], seguinte: PASSOS[2] });
  });
});
