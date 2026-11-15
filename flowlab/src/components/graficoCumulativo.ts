// Gráfico de fluxo cumulativo (T05), reutilizável pelos ecrãs do percurso.
// Três bandas empilhadas, como as colunas do quadro: «Feito» em baixo,
// «Em curso» no meio e «A fazer» em cima. Pode destacar a zona de uma das
// 3 regras de leitura.
//
// O SVG é desenhado à largura real do contentor (ResizeObserver), e não
// encolhido com um viewBox: assim o texto dos eixos fica com 12 px também
// num telemóvel de 360 px. Os caminhos das bandas são sempre os mesmos
// elementos, para o CSS animar a mudança de forma quando o WIP muda.
//
// Para leitor de ecrã: o SVG tem um texto alternativo com os números do fim,
// e a tabela com os valores de cada dia fica logo a seguir, num <details>.
// Com uma regra escolhida (T25), o texto alternativo diz o que está
// destacado e a tabela marca as mesmas células que o desenho.
//
// Leitura mais fácil: no fim de cada banda fica o nome e o valor do último
// dia (com espaço, a legenda de cima encolhe para uma linha). Passar o rato,
// tocar ou usar as setas no gráfico mostra uma linha vertical com os valores
// desse dia; o texto é anunciado ao leitor de ecrã.
import { celulasDestacadas, estaDestacada } from '../data/destaqueTabela';
import { NOMES_BANDAS, SIGNIFICADO_BANDAS, TEXTOS, type Destaque } from '../data/grafico';
import { numero } from '../data/metricas';
import { BANDAS, limitesBanda, type IdBanda, type SeriesCumulativas } from '../model/cfd';
import { afastarRotulos } from '../model/rotulos';

const NS = 'http://www.w3.org/2000/svg';
/** Abaixo desta largura o gráfico fica mais baixo, os dias vão de 5 em 5 e não há rótulos no fim. */
const ESTREITO = 520;
/** À direita fica o espaço dos rótulos no fim das bandas. */
const margem = (comRotulos: boolean) => ({ esquerda: 40, direita: comRotulos ? 104 : 14, cima: 26, baixo: 40 });
/** Distância mínima, na vertical, entre os rótulos do fim. */
const ESPACO_ROTULOS = 17;

export interface GraficoCumulativo {
  elemento: HTMLElement;
  /** Desenha as séries de um cenário; `descricao` é o texto alternativo. */
  atualizar: (series: SeriesCumulativas, descricao: string) => void;
  /**
   * Destaca a zona de uma regra, ou tira o destaque com null.
   * `explicacao` é a frase da regra; entra no texto alternativo do gráfico,
   * para quem não vê o desenho saber o que está destacado.
   */
  destacar: (destaque: Destaque | null, explicacao?: string) => void;
}

