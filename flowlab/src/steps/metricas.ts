// Ecrã das métricas (T16): uma lição com um ponto de foco.
// 1. Introdução numa frase (a etiqueta e o título vêm do main.ts).
// 2. Diapositivos, um cenário de cada vez (WIP 2, 4 e 12). Cada um tem uma
//    animação dos 15 dias do simulador com a mesma equipa de 4 pessoas, a
//    faixa com as três métricas e a conclusão. Passam sozinhos ao fim de um
//    minuto; param com o rato ou o foco lá dentro e com a aba escondida.
// 3. Duplo clique no número do WIP (no título) deixa escrever outro limite:
//    vira mais um cenário, calculado pelo simulador, e fica guardado.
import './metricas.css';
import {
  CENARIOS,
  METRICAS,
  PARAMETROS,
  TEXTOS,
  WIP_MAXIMO,
  WIP_MINIMO,
  cenarioPersonalizado,
  conclusao,
  numero,
  situacao,
  throughput,
  type Cenario,
} from '../data/metricas';
import type { Ecra } from './index';

/** Quando a simulação acaba, fica parada este tempo antes do cenário seguinte. */
const PAUSA_FIM_MS = 4_000;
/** Com «reduzir movimento» não há animação: cada cenário fica este tempo. */
const LEITURA_MS = 25_000;
/** Na animação: chegada das tarefas novas, depois o trabalho do dia. */
const CHEGADA_MS = 1_300;
const TRABALHO_MS = 2_300;
const INICIO_MS = 1_500;
/** De quanto em quanto tempo quem tem várias tarefas salta para outra. */
const TROCA_MS = 1_400;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

const movimentoReduzido = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICONE_PESSOA =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';

// ---------- Animação de um cenário ----------

/** Um momento da animação: quantas tarefas entraram, começaram e acabaram. */
interface Momento {
  inicio: number;
  dia: number;
  entradas: number;
  comecadas: number;
  acabadas: number;
}

interface Palco {
  elemento: HTMLElement;
  /** Põe a animação no instante `ms` desde o início do cenário. */
  definirTempo: (ms: number) => void;
  /** Volta ao dia 0 sem animar o regresso. */
  reiniciar: () => void;
  /** Instante em que se vê o último dia. */
  tempoFinal: number;
  /** Recalcula as posições (mudou a largura). */
  posicionar: () => void;
}

function criarMomentos(c: Cenario): Momento[] {
  const momentos: Momento[] = [{ inicio: 0, dia: 0, ...c.porDia[0] }];
  let t = INICIO_MS;
  for (let dia = 1; dia < c.porDia.length; dia++) {
    const antes = c.porDia[dia - 1];
    const hoje = c.porDia[dia];
    // Primeiro chegam as tarefas novas; depois acaba-se e puxa-se trabalho.
    momentos.push({ inicio: t, dia, entradas: hoje.entradas, comecadas: antes.comecadas, acabadas: antes.acabadas });
    t += CHEGADA_MS;
    momentos.push({ inicio: t, dia, ...hoje });
    t += TRABALHO_MS;
  }
  return momentos;
}

/** Quem trabalha em cada tarefa: vai para a pessoa com menos tarefas. */
function distribuir(momentos: Momento[], pessoas: number): Map<number, number> {
  const pessoaDe = new Map<number, number>();
  for (const m of momentos) {
    const carga = Array.from({ length: pessoas }, () => 0);
    for (let i = m.acabadas; i < m.comecadas; i++) {
      const p = pessoaDe.get(i);
      if (p !== undefined) carga[p]++;
    }
    for (let i = m.acabadas; i < m.comecadas; i++) {
      if (pessoaDe.has(i)) continue;
      const p = carga.indexOf(Math.min(...carga));
      pessoaDe.set(i, p);
      carga[p]++;
    }
  }
  return pessoaDe;
}

