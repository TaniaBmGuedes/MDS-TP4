// Quiz final (T17), como no Sketch 2: 5 perguntas sobre o que a pessoa
// experimentou no simulador, cada uma com os valores para a ver lá («Ver no
// simulador»). As 4 primeiras vêm do protótipo v1, adaptadas à equipa de 4
// pessoas do simulador; a 5.ª é nova.
//
// Os números das explicações saem do modelo do simulador, por isso batem
// certo com o que a pessoa vê ao carregar em «Ver no simulador».
import { simular } from '../model/simulador';
import type { EscolhaDilema } from '../model/percurso';
import type { IdRegra } from './grafico';
import { numero, throughput } from './metricas';
import { EQUIPA_INICIAL } from './simulacao';

export interface PerguntaQuiz {
  id: string;
  texto: string;
  /** Sempre 3 opções, como no Sketch 2. */
  opcoes: readonly [string, string, string];
  /** Índice, em opcoes, da resposta certa. */
  certa: 0 | 1 | 2;
  /** Porque é que a certa está certa. Aparece depois de responder. */
  explicacao: string;
  /** Valores com que o simulador abre em «Ver no simulador». */
  simulador: { wip: number; regra: IdRegra | null };
}

const { pessoas, chegadasPorDia } = EQUIPA_INICIAL;
const r = (wip: number) => simular(wip, EQUIPA_INICIAL);
const dias = (v: number): string => `${numero(v)} ${numero(v) === '1' ? 'dia' : 'dias'}`;

export const PERGUNTAS: readonly PerguntaQuiz[] = [
  {
    id: 'dobro-wip',
    texto: `A equipa tem ${pessoas} pessoas e decide começar o dobro das tarefas ao mesmo tempo (de ${pessoas} para ${pessoas * 2}). O que acontece ao lead time?`,
    opcoes: [
      'Desce, porque há mais trabalho a avançar',
      'Sobe, porque o WIP sobe e o throughput não acompanha',
      'Fica igual, só muda o throughput',
    ],
    certa: 1,
    explicacao: `Com as mesmas pessoas, o throughput não sobe (até desce, com tanta troca de tarefa). Pela Lei de Little, mais WIP com o mesmo throughput dá mais lead time: no simulador passa de ${dias(r(pessoas).leadTime)} para ${dias(r(pessoas * 2).leadTime)}.`,
    simulador: { wip: pessoas * 2, regra: 'horizontal' },
  },
  {
    id: 'lead-cycle',
    texto: 'Qual é a diferença entre lead time e cycle time?',
    opcoes: [
      'São a mesma coisa',
      'O lead time conta desde o pedido; o cycle time só desde que se começa',
      'O cycle time conta desde o pedido; o lead time só desde que se começa',
    ],
    certa: 1,
    explicacao: `O lead time inclui a espera em «A fazer»; o cycle time conta só o tempo em curso. Com ${pessoas} tarefas em curso, o lead time é ${dias(r(pessoas).leadTime)} e o cycle time ${dias(r(pessoas).cycleTime)}: a diferença é o tempo à espera.`,
    simulador: { wip: pessoas, regra: 'horizontal' },
  },
  {
    id: 'banda-alarga',
    texto: 'No gráfico cumulativo, a banda «A fazer» está cada vez mais larga. O que quer dizer?',
    opcoes: [
      'Chega mais trabalho do que a equipa acaba',
      'A equipa está a entregar mais depressa',
      'Não entram tarefas novas',
    ],
    certa: 0,
    explicacao: 'Uma banda a alargar mostra que as tarefas entram nesse estado mais depressa do que saem. Em «A fazer», é a fila a crescer: entra mais do que a equipa consegue acabar.',
    simulador: { wip: 12, regra: 'alargar' },
  },
  {
    id: 'throughput',
    texto: `Com ${pessoas} pessoas, o que acontece às tarefas acabadas por dia (o throughput) quando o limite de WIP passa de ${pessoas} para 12?`,
    opcoes: [
      'Sobem, porque há mais tarefas a avançar',
      'Descem, porque se perde tempo a saltar entre tarefas',
      'Ficam iguais, porque as pessoas são as mesmas',
    ],
    certa: 1,
    explicacao: `O throughput conta só o que fica feito. Com 12 tarefas para ${pessoas} pessoas, cada uma salta entre várias e perde tempo: no simulador desce de ${throughput(r(pessoas).throughput)} para ${throughput(r(12).throughput)} tarefas por dia.`,
    simulador: { wip: 12, regra: null },
  },
  {
    id: 'pouco-wip',
    texto: `E se o limite de WIP for só 2, com ${pessoas} pessoas?`,
    opcoes: [
      'É o ideal: menos tarefas a meio, menos espera',
      'Há pessoas paradas: sai menos do que entra e a fila cresce',
      'O lead time desce para metade',
    ],
    certa: 1,
    explicacao: `Limitar demasiado também é mau: só 2 pessoas trabalham. Saem ${throughput(r(2).throughput)} tarefas por dia, menos do que as ${chegadasPorDia} que chegam, e o lead time sobe para ${dias(r(2).leadTime)}. O melhor ficou em uma tarefa por pessoa.`,
    simulador: { wip: 2, regra: 'alargar' },
  },
];

/** O que aparece antes da explicação, conforme a resposta. */
export const PREFIXO = { certa: 'Certo.', errada: 'Ainda não.' };

/** Frase da pontuação no ecrã final. */
export function textoPontuacao(certas: number, total: number): string {
  if (certas === total) return `${certas} de ${total}. Já sabes ler o fluxo.`;
  if (certas >= Math.ceil(total / 2)) return `${certas} de ${total}. Já sabes o que é Kanban.`;
  return `${certas} de ${total}. Vale a pena voltar ao simulador e às métricas.`;
}

export const NOMES_DILEMA: Record<EscolhaDilema, string> = {
  gente: 'Trazer mais gente',
  mais: 'Começar mais trabalho',
  menos: 'Fazer menos de cada vez',
};

/** A escolha feita no dilema do início, comparada com o que se aprendeu. */
export function textoDilema(escolha: EscolhaDilema | null): string {
  switch (escolha) {
    case 'menos':
      return `A tua escolha no início foi «${NOMES_DILEMA.menos}». Acertaste: limitar o WIP deu mais entregas e menos espera.`;
    case 'mais':
      return `A tua escolha no início foi «${NOMES_DILEMA.mais}». Agora sabes porque é que limitar o WIP resulta melhor.`;
    case 'gente':
      return `A tua escolha no início foi «${NOMES_DILEMA.gente}». Mais pessoas só ajudam se o WIP não crescer com elas: primeiro limita o trabalho em curso.`;
    case null:
      return `Não chegaste a responder ao dilema do início. A resposta era «${NOMES_DILEMA.menos}»: limitar o trabalho em curso.`;
  }
}
