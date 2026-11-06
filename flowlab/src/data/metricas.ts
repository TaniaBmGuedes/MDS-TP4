// Conteúdo do ecrã das métricas (T16): WIP, throughput e lead time, a
// comparação entre os cenários do simulador e a Lei de Little.
// Como no Sketch 2, são três métricas; o cycle time aparece só como «tempo a
// trabalhar» dentro do lead time, até o Planning decidir se entra.
//
// Todos os números vêm do modelo do simulador (mesma equipa, mesmos
// cenários), por isso batem sempre certo com o que a pessoa vê lá.
//
// Fontes a confirmar pela equipa (critério de aceitação do T16):
// - Little, J. D. C. (1961). A Proof for the Queuing Formula: L = λW.
//   Operations Research, 9(3), 383–387.
// - Vacanti, D. S. (2015). Actionable Agile Metrics for Predictability.
// - Vacanti, D. S. e Coleman, Y. (2020). The Kanban Guide.
import { simular } from '../model/simulador';
import { CENARIOS_WIP, EQUIPA_INICIAL } from './simulacao';

export type IdMetrica = 'wip' | 'throughput' | 'lead';

/** Um cenário do simulador, com as médias dos dias simulados. */
export interface Cenario {
  /** Limite de WIP do cenário (o máximo de tarefas em curso). */
  limiteWip: number;
  nome: string;
  /** Média de tarefas em curso: é o WIP. */
  emCurso: number;
  /** Média de tarefas à espera em «A fazer». */
  aEspera: number;
  /** Média de tarefas dentro do sistema: em curso + à espera. */
  noSistema: number;
  /** Tarefas acabadas por dia. */
  throughput: number;
  /** Dias desde o pedido até estar feita. */
  leadTime: number;
  /** Parte do lead time passada em «A fazer». */
  tempoEspera: number;
  /** Parte do lead time passada em curso (o cycle time). */
  tempoTrabalho: number;
  /** Tarefas acabadas em cada um dos últimos dias simulados. */
  entregasPorDia: { dia: number; tarefas: number }[];
  /** true se sai, em média, tanto trabalho como o que entra. */
  estavel: boolean;
  /**
   * Totais acumulados no fim de cada dia (o índice 0 é o início), já em
   * tarefas inteiras para a animação: entraram, começaram e acabaram.
   */
  porDia: { entradas: number; comecadas: number; acabadas: number }[];
}

export const PARAMETROS = EQUIPA_INICIAL;
/** Quantos dias mostra o diagrama do throughput. */
const DIAS_NO_DIAGRAMA = 5;

function criarCenario(limiteWip: number, nome: string): Cenario {
  const r = simular(limiteWip, PARAMETROS);
  // Lei de Little ao contrário: tarefas em média = tempo médio × throughput.
  // Dá exatamente as médias diárias de «Em curso» e «A fazer» do simulador.
  const emCurso = r.cycleTime * r.throughput;
  const noSistema = r.leadTime * r.throughput;
  const ultimo = r.acabadas.length - 1;
  const entregasPorDia = Array.from({ length: DIAS_NO_DIAGRAMA }, (_, i) => {
    const dia = ultimo - DIAS_NO_DIAGRAMA + 1 + i;
    return { dia, tarefas: r.acabadas[dia] - r.acabadas[dia - 1] };
  });
  return {
    limiteWip,
    nome,
    emCurso,
    aEspera: noSistema - emCurso,
    noSistema,
    throughput: r.throughput,
    leadTime: r.leadTime,
    tempoEspera: r.leadTime - r.cycleTime,
    tempoTrabalho: r.cycleTime,
    entregasPorDia,
    estavel: r.throughput >= PARAMETROS.chegadasPorDia - 1e-9,
    porDia: r.entradas.map((e, d) => ({
      entradas: Math.round(e),
      comecadas: Math.round(r.comecadas[d]),
      acabadas: Math.round(r.acabadas[d]),
    })),
  };
}

/** Os cenários do simulador, do menor para o maior limite de WIP. */
export const CENARIOS: readonly Cenario[] = [...CENARIOS_WIP]
  .sort((a, b) => a.wip - b.wip)
  .map((c) => criarCenario(c.wip, c.nome));

