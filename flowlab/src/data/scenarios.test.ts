import { describe, expect, it } from 'vitest';
import { calcularEquipa } from '../model/equipa';
import {
  CENARIOS_EQUIPA,
  EQUIPA_BASE,
  LIMITES,
  cenarioAtivo,
  compararComInicial,
  formulaLittle,
  larguraBarra,
  situacao,
  textoDiferenca,
} from './scenarios';

describe('CENARIOS_EQUIPA', () => {
  it('tem os 4 cenários do mockup, o primeiro é a equipa inicial', () => {
    expect(CENARIOS_EQUIPA.map((c) => c.nome)).toEqual([
      'Equipa inicial',
      'Começar mais trabalho',
      'Trazer mais gente (e mais trabalho)',
      'Limitar o WIP',
    ]);
    expect(CENARIOS_EQUIPA[0]!.equipa).toEqual(EQUIPA_BASE);
    expect(EQUIPA_BASE).toEqual({ pessoas: 2, wip: 4 });
  });

  it('todos os cenários cabem nos limites dos steppers', () => {
    for (const { equipa } of CENARIOS_EQUIPA) {
      expect(equipa.pessoas).toBeGreaterThanOrEqual(LIMITES.pessoasMin);
      expect(equipa.pessoas).toBeLessThanOrEqual(LIMITES.pessoasMax);
      expect(equipa.wip).toBeGreaterThanOrEqual(LIMITES.wipMin);
      expect(equipa.wip).toBeLessThanOrEqual(LIMITES.wipMax);
    }
  });

  it('limitar o WIP é melhor do que começar mais trabalho', () => {
    const [inicial, maisTrabalho, , limitar] = CENARIOS_EQUIPA.map((c) => calcularEquipa(c.equipa));
    expect(limitar!.leadTime).toBeLessThan(inicial!.leadTime);
    expect(maisTrabalho!.leadTime).toBeGreaterThan(inicial!.leadTime);
  });
});

describe('cenarioAtivo', () => {
  it('destaca o cenário quando os valores coincidem', () => {
    expect(cenarioAtivo({ pessoas: 4, wip: 8 })?.id).toBe('mais-gente');
    expect(cenarioAtivo({ pessoas: 2, wip: 4 })?.id).toBe('inicial');
  });

  it('deixa de destacar quando se ajusta à mão', () => {
    expect(cenarioAtivo({ pessoas: 3, wip: 4 })).toBeNull();
    expect(cenarioAtivo({ pessoas: 2, wip: 5 })).toBeNull();
  });
});

describe('textos', () => {
  it('escreve a diferença à portuguesa, com o sinal de menos', () => {
    expect(textoDiferenca({ percentagem: 118, melhor: true })).toBe('+118% vs. inicial · melhor');
    expect(textoDiferenca({ percentagem: -54, melhor: true })).toBe('−54% vs. inicial · melhor');
    expect(textoDiferenca({ percentagem: 30, melhor: false })).toBe('+30% vs. inicial · pior');
    expect(textoDiferenca({ percentagem: 0, melhor: null })).toBe('Igual à equipa inicial');
  });

  it('compara o teste de referência com a equipa inicial', () => {
    const inicial = calcularEquipa(EQUIPA_BASE);
    const d = compararComInicial(calcularEquipa({ pessoas: 4, wip: 4 }), inicial);
    expect(textoDiferenca(d.throughput)).toBe('+118% vs. inicial · melhor');
    expect(textoDiferenca(d.leadTime)).toBe('−54% vs. inicial · melhor');
  });

  it('a conta da Lei de Little bate certo à vista', () => {
    expect(formulaLittle(4, calcularEquipa({ pessoas: 4, wip: 4 }))).toBe('4 ÷ 1,76 ≈ 2,3 dias');
  });

  it('explica a situação conforme o WIP face às pessoas', () => {
    expect(situacao({ pessoas: 2, wip: 2 })).toMatch(/foca-se/);
    expect(situacao({ pessoas: 2, wip: 4 })).toMatch(/paralelo/);
    expect(situacao({ pessoas: 2, wip: 8 })).toMatch(/dispara/);
  });
});

describe('larguraBarra', () => {
  it('limita a barra entre 0 e 100%', () => {
    expect(larguraBarra(1.25, 2.5)).toBe(50);
    expect(larguraBarra(48, 16)).toBe(100);
    expect(larguraBarra(-1, 16)).toBe(0);
  });
});
