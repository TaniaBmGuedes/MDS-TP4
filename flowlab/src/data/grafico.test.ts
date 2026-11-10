import { describe, expect, it } from 'vitest';
import { simular } from '../model/simulador';
import { REGRAS, TEXTOS, WIP_SLIDER_MAX, WIP_SLIDER_MIN } from './grafico';
import { EQUIPA_INICIAL } from './simulacao';

const wips = Array.from({ length: WIP_SLIDER_MAX - WIP_SLIDER_MIN + 1 }, (_, i) => WIP_SLIDER_MIN + i);

describe('regras de leitura', () => {
  it('são as 3 do ticket, numeradas por ordem', () => {
    expect(REGRAS.map((r) => r.id)).toEqual(['altura', 'horizontal', 'alargar']);
    expect(REGRAS.map((r) => r.numero)).toEqual([1, 2, 3]);
  });

  it('cada regra tem um texto com números para qualquer valor do slider', () => {
    for (const wip of wips) {
      const s = simular(wip, EQUIPA_INICIAL);
      for (const r of REGRAS) {
        const texto = r.explicar(r.destaque(s));
        expect(texto.length, `${r.id} com WIP ${wip}`).toBeGreaterThan(20);
        expect(texto).not.toMatch(/NaN|undefined|Infinity/);
      }
    }
  });

  it('a regra da altura mostra o WIP do último dia', () => {
    const d = REGRAS[0].destaque(simular(4, EQUIPA_INICIAL));
    expect(d).toMatchObject({ tipo: 'altura', dia: EQUIPA_INICIAL.dias, valor: 4 });
  });

  it('a regra da banda a alargar dá alerta com WIP 12 e fluxo estável com WIP 4', () => {
    expect(REGRAS[2].destaque(simular(12, EQUIPA_INICIAL)).tipo).toBe('alargar');
    expect(REGRAS[2].destaque(simular(4, EQUIPA_INICIAL)).tipo).toBe('estavel');
  });
});

describe('texto alternativo do gráfico', () => {
  it('diz o limite de WIP e aponta para a tabela', () => {
    const texto = TEXTOS.descricao(simular(12, EQUIPA_INICIAL), 12);
    expect(texto).toContain('limite de WIP 12');
    expect(texto).toContain('tabela');
    expect(texto).not.toMatch(/NaN|undefined/);
  });
});
