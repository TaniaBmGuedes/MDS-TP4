// Os 6 passos do percurso, pela ordem da proposta conjunta (experimentar antes
// de ler). O tempo restante de cada passo inclui o próprio passo, por isso o
// cabeçalho mostra ~10 à entrada e ~8, ~6, ~4, ~1 ao avançar (T2).
export type IdPasso = 'simular' | 'grafico' | 'info' | 'metricas' | 'quiz';
// cabeçalho mostra ~10 à entrada e ~8, ~6, ~4, ~3, ~1 ao avançar (T2).
export type IdPasso = 'simular' | 'grafico' | 'fazes' | 'metricas' | 'equipa' | 'quiz';

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
  { id: 'simular', nome: 'Simular', titulo: 'Quantas tarefas ao mesmo tempo? Experimenta.', etiqueta: 'Experimentar • Simulador', minutosRestantes: 10 },
  { id: 'grafico', nome: 'Ler o gráfico', titulo: 'Como se lê o gráfico cumulativo', minutosRestantes: 8 },
  { id: 'info', nome: 'Conheces o Kanban?', titulo: 'A tua equipa entrega tudo atrasado. O que fazes?', minutosRestantes: 6 },
  { id: 'metricas', nome: 'Métricas', titulo: 'As três métricas do fluxo', etiqueta: 'Aprender • Métricas', minutosRestantes: 4 },
  { id: 'simular', nome: 'Simular', titulo: 'Quantas tarefas ao mesmo tempo? Experimenta.', minutosRestantes: 10 },
  { id: 'equipa', nome: 'Equipa', titulo: 'Mais gente ou mais trabalho? Experimenta.', etiqueta: 'Experimentar • Equipa', minutosRestantes: 3 },
  { id: 'quiz', nome: 'Quiz', titulo: 'Quiz final', minutosRestantes: 1 },
];

/**
 * Índice do passo a partir da âncora do endereço (ex.: «#metricas» → 3), para
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
