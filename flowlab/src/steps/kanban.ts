// Ecrã «O que é Kanban» (SCRUM-128): a explicação simples do Kanban, num ecrã
// próprio e antes do simulador, para quem chega perceber de que se fala antes
// de experimentar. Uma frase de entrada, as três ideias em cartões numerados
// à esquerda, um quadro de exemplo à direita e, em baixo, a ponte para o
// simulador. O título e a etiqueta vêm do main.ts (data/passos.ts).
import './kanban.css';
import { ICONES } from '../components/icones';
import type { Ecra } from './index';

const IDEIAS = [
  { titulo: 'Visualizar', texto: 'Cada tarefa é um cartão e cada coluna é um estado. Vê-se de relance o que está à espera, em curso e feito.' },
  { titulo: 'Limitar', texto: 'A coluna «Em curso» tem um máximo. Só se começa uma tarefa nova quando outra acaba.' },
  { titulo: 'Medir', texto: 'Conta-se quanto trabalho sai e quanto tempo demora, para saber se o fluxo está a melhorar.' },
] as const;

const COLUNAS = [
  { titulo: 'A fazer', classe: 'fazer', tarefas: ['Tarefa E', 'Tarefa F', 'Tarefa G'] },
  { titulo: 'Em curso', limite: 'máx. 2', classe: 'curso', tarefas: ['Tarefa C', 'Tarefa D'] },
  { titulo: 'Feito', classe: 'feito', tarefas: ['Tarefa A', 'Tarefa B'] },
] as const;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export const ecraKanban: Ecra = (seccao, _passo, percurso) => {
  seccao.append(el('p', 'kanban__intro', 'Um método para gerir trabalho de forma visual, que nasceu nas fábricas da Toyota e hoje se usa em muitas equipas de software.'));

  const bloco = el('div', 'kanban');

  // ---------- Esquerda: as três ideias ----------
  const ideias = el('ol', 'kanban__ideias');
  IDEIAS.forEach((ideia, i) => {
    const li = el('li', 'kanban__ideia');
    li.append(
      el('span', 'kanban__numero', String(i + 1)),
      el('strong', 'kanban__ideia-titulo', ideia.titulo),
      el('span', 'kanban__ideia-texto', ideia.texto),
    );
    ideias.append(li);
  });

  // ---------- Direita: um quadro de exemplo ----------
  const exemplo = el('figure', 'kanban__exemplo');
  const quadro = el('div', 'kanban__quadro');
  quadro.setAttribute('role', 'img');
  quadro.setAttribute(
    'aria-label',
    'Exemplo de quadro Kanban: três tarefas em «A fazer», duas em «Em curso», que tem o máximo de 2, e duas em «Feito».',
  );
  COLUNAS.forEach((col) => {
    const coluna = el('div', `kanban__coluna kanban__coluna--${col.classe}`);
    const cabeca = el('p', 'kanban__cabeca');
    cabeca.append(el('span', undefined, col.titulo));
    if ('limite' in col) cabeca.append(el('span', 'kanban__limite', col.limite));
    coluna.append(cabeca);
    col.tarefas.forEach((t) => coluna.append(el('div', 'kanban__cartao', t)));
    quadro.append(coluna);
  });
  exemplo.append(
    quadro,
    el('figcaption', 'kanban__legenda', 'A «Em curso» está cheia: a Tarefa E só começa quando a C ou a D acabar.'),
  );

  bloco.append(ideias, exemplo);

  // ---------- Em baixo: ponte para o simulador ----------
  const ponte = el('div', 'kanban__ponte');
  ponte.append(el('p', undefined, 'A seguir, experimenta a segunda ideia: o que muda quando se limita o trabalho em curso?'));
  const seguir = el('button', 'botao kanban__seguir');
  seguir.type = 'button';
  seguir.innerHTML = `<span>Ir para o simulador</span>${ICONES.seta}`;
  seguir.addEventListener('click', () => percurso.avancar());
  ponte.append(seguir);

  seccao.append(bloco, ponte);
};
