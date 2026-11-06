import { describe, expect, it } from 'vitest';
import { CENARIOS, CENARIO_INICIAL, METRICAS, PARAMETROS, TEXTOS, cenarioPersonalizado, conclusao, numero, situacao, throughput } from './metricas';

describe('METRICAS', () => {
  it('são as três do Sketch 2, cada uma com os textos todos', () => {
    expect(METRICAS.map((m) => m.id)).toEqual(['wip', 'throughput', 'lead']);
    for (const m of METRICAS) {
      expect(m.definicao.length).toBeGreaterThan(0);
      expect(m.interpretar.length).toBeGreaterThan(0);
    }
  });
});

describe('CENARIOS', () => {
  const porLimite = (wip: number) => {
    const c = CENARIOS.find((x) => x.limiteWip === wip);
    if (!c) throw new Error(`Falta o cenário WIP ${wip}`);
    return c;
  };

  it('vêm do simulador, ordenados, e abrem no cenário de uma tarefa por pessoa', () => {
    expect(CENARIOS.map((c) => c.limiteWip)).toEqual([2, 4, 12]);
    expect(CENARIOS[CENARIO_INICIAL].limiteWip).toBe(PARAMETROS.pessoas);
  });

  it('as contas batem certo: sistema = em curso + à espera, lead time = espera + trabalho', () => {
    for (const c of CENARIOS) {
      expect(c.emCurso + c.aEspera).toBeCloseTo(c.noSistema, 9);
      expect(c.tempoEspera + c.tempoTrabalho).toBeCloseTo(c.leadTime, 9);
      // Lei de Little com as duas fronteiras.
      expect(c.noSistema / c.throughput).toBeCloseTo(c.leadTime, 9);
      expect(c.emCurso / c.throughput).toBeCloseTo(c.tempoTrabalho, 9);
      // O WIP médio nunca passa do limite.
      expect(c.emCurso).toBeLessThanOrEqual(c.limiteWip + 1e-9);
    }
  });

  // As conclusões dizem «tantas como as que chegam» e «menos do que as que
  // chegam»: se o modelo mudar (T15), os textos têm de mudar também.
  it('as conclusões correspondem aos números de cada cenário', () => {
    expect(porLimite(4).estavel).toBe(true);
    expect(porLimite(2).estavel).toBe(false);
    expect(porLimite(12).estavel).toBe(false);
    expect(porLimite(12).leadTime).toBeGreaterThan(porLimite(4).leadTime);
    expect(porLimite(12).throughput).toBeLessThan(porLimite(4).throughput);
    expect(conclusao(porLimite(4))).toContain('tantas como as que chegam');
    expect(conclusao(porLimite(2))).toContain('menos do que');
    expect(situacao(porLimite(12))).toContain('até 3');
  });

  it('o diagrama do throughput mostra os últimos dias simulados', () => {
    for (const c of CENARIOS) {
      expect(c.entregasPorDia.at(-1)?.dia).toBe(PARAMETROS.dias);
      for (const d of c.entregasPorDia) expect(d.tarefas).toBeGreaterThanOrEqual(0);
    }
  });

  it('o aviso de instabilidade e a fronteira do cycle time usam os números certos', () => {
    const c = porLimite(4);
    expect(TEXTOS.littleCycle(c)).toContain(numero(c.tempoTrabalho));
    expect(TEXTOS.littleInstavel(porLimite(12))).toContain(throughput(porLimite(12).throughput));
  });

  it('o exemplo do café usa os números do cenário e soma certo', () => {
    for (const c of CENARIOS) {
      const texto = TEXTOS.cafe(c).join(' ');
      expect(texto).toContain(`${numero(c.noSistema)} clientes`);
      expect(texto).toContain(`${numero(c.leadTime)} minutos`);
      expect(texto).toContain(`${PARAMETROS.pessoas} baristas`);
    }
  });

  it('a animação dia a dia usa totais inteiros e coerentes do simulador', () => {
    for (const c of CENARIOS) {
      expect(c.porDia).toHaveLength(PARAMETROS.dias + 1);
      expect(c.porDia[0]).toEqual({ entradas: PARAMETROS.filaInicial, comecadas: 0, acabadas: 0 });
      c.porDia.forEach((d, i) => {
        expect(d.entradas).toBeGreaterThanOrEqual(d.comecadas);
        expect(d.comecadas).toBeGreaterThanOrEqual(d.acabadas);
        // Nunca há mais tarefas em curso do que o limite de WIP.
        expect(d.comecadas - d.acabadas).toBeLessThanOrEqual(c.limiteWip);
        if (i > 0) {
          expect(d.entradas - c.porDia[i - 1].entradas).toBe(PARAMETROS.chegadasPorDia);
          expect(d.comecadas).toBeGreaterThanOrEqual(c.porDia[i - 1].comecadas);
          expect(d.acabadas).toBeGreaterThanOrEqual(c.porDia[i - 1].acabadas);
        }
      });
    }
  });

  // O que aparece no ecrã tem de bater certo à vista: lead ≈ sistema ÷ throughput
  // com os números já arredondados, a menos de uma décima.
  it('a equação mostrada bate certo com os números arredondados', () => {
    const lerNumero = (t: string) => Number(t.replace(',', '.'));
    for (const c of CENARIOS) {
      const conta = lerNumero(numero(c.noSistema)) / lerNumero(throughput(c.throughput));
      expect(Math.abs(conta - lerNumero(numero(c.leadTime)))).toBeLessThan(0.1);
    }
  });
});

describe('cenarioPersonalizado', () => {
  it('usa o simulador com o WIP escolhido e respeita os limites', () => {
    const c = cenarioPersonalizado(6);
    expect(c.limiteWip).toBe(6);
    expect(c.noSistema / c.throughput).toBeCloseTo(c.leadTime, 9);
    expect(cenarioPersonalizado(0).limiteWip).toBe(1);
    expect(cenarioPersonalizado(99).limiteWip).toBe(15);
    expect(situacao(cenarioPersonalizado(1))).toContain('1 tarefa em curso');
    expect({ ...cenarioPersonalizado(4), nome: "" }).toEqual({ ...CENARIOS[CENARIO_INICIAL], nome: "" });
  });
});

describe('numero', () => {
  it('escreve à portuguesa, com uma casa decimal só quando faz falta', () => {
    expect(numero(2)).toBe('2');
    expect(numero(2.04)).toBe('2');
    expect(numero(13.27)).toBe('13,3');
    expect(throughput(1.0304)).toBe('1,03');
    expect(throughput(2)).toBe('2');
  });
});
