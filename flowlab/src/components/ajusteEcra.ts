// Um ecrã por tema (SCRUM-135): no computador, cada passo tem a altura exata
// do ecrã (shell.css). Se o conteúdo de um passo não couber, reduz-se a
// escala dos seus blocos (--escala, aplicada com zoom) até caber, sem descer
// abaixo de ESCALA_MINIMA. Se nem assim couber, o passo cresce (ecra--cresce)
// com o tamanho normal, em vez de cortar o conteúdo. No telemóvel não se mexe em nada.

const ECRA_INTEIRO = window.matchMedia('(min-width: 1024px) and (min-height: 700px)');
const ESCALA_MINIMA = 0.72;

function cabe(seccao: HTMLElement): boolean {
  return seccao.scrollHeight <= seccao.clientHeight + 1;
}

function ajustar(seccao: HTMLElement): void {
  seccao.style.removeProperty('--escala');
  seccao.classList.remove('ecra--cresce');
  if (!ECRA_INTEIRO.matches || cabe(seccao)) return;

  seccao.style.setProperty('--escala', String(ESCALA_MINIMA));
  if (!cabe(seccao)) {
    // Nem assim cabe: cresce com o tamanho normal, que se lê melhor.
    seccao.style.removeProperty('--escala');
    seccao.classList.add('ecra--cresce');
    return;
  }
  // Procura a maior escala que ainda cabe (o texto volta a partir linhas
  // com cada escala, por isso mede-se em vez de fazer uma conta).
  let cabeEm = ESCALA_MINIMA;
  let naoCabeEm = 1;
  for (let i = 0; i < 6; i++) {
    const meio = (cabeEm + naoCabeEm) / 2;
    seccao.style.setProperty('--escala', meio.toFixed(3));
    if (cabe(seccao)) cabeEm = meio;
    else naoCabeEm = meio;
  }
  seccao.style.setProperty('--escala', cabeEm.toFixed(3));
}

/** Ajusta cada passo ao ecrã agora, ao mudar o tamanho da janela e quando o conteúdo muda. */
export function ajustarAoEcra(seccoes: readonly HTMLElement[]): void {
  const pendentes = new Set<HTMLElement>();
  let pedido = 0;
  function agendar(seccao: HTMLElement): void {
    pendentes.add(seccao);
    if (pedido) return;
    pedido = requestAnimationFrame(() => {
      pedido = 0;
      pendentes.forEach(ajustar);
      pendentes.clear();
    });
  }
  const todas = (): void => seccoes.forEach(agendar);

  todas();
  void document.fonts.ready.then(todas);
  window.addEventListener('resize', todas);
  ECRA_INTEIRO.addEventListener('change', todas);

  // Conteúdo novo (resposta do quiz, regra escolhida, …). Mudanças dentro de
  // decorações (aria-hidden: quadro vivo, palavra a descodificar) não contam.
  seccoes.forEach((seccao) => {
    new MutationObserver((mudancas) => {
      const conta = mudancas.some((m) => {
        const alvo = m.target instanceof Element ? m.target : m.target.parentElement;
        return !alvo?.closest('[aria-hidden="true"]');
      });
      if (conta) agendar(seccao);
    }).observe(seccao, { childList: true, subtree: true, characterData: true });
  });
}
