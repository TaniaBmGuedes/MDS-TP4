import { describe, expect, it } from 'vitest';
import { PASSOS, indicePorAncora, passosVizinhos, textoProgresso } from './passos';

describe('indicePorAncora', () => {
  it('encontra o passo pela âncora, com ou sem #', () => {
    expect(indicePorAncora('#inicio')).toBe(0);
    expect(indicePorAncora('#simular')).toBe(1);
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

describe('passosVizinhos (H24)', () => {
  it('o primeiro passo só tem seguinte', () => {
    expect(passosVizinhos(0)).toEqual({ anterior: null, seguinte: 1 });
  });

  it('um passo do meio tem anterior e seguinte', () => {
    expect(passosVizinhos(2)).toEqual({ anterior: 1, seguinte: 3 });
  });

  it('o último passo só tem anterior', () => {
    const ultimo = PASSOS.length - 1;
    expect(passosVizinhos(ultimo)).toEqual({ anterior: ultimo - 1, seguinte: null });
  });

  it('recusa índices fora do percurso', () => {
    expect(() => passosVizinhos(-1)).toThrow(RangeError);
    expect(() => passosVizinhos(PASSOS.length)).toThrow(RangeError);
    expect(() => passosVizinhos(1.5)).toThrow(RangeError);
  });
});
