// Ecrã de introdução (H20), em ecrã inteiro (H31): diz logo à entrada qual é
// o tema do site e o que a pessoa vai aprender, antes de qualquer simulador.
// À direita, um quadro Kanban vivo: as tarefas passam de coluna sozinhas,
// com no máximo 2 em curso, que é a ideia do site num relance.
// O título vem do main.ts; o botão «Começar» leva ao primeiro passo.
import './inicio.css';
import { PASSOS } from '../data/passos';
import { ICONES, iconePasso } from '../components/icones';
import { descodificar, semMovimento, tornarMagnetico } from '../components/efeitos';
import type { Ecra } from './index';

const APRENDER = [
  { passo: 'simular', texto: 'Porque é que começar menos tarefas ao mesmo tempo faz acabar mais depressa.' },
  { passo: 'info', texto: 'O que é um quadro Kanban e porque se limita o trabalho em curso.' },
  { passo: 'metricas', texto: 'Ler as três métricas do fluxo: trabalho em curso, throughput e lead time.' },
  { passo: 'equipa', texto: 'Decidir entre trazer mais gente ou fazer menos de cada vez.' },
] as const;

const TEMAS = ['Kanban', 'fluxo', 'WIP', 'lead time', 'throughput'] as const;

export const ecraInicio: Ecra = (seccao, _passo, percurso) => {
  // ---------- Topo: texto à esquerda, quadro vivo à direita ----------
  const heroi = document.createElement('div');
  heroi.className = 'inicio__heroi';

  const texto = document.createElement('div');
  texto.className = 'inicio__texto';

  const tema = document.createElement('p');
  tema.className = 'inicio__tema';
  tema.append('Uma lição interativa sobre ');
  const palavra = document.createElement('span');
  palavra.className = 'inicio__palavra';
  palavra.setAttribute('aria-hidden', 'true');
  const palavraLida = document.createElement('span');
  palavraLida.className = 'escondido-visual';
  palavraLida.textContent = 'Kanban e métricas de fluxo';
  tema.append(palavra, palavraLida);
  descodificar(palavra, TEMAS);

  const objetivo = document.createElement('p');
  objetivo.className = 'inicio__objetivo';
  objetivo.textContent = `Vais perceber, a experimentar e não só a ler, porque é que limitar o trabalho em curso faz as entregas chegarem mais cedo. São ${PASSOS.length - 1} passos e cerca de ${PASSOS[0].minutosRestantes} minutos.`;

  const comecar = document.createElement('button');
  comecar.type = 'button';
  comecar.className = 'inicio__comecar';
  comecar.innerHTML = `<span>Começar o percurso</span>${ICONES.seta}`;
  comecar.addEventListener('click', () => percurso.avancar());
  tornarMagnetico(comecar);

  heroi.append(texto, criarQuadroVivo());

  // O título e a etiqueta (desenhados no main.ts) passam para o bloco de texto.
  const titulo = seccao.querySelector('.ecra__titulo');
  const etiqueta = seccao.querySelector('.ecra__etiqueta');
  if (titulo) texto.prepend(titulo);
  if (etiqueta) texto.prepend(etiqueta);

  // ---------- O que vais aprender ----------
  const subtitulo = document.createElement('h2');
  subtitulo.className = 'inicio__subtitulo';
  subtitulo.textContent = 'O que vais aprender';

  const lista = document.createElement('ul');
  lista.className = 'inicio__lista';
  APRENDER.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'inicio__item';
    const icone = document.createElement('span');
    icone.className = 'inicio__icone';
    icone.innerHTML = iconePasso(item.passo);
    const frase = document.createElement('span');
    frase.textContent = item.texto;
    li.append(icone, frase);
    lista.append(li);
  });

  // Tudo no primeiro ecrã: o que se vai aprender fica por baixo do topo,
  // na largura toda, em quatro cartões lado a lado.
  const aprender = document.createElement('div');
  aprender.className = 'inicio__aprender';
  aprender.append(subtitulo, lista);
  texto.append(tema, objetivo, comecar);
  seccao.append(heroi, aprender);
};

// ---------- Quadro vivo ----------
const COLUNAS = ['A fazer', 'Em curso · máx. 2', 'Feito'] as const;
const LIMITE_EM_CURSO = 2;
const PASSO_MS = 1400;

/**
 * Quadro decorativo (aria-hidden): a cada passo, uma tarefa em curso fica
 * feita, entra outra de «A fazer» e chega uma nova. O movimento entre
 * colunas é animado com a técnica FLIP (mede, muda, inverte, anima).
 */
function criarQuadroVivo(): HTMLElement {
  const quadro = document.createElement('div');
  quadro.className = 'quadro-vivo';
  quadro.setAttribute('aria-hidden', 'true');

  const listas = COLUNAS.map((nome, i) => {
    const coluna = document.createElement('div');
    coluna.className = `quadro-vivo__coluna quadro-vivo__coluna--${i}`;
    const cabeca = document.createElement('p');
    cabeca.className = 'quadro-vivo__cabeca';
    cabeca.textContent = nome;
    const lista = document.createElement('div');
    lista.className = 'quadro-vivo__lista';
    coluna.append(cabeca, lista);
    quadro.append(coluna);
    return lista;
  });
  const [aFazer, emCurso, feito] = listas;

  let numero = 0;
  function cartao(): HTMLElement {
    numero++;
    const c = document.createElement('div');
    c.className = 'quadro-vivo__cartao';
    c.innerHTML = `<span class="quadro-vivo__id">FL-${String(numero).padStart(2, '0')}</span><span class="quadro-vivo__linha"></span><span class="quadro-vivo__linha quadro-vivo__linha--curta"></span>`;
    return c;
  }

  for (let i = 0; i < 2; i++) feito.append(cartao());
  for (let i = 0; i < LIMITE_EM_CURSO; i++) emCurso.append(cartao());
  for (let i = 0; i < 3; i++) aFazer.append(cartao());

  if (semMovimento()) return quadro;

  function mover(): void {
    const todos = Array.from(quadro.querySelectorAll<HTMLElement>('.quadro-vivo__cartao'));
    const antes = new Map(todos.map((c) => [c, c.getBoundingClientRect()]));

    // Uma tarefa em curso fica feita; o «Feito» guarda só as 3 últimas.
    const acabada = emCurso.firstElementChild;
    if (acabada) feito.prepend(acabada);
    while (feito.children.length > 3) feito.lastElementChild?.remove();
    // Entra outra em curso, sem passar o limite; chega uma nova ao fim da fila.
    const seguinte = aFazer.firstElementChild;
    if (seguinte && emCurso.children.length < LIMITE_EM_CURSO) emCurso.append(seguinte);
    const nova = cartao();
    nova.classList.add('quadro-vivo__cartao--novo');
    aFazer.append(nova);

    for (const [c, r] of antes) {
      if (!c.isConnected) continue;
      const depois = c.getBoundingClientRect();
      const dx = r.left - depois.left;
      const dy = r.top - depois.top;
      if (dx === 0 && dy === 0) continue;
      c.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 700, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      );
    }
  }

  window.setInterval(() => {
    // Parado com a aba escondida ou com o quadro fora do ecrã.
    if (document.hidden) return;
    const r = quadro.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    mover();
  }, PASSO_MS);
  return quadro;
}
