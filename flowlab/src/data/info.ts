import type { Passo } from './passos';
import type { Percurso } from '../model/percurso';
import { montarDilema } from '../steps/dilema';

// O _ antes de passo avisa o TypeScript de que é normal não o usarmos.
export function ecraInfo(seccao: HTMLElement, _passo: Passo, percurso: Percurso): void {
  // ==========================================
  // PARTE 1: O DILEMA (H23, em steps/dilema.ts)
  // ==========================================
  montarDilema(seccao, percurso);


  // ==========================================
  // PARTE 2: EXPLICAÇÃO E QUADRO KANBAN
  // ==========================================
  const cabecalhoKanban = document.createElement('div');
  cabecalhoKanban.className = 'kanban-cabecalho';
  
  const etiquetaKanban = document.createElement('p');
  etiquetaKanban.className = 'ecra__etiqueta';
  
  const tituloKanban = document.createElement('h1');
  tituloKanban.textContent = 'Um quadro que mostra o trabalho a fluir';
  
  cabecalhoKanban.append(etiquetaKanban, tituloKanban);
  seccao.append(cabecalhoKanban);

  const seccaoKanban = document.createElement('div');
  seccaoKanban.className = 'ecra-info__kanban';

  const infoTextos = document.createElement('div');
  infoTextos.className = 'kanban-textos';

  const kanbanIntro = document.createElement('p');
  kanbanIntro.textContent = 'Kanban é uma forma de gerir trabalho com três ideias simples:';

  const kanbanLista = document.createElement('ol');
  const ideias = [
    { forte: 'Visualizar', resto: ' cada tarefa como um cartão num quadro.' },
    { forte: 'Limitar', resto: ' quantas tarefas estão em curso ao mesmo tempo.' },
    { forte: 'Medir', resto: ' o fluxo para saber se está a melhorar.' }
  ];

  ideias.forEach(ideia => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = ideia.forte;
    li.append(strong, ideia.resto);
    kanbanLista.append(li);
  });

  infoTextos.append(kanbanIntro, kanbanLista);

  const quadro = document.createElement('div');
  quadro.className = 'kanban-quadro';

  const colunas = [
    { titulo: 'A fazer', classe: 'col-fazer', tarefas: ['Tarefa E', 'Tarefa F', 'Tarefa G'] },
    { titulo: 'Em curso · máx. 2', classe: 'col-curso', tarefas: ['Tarefa C', 'Tarefa D'] },
    { titulo: 'Feito', classe: 'col-feito', tarefas: ['Tarefa A', 'Tarefa B'] }
  ];

  colunas.forEach(col => {
    const colDiv = document.createElement('div');
    colDiv.className = `kanban-coluna ${col.classe}`;
    
    const tituloCol = document.createElement('h3');
    tituloCol.textContent = col.titulo;
    colDiv.append(tituloCol);
    
    col.tarefas.forEach(t => {
      const cartao = document.createElement('div');
      cartao.className = 'kanban-cartao';
      cartao.textContent = t;
      colDiv.append(cartao);
    });
    
    quadro.append(colDiv);
  });

  seccaoKanban.append(infoTextos, quadro);
  seccao.append(seccaoKanban);
}