function criarPalco(c: Cenario): Palco {
  const { pessoas, chegadasPorDia, dias } = PARAMETROS;
  const momentos = criarMomentos(c);
  const pessoaDe = distribuir(momentos, pessoas);
  const total = c.porDia[c.porDia.length - 1].entradas;
  const tempoFinal = momentos[momentos.length - 1].inicio;

  const envolta = el('div', 'palco-envolta');
  const topo = el('div', 'palco__topo');
  const relogio = el('p', 'palco__relogio');
  relogio.setAttribute('aria-hidden', 'true');
  topo.append(relogio, el('p', 'palco__nota', TEXTOS.ilustrativa));

  const palco = el('div', 'palco');
  palco.setAttribute('role', 'img');
  palco.setAttribute(
    'aria-label',
    `Animação de ${dias} dias: chegam ${chegadasPorDia} tarefas por dia a «A fazer». Em média, ${numero(c.emCurso)} estão em curso com a equipa de ${pessoas} pessoas, ${numero(c.aEspera)} estão à espera e saem ${throughput(c.throughput)} por dia.`,
  );

  const coluna = (titulo: string, extra?: string): { col: HTMLElement; cab: HTMLElement } => {
    const col = el('div', `palco__coluna${extra ? ` ${extra}` : ''}`);
    const cab = el('p', 'palco__titulo');
    cab.append(el('span', undefined, titulo));
    col.append(cab);
    palco.append(col);
    return { col, cab };
  };

  const fila = coluna('A fazer');
  fila.cab.append(el('span', 'palco__chegam', `+${chegadasPorDia} por dia`));
  const areaFila = el('div', 'palco__area');
  fila.col.append(areaFila);

  const curso = coluna('Em curso', 'palco__coluna--curso');
  const contaCurso = el('span', 'palco__conta');
  curso.cab.append(contaCurso);
  const listaPessoas = el('div', 'palco__pessoas');
  const linhas = Array.from({ length: pessoas }, () => {
    const linha = el('div', 'pessoa');
    const avatar = el('span', 'pessoa__avatar');
    avatar.innerHTML = ICONE_PESSOA;
    const mesa = el('div', 'pessoa__mesa');
    const estado = el('span', 'pessoa__estado', 'sem tarefa');
    linha.append(avatar, mesa, estado);
    listaPessoas.append(linha);
    return { linha, mesa };
  });
  curso.col.append(listaPessoas);

  const feito = coluna('Feito');
  const contaFeito = el('span', 'palco__conta');
  feito.cab.append(contaFeito);
  const areaFeito = el('div', 'palco__area');
  feito.col.append(areaFeito);

  const camada = el('div', 'palco__camada');
  const tarefas = Array.from({ length: total }, () => {
    const t = el('span', 'ficha ficha--espera ficha--nova');
    camada.append(t);
    return t;
  });
  palco.append(camada);
  envolta.append(topo, palco);

  let indice = 0;
  let vez = 0;

  function posicionar(): void {
    const m = momentos[indice];
    const base = palco.getBoundingClientRect();
    if (base.width === 0) return;
    const estilo = getComputedStyle(palco);
    const lado = parseFloat(estilo.getPropertyValue('--t')) || 14;
    const espaco = parseFloat(estilo.getPropertyValue('--g')) || 4;
    const passo = lado + espaco;
    const origem = (area: HTMLElement): { x: number; y: number; colunas: number } => {
      const r = area.getBoundingClientRect();
      return { x: r.left - base.left, y: r.top - base.top, colunas: Math.max(1, Math.floor((r.width + espaco) / passo)) };
    };
    const oFila = origem(areaFila);
    const oFeito = origem(areaFeito);
    const mesas = linhas.map((l) => origem(l.mesa));
    const emCurso = Array.from({ length: pessoas }, () => [] as number[]);
    for (let i = m.acabadas; i < m.comecadas; i++) emCurso[pessoaDe.get(i) ?? 0].push(i);

    tarefas.forEach((t, i) => {
      let x: number;
      let y: number;
      let classe: string;
      if (i < m.acabadas) {
        x = oFeito.x + (i % oFeito.colunas) * passo;
        y = oFeito.y + Math.floor(i / oFeito.colunas) * passo;
        classe = 'ficha--feita';
      } else if (i < m.comecadas) {
        const p = pessoaDe.get(i) ?? 0;
        const daPessoa = emCurso[p];
        const j = daPessoa.indexOf(i);
        x = mesas[p].x + j * passo;
        y = mesas[p].y;
        // Quem tem várias tarefas trabalha numa de cada vez e vai saltando.
        const ativa = daPessoa[(vez + p) % daPessoa.length] === i;
        classe = ativa ? 'ficha--curso ficha--ativa' : 'ficha--curso';
      } else if (i < m.entradas) {
        const k = i - m.comecadas;
        x = oFila.x + (k % oFila.colunas) * passo;
        y = oFila.y + Math.floor(k / oFila.colunas) * passo;
        classe = 'ficha--espera';
      } else {
        // Ainda não chegou: espera fora do quadro, à esquerda.
        x = oFila.x - passo * 2;
        y = oFila.y;
        classe = 'ficha--espera ficha--nova';
      }
      t.style.transform = `translate(${x}px, ${y}px)`;
      t.className = `ficha ${classe}`;
    });

    linhas.forEach((l, p) => l.linha.classList.toggle('pessoa--parada', emCurso[p].length === 0));
    relogio.textContent = m.dia === 0 ? 'Início' : `Dia ${m.dia} de ${dias}`;
    contaCurso.textContent = String(m.comecadas - m.acabadas);
    contaFeito.textContent = String(m.acabadas);
  }

  function semTransicao(): void {
    palco.classList.add('palco--sem-transicao');
    posicionar();
    void palco.offsetWidth;
    palco.classList.remove('palco--sem-transicao');
  }

  function definirTempo(ms: number): void {
    // A simulação não recomeça: no fim fica no último dia.
    const t = Math.min(ms, tempoFinal);
    let novo = 0;
    while (novo + 1 < momentos.length && momentos[novo + 1].inicio <= t) novo++;
    const novaVez = Math.floor(ms / TROCA_MS);
    if (novo < indice) {
      indice = novo;
      vez = novaVez;
      semTransicao();
      return;
    }
    if (novo !== indice || novaVez !== vez) {
      indice = novo;
      vez = novaVez;
      posicionar();
    }
  }

  return {
    elemento: envolta,
    definirTempo,
    reiniciar: () => {
      indice = 0;
      vez = 0;
      semTransicao();
    },
    tempoFinal,
    posicionar: semTransicao,
  };
}

