// Fontes (T20): as referências usadas no conteúdo do site. A lista é igual à
// do relatório (secção «Referências»): se uma mudar, muda nas duas.
// Cada fonte diz em que parte do site foi usada, para quem quiser confirmar.

export interface Fonte {
  /** Autores, como no relatório. */
  autores: string;
  ano: number;
  titulo: string;
  /** Editora ou revista, se houver. */
  publicacao?: string;
  /** Endereço público, se houver. */
  url?: string;
  /** Onde a fonte foi usada no site. */
  usadaEm: string;
}

export const FONTES: readonly Fonte[] = [
  {
    autores: 'Vacanti, D. e Yeret, Y.',
    ano: 2020,
    titulo: 'The Kanban Guide',
    url: 'https://kanbanguides.org',
    usadaEm: 'O que é Kanban, limite de WIP e as métricas do fluxo (WIP, throughput e cycle time).',
  },
  {
    autores: 'Anderson, D. J.',
    ano: 2010,
    titulo: 'Kanban: Successful Evolutionary Change for Your Technology Business',
    publicacao: 'Blue Hole Press',
    usadaEm: 'O quadro Kanban, as colunas e o limite de trabalho em curso.',
  },
  {
    autores: 'Vacanti, D. S.',
    ano: 2015,
    titulo: 'Actionable Agile Metrics for Predictability',
    publicacao: 'ActionableAgile Press',
    usadaEm: 'Gráfico de fluxo cumulativo e as três regras de leitura; lead time e cycle time.',
  },
  {
    autores: 'Little, J. D. C.',
    ano: 1961,
    titulo: 'A Proof for the Queuing Formula: L = λW',
    publicacao: 'Operations Research, 9(3), 383–387',
    usadaEm: 'Lei de Little nas métricas, no simulador da equipa e no quiz.',
  },
  {
    autores: 'Schwaber, K. e Sutherland, J.',
    ano: 2020,
    titulo: 'The Scrum Guide',
    url: 'https://scrumguides.org',
    usadaEm: 'Processo da equipa que fez o site (sprints, review e retrospetiva).',
  },
];

/** A referência escrita como no relatório: «Autores (ano). Título. Publicação.» */
export function referencia(fonte: Fonte): string {
  const partes = [`${fonte.autores} (${fonte.ano}).`, `${fonte.titulo}.`];
  if (fonte.publicacao) partes.push(`${fonte.publicacao}.`);
  return partes.join(' ');
}
