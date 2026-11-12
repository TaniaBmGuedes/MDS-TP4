import { describe, expect, it } from 'vitest';
import { FONTES, referencia } from './fontes';

describe('FONTES', () => {
  it('tem as 5 referências do relatório', () => {
    expect(FONTES.map((f) => f.titulo)).toEqual([
      'The Kanban Guide',
      'Kanban: Successful Evolutionary Change for Your Technology Business',
      'Actionable Agile Metrics for Predictability',
      'A Proof for the Queuing Formula: L = λW',
      'The Scrum Guide',
    ]);
  });

  it('cada fonte diz onde foi usada e os endereços são https', () => {
    for (const fonte of FONTES) {
      expect(fonte.usadaEm.length).toBeGreaterThan(0);
      if (fonte.url) expect(fonte.url).toMatch(/^https:\/\//);
    }
  });
});

describe('referencia', () => {
  it('escreve a referência como no relatório', () => {
    const little = FONTES.find((f) => f.ano === 1961);
    expect(little && referencia(little)).toBe(
      'Little, J. D. C. (1961). A Proof for the Queuing Formula: L = λW. Operations Research, 9(3), 383–387.',
    );
  });

  it('sem publicação, acaba no título', () => {
    expect(referencia({ autores: 'A.', ano: 2000, titulo: 'T', usadaEm: 'x' })).toBe('A. (2000). T.');
  });
});
