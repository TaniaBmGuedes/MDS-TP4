import { describe, expect, it } from 'vitest';
import { simular } from '../model/simulador';
import { WIP_SLIDER_MAX, WIP_SLIDER_MIN } from './grafico';
import { PERGUNTAS, textoDilema, textoPontuacao } from './quiz';
import { EQUIPA_INICIAL } from './simulacao';

const r = (wip: number) => simular(wip, EQUIPA_INICIAL);
const { pessoas, chegadasPorDia } = EQUIPA_INICIAL;

describe('PERGUNTAS', () => {
  it('são 5, com ids diferentes', () => {
    expect(PERGUNTAS).toHaveLength(5);
    expect(new Set(PERGUNTAS.map((p) => p.id)).size).toBe(PERGUNTAS.length);
  });

  // Um índice errado não dá erro de tipos, mas marcaria a resposta errada como certa.
  it('cada pergunta aponta para uma opção que existe', () => {
    for (const pergunta of PERGUNTAS) {
      expect(pergunta.opcoes[pergunta.certa]).toBeDefined();
    }
  });

  it('o simulador abre com um WIP que o slider aceita', () => {
    for (const p of PERGUNTAS) {
      expect(p.simulador.wip).toBeGreaterThanOrEqual(WIP_SLIDER_MIN);
      expect(p.simulador.wip).toBeLessThanOrEqual(WIP_SLIDER_MAX);
    }
  });

  it('as explicações não têm números estragados', () => {
    for (const p of PERGUNTAS) expect(p.explicacao).not.toMatch(/NaN|undefined|Infinity/);
  });

  // As respostas certas têm de bater com o modelo do simulador, senão
  // «Ver no simulador» mostraria o contrário do que o quiz diz.
  it('as respostas certas batem com o simulador', () => {
    expect(r(pessoas * 2).leadTime).toBeGreaterThan(r(pessoas).leadTime);
    expect(r(pessoas).cycleTime).toBeLessThan(r(pessoas).leadTime);
    expect(r(12).throughput).toBeLessThan(r(pessoas).throughput);
    expect(r(2).throughput).toBeLessThan(chegadasPorDia);
    expect(r(2).leadTime).toBeGreaterThan(r(pessoas).leadTime);
  });
});

describe('textoPontuacao', () => {
  it('muda conforme as certas', () => {
    expect(textoPontuacao(5, 5)).toContain('Já sabes ler o fluxo');
    expect(textoPontuacao(4, 5)).toBe('4 de 5. Já sabes o que é Kanban.');
    expect(textoPontuacao(1, 5)).toContain('Vale a pena');
  });
});

describe('textoDilema', () => {
  it('tem um texto para cada escolha e para quem não respondeu', () => {
    expect(textoDilema('mais')).toContain('«Começar mais trabalho»');
    expect(textoDilema('menos')).toContain('Acertaste');
    expect(textoDilema('gente')).toContain('«Trazer mais gente»');
    expect(textoDilema(null)).toContain('Não chegaste a responder');
  });
});
