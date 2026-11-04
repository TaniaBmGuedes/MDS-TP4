// Perguntas do quiz, migradas do protótipo v1.
export interface Pergunta {
  texto: string;
  opcoes: string[];
  /** Índice, em opcoes, da resposta certa. */
  certa: number;
  explicacao: string;
}

export const PERGUNTAS: Pergunta[] = [
  {
    texto: 'A equipa tem 4 pessoas e decide começar o dobro das tarefas ao mesmo tempo. O que acontece ao lead time?',
    opcoes: [
      'Desce, porque há mais trabalho a avançar',
      'Sobe, porque o WIP sobe e o throughput não acompanha',
      'Fica igual, só muda o throughput',
    ],
    certa: 1,
    explicacao: 'Pela Lei de Little, mais trabalho em curso com o mesmo throughput dá mais tempo por tarefa.',
  },
  {
    texto: 'Qual é a diferença entre lead time e cycle time?',
    opcoes: [
      'São a mesma coisa',
      'O lead time conta desde o pedido; o cycle time só desde que se começa',
      'O cycle time conta desde o pedido; o lead time só desde que se começa',
    ],
    certa: 1,
    explicacao: 'O lead time inclui a espera em «A fazer». O cycle time conta só o tempo em curso.',
  },
  {
    texto: 'No gráfico cumulativo, a faixa «Em curso» está a ficar cada vez mais larga. O que quer dizer?',
    opcoes: [
      'Começa-se mais trabalho do que se acaba',
      'A equipa está a entregar mais depressa',
      'Não entram tarefas novas',
    ],
    certa: 0,
    explicacao: 'Uma faixa a alargar mostra que as tarefas entram nesse estado mais depressa do que saem.',
  },
  {
    texto: 'O que mede o throughput?',
    opcoes: [
      'Quanto tempo demora uma tarefa',
      'Quantas tarefas estão a meio',
      'Quantas tarefas a equipa acaba por unidade de tempo',
    ],
    certa: 2,
    explicacao: 'É a velocidade de entrega: tarefas feitas por dia ou por semana.',
  },
];
