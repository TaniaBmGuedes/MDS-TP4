// Estado do percurso (T2): passo atual, passos vistos e concluídos, resposta ao dilema,
// respostas do quiz e a pergunta em que a pessoa está (T17). Fica num store criado por criarPercurso(), em vez de
// variáveis globais soltas: os ecrãs recebem o store e só mudam o estado
// pelas funções dele. Não toca no DOM, por isso é testado com o Vitest.

import type { IdRegra } from '../data/grafico';

export type EscolhaDilema = 'gente' | 'mais' | 'menos';

/**
 * Pedido para abrir o simulador já com valores (T17: botão «Ver no
 * simulador» do quiz). O ecrã do simulador tira-o do store quando abre.
 */
export interface PedidoSimulador {
  wip: number;
  /** Regra de leitura a destacar logo, ou null. */
  regra: IdRegra | null;
  /** Índice da pergunta do quiz de onde veio, para o botão «Voltar ao quiz». */
  pergunta: number;
}

export interface EstadoPercurso {
  /** Índice do passo atual, de 0 a totalPassos - 1. */
  readonly passoAtual: number;
  /** vistos[i] é true se a pessoa já abriu o passo i. */
  readonly vistos: readonly boolean[];
  /**
   * concluidos[i] é true se a pessoa saiu do passo i para a frente. Voltar
   * atrás ou saltar para um passo anterior não conclui o passo.
   */
  readonly concluidos: readonly boolean[];
  readonly respostaDilema: EscolhaDilema | null;
  /** Índice da opção escolhida em cada pergunta, ou null se ainda não respondeu. */
  readonly respostasQuiz: readonly (number | null)[];
  /** Pergunta do quiz em que a pessoa está; igual ao total quando acabou. */
  readonly perguntaAtual: number;
}

export type Ouvinte = (estado: EstadoPercurso) => void;

export interface Percurso {
  estado(): EstadoPercurso;
  irPara(passo: number): void;
  avancar(): void;
  voltar(): void;
  responderDilema(escolha: EscolhaDilema): void;
  responderQuiz(pergunta: number, opcao: number): void;
  /** Passa à pergunta seguinte (ou ao resultado, depois da última). */
  proximaPergunta(): void;
  /** Apaga as respostas do quiz e volta à primeira pergunta. */
  reiniciarQuiz(): void;
  /** Guarda um pedido para o simulador abrir com estes valores. */
  pedirSimulador(pedido: PedidoSimulador): void;
  /** Diz se há um pedido à espera, sem o apagar. */
  temPedidoSimulador(): boolean;
  /** Devolve o pedido guardado (ou null) e apaga-o: só vale uma vez. */
  tirarPedidoSimulador(): PedidoSimulador | null;
  /** Chama o ouvinte a cada mudança. Devolve a função que o desliga. */
  subscrever(ouvinte: Ouvinte): () => void;
}

export function criarPercurso(totalPassos: number, totalPerguntas: number): Percurso {
  if (totalPassos < 1) throw new Error('O percurso precisa de pelo menos um passo');

  let estado: EstadoPercurso = {
    passoAtual: 0,
    vistos: Array.from({ length: totalPassos }, (_, i) => i === 0),
    concluidos: Array.from({ length: totalPassos }, () => false),
    respostaDilema: null,
    respostasQuiz: Array.from({ length: totalPerguntas }, () => null),
    perguntaAtual: 0,
  };
  // O pedido ao simulador não faz parte do estado: não muda nada no ecrã até
  // o simulador o ler, por isso não avisa os ouvintes.
  let pedido: PedidoSimulador | null = null;
  const ouvintes = new Set<Ouvinte>();

  // O estado é imutável: cada mudança cria um objeto novo, para ninguém o
  // alterar por fora e para os ouvintes poderem comparar o antes e o depois.
  function mudar(novo: EstadoPercurso): void {
    estado = novo;
    for (const ouvinte of ouvintes) ouvinte(estado);
  }

  function irPara(passo: number): void {
    const destino = Math.min(Math.max(Math.trunc(passo), 0), totalPassos - 1);
    const origem = estado.passoAtual;
    if (destino === origem) return;
    const paraAFrente = destino > origem;
    mudar({
      ...estado,
      passoAtual: destino,
      vistos: estado.vistos.map((visto, i) => visto || i === destino),
      concluidos: estado.concluidos.map((feito, i) => feito || (paraAFrente && i === origem)),
    });
  }

  return {
    estado: () => estado,
    irPara,
    avancar: () => irPara(estado.passoAtual + 1),
    voltar: () => irPara(estado.passoAtual - 1),
    responderDilema(escolha) {
      if (estado.respostaDilema === escolha) return;
      mudar({ ...estado, respostaDilema: escolha });
    },
    responderQuiz(pergunta, opcao) {
      if (pergunta < 0 || pergunta >= totalPerguntas) {
        throw new RangeError(`Não existe a pergunta ${pergunta}`);
      }
      mudar({
        ...estado,
        respostasQuiz: estado.respostasQuiz.map((r, i) => (i === pergunta ? opcao : r)),
      });
    },
    proximaPergunta() {
      if (estado.perguntaAtual >= totalPerguntas) return;
      mudar({ ...estado, perguntaAtual: estado.perguntaAtual + 1 });
    },
    reiniciarQuiz() {
      mudar({ ...estado, respostasQuiz: estado.respostasQuiz.map(() => null), perguntaAtual: 0 });
    },
    pedirSimulador(novo) {
      pedido = { ...novo };
    },
    tirarPedidoSimulador() {
      const atual = pedido;
      pedido = null;
      return atual;
    },
    temPedidoSimulador: () => pedido !== null,
    subscrever(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };
}
