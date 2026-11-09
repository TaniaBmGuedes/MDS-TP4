// Resumo final (H19): o badge e os conceitos que aparecem no ecrã de
// resultado do quiz. Cada conceito está ligado às perguntas que o testam; se
// a pessoa acertou em todas, o conceito fica «dominado», senão fica «a rever»
// e o ecrã mostra um botão para o passo onde se aprende.
import type { IdPasso } from './passos';
import { PERGUNTAS } from './quiz';

export interface Conceito {
  id: string;
  nome: string;
  /** O conceito numa frase, para levar para casa. */
  resumo: string;
  /** Ids das perguntas do quiz que testam este conceito. */
  perguntas: readonly string[];
  /** Passo onde se volta para rever. */
  passo: IdPasso;
}

export const CONCEITOS: readonly Conceito[] = [
  {
    id: 'limite-wip',
    nome: 'Limite de WIP',
    resumo: 'Uma tarefa por pessoa: nem a mais (troca de tarefa), nem a menos (gente parada).',
    perguntas: ['dobro-wip', 'pouco-wip'],
    passo: 'simular',
  },
  {
    id: 'little',
    nome: 'Lei de Little',
    resumo: 'Lead time = WIP ÷ throughput: mais trabalho a meio com a mesma equipa é mais espera.',
    perguntas: ['dobro-wip'],
    passo: 'metricas',
  },
  {
    id: 'tempos',
    nome: 'Lead time e cycle time',
    resumo: 'O lead time conta desde o pedido; o cycle time só desde que se começa.',
    perguntas: ['lead-cycle'],
    passo: 'metricas',
  },
  {
    id: 'throughput',
    nome: 'Throughput',
    resumo: 'Conta só o que fica feito por dia, não o que se começa.',
    perguntas: ['throughput'],
    passo: 'metricas',
  },
  {
    id: 'cfd',
    nome: 'Gráfico cumulativo',
    resumo: 'Uma banda a alargar quer dizer que entra mais trabalho do que sai.',
    perguntas: ['banda-alarga'],
    passo: 'simular',
  },
];

export interface EstadoConceito {
  conceito: Conceito;
  dominado: boolean;
}

/** Para cada conceito, se a pessoa acertou em todas as perguntas dele. */
export function estadoConceitos(respostas: readonly (number | null)[]): EstadoConceito[] {
  return CONCEITOS.map((conceito) => ({
    conceito,
    dominado: conceito.perguntas.every((id) => {
      const i = PERGUNTAS.findIndex((p) => p.id === id);
      return i !== -1 && respostas[i] === PERGUNTAS[i].certa;
    }),
  }));
}

export type NivelBadge = 'ouro' | 'prata' | 'bronze';

export interface Badge {
  nivel: NivelBadge;
  nome: string;
  descricao: string;
}

/** O badge ganho com a pontuação do quiz. */
export function badgePara(certas: number, total: number): Badge {
  if (certas === total) {
    return { nivel: 'ouro', nome: 'Mestre do fluxo', descricao: 'Acertaste em todas as perguntas.' };
  }
  if (certas >= Math.ceil(total / 2)) {
    return { nivel: 'prata', nome: 'Leitor do fluxo', descricao: 'Acertaste em mais de metade das perguntas.' };
  }
  return { nivel: 'bronze', nome: 'Aprendiz do fluxo', descricao: 'Fizeste o percurso todo. Revê os conceitos abaixo e tenta outra vez.' };
}