// ---------- Ecrã ----------

/** Onde fica guardado o limite de WIP que a pessoa escreveu. */
const CHAVE_WIP = 'flowlab.wipPersonalizado';

function lerWipGuardado(): number | null {
  try {
    const v = Number(localStorage.getItem(CHAVE_WIP));
    return Number.isFinite(v) && v >= WIP_MINIMO ? v : null;
  } catch {
    return null;
  }
}

function guardarWip(v: number): void {
  try {
    localStorage.setItem(CHAVE_WIP, String(v));
  } catch {
    // Sem armazenamento (modo privado): funciona na mesma, só não fica guardado.
  }
}

/**
 * O número do WIP no título. Com duplo clique (ou Enter) vira um campo:
 * escreve-se outro limite e o simulador cria um cenário novo com ele.
 */
function criarNumeroWip(valor: number, aoMudar: (wip: number) => void): HTMLElement {
  const numeroWip = el('span', 'cenario__wip', String(valor));
  numeroWip.tabIndex = 0;
  numeroWip.setAttribute('role', 'button');
  numeroWip.setAttribute('aria-label', `Limite de WIP ${valor}. Clica duas vezes ou carrega em Enter para mudar.`);
  numeroWip.title = 'Clica duas vezes para mudar';

  const editar = (): void => {
    const campo = el('input', 'cenario__campo');
    campo.type = 'number';
    campo.inputMode = 'numeric';
    campo.min = String(WIP_MINIMO);
    campo.max = String(WIP_MAXIMO);
    campo.step = '1';
    campo.value = String(valor);
    campo.setAttribute('aria-label', `Novo limite de WIP, entre ${WIP_MINIMO} e ${WIP_MAXIMO}`);
    let feito = false;
    const fechar = (aplicar: boolean): void => {
      if (feito) return;
      feito = true;
      const n = Number(campo.value);
      campo.replaceWith(numeroWip);
      if (aplicar && campo.value !== '' && Number.isFinite(n) && n !== valor) aoMudar(n);
      else numeroWip.focus();
    };
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') fechar(true);
      if (e.key === 'Escape') fechar(false);
    });
    campo.addEventListener('blur', () => fechar(true));
    numeroWip.replaceWith(campo);
    campo.focus();
    campo.select();
  };
  numeroWip.addEventListener('dblclick', editar);
  numeroWip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      editar();
    }
  });
  return numeroWip;
}

/** O conteúdo de um diapositivo: cabeçalho, animação, métricas e conclusão. */
function criarDiapositivo(
  c: Cenario,
  id: string,
  aoMudarWip: (wip: number) => void,
): { elemento: HTMLElement; palco: Palco; passo: HTMLElement } {
  // div e não article: o padrão de carrossel pede role="group", que não é
  // permitido em article (auditoria de acessibilidade, H17).
  const d = el('div', 'cenario');
  d.setAttribute('role', 'group');
  d.setAttribute('aria-roledescription', 'diapositivo');
  d.setAttribute('aria-labelledby', id);

  const cab = el('header', 'cenario__cabeca');
  const passo = el('p', 'cenario__passo');
  const titulo = el('h2', 'cenario__titulo');
  titulo.id = id;
  titulo.append('WIP ', criarNumeroWip(c.limiteWip, aoMudarWip), ` — ${c.nome}`);
  if (!c.estavel) titulo.append(el('span', 'cenario__aviso', 'a fila cresce'));
  cab.append(passo, titulo, el('p', 'cenario__situacao', situacao(c)));

  const palco = criarPalco(c);

  const faixa = el('dl', 'faixa');
  for (const m of METRICAS) {
    const item = el('div', 'faixa__item');
    const v = m.valor(c);
    const nome = el('dt', 'faixa__nome', m.nome);
    nome.append(el('span', 'faixa__significado', m.explicacao));
    const valor = el('dd', 'faixa__valor');
    valor.append(el('strong', undefined, m.formatar(v)), ` ${m.unidade(v)}${m.id === 'wip' ? ', em média' : ''}`);
    item.append(nome, valor, el('dd', 'faixa__definicao', m.definicao));
    faixa.append(item);
  }

  d.append(cab, palco.elemento, faixa, el('p', 'cenario__conclusao', conclusao(c)));
  return { elemento: d, palco, passo };
}

