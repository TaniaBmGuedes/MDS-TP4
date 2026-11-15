// Pergunta guia e chamadas de atenção do simulador (SCRUM-28). O ecrã abre
// com uma pergunta, pede uma previsão antes de a pessoa experimentar e, em
// cada cenário sugerido, diz em que reparar. Os números saem do modelo do
// simulador, por isso batem certo com o que o gráfico mostra.
import { simular } from '../model/simulador';
import { numero, throughput } from './metricas';
import { CENARIOS_WIP, EQUIPA_INICIAL, type CenarioWip } from './simulacao';

const { pessoas, chegadasPorDia } = EQUIPA_INICIAL;
const r = (wip: number) => simular(wip, EQUIPA_INICIAL);
const dias = (v: number): string => `${numero(v)} ${numero(v) === '1' ? 'dia' : 'dias'}`;
/** «saem 2 tarefas por dia» / «sai 1 tarefa por dia». */
const saem = (v: number, so = ''): string =>
  throughput(v) === '1' ? `sai ${so}1 tarefa por dia` : `saem ${so}${throughput(v)} tarefas por dia`;

export const PERGUNTA_GUIA = 'Fazer mais coisas ao mesmo tempo é melhor?';

export const PREVISAO = {
  pergunta: 'Antes de experimentar: qual destes cenários achas que entrega cada tarefa mais depressa?',
  ajuda: 'Escolhe por instinto. Depois o simulador mostra o que acontece.',
};

/** O cenário sugerido com o lead time mais baixo, segundo o modelo. */
export const MELHOR_CENARIO: CenarioWip = CENARIOS_WIP.reduce((melhor, c) =>
  r(c.wip).leadTime < r(melhor.wip).leadTime ? c : melhor,
);

/** Resposta à previsão: diz se acertou e põe o simulador nesse cenário. */
export function respostaPrevisao(wip: number): string {
  const melhor = MELHOR_CENARIO;
  const escolhido = CENARIOS_WIP.find((c) => c.wip === wip);
  const nome = escolhido ? `«${escolhido.nome}»` : `um limite de ${wip}`;
  if (wip === melhor.wip) {
    return `Acertaste: ${nome} é o mais rápido, com cada tarefa a demorar ${dias(r(wip).leadTime)}. O simulador passou para esse cenário; experimenta os outros para ver porquê.`;
  }
  return `Escolheste ${nome}. O simulador passou para esse cenário: cada tarefa demora ${dias(r(wip).leadTime)}. Agora experimenta «${melhor.nome}» e compara.`;
}

/**
 * Frase «repara em…» de cada cenário sugerido: o que observar no gráfico e
 * nos números. Devolve null para valores que não são de nenhum cenário.
 */
export function reparaEm(wip: number): string | null {
  if (!CENARIOS_WIP.some((c) => c.wip === wip)) return null;
  const s = r(wip);
  if (wip > pessoas) {
    return `Repara na banda «A fazer» a alargar: com ${wip} tarefas para ${pessoas} pessoas, perde-se tempo a saltar entre elas, ${saem(s.throughput, 'só ')} e cada tarefa demora ${dias(s.leadTime)}.`;
  }
  if (wip === pessoas) {
    return `Repara que as bandas andam paralelas: ${saem(s.throughput)}, tantas como as ${chegadasPorDia} que chegam, e cada tarefa demora só ${dias(s.leadTime)}.`;
  }
  return `Repara nas pessoas paradas: só ${wip} de ${pessoas} trabalham, ${saem(s.throughput)}, menos do que as ${chegadasPorDia} que chegam, e a fila cresce (${dias(s.leadTime)} por tarefa).`;
}