/** Limites aceites para o WIP que a pessoa escreve. */
export const WIP_MINIMO = 1;
export const WIP_MAXIMO = 15;

/** Um cenário com o limite de WIP que a pessoa escolheu (fica entre o mínimo e o máximo). */
export function cenarioPersonalizado(wip: number): Cenario {
  const limite = Math.min(WIP_MAXIMO, Math.max(WIP_MINIMO, Math.round(wip)));
  return criarCenario(limite, 'O teu cenário');
}

/** O cenário mostrado ao abrir: uma tarefa por pessoa. */
export const CENARIO_INICIAL = CENARIOS.findIndex((c) => c.limiteWip === PARAMETROS.pessoas);

/**
 * Escreve um número à portuguesa, sem zeros a mais: 2 → «2», 13.27 → «13,3».
 * Com casas = 2: 1.03 → «1,03», 2 → «2».
 */
export function numero(valor: number, casas = 1): string {
  const fator = 10 ** casas;
  const arredondado = Math.round(valor * fator) / fator;
  return String(arredondado).replace('.', ',');
}

/**
 * O throughput leva duas casas: com uma só, 1,03 aparecia como «1» e a conta
 * da Lei de Little deixava de bater certo à vista.
 */
export const throughput = (valor: number): string => numero(valor, 2);

function tarefasPorDia(valor: number): string {
  return `${throughput(valor)} ${throughput(valor) === '1' ? 'tarefa' : 'tarefas'}`;
}

/**
 * O que se observa neste cenário, em linguagem simples. Fala só deste
 * cenário e deste modelo, não é uma regra geral.
 */
export function conclusao(c: Cenario): string {
  const { pessoas, chegadasPorDia } = PARAMETROS;
  if (c.limiteWip < pessoas) {
    return `Há pessoas paradas: sai ${tarefasPorDia(c.throughput)} por dia, menos do que as ${chegadasPorDia} que chegam, e a fila cresce.`;
  }
  if (c.limiteWip === pessoas) {
    return `Uma tarefa por pessoa: saem ${tarefasPorDia(c.throughput)} por dia, tantas como as que chegam, e quase não há espera.`;
  }
  return `Tarefas a mais: perde-se tempo a saltar entre elas, sai ${tarefasPorDia(c.throughput)} por dia e cada uma demora ${numero(c.leadTime)} dias.`;
}

/** A situação do cenário numa frase. */
export function situacao(c: Cenario): string {
  const { pessoas } = PARAMETROS;
  if (c.limiteWip === 1) return `Só pode estar 1 tarefa em curso de cada vez, para uma equipa de ${pessoas} pessoas.`;
  if (c.limiteWip < pessoas) return `Só podem estar ${c.limiteWip} tarefas em curso ao mesmo tempo, para uma equipa de ${pessoas} pessoas.`;
  if (c.limiteWip === pessoas) return 'Cada pessoa trabalha numa só tarefa e só começa outra quando a acaba.';
  return `Podem estar ${c.limiteWip} tarefas em curso ao mesmo tempo: cada pessoa tem até ${Math.ceil(c.limiteWip / pessoas)} e salta entre elas.`;
}

export interface Metrica {
  id: IdMetrica;
  nome: string;
  /** Explicação curta em português, ao lado do nome. */
  explicacao: string;
  /** Uma frase. */
  definicao: string;
  /** Texto mais longo, dentro de «Como interpretar». */
  interpretar: string;
  unidade: (valor: number) => string;
  valor: (c: Cenario) => number;
  formatar: (valor: number) => string;
}