export const ecraMetricas: Ecra = (contentor) => {
  contentor.append(el('p', 'metricas__intro', TEXTOS.intro));

  const licao = el('section', 'licao');
  licao.setAttribute('aria-roledescription', 'carrossel');
  licao.setAttribute('aria-label', 'Cenários do simulador');
  const janela = el('div', 'licao__janela');
  janela.setAttribute('aria-live', 'off');
  const pista = el('div', 'licao__pista');
  janela.append(pista);

  const diapositivos = CENARIOS.map((c, i) => criarDiapositivo(c, `cenario-${i}`, (wip) => usarWip(wip, true)));

  licao.append(janela);
  contentor.append(licao);

  // ---------- Tempo ----------
  let atual = 0;
  let decorrido = 0; // só com «reduzir movimento»: tempo de leitura
  let tempoPalco = 0; // da animação deste cenário
  // Com «reduzir movimento» os cenários passam na mesma, mas sem animação:
  // cada um mostra logo o fim dos 15 dias.
  const reduzido = movimentoReduzido();
  let rato = false;
  let foco = false;

  licao.addEventListener('pointerenter', () => (rato = true));
  licao.addEventListener('pointerleave', () => (rato = false));
  licao.addEventListener('focusin', () => (foco = true));
  licao.addEventListener('focusout', (e) => {
    if (!licao.contains(e.relatedTarget as Node | null)) foco = false;
  });

  function montar(): void {
    pista.replaceChildren(...diapositivos.map((d) => d.elemento));
    diapositivos.forEach((d, i) => {
      d.passo.textContent = `Cenário ${i + 1} de ${diapositivos.length}`;
    });
  }

  function irPara(indice: number): void {
    atual = (indice + diapositivos.length) % diapositivos.length;
    decorrido = 0;
    pista.style.transform = `translateX(-${atual * 100}%)`;
    diapositivos.forEach((d, i) => {
      d.elemento.inert = i !== atual;
      d.elemento.classList.toggle('cenario--ativo', i === atual);
    });
    ajustarAltura();
    const palco = diapositivos[atual].palco;
    palco.reiniciar();
    tempoPalco = reduzido ? palco.tempoFinal : 0;
    palco.definirTempo(tempoPalco);
  }

  // A janela fica com a altura do cenário atual: não sobra espaço vazio.
  function ajustarAltura(): void {
    janela.style.height = `${diapositivos[atual].elemento.offsetHeight}px`;
  }

  function usarWip(wip: number, mostrarJa: boolean): void {
    const c = cenarioPersonalizado(wip);
    guardarWip(c.limiteWip);
    const novo = criarDiapositivo(c, 'cenario-teu', (n) => usarWip(n, true));
    if (diapositivos.length > CENARIOS.length) diapositivos[CENARIOS.length] = novo;
    else diapositivos.push(novo);
    montar();
    novo.palco.posicionar();
    if (mostrarJa) irPara(CENARIOS.length);
  }

  const observador = new ResizeObserver(() => {
    diapositivos.forEach((d) => d.palco.posicionar());
    ajustarAltura();
  });
  observador.observe(janela);

  let ultimo = performance.now();
  function tique(agora: number): void {
    // O ecrã foi trocado por outro: pára tudo.
    if (!licao.isConnected) {
      observador.disconnect();
      return;
    }
    const dt = Math.min(agora - ultimo, 100);
    ultimo = agora;
    if (!document.hidden) {
      const palco = diapositivos[atual].palco;
      if (!reduzido) {
        tempoPalco += dt;
        palco.definirTempo(tempoPalco);
      } else {
        decorrido += dt;
      }
      // Quando a simulação acaba (e depois de uma pausa curta), passa ao
      // cenário seguinte. Com o rato ou o foco lá dentro, espera.
      const acabou = reduzido ? decorrido >= LEITURA_MS : tempoPalco >= palco.tempoFinal + PAUSA_FIM_MS;
      if (acabou && !rato && !foco) irPara(atual + 1);
    }
    requestAnimationFrame(tique);
  }

  montar();
  const guardado = lerWipGuardado();
  if (guardado !== null) usarWip(guardado, false);
  irPara(0);
  requestAnimationFrame(tique);
};