let instancias = 0;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  atributos: Record<string, string | number> = {},
  texto?: string,
): SVGElementTagNameMap[K] {
  const elemento = document.createElementNS(NS, tag);
  for (const [nome, valor] of Object.entries(atributos)) elemento.setAttribute(nome, String(valor));
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/** Topo do eixo vertical: múltiplo de 5 (até 20) ou de 10. */
function topoEixo(maximo: number): { topo: number; passo: number } {
  const passo = maximo <= 20 ? 5 : 10;
  return { topo: Math.max(passo, Math.ceil(maximo / passo) * passo), passo };
}

export function criarGraficoCumulativo(titulo: string): GraficoCumulativo {
  const id = `cfd-${++instancias}`;

  const figura = el('figure', 'cfd');
  figura.setAttribute('aria-labelledby', `${id}-titulo`);
  const legenda = el('figcaption', 'cfd__cabeca');
  const nome = el('span', 'cfd__titulo', titulo);
  nome.id = `${id}-titulo`;
  legenda.append(nome);

  const lista = el('ul', 'cfd__legenda');
  for (const banda of BANDAS) {
    const item = el('li', `cfd__chave cfd__chave--${banda}`);
    item.append(el('span', 'cfd__cor'), el('strong', undefined, NOMES_BANDAS[banda]), el('span', undefined, SIGNIFICADO_BANDAS[banda]));
    lista.append(item);
  }
  legenda.append(lista);

  const area = el('div', 'cfd__area');
  const desenho = svg('svg', { class: 'cfd__svg', role: 'img', focusable: 'false' });
  const defs = svg('defs');
  const seta = svg('marker', {
    id: `${id}-seta`,
    viewBox: '0 0 10 10',
    refX: 9,
    refY: 5,
    markerWidth: 7,
    markerHeight: 7,
    orient: 'auto-start-reverse',
  });
  seta.append(svg('path', { d: 'M0 0L10 5L0 10z', class: 'cfd__ponta' }));
  defs.append(seta);
  const grelha = svg('g', { class: 'cfd__grelha', 'aria-hidden': 'true' });
  const camadaBandas = svg('g', { class: 'cfd__bandas', 'aria-hidden': 'true' });
  const caminhos = new Map<IdBanda, SVGPathElement>();
  // De baixo para cima, para «Feito» ficar por baixo das outras.
  for (const banda of [...BANDAS].reverse()) {
    const caminho = svg('path', { class: `cfd__banda cfd__banda--${banda}` });
    caminhos.set(banda, caminho);
    camadaBandas.append(caminho);
  }
  const marcas = svg('g', { class: 'cfd__marcas', 'aria-hidden': 'true' });
  const fim = svg('g', { class: 'cfd__fim', 'aria-hidden': 'true' });
  // Cursor dos dias: linha vertical e um ponto no topo de cada banda.
  const cursor = svg('g', { class: 'cfd__cursor', 'aria-hidden': 'true' });
  const linhaCursor = svg('line', { class: 'cfd__cursor-linha' });
  const pontosCursor = new Map<IdBanda, SVGCircleElement>();
  cursor.append(linhaCursor);
  for (const banda of BANDAS) {
    const ponto = svg('circle', { r: 4, class: `cfd__cursor-ponto cfd__cursor-ponto--${banda}` });
    pontosCursor.set(banda, ponto);
    cursor.append(ponto);
  }
  desenho.append(defs, grelha, camadaBandas, marcas, fim, cursor);

  // Caixa com os valores do dia. É anunciada (aria-live), por isso quem usa
  // o teclado ouve os valores ao andar com as setas.
  const caixa = el('div', 'cfd__caixa');
  caixa.setAttribute('aria-live', 'polite');
  caixa.hidden = true;
  const ajuda = el('p', 'escondido-visual', TEXTOS.ajudaCursor);
  ajuda.id = `${id}-ajuda`;
  // A área recebe o foco para as setas funcionarem; o desenho continua a ser
  // uma imagem com texto alternativo.
  area.tabIndex = 0;
  area.setAttribute('role', 'group');
  area.setAttribute('aria-labelledby', `${id}-titulo`);
  area.setAttribute('aria-describedby', ajuda.id);
  area.append(desenho, caixa, ajuda);

  const dados = el('details', 'cfd__dados');
  dados.append(el('summary', undefined, 'Ver os valores de cada dia (tabela)'));
  const rolar = el('div', 'cfd__rolar');
  // Pode rolar na horizontal num ecrã estreito: tem de receber o foco.
  rolar.tabIndex = 0;
  rolar.setAttribute('role', 'region');
  rolar.setAttribute('aria-label', 'Tabela com os valores de cada dia');
  const tabela = el('table', 'cfd__tabela');
  const LEGENDA_TABELA = 'Tarefas em cada banda no fim de cada dia';
  const legendaTabela = el('caption', undefined, LEGENDA_TABELA);
  tabela.append(legendaTabela);
  const cabeca = el('thead');
  const linhaCabeca = el('tr');
  for (const nome of ['Dia', ...BANDAS.map((b) => NOMES_BANDAS[b])]) {
    const th = el('th', undefined, nome);
    th.scope = 'col';
    linhaCabeca.append(th);
  }
  cabeca.append(linhaCabeca);
  const corpo = el('tbody');
  tabela.append(cabeca, corpo);
  rolar.append(tabela);
  dados.append(rolar);

  figura.append(legenda, area, dados);

  let series: SeriesCumulativas | null = null;
  let destaque: Destaque | null = null;
  let descricao = '';
  let explicacaoDestaque = '';
  /** Dia mostrado pelo cursor, ou null sem cursor. */
  let diaCursor: number | null = null;
  /** Escalas do último desenho, para o cursor e o rato. */
  let escala: { x: (dia: number) => number; y: (v: number) => number; esquerda: number; direita: number } | null = null;

  /** Texto alternativo: os números do fim e, se houver, o destaque. */
  function atualizarDescricao(): void {
    const extra = destaque && explicacaoDestaque ? ` Destaque: ${explicacaoDestaque}` : '';
    desenho.setAttribute('aria-label', descricao + extra);
  }

  function desenhar(): void {
    const largura = Math.round(area.clientWidth);
    if (!series || largura === 0) return;
    const estreito = largura < ESTREITO;
    figura.classList.toggle('cfd--rotulos', !estreito);
    // Em ecrãs baixos o gráfico encolhe um pouco, para o passo caber num ecrã,
    // mas fica alto o bastante para as bandas não parecerem fitas.
    const altura = estreito ? 260 : window.innerHeight < 1000 ? 290 : 340;
    desenho.setAttribute('width', String(largura));
    desenho.setAttribute('height', String(altura));
    desenho.setAttribute('viewBox', `0 0 ${largura} ${altura}`);

    const MARGEM = margem(!estreito);
    const s = series;
    const ultimoDia = s.entradas.length - 1;
    const { topo, passo } = topoEixo(Math.max(...s.entradas));
    const baixo = altura - MARGEM.baixo;
    const x = (dia: number): number => MARGEM.esquerda + (dia / ultimoDia) * (largura - MARGEM.esquerda - MARGEM.direita);
    const y = (v: number): number => MARGEM.cima + (1 - v / topo) * (baixo - MARGEM.cima);
    escala = { x, y, esquerda: MARGEM.esquerda, direita: largura - MARGEM.direita };

    // Grelha e eixos.
    grelha.replaceChildren();
    for (let v = 0; v <= topo; v += passo) {
      grelha.append(svg('line', { x1: MARGEM.esquerda, x2: largura - MARGEM.direita, y1: y(v), y2: y(v), class: v === 0 ? 'cfd__eixo' : 'cfd__linha' }));
      grelha.append(svg('text', { x: MARGEM.esquerda - 8, y: y(v), class: 'cfd__valor', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, String(v)));
    }
    const cadaDia = estreito ? 5 : ultimoDia <= 20 ? 1 : 5;
    for (let dia = 0; dia <= ultimoDia; dia += cadaDia) {
      grelha.append(svg('line', { x1: x(dia), x2: x(dia), y1: baixo, y2: baixo + 5, class: 'cfd__eixo' }));
      grelha.append(svg('text', { x: x(dia), y: baixo + 18, class: 'cfd__valor', 'text-anchor': 'middle' }, String(dia)));
    }
    grelha.append(svg('text', { x: x(ultimoDia), y: altura - 4, class: 'cfd__rotulo', 'text-anchor': 'end' }, 'Dias'));
    grelha.append(svg('text', { x: 0, y: 12, class: 'cfd__rotulo' }, 'Tarefas (acumulado)'));

    // Bandas: o limite de cima da esquerda para a direita, o de baixo de volta.
    for (const banda of BANDAS) {
      const cima: string[] = [];
      const fundo: string[] = [];
      for (let dia = 0; dia <= ultimoDia; dia++) {
        const l = limitesBanda(s, banda, dia);
        cima.push(`${x(dia).toFixed(1)},${y(l.cima).toFixed(1)}`);
        fundo.unshift(`${x(dia).toFixed(1)},${y(l.baixo).toFixed(1)}`);
      }
      caminhos.get(banda)!.setAttribute('d', `M${cima.join('L')}L${fundo.join('L')}Z`);
    }

    // Rótulos no fim: nome e valor do último dia, à frente do meio de cada
    // banda, afastados para não se sobreporem quando as bandas são finas.
    fim.replaceChildren();
    if (!estreito) {
      const ideais = BANDAS.map((b) => {
        const l = limitesBanda(s, b, ultimoDia);
        return (y(l.cima) + y(l.baixo)) / 2;
      });
      const ys = afastarRotulos(ideais, ESPACO_ROTULOS, MARGEM.cima, baixo);
      BANDAS.forEach((b, i) => {
        const l = limitesBanda(s, b, ultimoDia);
        const px = x(ultimoDia) + 10;
        fim.append(svg('circle', { cx: px + 4, cy: ys[i], r: 4, class: `cfd__fim-cor cfd__fim-cor--${b}` }));
        const texto = svg('text', { x: px + 13, y: ys[i], class: 'cfd__fim-texto', 'dominant-baseline': 'middle' });
        texto.append(svg('tspan', { class: 'cfd__fim-nome' }, NOMES_BANDAS[b]), svg('tspan', { dx: 5 }, numero(l.cima - l.baixo)));
        fim.append(texto);
      });
    }

    desenharDestaque(x, y, largura);
    desenharCursor();
  }

  /** Põe a linha, os pontos e a caixa no dia do cursor (ou esconde-os). */
  function desenharCursor(): void {
    const s = series;
    const e = escala;
    const mostrar = diaCursor !== null && s !== null && e !== null;
    cursor.classList.toggle('cfd__cursor--visivel', mostrar);
    caixa.hidden = !mostrar;
    if (!mostrar) return;
    const dia = diaCursor!;
    const px = e.x(dia);
    linhaCursor.setAttribute('x1', String(px));
    linhaCursor.setAttribute('x2', String(px));
    linhaCursor.setAttribute('y1', String(e.y(s.entradas[dia])));
    linhaCursor.setAttribute('y2', String(e.y(0)));
    for (const [banda, ponto] of pontosCursor) {
      ponto.setAttribute('cx', String(px));
      ponto.setAttribute('cy', String(e.y(limitesBanda(s, banda, dia).cima)));
    }
    caixa.replaceChildren(el('strong', undefined, `Dia ${dia}`));
    for (const banda of BANDAS) {
      const l = limitesBanda(s, banda, dia);
      const linha = el('span', `cfd__caixa-linha cfd__caixa-linha--${banda}`);
      linha.append(el('span', 'cfd__caixa-cor'), `${NOMES_BANDAS[banda]} `, el('b', undefined, numero(l.cima - l.baixo)));
      caixa.append(linha);
    }
    // O leitor de ecrã ouve uma frase completa, não as linhas soltas.
    caixa.setAttribute('aria-label', TEXTOS.dia(s, dia));
    // A caixa fica do lado com mais espaço, para não tapar a linha.
    const meio = (e.esquerda + e.direita) / 2;
    caixa.style.left = px > meio ? '' : `${px + 12}px`;
    caixa.style.right = px > meio ? `${area.clientWidth - px + 12}px` : '';
  }

  function mostrarDia(dia: number | null): void {
    if (!series) return;
    const ultimo = series.entradas.length - 1;
    diaCursor = dia === null ? null : Math.min(ultimo, Math.max(0, Math.round(dia)));
    desenharCursor();
  }

  // Rato e toque: o dia mais próximo do ponteiro. touch-action no CSS deixa
  // o deslizar vertical continuar a fazer scroll.
  function diaDoPonteiro(ev: PointerEvent): void {
    const e = escala;
    if (!e || !series) return;
    const r = desenho.getBoundingClientRect();
    const px = ev.clientX - r.left;
    if (px < e.esquerda - 10 || px > e.direita + 10) return mostrarDia(null);
    const ultimo = series.entradas.length - 1;
    mostrarDia(((px - e.esquerda) / (e.direita - e.esquerda)) * ultimo);
  }
  area.addEventListener('pointermove', diaDoPonteiro);
  // Um toque rápido no telemóvel não gera pointermove.
  area.addEventListener('pointerdown', diaDoPonteiro);
  area.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType === 'mouse') mostrarDia(null);
  });
  // Teclado: setas mudam de dia, Home e End vão ao início e ao fim, Esc esconde.
  area.addEventListener('keydown', (ev) => {
    if (!series) return;
    const ultimo = series.entradas.length - 1;
    const atual = diaCursor ?? ultimo;
    const teclas: Record<string, number | null> = {
      ArrowLeft: diaCursor === null ? ultimo : atual - 1,
      ArrowRight: diaCursor === null ? ultimo : atual + 1,
      Home: 0,
      End: ultimo,
      Escape: null,
    };
    if (!(ev.key in teclas)) return;
    ev.preventDefault();
    mostrarDia(teclas[ev.key]);
  });
  area.addEventListener('focusout', () => mostrarDia(null));

  function rotulo(px: number, py: number, texto: string, ancora: 'start' | 'middle' | 'end'): SVGTextElement {
    return svg('text', { x: px, y: py, class: 'cfd__rotulo-marca', 'text-anchor': ancora, 'dominant-baseline': 'middle' }, texto);
  }

  /** Um traço vertical com as pontas marcadas, de v1 a v2 no dia `dia`. */
  function chaveVertical(px: number, y1: number, y2: number): SVGGElement {
    const g = svg('g', { class: 'cfd__chaveta' });
    g.append(svg('line', { x1: px, x2: px, y1, y2 }));
    g.append(svg('line', { x1: px - 5, x2: px + 5, y1, y2: y1 }));
    g.append(svg('line', { x1: px - 5, x2: px + 5, y1: y2, y2 }));
    return g;
  }

  function desenharDestaque(x: (dia: number) => number, y: (v: number) => number, largura: number): void {
    marcas.replaceChildren();
    const s = series;
    const d = destaque;
    figura.classList.toggle('cfd--destaque', d !== null);
    for (const [banda, caminho] of caminhos) {
      const alvo = d !== null && ((d.tipo === 'altura' && banda === 'emCurso') || (d.tipo === 'alargar' && banda === d.banda));
      caminho.classList.toggle('cfd__banda--alvo', alvo);
    }
    if (!s || !d) return;
    const ultimoDia = s.entradas.length - 1;
    // Os rótulos vão para o lado onde há espaço.
    const lado = (px: number, margem: number): { px: number; ancora: 'start' | 'end' } =>
      px > largura / 2 ? { px: px - margem, ancora: 'end' } : { px: px + margem, ancora: 'start' };

    switch (d.tipo) {
      case 'altura': {
        const l = limitesBanda(s, 'emCurso', d.dia);
        const px = x(d.dia) - 8;
        marcas.append(chaveVertical(px, y(l.cima), y(l.baixo)));
        const r = lado(px, 10);
        marcas.append(rotulo(r.px, (y(l.cima) + y(l.baixo)) / 2, `WIP = ${numero(d.valor)}`, r.ancora));
        break;
      }
      case 'horizontal': {
        const py = y(d.nivel);
        const x1 = x(d.diaEntrada);
        const x2 = d.diaSaida === null ? x(ultimoDia) : x(d.diaSaida);
        marcas.append(svg('circle', { cx: x1, cy: py, r: 4, class: 'cfd__ponto' }));
        marcas.append(
          svg('line', {
            x1,
            x2,
            y1: py,
            y2: py,
            class: d.diaSaida === null ? 'cfd__seta cfd__seta--aberta' : 'cfd__seta',
            'marker-end': `url(#${id}-seta)`,
          }),
        );
        const texto = d.diaSaida === null ? `mais de ${ultimoDia - d.diaEntrada} dias` : `≈ ${numero(d.diaSaida - d.diaEntrada)} dias`;
        marcas.append(rotulo((x1 + x2) / 2, py - 14, texto, 'middle'));
        break;
      }
      case 'alargar': {
        for (const [dia, valor] of [
          [d.de, d.inicio],
          [d.ate, d.fim],
        ] as const) {
          const l = limitesBanda(s, d.banda, dia);
          const px = dia === ultimoDia ? x(dia) - 8 : x(dia) + 8;
          if (l.cima - l.baixo > 0.05) marcas.append(chaveVertical(px, y(l.cima), y(l.baixo)));
          const r = lado(px, 10);
          marcas.append(rotulo(r.px, (y(l.cima) + y(l.baixo)) / 2, numero(valor), r.ancora));
        }
        break;
      }
      case 'estavel':
        marcas.append(rotulo(x(ultimoDia / 2), margem(false).cima - 6, 'Nenhuma banda alarga: fluxo estável', 'middle'));
        break;
    }
  }

  function preencherTabela(s: SeriesCumulativas): void {
    const marcadas = celulasDestacadas(destaque, s.entradas.length - 1);
    // A legenda explica a marca; o texto escondido em cada célula faz o leitor
    // de ecrã dizer «destacado» ao chegar lá, e não depende só da cor.
    legendaTabela.textContent = marcadas.length > 0
      ? `${LEGENDA_TABELA}. As células marcadas são as do destaque da regra escolhida.`
      : LEGENDA_TABELA;
    corpo.replaceChildren(
      ...s.entradas.map((_, dia) => {
        const tr = el('tr');
        const th = el('th', undefined, String(dia));
        th.scope = 'row';
        tr.append(th, ...BANDAS.map((b) => {
          const l = limitesBanda(s, b, dia);
          const td = el('td', undefined, numero(l.cima - l.baixo));
          if (estaDestacada(marcadas, dia, b)) {
            td.classList.add('cfd__celula--destaque');
            td.append(el('span', 'escondido-visual', ' (destacado)'));
          }
          return td;
        }));
        return tr;
      }),
    );
  }

  // Ao mudar de largura não anima: só a mudança de cenário é animada.
  let montado = false;
  const observador = new ResizeObserver(() => {
    if (!figura.isConnected) {
      // O ecrã foi trocado por outro: deixa de observar.
      if (montado) observador.disconnect();
      return;
    }
    montado = true;
    figura.classList.add('cfd--sem-transicao');
    desenhar();
    void figura.offsetWidth;
    figura.classList.remove('cfd--sem-transicao');
  });
  observador.observe(area);

  return {
    elemento: figura,
    atualizar(novas, novaDescricao) {
      series = novas;
      descricao = novaDescricao;
      atualizarDescricao();
      preencherTabela(novas);
      desenhar();
    },
    destacar(novo, explicacao = '') {
      destaque = novo;
      explicacaoDestaque = explicacao;
      atualizarDescricao();
      if (series) preencherTabela(series);
      desenhar();
    },
  };
}
