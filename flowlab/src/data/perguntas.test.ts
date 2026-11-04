import { describe, expect, it } from 'vitest';
import { PERGUNTAS } from './perguntas';

describe('PERGUNTAS', () => {
  // Um índice errado não dá erro de tipos, mas marcaria a resposta errada como certa.
  it('cada pergunta aponta para uma opção que existe', () => {
    for (const pergunta of PERGUNTAS) {
      expect(pergunta.opcoes[pergunta.certa]).toBeDefined();
    }
  });
});