export const METRICAS: readonly Metrica[] = [
  {
    id: 'wip',
    nome: 'WIP',
    explicacao: 'Work in Progress: trabalho em curso',
    definicao: 'Quantas tarefas já começaram e ainda não acabaram.',
    interpretar:
      'Conta só a coluna «Em curso». Se o WIP sobe e as entregas não acompanham, há trabalho começado a acumular-se. É o número que o Kanban manda limitar. No simulador, o limite de WIP é o máximo permitido; o valor aqui é a média de tarefas em curso nos dias simulados, por isso pode ficar abaixo do limite.',
    unidade: (v) => (numero(v) === '1' ? 'tarefa em curso' : 'tarefas em curso'),
    valor: (c) => c.emCurso,
    formatar: (v) => numero(v),
  },
  {
    id: 'throughput',
    nome: 'Throughput',
    explicacao: 'Ritmo de entrega',
    definicao: 'Quantas tarefas ficam feitas por dia.',
    interpretar:
      'Conta só o que fica feito, por dia ou por semana. Começar mais tarefas não o faz subir: neste modelo, com mais tarefas a meio do que pessoas, as trocas de tarefa até o fazem descer. Compara-o com o ritmo a que chegam pedidos: se sai menos do que entra, a fila cresce.',
    unidade: (v) => (throughput(v) === '1' ? 'tarefa por dia' : 'tarefas por dia'),
    valor: (c) => c.throughput,
    formatar: throughput,
  },
  {
    id: 'lead',
    nome: 'Lead time',
    explicacao: 'Tempo de entrega',
    definicao: 'Quanto tempo vai do pedido até estar feita.',
    interpretar:
      'É o tempo que quem pediu fica à espera: o tempo parado em «A fazer» mais o tempo a trabalhar. O tempo a trabalhar, sozinho, chama-se cycle time. Se o lead time sobe de semana para semana, o trabalho está a acumular-se algures no quadro.',
    unidade: (v) => (numero(v) === '1' ? 'dia' : 'dias'),
    valor: (c) => c.leadTime,
    formatar: (v) => numero(v),
  },
];

export const TEXTOS = {
  intro: `A mesma equipa de ${PARAMETROS.pessoas} pessoas, em três cenários do simulador. Quando a simulação de um cenário acaba, passa sozinho ao seguinte.`,
  ilustrativa: `Animação ilustrativa: os ${PARAMETROS.dias} dias do simulador, arredondados a tarefas inteiras.`,
  perceber: 'Perceber as métricas',
  littleRotulo: 'Lei de Little',
  littleTitulo: 'As três estão ligadas',
  cafeTitulo: 'Pensa num café',
  /**
   * A Lei de Little contada com um café, com os números do cenário: a fila
   * ao balcão é «A fazer», os cafés a ser feitos são o WIP e o «sistema» é
   * tudo o que está lá dentro (fila + balcão).
   */
  cafe: (c: Cenario) => {
    // «=» só quando a conta com os números mostrados dá certo à risca.
    const ler = (t: string): number => Number(t.replace(',', '.'));
    const exato = Math.abs(ler(numero(c.noSistema)) / ler(throughput(c.throughput)) - ler(numero(c.leadTime))) < 1e-9;
    const sinal = exato ? '=' : '≈';
    return [
      `Há ${PARAMETROS.pessoas} baristas. A fila ao balcão é «A fazer» e os cafés a ser preparados são o WIP.`,
      `Lá dentro estão, em média, ${numero(c.noSistema)} clientes (${numero(c.aEspera)} na fila + ${numero(c.emCurso)} a ser servidos) e saem ${throughput(c.throughput)} por minuto.`,
      `Então cada cliente fica ${numero(c.noSistema)} ÷ ${throughput(c.throughput)} ${sinal} ${numero(c.leadTime)} minutos, desde que entra até sair com o café.`,
    ];
  },
  littleCuriosos: 'Para os curiosos: quando é que a relação vale?',
  littleCondicoes:
    'A Lei de Little liga médias medidas sempre com a mesma fronteira, num sistema estável, em que entra, em média, tanto trabalho como sai. Numa equipa real, a relação é aproximada. No simulador, o lead time é calculado a partir desta relação, por isso aqui os números batem certo.',
  littleCycle: (c: Cenario) =>
    `Com a fronteira só em «Em curso», vale o mesmo: tempo a trabalhar ≈ WIP ÷ throughput, ou seja ${numero(c.tempoTrabalho)} dias ≈ ${numero(c.emCurso)} ÷ ${throughput(c.throughput)}.`,
  littleInstavel: (c: Cenario) =>
    `Atenção: entram ${PARAMETROS.chegadasPorDia} por dia e saem ${throughput(c.throughput)}. A fila não pára de crescer, por isso estes números são só médias dos ${PARAMETROS.dias} dias simulados.`,
  fecho: 'Neste modelo, uma tarefa por pessoa deu mais entregas e menos espera.',
};
