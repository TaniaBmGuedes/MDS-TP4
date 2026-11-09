// Modelo da equipa (T03, SCRUM-21): quantas tarefas a equipa acaba por dia e
// quanto uma tarefa demora, conforme as pessoas e o limite de WIP. É uma
// função pura, sem DOM, por isso é testada com o Vitest. O modelo é
// simplificado de propósito (veio do mockup do ecrã): serve para ver a
// tendência, não para prever números reais.

/** Tarefas que uma pessoa acaba por dia, quando se foca numa só. */
export const TAREFAS_POR_PESSOA_DIA = 0.5;
/** Cada tarefa a meio, além do número de pessoas, tira este peso ao foco. */
export const PERDA_POR_TAREFA_A_MAIS = 0.08;
/** Quanto o foco pode cair, no máximo (metade do ritmo). */
export const FOCO_MINIMO = 0.5;
/** Cada pessoa a mais custa este peso em coordenação (reuniões, dúvidas). */
export const CUSTO_COORDENACAO = 0.04;

export interface Equipa {
  pessoas: number;
  /** Tarefas em curso ao mesmo tempo (o limite de WIP). */
  wip: number;
}

export interface ResultadoEquipa {
  /** Tarefas acabadas por dia. */
  throughput: number;
  /** Dias que uma tarefa demora, do princípio ao fim (Lei de Little). */
  leadTime: number;
}

function validar({ pessoas, wip }: Equipa): void {
  if (!Number.isInteger(pessoas) || pessoas < 1) throw new RangeError('A equipa precisa de pelo menos 1 pessoa');
  if (!Number.isInteger(wip) || wip < 1) throw new RangeError('O WIP tem de ser pelo menos 1');
}

export function calcularEquipa(equipa: Equipa): ResultadoEquipa {
  validar(equipa);
  const { pessoas, wip } = equipa;
  // Só trabalham tantas pessoas quantas as tarefas a meio.
  const ativas = Math.min(pessoas, wip);
  // Com mais tarefas do que pessoas, saltar entre tarefas faz perder foco.
  const foco = wip > pessoas ? Math.max(FOCO_MINIMO, 1 - PERDA_POR_TAREFA_A_MAIS * (wip - pessoas)) : 1;
  // Quanto mais gente, mais tempo se gasta a coordenar.
  const coordenacao = 1 - CUSTO_COORDENACAO * (pessoas - 1);
  const throughput = ativas * TAREFAS_POR_PESSOA_DIA * foco * coordenacao;
  // Lei de Little: lead time = WIP ÷ throughput.
  return { throughput, leadTime: wip / throughput };
}

export interface Diferenca {
  /** Variação em %, arredondada às unidades: 118 quer dizer «+118%». */
  percentagem: number;
  /** Se a mudança é boa para a equipa: mais throughput, menos lead time. */
  melhor: boolean | null;
}

/**
 * Compara um valor com o da equipa inicial. `maisEMelhor` é true no
 * throughput e false no lead time. Devolve `melhor: null` quando não há
 * diferença (0%).
 */
export function diferenca(atual: number, inicial: number, maisEMelhor: boolean): Diferenca {
  const percentagem = Math.round(((atual - inicial) / inicial) * 100);
  if (percentagem === 0) return { percentagem: 0, melhor: null };
  return { percentagem, melhor: percentagem > 0 === maisEMelhor };
}
