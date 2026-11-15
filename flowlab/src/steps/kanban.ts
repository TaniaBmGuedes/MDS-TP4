// Ecrã «O que é Kanban» (SCRUM-128): a explicação simples do Kanban, num ecrã
// próprio e antes do simulador, para quem chega perceber de que se fala antes
// de experimentar. Três ideias à esquerda e um quadro de exemplo à direita.
// O título e a etiqueta vêm do main.ts (data/passos.ts).
// Antes estava por baixo do dilema, em data/info.ts; o feedback do cliente na
// review do Sprint 1 pediu que viesse à cabeça e separada do dilema.
import type { Ecra } from './index';

const IDEIAS = [
  { forte: 'Visualizar', resto: ' cada tarefa como um cartão num quadro.' },
  { forte: 'Limitar', resto: ' quantas tarefas estão em curso ao mesmo tempo.' },
  { forte: 'Medir', resto: ' o fluxo para saber se está a melhorar.' },
] as const;

const COLUNAS = [
  { titulo: 'A fazer', classe: 'col-fazer', tarefas: ['Tarefa E', 'Tarefa F', 'Tarefa G'] },
  { titulo: 'Em curso · máx. 2', classe: 'col-curso', tarefas: ['Tarefa C', 'Tarefa D'] },
  { titulo: 'Feito', classe: 'col-feito', tarefas: ['Tarefa A', 'Tarefa B'] },
] as const;

export const ecraKanban: Ecra = (seccao) => {
  const bloco = document.createElement('div');
  bloco.className = 'ecra-info__kanban';

  // ---------- Esquerda: as três ideias ----------
  const textos = document.createElement('div');
  textos.className = 'kanban-textos';

  const intro = document.createElement('p');
  intro.textContent = 'Kanban é uma forma de gerir trabalho com três ideias simples:';

  const lista = document.createElement('ol');
  IDEIAS.forEach((ideia) => {
    const li = document.createElement('li');
    const forte = document.createElement('strong');
    forte.textContent = ideia.forte;
    li.append(forte, ideia.resto);
    lista.append(li);
  });

  const aSeguir = document.createElement('p');
  aSeguir.className = 'kanban-textos__seguir';
  aSeguir.textContent = 'No passo seguinte vais experimentar a segunda ideia: o que muda quando se limita o trabalho em curso.';

  textos.append(intro, lista, aSeguir);

  // ---------- Direita: um quadro de exemplo ----------
  const quadro = document.createElement('div');
  quadro.className = 'kanban-quadro';
  quadro.setAttribute('role', 'img');
  quadro.setAttribute(
    'aria-label',
    'Exemplo de quadro Kanban: três tarefas em «A fazer», duas em «Em curso», que tem o máximo de 2, e duas em «Feito».',
  );

  COLUNAS.forEach((col) => {
    const coluna = document.createElement('div');
    coluna.className = `kanban-coluna ${col.classe}`;
    const titulo = document.createElement('h3');
    titulo.textContent = col.titulo;
    coluna.append(titulo);
    col.tarefas.forEach((t) => {
      const cartao = document.createElement('div');
      cartao.className = 'kanban-cartao';
      cartao.textContent = t;
      coluna.append(cartao);
    });
    quadro.append(coluna);
  });

  bloco.append(textos, quadro);
  seccao.append(bloco);
};
