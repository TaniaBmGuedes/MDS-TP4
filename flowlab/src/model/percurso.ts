// Estado do percurso (T2): passo atual, passos vistos, resposta ao dilema e
// respostas do quiz. Fica num store criado por criarPercurso(), em vez de
// variáveis globais soltas: os ecrãs recebem o store e só mudam o estado
// pelas funções dele. Não toca no DOM, por isso é testado com o Vitest.

export type EscolhaDilema = 'gente' | 'mais' | 'menos';

export interface EstadoPercurso {
  /** Índice do passo atual, de 0 a totalPassos - 1. */
  readonly passoAtual: number;
  /** vistos[i] é true se a pessoa já abriu o passo i. */
  readonly vistos: readonly boolean[];
  readonly respostaDilema: EscolhaDilema | null;
  /** Índice da opção escolhida em cada pergunta, ou null se ainda não respondeu. */
  readonly respostasQuiz: readonly (number | null)[];
}

export type Ouvinte = (estado: EstadoPercurso) => void;

export interface Percurso {
  estado(): EstadoPercurso;
  irPara(passo: number): void;
  avancar(): void;
  voltar(): void;
  responderDilema(escolha: EscolhaDilema): void;
  responderQuiz(pergunta: number, opcao: number): void;
  /** Chama o ouvinte a cada mudança. Devolve a função que o desliga. */
  subscrever(ouvinte: Ouvinte): () => void;
}

export function criarPercurso(totalPassos: number, totalPerguntas: number): Percurso {
  if (totalPassos < 1) throw new Error('O percurso precisa de pelo menos um passo');

  let estado: EstadoPercurso = {
    passoAtual: 0,
    vistos: Array.from({ length: totalPassos }, (_, i) => i === 0),
    respostaDilema: null,
    respostasQuiz: Array.from({ length: totalPerguntas }, () => null),
  };
  const ouvintes = new Set<Ouvinte>();

  // O estado é imutável: cada mudança cria um objeto novo, para ninguém o
  // alterar por fora e para os ouvintes poderem comparar o antes e o depois.
  function mudar(novo: EstadoPercurso): void {
    estado = novo;
    for (const ouvinte of ouvintes) ouvinte(estado);
  }

  function irPara(passo: number): void {
    const destino = Math.min(Math.max(Math.trunc(passo), 0), totalPassos - 1);
    if (destino === estado.passoAtual) return;
    mudar({
      ...estado,
      passoAtual: destino,
      vistos: estado.vistos.map((visto, i) => visto || i === destino),
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
    subscrever(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };
}
