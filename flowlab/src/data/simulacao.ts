// Valores do simulador, migrados do protótipo v1. Ficam separados do motor
// porque o T15 pode mudar o modelo e, com ele, os valores dos cenários.
import type { ParametrosSimulacao } from '../model/simulador';

export const EQUIPA_INICIAL: ParametrosSimulacao = {
  pessoas: 4,
  chegadasPorDia: 2,
  dias: 15,
  filaInicial: 6,
  tarefasPorPessoaDia: 0.5,
  custoTroca: 0.6,
};

export interface CenarioWip {
  nome: string;
  wip: number;
}

export const CENARIOS_WIP: CenarioWip[] = [
  { nome: 'Tudo ao mesmo tempo', wip: 12 },
  { nome: 'Uma por pessoa', wip: 4 },
  { nome: 'Muito pouco', wip: 2 },
];
