import { describe, expect, it } from 'vitest';
import { afastarRotulos } from './rotulos';

describe('afastarRotulos', () => {
  it('não mexe em rótulos que já estão afastados', () => {
    expect(afastarRotulos([10, 50, 90], 16, 0, 200)).toEqual([10, 50, 90]);
  });

  it('afasta rótulos sobrepostos, mantendo a ordem', () => {
    const y = afastarRotulos([40, 44, 120], 16, 0, 200);
    expect(y[1] - y[0]).toBeGreaterThanOrEqual(16);
    expect(y[2]).toBe(120);
  });

  it('fica dentro dos limites, empurrando para cima se passar do fundo', () => {
    const y = afastarRotulos([190, 195, 198], 16, 0, 200);
    expect(y[2]).toBe(200);
    expect(y[1]).toBe(184);
    expect(y[0]).toBe(168);
  });
});
