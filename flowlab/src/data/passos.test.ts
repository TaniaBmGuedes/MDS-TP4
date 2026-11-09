import { describe, expect, it } from 'vitest';
import { PASSOS, indicePorAncora, textoProgresso } from './passos';

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
