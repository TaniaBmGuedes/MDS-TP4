// Animações do percurso contínuo (ticket das animações):
// - os blocos de cada passo aparecem a subir quando entram no ecrã;
// - o fio do cabeçalho enche com o que já se leu da página.
// Com «reduzir movimento» (ou sem IntersectionObserver) não se esconde nada:
// o conteúdo fica logo visível e o fio só acompanha o scroll, sem transição.
import './animacoes.css';

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

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
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
  );

  for (const seccao of seccoes) {
    Array.from(seccao.children).forEach((bloco, i) => {
      if (!(bloco instanceof HTMLElement)) return;
      bloco.classList.add('aparecer');
      // Os primeiros blocos de cada passo entram um a seguir ao outro.
      bloco.style.setProperty('--atraso', `${Math.min(i, 4) * 70}ms`);
      observador.observe(bloco);
    });
  }
}

/** Fio do cabeçalho: enche da esquerda para a direita com o scroll da página. */
export function atualizarLeitura(): void {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const fracao = total > 0 ? Math.min(Math.max(window.scrollY / total, 0), 1) : 1;
  document.documentElement.style.setProperty('--leitura', fracao.toFixed(4));
}
