// Animações do percurso contínuo (ticket das animações):
// - os blocos de cada passo aparecem a subir quando entram no ecrã e, dentro
//   deles, os cartões e opções entram um a um;
// - no computador, cada passo entra de baixo e o anterior encolhe e apaga-se
//   enquanto sai (CSS ligado ao scroll, em animacoes.css);
// - o fio do cabeçalho enche com o que já se leu da página.
// Com «reduzir movimento» (ou sem IntersectionObserver) não se esconde nada:
// o conteúdo fica logo visível e o fio só acompanha o scroll, sem transição.
import './animacoes.css';

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Peças repetidas dentro dos blocos (cartões, opções, colunas, itens de
 * listas): entram uma a uma depois do bloco, para o ecrã não aparecer todo
 * de uma vez. As decorações (aria-hidden) ficam de fora.
 */
// Cada tipo de peça entra à sua maneira (data-entrar, em animacoes.css):
// «pop» cresce com um pequeno salto, «lado» desliza da esquerda e «subir»
// (texto e o resto) sobe e ganha nitidez.
const ITENS: readonly (readonly [string, 'pop' | 'lado' | 'subir'])[] = [
  ['.cartao-opcao, .quiz__opcao, .sim__pilula, .eq__pilula, .inicio__item, .faixa__item', 'pop'],
  ['.kanban-coluna, .kanban-cartao, .ecra-info__kanban li, .regra', 'lado'],
  ['h2, h3, p, li, .botao, .inicio__comecar', 'subir'],
];

function marcarItens(bloco: HTMLElement): void {
  for (const [seletor, tipo] of ITENS) {
    bloco.querySelectorAll<HTMLElement>(seletor).forEach((item) => {
      // Decorações e peças já marcadas (ou dentro de uma marcada) ficam como estão.
      if (item.closest('[aria-hidden="true"], .entrar-item')) return;
      const irmaos = item.parentElement ? Array.from(item.parentElement.children) : [item];
      const posicao = Math.min(irmaos.indexOf(item), 6);
      item.classList.add('entrar-item');
      item.dataset.entrar = tipo;
      item.style.setProperty('--atraso-item', `${40 + posicao * 45}ms`);
    });
  }
}

/**
 * Quando uma peça acaba de entrar, perde a classe: volta às transições
 * dela (inclinação, pairar), que são mais rápidas do que a da entrada.
 */
function limparItem(evento: TransitionEvent): void {
  const item = evento.target;
  if (!(item instanceof HTMLElement) || evento.propertyName !== 'opacity') return;
  if (!item.classList.contains('entrar-item') || !item.closest('.revelado')) return;
  item.classList.remove('entrar-item');
  item.style.removeProperty('--atraso-item');
  delete item.dataset.entrar;
}

/** Faz aparecer, uma vez, cada bloco direto das secções quando fica à vista. */
export function animarAoAparecer(seccoes: readonly HTMLElement[]): void {
  if (reduzirMovimento.matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('animar');

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('revelado');
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.05, rootMargin: '0px' },
  );

  for (const seccao of seccoes) {
    Array.from(seccao.children).forEach((bloco, i) => {
      if (!(bloco instanceof HTMLElement)) return;
      bloco.classList.add('aparecer');
      // Os primeiros blocos de cada passo entram um a seguir ao outro.
      bloco.style.setProperty('--atraso', `${Math.min(i, 4) * 50}ms`);
      marcarItens(bloco);
      observador.observe(bloco);
    });
  }
  document.addEventListener('transitionend', limparItem);
}

/** Fio do cabeçalho: enche da esquerda para a direita com o scroll da página. */
export function atualizarLeitura(): void {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const fracao = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 1;
  document.documentElement.style.setProperty('--leitura', fracao.toFixed(4));
}
