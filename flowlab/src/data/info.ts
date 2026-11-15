import type { Passo } from './passos';
import type { Percurso } from '../model/percurso';
import { montarDilema } from '../steps/dilema';

// O _ antes de passo avisa o TypeScript de que é normal não o usarmos.
export function ecraInfo(seccao: HTMLElement, _passo: Passo, percurso: Percurso): void {
  // O dilema (H23, em steps/dilema.ts). A explicação do Kanban que estava aqui
  // passou para um ecrã próprio, antes do simulador (SCRUM-128, steps/kanban.ts).
  montarDilema(seccao, percurso);
}
