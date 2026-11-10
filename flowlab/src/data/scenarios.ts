// Valores e textos do Ecrã 6 · Simulador da equipa (T03, SCRUM-21): a equipa
// inicial, os 4 cenários, os limites dos steppers e as frases que explicam o
// que se vê. O cálculo está em model/equipa.ts; aqui só há dados e texto,
// sem DOM, por isso também é testado com o Vitest.
import { diferenca, type Diferenca, type Equipa, type ResultadoEquipa } from '../model/equipa';
import { numero } from './metricas';

/** A equipa com que se compara tudo: 2 pessoas e 4 tarefas em curso. */
export const EQUIPA_BASE: Equipa = { pessoas: 2, wip: 4 };

export const LIMITES = { pessoasMin: 1, pessoasMax: 6, wipMin: 1, wipMax: 12 } as const;

/** Valor que enche a barra por inteiro, para o throughput e para o lead time. */
export const ESCALA_BARRAS = { throughput: 2.5, leadTime: 16 } as const;

export interface CenarioEquipa {
  id: 'inicial' | 'mais-trabalho' | 'mais-gente' | 'limitar-wip';
  nome: string;
  equipa: Equipa;
}

export const CENARIOS_EQUIPA: readonly CenarioEquipa[] = [
  { id: 'inicial', nome: 'Equipa inicial', equipa: EQUIPA_BASE },
  { id: 'mais-trabalho', nome: 'Começar mais trabalho', equipa: { pessoas: 2, wip: 8 } },
  { id: 'mais-gente', nome: 'Trazer mais gente (e mais trabalho)', equipa: { pessoas: 4, wip: 8 } },
  { id: 'limitar-wip', nome: 'Limitar o WIP', equipa: { pessoas: 2, wip: 2 } },
];

/** O cenário que corresponde a estes valores, ou null se foram ajustados à mão. */
export function cenarioAtivo(equipa: Equipa): CenarioEquipa | null {
  return CENARIOS_EQUIPA.find((c) => c.equipa.pessoas === equipa.pessoas && c.equipa.wip === equipa.wip) ?? null;
}

/** Quanto da barra se enche (0 a 100), com o valor limitado à escala. */
export function larguraBarra(valor: number, escala: number): number {
  return Math.min(100, Math.max(0, (valor / escala) * 100));
}

/** O que acontece nesta equipa, em linguagem simples. */
export function situacao({ pessoas, wip }: Equipa): string {
  if (wip >= pessoas * 2 + 1) return 'Há muito trabalho a meio: cada pessoa salta entre tarefas, nada acaba e o lead time dispara.';
  if (wip <= pessoas) return 'Cada pessoa foca-se numa tarefa de cada vez: as tarefas acabam depressa e o lead time é baixo.';
  return 'Algum trabalho em paralelo: um equilíbrio razoável, mas ainda há espaço para focar mais.';
}

/** «+118% vs. inicial · melhor», «−54% vs. inicial · melhor» ou «Igual à equipa inicial». */
export function textoDiferenca({ percentagem, melhor }: Diferenca): string {
  if (melhor === null) return 'Igual à equipa inicial';
  const sinal = percentagem > 0 ? '+' : '−';
  return `${sinal}${Math.abs(percentagem)}% vs. inicial · ${melhor ? 'melhor' : 'pior'}`;
}

export const throughputPorDia = (valor: number): string => `${numero(valor)} / dia`;
export const leadTimeEmDias = (valor: number): string => `${numero(valor)} dias`;

/** A conta da Lei de Little com os valores atuais (throughput com 2 casas, para a conta bater). */
export function formulaLittle(wip: number, r: ResultadoEquipa): string {
  return `${wip} ÷ ${numero(r.throughput, 2)} ≈ ${numero(r.leadTime)} dias`;
}

/** Throughput e lead time desta equipa face à equipa inicial. */
export function compararComInicial(r: ResultadoEquipa, inicial: ResultadoEquipa): { throughput: Diferenca; leadTime: Diferenca } {
  return {
    throughput: diferenca(r.throughput, inicial.throughput, true),
    leadTime: diferenca(r.leadTime, inicial.leadTime, false),
  };
}

export const TEXTOS = {
  intro: 'Escolhe um cenário ou ajusta os valores à mão. As métricas comparam sempre com a equipa inicial: 2 pessoas e 4 tarefas em curso.',
  cenarios: 'Cenários',
  pessoas: 'Pessoas na equipa',
  wip: 'Tarefas em curso (WIP)',
  nota: 'Modelo simplificado: cada pessoa acaba meia tarefa por dia; saltar entre tarefas e coordenar mais gente custa tempo.',
  throughput: 'Throughput',
  leadTime: 'Lead time',
  little: 'Lead time ≈ WIP ÷ throughput',
  respostaEtiqueta: 'A resposta ao dilema',
  respostaTitulo: 'Primeiro limita o trabalho em curso. Só depois pensa em trazer gente.',
  resposta:
    'Começar mais trabalho faz o lead time disparar sem aumentar as entregas. Mais pessoas aumentam o throughput, mas o ganho desaparece se o WIP crescer com elas. Limitar o WIP é a forma mais barata de entregar mais depressa.',
  anterior: 'Rever as métricas',
  seguinte: 'Fazer o quiz final',
} as const;
