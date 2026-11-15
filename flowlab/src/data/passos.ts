// Os passos do percurso, pela ordem pedida pelo cliente na review do Sprint 1:
// introdução (H20), o que é Kanban (SCRUM-128), simulador, dilema, métricas,
// equipa e quiz. O tempo restante de cada passo inclui o próprio passo, por
// isso o menu mostra ~10 à entrada e ~9, ~8, ~6, ~4, ~3, ~1 ao avançar (T2).
// O passo do dilema mantém o id 'info' (e a âncora #info) para não partir
// ligações nem os ramos que já lhe mexem.
export type IdPasso = 'inicio' | 'kanban' | 'simular' | 'grafico' | 'metricas' | 'equipa' | 'quiz' | 'info';

export interface Passo {
  id: IdPasso;
  /** Nome curto, usado na barra de passos. */
  nome: string;
  /** Título do ecrã do passo. */
  titulo: string;
  /** Etiqueta pequena por cima do título, se o ecrã a tiver. */
  etiqueta?: string;
  /** Minutos que faltam ao entrar neste passo, contando com ele. */
  minutosRestantes: number;
}

export const PASSOS: readonly Passo[] = [
  // Introdução (H20): tema e objetivo do site, antes de qualquer simulador.
  { id: 'inicio', nome: 'Introdução', titulo: 'Menos trabalho a meio, mais trabalho acabado', etiqueta: 'Começar • Introdução', minutosRestantes: 10 },
  // O que é Kanban (SCRUM-128): explicação simples, num ecrã próprio, antes do simulador.
  { id: 'kanban', nome: 'O que é Kanban', titulo: 'O que é Kanban? Três ideias simples', etiqueta: 'Aprender • Kanban', minutosRestantes: 9 },
  { id: 'simular', nome: 'Simular', titulo: 'Quantas tarefas ao mesmo tempo? Experimenta.', etiqueta: 'Experimentar • Simulador', minutosRestantes: 8 },
  { id: 'info', nome: 'Dilema', titulo: 'A tua equipa entrega tudo atrasado. O que fazes?', etiqueta: 'Decidir • Dilema', minutosRestantes: 6 },
  { id: 'metricas', nome: 'Métricas', titulo: 'As três métricas do fluxo', etiqueta: 'Aprender • Métricas', minutosRestantes: 4 },
  { id: 'equipa', nome: 'Equipa', titulo: 'Mais gente ou mais trabalho? Experimenta.', etiqueta: 'Experimentar • Equipa', minutosRestantes: 3 },
  { id: 'quiz', nome: 'Quiz', titulo: 'Quiz final', minutosRestantes: 1 },
];

/**
 * Índice do passo a partir da âncora do endereço (ex.: «#metricas» → 4), para
 * se poder ligar diretamente a um passo e usar o botão «voltar» do browser
 * (H01). Devolve null se a âncora não for de nenhum passo.
 */
export function indicePorAncora(ancora: string): number | null {
  const id = ancora.replace(/^#/, '');
  const i = PASSOS.findIndex((p) => p.id === id);
  return i === -1 ? null : i;
}

/** Texto do progresso no menu: «Passo 2 de 5 · faltam ~8 min». */
export function textoProgresso(indice: number): string {
  const passo = PASSOS[indice];
  return `Passo ${indice + 1} de ${PASSOS.length} · faltam ~${passo.minutosRestantes} min`;
}
