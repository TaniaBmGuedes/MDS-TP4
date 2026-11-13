// Ponto de entrada: cria o store do percurso e monta a shell da app (T2),
// com o menu do percurso à esquerda e o título do passo atual. Muda-se de
// passo pelo menu.
import './style.css';
import './shell.css';
import { criarFontes } from './components/fontes';
import { criarMenuLateral } from './components/menuLateral';
import { criarNavegacaoPassos } from './components/navegacaoPassos';
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

const seccao = document.createElement('section');
seccao.className = 'ecra';
app.append(seccao);

// Fontes (T20): no fim da página, depois do ecrã do passo, em todos os passos.
app.after(criarFontes());

let passoDesenhado = -1;

function desenharPasso(estado: EstadoPercurso): void {
  // Os ouvintes são chamados a cada mudança (por ex., uma resposta do quiz);
  // só se volta a desenhar o ecrã quando o passo muda.
  if (estado.passoAtual === passoDesenhado) return;
  const primeiraVez = passoDesenhado === -1;
  passoDesenhado = estado.passoAtual;

  const passo = PASSOS[estado.passoAtual];
  seccao.replaceChildren();
  seccao.setAttribute('aria-labelledby', 'titulo-passo');

  const titulo = document.createElement('h1');
  titulo.id = 'titulo-passo';
  titulo.tabIndex = -1;
  titulo.textContent = passo.titulo;

  if (passo.etiqueta) {
    const etiqueta = document.createElement('p');
    etiqueta.className = 'ecra__etiqueta';
    etiqueta.textContent = passo.etiqueta;
    seccao.append(etiqueta);
  }
  seccao.append(titulo);

  // Reinicia a animação de entrada do ecrã (o CSS desliga-a com
  // prefers-reduced-motion).
  seccao.classList.remove('ecra--entrar');
  void seccao.offsetWidth;
  seccao.classList.add('ecra--entrar');
  ECRAS[passo.id](seccao, passo, percurso);
  // Fluxo contínuo: no fim do ecrã, ir para o passo anterior ou seguinte sem
  // passar pelo menu. A cor do passo atual vai para o body (shell.css).
  seccao.append(criarNavegacaoPassos(estado.passoAtual, percurso));
  document.body.dataset.passo = passo.id;

  // Ao mudar de passo, o foco vai para o título: quem usa teclado ou leitor de
  // ecrã continua a partir do início do novo passo, e não do botão clicado.
  if (!primeiraVez) {
    window.scrollTo({ top: 0 });
    titulo.focus({ preventScroll: true });
  }
}

// Âncoras (H01): cada passo tem o seu endereço (#simular, #metricas, …).
// Abrir um endereço com âncora vai para esse passo, e o botão «voltar» do
// browser volta ao passo anterior.
const inicial = indicePorAncora(location.hash);
if (inicial !== null) percurso.irPara(inicial);

function atualizarAncora(estado: EstadoPercurso): void {
  const ancora = `#${PASSOS[estado.passoAtual].id}`;
  if (location.hash === ancora) return;
  // Na primeira vez substitui, para o «voltar» não ficar preso no endereço sem âncora.
  if (location.hash === '') history.replaceState(null, '', ancora);
  else history.pushState(null, '', ancora);
}

window.addEventListener('popstate', () => {
  const i = indicePorAncora(location.hash);
  if (i !== null && i !== percurso.estado().passoAtual) percurso.irPara(i);
});

desenharPasso(percurso.estado());
atualizarAncora(percurso.estado());
percurso.subscrever(desenharPasso);
percurso.subscrever(atualizarAncora);
