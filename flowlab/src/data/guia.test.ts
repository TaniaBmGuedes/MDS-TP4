import { describe, expect, it } from 'vitest';
import { MELHOR_CENARIO, PERGUNTA_GUIA, reparaEm, respostaPrevisao } from './guia';
import { CENARIOS_WIP, EQUIPA_INICIAL } from './simulacao';

describe('pergunta guia', () => {
  it('é a do ticket', () => {
    expect(PERGUNTA_GUIA).toBe('Fazer mais coisas ao mesmo tempo é melhor?');
  });

  it('o melhor cenário é uma tarefa por pessoa', () => {
    expect(MELHOR_CENARIO.wip).toBe(EQUIPA_INICIAL.pessoas);
  });
});

describe('respostaPrevisao', () => {
  it('diz «Acertaste» só para o melhor cenário', () => {
    for (const c of CENARIOS_WIP) {
      const texto = respostaPrevisao(c.wip);
      expect(texto.startsWith('Acertaste'), `WIP ${c.wip}`).toBe(c.wip === MELHOR_CENARIO.wip);
      expect(texto).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
});

describe('reparaEm', () => {
  it('cada cenário sugerido tem uma frase «Repara…» diferente', () => {
    const frases = CENARIOS_WIP.map((c) => reparaEm(c.wip));
    for (const f of frases) {
      expect(f).toMatch(/^Repara/);
      expect(f).not.toMatch(/NaN|undefined|Infinity/);
    }
    expect(new Set(frases).size).toBe(CENARIOS_WIP.length);
  });

  it('não tem frase para valores fora dos cenários sugeridos', () => {
    expect(reparaEm(7)).toBeNull();
  });
});
