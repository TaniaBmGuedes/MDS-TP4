// Leitura do gráfico de fluxo cumulativo (T05). Funções puras sobre as séries
// do simulador: a altura de cada banda, a distância na horizontal entre a
// entrada e a saída, e a banda que alarga. Não tocam no DOM, por isso o
// gráfico e os textos das 3 regras usam as mesmas contas e são testadas com o
// Vitest.
import type { ResultadoSimulacao } from './simulador';

/** As séries acumuladas, uma entrada por dia (o índice 0 é o início). */
export type SeriesCumulativas = Pick<ResultadoSimulacao, 'entradas' | 'comecadas' | 'acabadas'>;

/** As bandas do gráfico, de cima para baixo, como as colunas do quadro. */
export type IdBanda = 'aFazer' | 'emCurso' | 'feito';

export const BANDAS: readonly IdBanda[] = ['aFazer', 'emCurso', 'feito'];

/** Limite de baixo e de cima de uma banda num dia. */
export function limitesBanda(s: SeriesCumulativas, banda: IdBanda, dia: number): { baixo: number; cima: number } {
  switch (banda) {
    case 'feito':
      return { baixo: 0, cima: s.acabadas[dia] };
    case 'emCurso':
      return { baixo: s.acabadas[dia], cima: s.comecadas[dia] };
    case 'aFazer':
      return { baixo: s.comecadas[dia], cima: s.entradas[dia] };
  }
}

/** Altura de uma banda num dia: quantas tarefas estão nesse estado. */
export function alturaBanda(s: SeriesCumulativas, banda: IdBanda, dia: number): number {
  const { baixo, cima } = limitesBanda(s, banda, dia);
  return cima - baixo;
}

/**
 * Distância na horizontal: as tarefas que tinham entrado até `diaEntrada`
 * estão todas feitas em `diaSaida`. A diferença é, em média, o tempo que uma
 * tarefa leva desde o pedido (o lead time). `diaSaida` é interpolado entre
 * dias e fica null se não chegar a esse nível dentro dos dias simulados.
 */
export interface Travessia {
  diaEntrada: number;
  /** Número acumulado de tarefas: a altura da seta. */
  nivel: number;
  diaSaida: number | null;
}

export function travessia(s: SeriesCumulativas, diaEntrada: number): Travessia {
  const nivel = s.entradas[diaEntrada];
  const { acabadas } = s;
  for (let dia = 1; dia < acabadas.length; dia++) {
    if (acabadas[dia] >= nivel - 1e-9) {
      const antes = acabadas[dia - 1];
      const fracao = acabadas[dia] === antes ? 0 : (nivel - antes) / (acabadas[dia] - antes);
      return { diaEntrada, nivel, diaSaida: Math.max(diaEntrada, dia - 1 + fracao) };
    }
  }
  return { diaEntrada, nivel, diaSaida: null };
}

/** Uma banda que alarga entre dois dias. */
export interface Alargamento {
  banda: IdBanda;
  de: number;
  ate: number;
  /** Altura da banda no dia `de` e no dia `ate`. */
  inicio: number;
  fim: number;
}

/**
 * A banda que mais alarga entre `de` e `ate`, se crescer mais do que
 * `limiar` tarefas. «Feito» não conta: cresce sempre, é o acumulado das
 * entregas. Devolve null se o fluxo está estável.
 */
export function bandaQueAlarga(s: SeriesCumulativas, de: number, ate: number, limiar = 1): Alargamento | null {
  let melhor: Alargamento | null = null;
  for (const banda of ['aFazer', 'emCurso'] as const) {
    const inicio = alturaBanda(s, banda, de);
    const fim = alturaBanda(s, banda, ate);
    if (fim - inicio > limiar && (!melhor || fim - inicio > melhor.fim - melhor.inicio)) {
      melhor = { banda, de, ate, inicio, fim };
    }
  }
  return melhor;
}
