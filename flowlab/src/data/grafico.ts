// Conteúdo do ecrã 1 (T05): o simulador com o gráfico de fluxo cumulativo,
// a explicação das bandas e as 3 regras de leitura. Os textos usam os números
// do modelo (src/model/cfd.ts), por isso batem certo com o que o gráfico
// destaca.
import {
  alturaBanda,
  bandaQueAlarga,
  travessia,
  type Alargamento,
  type IdBanda,
  type SeriesCumulativas,
  type Travessia,
} from '../model/cfd';
import { numero } from './metricas';
import { EQUIPA_INICIAL } from './simulacao';

/** Limites do slider do WIP (os mesmos do protótipo v1). */
export const WIP_SLIDER_MIN = 1;
export const WIP_SLIDER_MAX = 12;

/** Dia em que a regra da distância horizontal mede as tarefas que entraram. */
export const DIA_ENTRADA = 3;

export const NOMES_BANDAS: Record<IdBanda, string> = {
  aFazer: 'A fazer',
  emCurso: 'Em curso',
  feito: 'Feito',
};

/** O que cada banda é, para a legenda. */
export const SIGNIFICADO_BANDAS: Record<IdBanda, string> = {
  aFazer: 'tarefas à espera',
  emCurso: 'tarefas começadas, ainda não acabadas',
  feito: 'tarefas entregues, acumuladas',
};

const tarefas = (v: number): string => `${numero(v)} ${numero(v) === '1' ? 'tarefa' : 'tarefas'}`;
const dias = (v: number): string => `${numero(v)} ${numero(v) === '1' ? 'dia' : 'dias'}`;

export const TEXTOS = {
  intro: `Uma equipa de ${EQUIPA_INICIAL.pessoas} pessoas recebe ${EQUIPA_INICIAL.chegadasPorDia} tarefas novas por dia, durante ${EQUIPA_INICIAL.dias} dias. Muda o limite de trabalho em curso e vê o gráfico mudar.`,
  rotuloWip: 'Limite de trabalho em curso (WIP)',
  ajudaWip: 'Quantas tarefas podem estar começadas ao mesmo tempo.',
  experimenta: 'Experimenta:',
  tituloGrafico: `Gráfico de fluxo cumulativo dos ${EQUIPA_INICIAL.dias} dias`,
  bandas:
    'Cada banda é uma coluna do quadro Kanban. Num dia, a altura de cada banda diz quantas tarefas estão nesse estado; empilhadas, somam todas as tarefas que já entraram.',
  tituloRegras: 'Como se lê: 3 regras',
  ajudaRegras: 'Escolhe uma regra para a ver destacada no gráfico.',
  semRegra: 'Nenhuma regra escolhida.',
  /** Texto alternativo do gráfico, com os números do fim da simulação. */
  descricao: (s: SeriesCumulativas, wip: number): string => {
    const d = s.entradas.length - 1;
    return `Gráfico de fluxo cumulativo com limite de WIP ${wip}, do dia 0 ao dia ${d}. Três bandas empilhadas: Feito em baixo, Em curso no meio e A fazer em cima. No dia ${d}: ${tarefas(alturaBanda(s, 'aFazer', d))} a fazer, ${tarefas(alturaBanda(s, 'emCurso', d))} em curso e ${tarefas(alturaBanda(s, 'feito', d))} feitas. Os valores de cada dia estão na tabela a seguir ao gráfico.`;
  },
};

export type IdRegra = 'altura' | 'horizontal' | 'alargar';

/** O que o gráfico destaca para uma regra, já com os números do cenário. */
export type Destaque =
  | { tipo: 'altura'; dia: number; valor: number }
  | ({ tipo: 'horizontal' } & Travessia)
  | ({ tipo: 'alargar' } & Alargamento)
  | { tipo: 'estavel'; de: number; ate: number };

export interface Regra {
  id: IdRegra;
  numero: number;
  titulo: string;
  /** A regra numa frase curta, igual para qualquer cenário. */
  resumo: string;
  destaque: (s: SeriesCumulativas) => Destaque;
  /** O que a regra mostra neste cenário. */
  explicar: (d: Destaque) => string;
}

export const REGRAS: readonly Regra[] = [
  {
    id: 'altura',
    numero: 1,
    titulo: 'Altura da banda = WIP',
    resumo: 'A altura da banda «Em curso» num dia é o trabalho em curso nesse dia.',
    destaque: (s) => {
      const dia = s.entradas.length - 1;
      return { tipo: 'altura', dia, valor: alturaBanda(s, 'emCurso', dia) };
    },
    explicar: (d) =>
      d.tipo !== 'altura'
        ? ''
        : `No dia ${d.dia}, a banda «Em curso» tem ${tarefas(d.valor)} de altura: é o WIP. Quanto mais alta, mais tarefas estão a meio ao mesmo tempo.`,
  },
  {
    id: 'horizontal',
    numero: 2,
    titulo: 'Distância horizontal = tempo',
    resumo: 'Da linha de cima até à banda «Feito», na horizontal, é o tempo que uma tarefa leva desde o pedido.',
    destaque: (s) => ({ tipo: 'horizontal', ...travessia(s, Math.min(DIA_ENTRADA, s.entradas.length - 1)) }),
    explicar: (d) => {
      if (d.tipo !== 'horizontal') return '';
      const total = EQUIPA_INICIAL.dias;
      if (d.diaSaida === null) {
        return `Até ao dia ${d.diaEntrada} entraram ${tarefas(d.nivel)}, e ao fim de ${total} dias ainda não estão todas feitas: cada tarefa leva mais de ${dias(total - d.diaEntrada)}.`;
      }
      return `Até ao dia ${d.diaEntrada} entraram ${tarefas(d.nivel)}. A banda «Feito» chega a esse número no dia ${numero(d.diaSaida)}: cada tarefa levou, em média, cerca de ${dias(d.diaSaida - d.diaEntrada)} desde o pedido (o lead time).`;
    },
  },
  {
    id: 'alargar',
    numero: 3,
    titulo: 'Banda a alargar = alerta',
    resumo: 'Se uma banda alarga de dia para dia, entra mais trabalho do que sai: há tarefas a acumular-se.',
    destaque: (s) => {
      const ate = s.entradas.length - 1;
      const a = bandaQueAlarga(s, 1, ate);
      return a ? { tipo: 'alargar', ...a } : { tipo: 'estavel', de: 1, ate };
    },
    explicar: (d) => {
      if (d.tipo === 'estavel') {
        return `Neste cenário nenhuma banda alarga entre o dia ${d.de} e o dia ${d.ate}: sai tanto trabalho como entra. Experimenta um limite de 12 ou de 2 e volta a escolher esta regra.`;
      }
      if (d.tipo !== 'alargar') return '';
      const porque =
        d.banda === 'aFazer'
          ? 'a equipa acaba menos tarefas do que as que chegam, e a fila cresce'
          : 'começam-se mais tarefas do que as que se acabam';
      return `Alerta: a banda «${NOMES_BANDAS[d.banda]}» passa de ${tarefas(d.inicio)} no dia ${d.de} para ${tarefas(d.fim)} no dia ${d.ate}. Está a alargar porque ${porque}.`;
    },
  },
];
