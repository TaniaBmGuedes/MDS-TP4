// Ponto de entrada: cria o store do percurso e monta a shell da app (T2),
// com o menu do percurso à esquerda e todos os passos seguidos numa só
// página. Desce-se de um passo para o seguinte com o scroll; o menu, o
// progresso e o endereço acompanham o passo que está à vista. Clicar num
// passo do menu (ou num botão que leve a outro passo) desliza até ele.
import './style.css';
import './shell.css';
import { animarAoAparecer, atualizarLeitura } from './components/animacoes';
import { ativarInclinacao, dividirPalavras, mostrarCarregamento } from './components/efeitos';
import { criarFontes } from './components/fontes';
import { criarMenuLateral } from './components/menuLateral';
import { PASSOS, indicePorAncora } from './data/passos';
import { PERGUNTAS } from './data/quiz';
import { criarPercurso, type EstadoPercurso } from './model/percurso';
import { ECRAS } from './steps';
// O modo escuro fica em último, para se sobrepor a todos os outros estilos.
import './escuro.css';

// Com o modo strict, querySelector pode devolver null: é preciso tratar esse
// caso em vez de assumir que o elemento existe.
const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Falta o elemento #app no index.html');

const percurso = criarPercurso(PASSOS.length, PERGUNTAS.length);

// O cabeçalho e o rodapé do site estão no index.html. O menu do percurso
// abre e fecha pela esquerda, só com o botão de menu antes do logótipo.
const menu = criarMenuLateral(PASSOS, percurso);
document.querySelector('.site-topo__linha')?.prepend(menu.botao);
// Fica antes da página no HTML: no telemóvel aparece por cima do título.
document.querySelector('.pagina')?.before(menu.painel);

// ---------- Os passos, todos seguidos ----------
// Cada passo é uma secção com a âncora do passo (#simular, #metricas, …),
// desenhada uma vez pelo seu ecrã.
const seccoes = PASSOS.map((passo) => {
  const seccao = document.createElement('section');
  seccao.className = 'ecra';
  seccao.id = passo.id;
  app.append(seccao);
  return seccao;
});

function desenharPasso(indice: number): void {
  const passo = PASSOS[indice];
  const seccao = seccoes[indice];
  seccao.replaceChildren();
  const tituloId = `titulo-${passo.id}`;
  seccao.setAttribute('aria-labelledby', tituloId);

  // Etiqueta com o número do passo em destaque: «02 / 06 · Experimentar • Simulador».
  const etiqueta = document.createElement('p');
  etiqueta.className = 'ecra__etiqueta';
  const numero = document.createElement('span');
  numero.className = 'ecra__numero';
  numero.textContent = String(indice + 1).padStart(2, '0');
  const total = String(PASSOS.length).padStart(2, '0');
  etiqueta.append(numero, ` / ${total}${passo.etiqueta ? ` · ${passo.etiqueta}` : ''}`);
  seccao.append(etiqueta);

  const titulo = document.createElement('h1');
  titulo.id = tituloId;
  titulo.className = 'ecra__titulo';
  titulo.tabIndex = -1;
  titulo.textContent = passo.titulo;
  // As palavras do título sobem uma a uma quando ele aparece (efeitos.ts).
  dividirPalavras(titulo);
  seccao.append(titulo);

  ECRAS[passo.id](seccao, passo, percurso);
}

PASSOS.forEach((_, i) => desenharPasso(i));

// Fontes (T20): no fim da página, depois do último passo.
app.after(criarFontes());
animarAoAparecer(seccoes);
// Efeitos «wow» (H31): ecrã de carregamento e cartões com inclinação.
// Nenhum corre com «reduzir movimento»; a inclinação só com rato.
mostrarCarregamento();
ativarInclinacao();
atualizarLeitura();
window.addEventListener('resize', atualizarLeitura);

