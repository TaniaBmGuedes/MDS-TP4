// Efeitos «wow» (SCRUM-137 · H31), inspirados no portefólio da equipa:
// ecrã de carregamento, botões magnéticos, cartões com inclinação 3D,
// palavras a subir e palavra a descodificar.
//
// Regras: com «reduzir movimento» nada disto corre e nada fica escondido;
// o magnetismo e a inclinação só existem com rato (pointer: fine).
import './efeitos.css';

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const comRato = window.matchMedia('(hover: hover) and (pointer: fine)');

export function semMovimento(): boolean {
  return reduzirMovimento.matches;
}

// ---------- Ecrã de carregamento ----------
const CHAVE_CARREGADO = 'flowlab.carregado';

function jaCarregouNaSessao(): boolean {
  try {
    return sessionStorage.getItem(CHAVE_CARREGADO) === '1';
  } catch {
    return false;
  }
}

function marcarCarregado(): void {
  try {
    sessionStorage.setItem(CHAVE_CARREGADO, '1');
  } catch {
    // Sem armazenamento: volta a aparecer ao recarregar, não faz mal.
  }
}

/**
 * «FlowLab» a subir, contador até 100 e uma cortina que abre para cima.
 * Só na primeira visita da sessão e nunca com «reduzir movimento».
 */
export function mostrarCarregamento(): void {
  if (semMovimento() || jaCarregouNaSessao()) return;
  marcarCarregado();

  const ecra = document.createElement('div');
  ecra.className = 'carregar';
  ecra.setAttribute('aria-hidden', 'true');
  ecra.innerHTML = `
    <div class="carregar__mascara"><p class="carregar__nome">FlowLab</p></div>
    <p class="carregar__papel">Kanban e métricas de fluxo</p>
    <div class="carregar__base">
      <span class="carregar__texto">A preparar o quadro</span>
      <span class="carregar__numero">0</span>
    </div>
    <div class="carregar__barra"></div>
  `;
  document.body.append(ecra);
  document.documentElement.classList.add('a-carregar');

  const numero = ecra.querySelector<HTMLElement>('.carregar__numero');
  const barra = ecra.querySelector<HTMLElement>('.carregar__barra');
  const DURACAO = 1500;
  const inicio = performance.now();

  function tique(agora: number): void {
    const t = Math.min(1, (agora - inicio) / DURACAO);
    const valor = Math.round((1 - Math.pow(1 - t, 3)) * 100);
    if (numero) numero.textContent = String(valor);
    if (barra) barra.style.width = `${valor}%`;
    if (t < 1) {
      requestAnimationFrame(tique);
      return;
    }
    window.setTimeout(() => {
      ecra.classList.add('carregar--sair');
      document.documentElement.classList.remove('a-carregar');
      ecra.addEventListener('transitionend', () => ecra.remove(), { once: true });
      // Se a transição não chegar a correr, sai na mesma.
      window.setTimeout(() => ecra.remove(), 1400);
    }, 220);
  }
  requestAnimationFrame(tique);
}

// ---------- Magnético ----------
/** O botão inclina-se para o rato e volta ao sítio quando ele sai. */
export function tornarMagnetico(elemento: HTMLElement, forca = 0.3): void {
  if (semMovimento() || !comRato.matches) return;
  elemento.classList.add('magnetico');
  elemento.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = elemento.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * forca;
    const y = (e.clientY - (r.top + r.height / 2)) * forca;
    elemento.style.transform = `translate(${x}px, ${y}px)`;
  });
  elemento.addEventListener('pointerleave', () => {
    elemento.style.transform = '';
  });
}

// ---------- Inclinação 3D ----------
/** Cartões que se inclinam para o rato. */
const INCLINAVEIS = '.inicio__item, .cartao-opcao, .regra, .kanban-quadro, .quadro-vivo';
const INCLINACAO_MAX = 8;

export function ativarInclinacao(): void {
  if (semMovimento() || !comRato.matches) return;
  let atual: HTMLElement | null = null;

  function largar(): void {
    if (!atual) return;
    atual.style.transform = '';
    atual.classList.remove('inclinado');
    atual = null;
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
      const cartao = e.target.closest<HTMLElement>(INCLINAVEIS);
      if (cartao !== atual) largar();
      if (!cartao) return;
      atual = cartao;
      cartao.classList.add('inclinado');
      const r = cartao.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * INCLINACAO_MAX * 2;
      const rx = -(py - 0.5) * INCLINACAO_MAX * 2;
      cartao.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', largar);
}

// ---------- Palavras a subir ----------
/**
 * Parte o texto do elemento em palavras, cada uma numa máscara, para subirem
 * uma a seguir à outra quando o elemento aparece (classe «revelado»). O texto
 * continua igual para leitores de ecrã: só se acrescentam spans.
 */
export function dividirPalavras(elemento: HTMLElement): void {
  const texto = elemento.textContent ?? '';
  elemento.textContent = '';
  elemento.classList.add('palavras');
  texto.split(/(\s+)/).forEach((parte, i) => {
    if (/^\s+$/.test(parte)) {
      elemento.append(document.createTextNode(parte));
      return;
    }
    if (!parte) return;
    const mascara = document.createElement('span');
    mascara.className = 'palavra';
    const dentro = document.createElement('span');
    dentro.className = 'palavra__dentro';
    dentro.style.setProperty('--i', String(Math.floor(i / 2)));
    dentro.textContent = parte;
    mascara.append(dentro);
    elemento.append(mascara);
  });
}

// ---------- Palavra a descodificar ----------
const SIMBOLOS = '!<>-_\\/[]{}=+*^?#01';

/** Vai trocando de palavra, descodificando letra a letra (portefólio: Scramble). */
export function descodificar(elemento: HTMLElement, palavras: readonly string[], intervalo = 2600): void {
  const [primeira] = palavras;
  if (primeira === undefined) return;
  elemento.textContent = primeira;
  if (semMovimento() || palavras.length < 2) return;

  let indice = 0;
  let atual = primeira;

  function trocar(para: string): void {
    const de = atual;
    atual = para;
    const tamanho = Math.max(de.length, para.length);
    const fila = Array.from({ length: tamanho }, (_, i) => ({
      de: de[i] ?? '',
      para: para[i] ?? '',
      inicio: Math.floor(Math.random() * 14),
      fim: Math.floor(Math.random() * 14) + 14,
    }));
    let frame = 0;
    function tique(): void {
      let feitas = 0;
      const partes = fila.map((l) => {
        if (frame >= l.fim) {
          feitas++;
          return l.para;
        }
        if (frame >= l.inicio) return SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)];
        return l.de;
      });
      elemento.textContent = partes.join('');
      frame++;
      if (feitas < fila.length) requestAnimationFrame(tique);
    }
    tique();
  }

  window.setInterval(() => {
    if (document.hidden) return;
    indice = (indice + 1) % palavras.length;
    trocar(palavras[indice]);
  }, intervalo);
}
