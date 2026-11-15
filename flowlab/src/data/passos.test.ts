import { describe, expect, it } from 'vitest';
import { PASSOS, indicePorAncora, textoProgresso } from './passos';

describe('indicePorAncora', () => {
  it('encontra o passo pela âncora, com ou sem #', () => {
    expect(indicePorAncora('#inicio')).toBe(0);
    expect(indicePorAncora('#kanban')).toBe(1);
    expect(indicePorAncora('#simular')).toBe(2);
    expect(indicePorAncora('metricas')).toBe(4);
  });

  it('devolve null para âncoras vazias ou desconhecidas', () => {
    expect(indicePorAncora('')).toBeNull();
    expect(indicePorAncora('#app')).toBeNull();
  });
});

describe('ordem dos passos (SCRUM-128)', () => {
  it('explica o Kanban logo a seguir à introdução e antes do simulador', () => {
    const ids = PASSOS.map((p) => p.id);
    expect(ids.indexOf('kanban')).toBe(ids.indexOf('inicio') + 1);
    expect(ids.indexOf('kanban')).toBeLessThan(ids.indexOf('simular'));
  });

  it('separa o Kanban do dilema, cada um com um nome que diz o que faz', () => {
    const kanban = PASSOS.find((p) => p.id === 'kanban');
    const dilema = PASSOS.find((p) => p.id === 'info');
    expect(kanban?.nome).toBe('O que é Kanban');
    expect(dilema?.nome).toBe('Dilema');
    expect(PASSOS.some((p) => p.nome.includes('Conheces'))).toBe(false);
  });

  it('o tempo que falta desce de passo para passo', () => {
    for (let i = 1; i < PASSOS.length; i++) {
      expect(PASSOS[i].minutosRestantes).toBeLessThan(PASSOS[i - 1].minutosRestantes);
    }
  });
});

describe('textoProgresso', () => {
  it('diz o passo, o total e o tempo que falta', () => {
    expect(textoProgresso(0)).toBe(`Passo 1 de ${PASSOS.length} · faltam ~10 min`);
    expect(textoProgresso(PASSOS.length - 1)).toBe(`Passo ${PASSOS.length} de ${PASSOS.length} · faltam ~1 min`);
  });
});