// ---------- Scroll → passo atual ----------
// O passo atual é o último cuja secção já passou a linha a 40 % da altura
// do ecrã. No fundo da página é sempre o último passo (o quiz pode ser
// curto demais para chegar à linha).
const LINHA_DO_ECRA = 0.4;
/** Enquanto desliza por um clique, o scroll não muda o passo. */
let deslizarAte = 0;
/** true quando a mudança de passo veio do scroll (não se desliza outra vez). */
let vemDoScroll = false;

function passoVisivel(): number {
  const fundo = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (fundo) return seccoes.length - 1;
  const linha = window.innerHeight * LINHA_DO_ECRA;
  let atual = 0;
  seccoes.forEach((s, i) => {
    if (s.getBoundingClientRect().top <= linha) atual = i;
  });
  return atual;
}

let pedidoFrame = 0;
window.addEventListener(
  'scroll',
  () => {
    if (pedidoFrame) return;
    pedidoFrame = requestAnimationFrame(() => {
      pedidoFrame = 0;
      atualizarLeitura();
      if (performance.now() < deslizarAte) return;
      const i = passoVisivel();
      if (i === percurso.estado().passoAtual) return;
      vemDoScroll = true;
      percurso.irPara(i);
      vemDoScroll = false;
    });
  },
  { passive: true },
);
// Quando o deslizar acaba, o scroll volta a mandar.
window.addEventListener('scrollend', () => {
  deslizarAte = 0;
});

// ---------- Passo atual → scroll ----------
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

function irParaSeccao(indice: number, suave: boolean): void {
  const passo = PASSOS[indice];
  // O simulador lê o pedido do quiz («Ver no simulador») quando se desenha.
  if (passo.id === 'simular' && percurso.temPedidoSimulador()) desenharPasso(indice);
  // Margem de segurança caso o browser não tenha o evento scrollend.
  deslizarAte = performance.now() + 1200;
  seccoes[indice].scrollIntoView({ behavior: suave && !reduzirMovimento.matches ? 'smooth' : 'auto', block: 'start' });
  // Quem usa teclado ou leitor de ecrã continua a partir do título do passo.
  document.getElementById(`titulo-${passo.id}`)?.focus({ preventScroll: true });
}

let passoAntes = percurso.estado().passoAtual;
percurso.subscrever((estado: EstadoPercurso) => {
  if (estado.passoAtual === passoAntes) return;
  passoAntes = estado.passoAtual;
  if (!vemDoScroll) irParaSeccao(estado.passoAtual, true);
});

// ---------- Âncoras (H01) ----------
// O endereço diz o passo à vista (#simular, #metricas, …). Com o scroll só se
// substitui o endereço, para o «voltar» do browser não guardar cada passo
// por onde se passou; um clique para outro passo fica no histórico.
function atualizarAncora(estado: EstadoPercurso): void {
  const ancora = `#${PASSOS[estado.passoAtual].id}`;
  if (location.hash === ancora) return;
  // Ao abrir o site no início, o endereço fica sem âncora: com «#inicio» o
  // browser descia até ela quando a página acabasse de carregar.
  if (location.hash === '' && estado.passoAtual === 0) return;
  if (vemDoScroll || location.hash === '') history.replaceState(null, '', ancora);
  else history.pushState(null, '', ancora);
}

window.addEventListener('popstate', () => {
  const i = indicePorAncora(location.hash);
  if (i !== null && i !== percurso.estado().passoAtual) percurso.irPara(i);
});

// Abrir um endereço com âncora vai direto a esse passo.
const inicial = indicePorAncora(location.hash);
if (inicial !== null && inicial !== 0) {
  vemDoScroll = true;
  percurso.irPara(inicial);
  vemDoScroll = false;
  deslizarAte = performance.now() + 300;
  seccoes[inicial].scrollIntoView({ block: 'start' });
}

atualizarAncora(percurso.estado());
percurso.subscrever(atualizarAncora);
