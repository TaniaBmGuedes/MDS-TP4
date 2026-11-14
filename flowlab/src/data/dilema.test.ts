import { describe, expect, it } from 'vitest';
import { calcularEquipa } from '../model/equipa';
import {
  OPCOES_DILEMA,
  TEXTOS_DILEMA,
  numerosDaOpcao,
  opcaoDilema,
  resultadoDilema,
  textoEscolhaNaEquipa,
} from './dilema';
import { NOMES_DILEMA } from './quiz';
import { CENARIOS_EQUIPA, leadTimeEmDias, throughputPorDia } from './scenarios';

describe('opções do dilema', () => {
  it('são as três do store do percurso, com os nomes do quiz', () => {
    expect(OPCOES_DILEMA.map((o) => o.id)).toEqual(['gente', 'mais', 'menos']);
    for (const o of OPCOES_DILEMA) {
      expect(o.titulo).toBe(NOMES_DILEMA[o.id]);
      expect(o.descricao.length).toBeGreaterThan(0);
    }
  });

  it('cada opção aponta para um cenário que existe no ecrã Equipa', () => {
    for (const o of OPCOES_DILEMA) {
      expect(CENARIOS_EQUIPA.map((c) => c.id)).toContain(o.cenario);
    }
  });

  it('opcaoDilema devolve a opção certa', () => {
    expect(opcaoDilema('menos').titulo).toBe('Fazer menos de cada vez');
  });
});

describe('resultado ao escolher', () => {
  it('todas as opções dão um resultado completo', () => {
    for (const o of OPCOES_DILEMA) {
      const r = resultadoDilema(o.id);
      expect(r.veredicto.length).toBeGreaterThan(0);
      expect(r.explicacao.length).toBeGreaterThan(0);
      expect(r.numeros.length).toBeGreaterThan(0);
    }
  });

  it('os números são os do modelo, iguais aos do ecrã Equipa', () => {
    for (const o of OPCOES_DILEMA) {
      const cenario = CENARIOS_EQUIPA.find((c) => c.id === o.cenario)!;
      const r = calcularEquipa(cenario.equipa);
      const texto = numerosDaOpcao(o.id);
      expect(texto).toContain(throughputPorDia(r.throughput));
      expect(texto).toContain(leadTimeEmDias(r.leadTime));
    }
  });

  // As frases dizem qual das opções é a melhor e qual piora tudo: se o modelo
  // mudar (T15), os textos têm de mudar também.
  it('o que o texto afirma bate com o modelo', () => {
    const resultado = (id: 'gente' | 'mais' | 'menos') => calcularEquipa(CENARIOS_EQUIPA.find((c) => c.id === opcaoDilema(id).cenario)!.equipa);
    const gente = resultado('gente');
    const mais = resultado('mais');
    const menos = resultado('menos');
    // «Fazer menos» é a que mais encurta a espera.
    expect(menos.leadTime).toBeLessThan(gente.leadTime);
    expect(menos.leadTime).toBeLessThan(mais.leadTime);
    // «Começar mais trabalho» piora o ritmo e a espera face à equipa inicial.
    const inicial = calcularEquipa(CENARIOS_EQUIPA.find((c) => c.id === 'inicial')!.equipa);
    expect(mais.throughput).toBeLessThan(inicial.throughput);
    expect(mais.leadTime).toBeGreaterThan(inicial.leadTime);
    // «Trazer mais gente» entrega mais por dia, mas cada tarefa demora mais.
    expect(gente.throughput).toBeGreaterThan(inicial.throughput);
    expect(gente.leadTime).toBeGreaterThan(inicial.leadTime);
  });
});

describe('a escolha no ecrã Equipa', () => {
  it('refere a opção escolhida', () => {
    for (const o of OPCOES_DILEMA) {
      const texto = textoEscolhaNaEquipa(o.id);
      expect(texto).toContain(`«${o.titulo}»`);
      expect(texto).toContain(resultadoDilema(o.id).veredicto);
    }
  });

  it('sem escolha, diz qual era a resposta', () => {
    expect(textoEscolhaNaEquipa(null)).toBe(TEXTOS_DILEMA.semEscolha);
    expect(TEXTOS_DILEMA.semEscolha).toContain(NOMES_DILEMA.menos);
  });
});
