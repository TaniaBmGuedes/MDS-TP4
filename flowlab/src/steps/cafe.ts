// Secção final «Do café ao software» (H18, SCRUM-74). Fica por baixo do
// último passo (o quiz) e não é um passo novo: não muda a ordem nem o tempo
// do percurso. Traduz a metáfora do Café Kanban, do Design Thinking do
// Sprint 0, para uma equipa de desenvolvimento.
import './cafe.css';

interface Par {
  cafe: string;
  software: string;
  conceito: string;
}

const PARES: readonly Par[] = [
  { conceito: 'Cartão', cafe: 'Um pedido: «2 cappuccinos, mesa 4».', software: 'Uma tarefa ou user story.' },
  { conceito: 'Colunas', cafe: 'Pedido → Em preparação → Pronto.', software: 'A fazer → Em curso → Feito.' },
  { conceito: 'Limite de WIP', cafe: 'O barista só faz 3 bebidas de cada vez.', software: 'No máximo N tarefas em curso por pessoa ou coluna.' },
  { conceito: 'Lead time', cafe: 'Do pedido até a bebida chegar à mesa.', software: 'Da tarefa entrar no quadro até estar feita.' },
  { conceito: 'Throughput', cafe: 'Bebidas entregues por hora.', software: 'Tarefas acabadas por dia ou por sprint.' },
  { conceito: 'Gargalo', cafe: 'Pedidos a acumular à frente da máquina.', software: 'Uma banda do gráfico cumulativo a alargar.' },
];

const ACOES: readonly string[] = [
  'Conta as tarefas em curso da tua equipa hoje. É o vosso WIP.',
  'Combinem um limite e acabem antes de começar outra.',
  'Vejam o gráfico cumulativo uma vez por semana: a banda que alarga é onde está o problema.',
];

export function seccaoCafe(): HTMLElement {
  const seccao = document.createElement('section');
  seccao.className = 'cafe';
  seccao.setAttribute('aria-labelledby', 'titulo-cafe');

  const etiqueta = document.createElement('p');
  etiqueta.className = 'cafe__etiqueta';
  etiqueta.textContent = 'Para levar';

  const titulo = document.createElement('h2');
  titulo.id = 'titulo-cafe';
  titulo.textContent = 'Do café ao software';

  const intro = document.createElement('p');
  intro.className = 'cafe__intro';
  intro.textContent =
    'Num café toda a gente vê quando os pedidos se acumulam. Numa equipa de software é igual, só que as tarefas não se veem. Cada ideia do percurso tem um par no café:';

  const lista = document.createElement('ul');
  lista.className = 'cafe__pares';
  for (const p of PARES) {
    const item = document.createElement('li');
    item.className = 'cafe__par';
    const nome = document.createElement('h3');
    nome.textContent = p.conceito;
    const cafe = document.createElement('p');
    const cafeRotulo = document.createElement('strong');
    cafeRotulo.textContent = 'No café: ';
    cafe.append(cafeRotulo, p.cafe);
    const sw = document.createElement('p');
    const swRotulo = document.createElement('strong');
    swRotulo.textContent = 'Na equipa: ';
    sw.append(swRotulo, p.software);
    item.append(nome, cafe, sw);
    lista.append(item);
  }

  const tituloAcoes = document.createElement('h3');
  tituloAcoes.className = 'cafe__subtitulo';
  tituloAcoes.textContent = 'Amanhã, na tua equipa';
  const acoes = document.createElement('ol');
  acoes.className = 'cafe__acoes';
  for (const a of ACOES) {
    const li = document.createElement('li');
    li.textContent = a;
    acoes.append(li);
  }

  seccao.append(etiqueta, titulo, intro, lista, tituloAcoes, acoes);
  return seccao;
}
