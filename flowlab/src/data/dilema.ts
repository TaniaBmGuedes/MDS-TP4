// O dilema do início («A tua equipa entrega tudo atrasado. O que fazes?», H23):
// as três opções, o resultado que a pessoa vê ao escolher e a frase do ecrã
// Equipa («A resposta ao dilema») que refere a escolha. Os números vêm do
// modelo da equipa (model/equipa.ts), os mesmos do ecrã Equipa, por isso
// batem certo com o que a pessoa vê lá. Sem DOM: é testado com o Vitest.
import { calcularEquipa } from '../model/equipa';
import type { EscolhaDilema } from '../model/percurso';
import {
  CENARIOS_EQUIPA,
  EQUIPA_BASE,
  compararComInicial,
  leadTimeEmDias,
  textoDiferenca,
  throughputPorDia,
  type CenarioEquipa,
} from './scenarios';
import { NOMES_DILEMA } from './quiz';

export interface OpcaoDilema {
  id: EscolhaDilema;
  titulo: string;
  descricao: string;
  /** O cenário do ecrã Equipa que mostra o que esta opção faz. */
  cenario: CenarioEquipa['id'];
}

export const OPCOES_DILEMA: readonly OpcaoDilema[] = [
  { id: 'gente', titulo: NOMES_DILEMA.gente, descricao: 'Mais pessoas, mais mãos a trabalhar.', cenario: 'mais-gente' },
  { id: 'mais', titulo: NOMES_DILEMA.mais, descricao: 'Tudo em paralelo, para não ficar nada parado.', cenario: 'mais-trabalho' },
  { id: 'menos', titulo: NOMES_DILEMA.menos, descricao: 'Acabar antes de começar coisas novas.', cenario: 'limitar-wip' },
];

export const TEXTOS_DILEMA = {
  subtitulo: 'Escolhe por instinto. Logo a seguir vês o que acontece com a tua escolha.',
  /** Etiqueta pequena do resultado, por cima do veredicto. */
  etiquetaResultado: 'O que acontece com a tua escolha',
  /** Frase do ecrã Equipa quando a pessoa saltou o dilema. */
  semEscolha: 'Não escolheste nenhuma opção no dilema. A resposta é «Fazer menos de cada vez»: limitar o trabalho em curso.',
} as const;

const VEREDICTO: Record<EscolhaDilema, string> = {
  menos: 'Boa escolha: é a que mais encurta a espera, sem gastar mais.',
  gente: 'Ajuda, mas só em parte.',
  mais: 'Parece que ajuda, mas piora.',
};

const EXPLICACAO: Record<EscolhaDilema, string> = {
  menos:
    'Acabar antes de começar coisas novas é a ideia central do Kanban: cada pessoa foca-se numa tarefa e as entregas saem mais depressa.',
  gente:
    'Mais pessoas entregam mais por dia, mas custam mais coordenação, e se o trabalho em curso crescer com a equipa, cada tarefa demora mais a sair.',
  mais:
    'Começar tudo em paralelo deixa muitas tarefas a meio: as pessoas saltam entre elas, quase nada acaba e cada tarefa demora muito mais.',
};

export function opcaoDilema(escolha: EscolhaDilema): OpcaoDilema {
  const opcao = OPCOES_DILEMA.find((o) => o.id === escolha);
  if (!opcao) throw new RangeError(`Não existe a opção ${escolha}`);
  return opcao;
}

function cenarioDaOpcao(escolha: EscolhaDilema): CenarioEquipa {
  const id = opcaoDilema(escolha).cenario;
  const cenario = CENARIOS_EQUIPA.find((c) => c.id === id);
  if (!cenario) throw new RangeError(`Falta o cenário ${id}`);
  return cenario;
}

/** Os números desta opção, comparados com a equipa inicial do ecrã Equipa. */
export function numerosDaOpcao(escolha: EscolhaDilema): string {
  const cenario = cenarioDaOpcao(escolha);
  const r = calcularEquipa(cenario.equipa);
  const d = compararComInicial(r, calcularEquipa(EQUIPA_BASE));
  const { pessoas, wip } = cenario.equipa;
  return (
    `No modelo do site, com ${pessoas} pessoas e ${wip} tarefas em curso (a equipa inicial tem ${EQUIPA_BASE.pessoas} e ${EQUIPA_BASE.wip}): ` +
    `throughput ${throughputPorDia(r.throughput)}, ${textoDiferenca(d.throughput)}; ` +
    `lead time ${leadTimeEmDias(r.leadTime)}, ${textoDiferenca(d.leadTime)}.`
  );
}

export interface ResultadoDilema {
  veredicto: string;
  explicacao: string;
  numeros: string;
}

/** O que a pessoa vê logo ao escolher. */
export function resultadoDilema(escolha: EscolhaDilema): ResultadoDilema {
  return { veredicto: VEREDICTO[escolha], explicacao: EXPLICACAO[escolha], numeros: numerosDaOpcao(escolha) };
}

/** A frase que abre «A resposta ao dilema», no ecrã Equipa, com a escolha da pessoa. */
export function textoEscolhaNaEquipa(escolha: EscolhaDilema | null): string {
  if (escolha === null) return TEXTOS_DILEMA.semEscolha;
  const { titulo } = opcaoDilema(escolha);
  return `Escolheste «${titulo}». ${VEREDICTO[escolha]} ${EXPLICACAO[escolha]}`;
}
