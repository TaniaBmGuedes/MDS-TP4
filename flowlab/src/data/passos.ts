// Os 5 passos do percurso, pela ordem da proposta conjunta (experimentar antes
// de ler). O tempo restante de cada passo inclui o próprio passo, por isso o
// cabeçalho mostra ~10 à entrada e ~8, ~6, ~4, ~1 ao avançar (T2).
export type IdPasso = 'simular' | 'grafico' | 'fazes' | 'metricas' | 'quiz';

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
  { id: 'simular', nome: 'Simular', titulo: 'Quantas tarefas ao mesmo tempo? Experimenta.', minutosRestantes: 10 },
  { id: 'grafico', nome: 'Ler o gráfico', titulo: 'Como se lê o gráfico cumulativo', minutosRestantes: 8 },
  { id: 'fazes', nome: 'O que fazes?', titulo: 'Neste gráfico, o que fazes?', minutosRestantes: 6 },
  { id: 'metricas', nome: 'Métricas', titulo: 'As três métricas do fluxo', etiqueta: 'Aprender • Métricas', minutosRestantes: 4 },
  { id: 'quiz', nome: 'Quiz', titulo: 'Quiz final', minutosRestantes: 1 },
];
