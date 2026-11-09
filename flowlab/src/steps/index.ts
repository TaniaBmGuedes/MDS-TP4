// Ecrãs dos passos. Cada ecrã é uma função que desenha o passo dentro do
// contentor e recebe o store do percurso, onde lê e guarda as respostas.
// Os ecrãs ainda por fazer usam um ecrã vazio; os tickets de cada ecrã
// (simulador, gráfico, «o que fazes?», métricas, quiz) substituem-no aqui.
import type { IdPasso, Passo } from '../data/passos';
import type { Percurso } from '../model/percurso';
import { ecraMetricas } from './metricas';
import { ecraSimular } from './simular';

export type Ecra = (contentor: HTMLElement, passo: Passo, percurso: Percurso) => void;

// Por agora cada passo mostra só o título (desenhado no main.ts).
const provisorio: Ecra = () => {};

export const ECRAS: Record<IdPasso, Ecra> = {
  simular: ecraSimular,
  grafico: provisorio,
  fazes: provisorio,
  metricas: ecraMetricas,
  quiz: provisorio,
};
