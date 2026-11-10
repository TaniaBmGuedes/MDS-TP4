import type { Passo } from './passos';
import type { Percurso } from '../model/percurso';

const INFO_DILEMA = {
  subtitulo: 'Escolhe por instinto. No fim do percurso vais ver, com números, se acertaste.',
  opcoes: [
    {
      id: 'trazer-gente',
      titulo: 'Trazer mais gente',
      descricao: 'Mais pessoas, mais mãos a trabalhar.',
    },
    {
      id: 'comecar-trabalho',
      titulo: 'Começar mais trabalho',
      descricao: 'Tudo em paralelo, para não ficar nada parado.',
    },
    {
      id: 'fazer-menos',
      titulo: 'Fazer menos de cada vez',
      descricao: 'Acabar antes de começar coisas novas.',
    }
  ]
};

// Adicionámos o _ antes de passo e percurso para avisar o TypeScript 
// que é normal não os estarmos a usar neste momento.
export function ecraInfo(seccao: HTMLElement, _passo: Passo, _percurso: Percurso): void {
  // ==========================================
  // PARTE 1: O DILEMA (BOTÕES)
  // ==========================================
  const subtitulo = document.createElement('p');
  subtitulo.className = 'ecra-info__subtitulo';
  subtitulo.textContent = INFO_DILEMA.subtitulo;
  seccao.append(subtitulo);

  const grelhaOpcoes = document.createElement('div');
  grelhaOpcoes.className = 'ecra-info__opcoes';

  INFO_DILEMA.opcoes.forEach(opcao => {
    const botao = document.createElement('button');
    botao.className = 'cartao-opcao';
    
    const tituloOpcao = document.createElement('h2');
    tituloOpcao.className = 'cartao-opcao__titulo';
    tituloOpcao.textContent = opcao.titulo;
    
    const descOpcao = document.createElement('p');
    descOpcao.className = 'cartao-opcao__desc';
    descOpcao.textContent = opcao.descricao;
    
    botao.append(tituloOpcao, descOpcao);
    
    botao.addEventListener('click', () => {
      const todosCartoes = grelhaOpcoes.querySelectorAll('.cartao-opcao');
      todosCartoes.forEach(cartao => {
        cartao.classList.remove('cartao-opcao--selecionado');
      });
      botao.classList.add('cartao-opcao--selecionado');
    });
    
    grelhaOpcoes.append(botao);
  });

  seccao.append(grelhaOpcoes);


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