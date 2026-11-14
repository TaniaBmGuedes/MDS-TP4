// Ecrã das métricas (T16): uma lição passo a passo, para não mostrar tudo de
// uma vez.
// 1. Introdução numa frase (a etiqueta e o título vêm do main.ts).
// 2. Diapositivos, um cenário de cada vez (WIP 2, 4 e 12), com separadores
//    por cima para saltar entre eles. Cada um começa só com a animação dos 15
//    dias do simulador. Um botão mostra uma coisa de cada vez: o WIP, o
//    throughput, o lead time e o que o exemplo quer dizer; depois leva ao
//    exemplo seguinte. Os exemplos já não passam sozinhos.
// 3. O último diapositivo é «Agora tu»: um controlo visível (− / + e um campo,
//    de 1 a 12) escolhe o limite de WIP; o simulador calcula o cenário e o
//    limite fica guardado. O duplo clique no número do WIP, no título,
//    continua a funcionar como atalho.
// 4. A conclusão final, que compara os exemplos, aparece quando se chega a
//    «Agora tu».
import './metricas.css';
import {
  CENARIOS,
  ETAPAS,
  METRICAS,
  PARAMETROS,
  TEXTOS,
  WIP_MAXIMO,
  WIP_MINIMO,
  WIP_PROPRIO_INICIAL,
  cenarioPersonalizado,
  comparacao,
  etapasVisiveis,
  indiceDoExemplo,
  conclusao,
  textoBotao,
  numero,
  situacao,
  throughput,
  type Cenario,
  type Etapa,
} from '../data/metricas';
import type { Ecra } from './index';

/** Na animação: chegada das tarefas novas, depois o trabalho do dia. */
const CHEGADA_MS = 450;
const TRABALHO_MS = 750;
const INICIO_MS = 600;
/** De quanto em quanto tempo quem tem várias tarefas salta para outra. */
const TROCA_MS = 600;

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

/**
 * O controlo visível de «O teu cenário»: − / + e um campo com o limite de WIP,
 * o intervalo escrito e um botão. Funciona com rato e com teclado (Enter).
 */
function criarExperimenta(aoEscolher: (wip: number) => void): {
  elemento: HTMLFormElement;
  sincronizar: (wip: number) => void;
  focar: () => void;
} {
  const T = TEXTOS.experimenta;
  const form = el('form', 'experimenta');
  form.noValidate = true;

  const rotulo = el('label', 'experimenta__rotulo', T.rotulo);
  rotulo.htmlFor = 'wip-proprio';

  const menos = el('button', 'experimenta__passo', '−');
  menos.type = 'button';
  menos.setAttribute('aria-label', T.menos);
  const campo = el('input', 'experimenta__campo');
  campo.id = 'wip-proprio';
  campo.type = 'number';
  campo.inputMode = 'numeric';
  campo.min = String(WIP_MINIMO);
  campo.max = String(WIP_MAXIMO);
  campo.step = '1';
  campo.setAttribute('aria-describedby', 'wip-proprio-ajuda');
  const mais = el('button', 'experimenta__passo', '+');
  mais.type = 'button';
  mais.setAttribute('aria-label', T.mais);
  const linha = el('div', 'experimenta__linha');
  linha.append(menos, campo, mais);

  const ajuda = el('p', 'experimenta__ajuda', T.ajuda);
  ajuda.id = 'wip-proprio-ajuda';
  const erro = el('p', 'experimenta__erro');
  erro.setAttribute('role', 'status');
  form.append(rotulo, linha, ajuda, erro);

  let atual = WIP_PROPRIO_INICIAL;
  const valido = (n: number): boolean => Number.isInteger(n) && n >= WIP_MINIMO && n <= WIP_MAXIMO;

  function sincronizar(wip: number): void {
    atual = wip;
    campo.value = String(wip);
    campo.removeAttribute('aria-invalid');
    erro.textContent = '';
    menos.setAttribute('aria-disabled', String(wip <= WIP_MINIMO));
    mais.setAttribute('aria-disabled', String(wip >= WIP_MAXIMO));
  }

  // − e + partem do número que está no campo (se for válido) e aplicam logo.
  function passo(delta: number): void {
    const escrito = Number(campo.value);
    const base = campo.value.trim() !== '' && valido(escrito) ? escrito : atual;
    const novo = base + delta;
    if (novo < WIP_MINIMO || novo > WIP_MAXIMO) return;
    aoEscolher(novo);
  }
  menos.addEventListener('click', () => passo(-1));
  mais.addEventListener('click', () => passo(1));

  // Um número escrito aplica-se com Enter ou ao sair do campo.
  function aplicarEscrito(): void {
    const n = Number(campo.value);
    if (campo.value.trim() === '' || !valido(n)) {
      campo.setAttribute('aria-invalid', 'true');
      erro.textContent = T.erro;
      return;
    }
    if (n !== atual) aoEscolher(n);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicarEscrito();
    if (campo.getAttribute('aria-invalid') === 'true') campo.focus();
  });
  campo.addEventListener('change', aplicarEscrito);

  sincronizar(atual);
  return { elemento: form, sincronizar, focar: () => campo.focus({ preventScroll: true }) };
}

/** O conteúdo de um diapositivo: cabeçalho, animação, métricas e conclusão. */
interface Diapositivo {
  elemento: HTMLElement;
  palco: Palco;
  passo: HTMLElement;
  /** O que cada etapa mostra (uma métrica ou a conclusão). */
  partes: Map<Etapa, HTMLElement[]>;
  /** Botão que mostra a etapa seguinte ou leva ao exemplo seguinte. */
  botao: HTMLButtonElement;
}

function criarDiapositivo(c: Cenario, id: string, aoMudarWip: (wip: number) => void): Diapositivo {
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

  const partes = new Map<Etapa, HTMLElement[]>();
  const faixa = el('dl', 'faixa');
  // Quem usa leitor de ecrã ouve cada métrica quando aparece.
  faixa.setAttribute('aria-live', 'polite');
  for (const m of METRICAS) {
    const item = el('div', 'faixa__item');
    item.hidden = true;
    partes.set(m.id, [item]);
    const v = m.valor(c);
    const nome = el('dt', 'faixa__nome', m.nome);
    nome.append(el('span', 'faixa__significado', m.explicacao));
    const valor = el('dd', 'faixa__valor');
    valor.append(el('strong', undefined, m.formatar(v)), ` ${m.unidade(v)}${m.id === 'wip' ? ', em média' : ''}`);
    item.append(nome, valor, el('dd', 'faixa__definicao', m.definicao));
    faixa.append(item);
  }

  const fim = el('div', 'cenario__fim');
  fim.hidden = true;
  fim.setAttribute('aria-live', 'polite');
  fim.append(el('p', 'cenario__conclusao', conclusao(c)));
  const comparar = comparacao(c);
  if (comparar) fim.append(el('p', 'cenario__comparacao', comparar));
  partes.set('conclusao', [fim]);

  const botao = el('button', 'cenario__botao');
  botao.type = 'button';

  d.append(cab, palco.elemento, faixa, fim, botao);
  return { elemento: d, palco, passo, partes, botao };
}

/** A conclusão final: visível por baixo dos cenários, sem ser preciso procurá-la. */
function criarFecho(): HTMLElement {
  const { destaque, detalhe } = TEXTOS.fecho(CENARIOS);
  const secao = el('section', 'fecho');
  secao.setAttribute('aria-labelledby', 'fecho-titulo');
  const titulo = el('h2', 'fecho__titulo', TEXTOS.fechoTitulo);
  titulo.id = 'fecho-titulo';
  secao.append(titulo, el('p', 'fecho__destaque', destaque), el('p', 'fecho__detalhe', detalhe));
  // Só aparece quando se chega a «Agora tu», depois dos exemplos.
  secao.hidden = true;
  return secao;
}

export const ecraMetricas: Ecra = (contentor) => {
  contentor.append(el('p', 'metricas__intro', TEXTOS.intro));
  // O controlo do WIP fica dentro do último diapositivo, «Agora tu».
  const experimenta = criarExperimenta((wip) => usarWip(wip, true));

  const licao = el('section', 'licao');
  licao.setAttribute('aria-roledescription', 'carrossel');
  licao.setAttribute('aria-label', 'Cenários do simulador');
  const janela = el('div', 'licao__janela');
  janela.setAttribute('aria-live', 'off');
  const pista = el('div', 'licao__pista');
  janela.append(pista);

  const diapositivos = CENARIOS.map((c, i) => criarDiapositivo(c, `cenario-${i}`, (wip) => usarWip(wip, true)));
  /** Quantas etapas já se mostraram em cada diapositivo. */
  const vistas: number[] = diapositivos.map(() => 0);

  // Separadores por cima: Exemplo 1, 2, 3 e «Agora tu».
  const separadores = el('div', 'licao__separadores');
  separadores.setAttribute('role', 'group');
  separadores.setAttribute('aria-label', 'Escolher o exemplo');
  const botoesSeparador = [...CENARIOS.map((c) => `WIP ${c.limiteWip}`), 'Agora tu'].map((texto, i) => {
    const b = el('button', 'licao__separador', i < CENARIOS.length ? `Exemplo ${i + 1} · ${texto}` : texto);
    b.type = 'button';
    b.addEventListener('click', () => irPara(i));
    separadores.append(b);
    return b;
  });

  const fecho = criarFecho();
  licao.append(separadores, janela);
  contentor.append(licao, fecho);

  // ---------- Tempo ----------
  let atual = 0;
  let tempoPalco = 0; // da animação deste cenário
  // Com «reduzir movimento» não há animação: cada cenário mostra logo o fim
  // dos 15 dias.
  const reduzido = movimentoReduzido();

  /** Mostra as etapas já vistas do diapositivo i e põe o texto do botão. */
  function mostrarEtapas(i: number): void {
    const d = diapositivos[i];
    const visiveis = new Set(etapasVisiveis(vistas[i]));
    d.partes.forEach((elementos, etapa) => elementos.forEach((e) => (e.hidden = !visiveis.has(etapa))));
    const texto = textoBotao(vistas[i], i);
    d.botao.hidden = texto === null;
    d.botao.textContent = texto ?? '';
  }

  function ligarBotao(i: number): void {
    diapositivos[i].botao.addEventListener('click', () => {
      if (vistas[i] < ETAPAS.length) {
        vistas[i]++;
        mostrarEtapas(i);
        ajustarAltura();
        return;
      }
      irPara(i + 1);
      // Em «Agora tu», o foco vai para o campo do WIP.
      if (i + 1 === CENARIOS.length) experimenta.focar();
      else diapositivos[i + 1].botao.focus({ preventScroll: true });
    });
  }

  // Etiqueta do último diapositivo: se o limite escolhido é o de um exemplo,
  // diz qual; se é outro, diz que é um valor diferente dos exemplos.
  let rotuloTeu: string = TEXTOS.passoTeu;

  function montar(): void {
    pista.replaceChildren(...diapositivos.map((d) => d.elemento));
    diapositivos.forEach((d, i) => {
      d.passo.textContent = i < CENARIOS.length ? TEXTOS.passoExemplo(i + 1, CENARIOS.length) : rotuloTeu;
    });
  }

  function irPara(indice: number): void {
    atual = Math.max(0, Math.min(indice, diapositivos.length - 1));
    pista.style.transform = `translateX(-${atual * 100}%)`;
    diapositivos.forEach((d, i) => {
      d.elemento.inert = i !== atual;
      d.elemento.classList.toggle('cenario--ativo', i === atual);
    });
    botoesSeparador.forEach((b, i) => {
      if (i === atual) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    // A conclusão final aparece quando se chega a «Agora tu».
    if (atual === CENARIOS.length) fecho.hidden = false;
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

  function usarWip(wip: number, mostrarJa: boolean, guardar = true): void {
    const calculado = cenarioPersonalizado(wip);
    // Com o limite de um exemplo, mostra-se com o nome desse exemplo.
    const exemplo = indiceDoExemplo(calculado.limiteWip);
    const c = exemplo >= 0 ? { ...calculado, nome: CENARIOS[exemplo].nome } : calculado;
    rotuloTeu = exemplo >= 0 ? TEXTOS.passoIgual(exemplo + 1, CENARIOS.length) : TEXTOS.passoTeu;
    if (guardar) guardarWip(c.limiteWip);
    experimenta.sincronizar(c.limiteWip);
    const novo = criarDiapositivo(c, 'cenario-teu', (n) => usarWip(n, true));
    // O controlo passa para o diapositivo novo; quem estava a escrever nele
    // continua com o foco no mesmo sítio.
    const ativo = document.activeElement;
    const tinhaFoco = ativo instanceof HTMLElement && experimenta.elemento.contains(ativo);
    novo.elemento.querySelector('.cenario__cabeca')?.after(experimenta.elemento);
    if (diapositivos.length > CENARIOS.length) diapositivos[CENARIOS.length] = novo;
    else diapositivos.push(novo);
    vistas[CENARIOS.length] = 0;
    ligarBotao(CENARIOS.length);
    montar();
    mostrarEtapas(CENARIOS.length);
    novo.palco.posicionar();
    if (tinhaFoco) ativo.focus({ preventScroll: true });
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
      // Os exemplos já não passam sozinhos: a animação corre e fica no fim.
      if (!reduzido && tempoPalco < diapositivos[atual].palco.tempoFinal) {
        tempoPalco += dt;
        diapositivos[atual].palco.definirTempo(tempoPalco);
      }
    }
    requestAnimationFrame(tique);
  }

  CENARIOS.forEach((_, i) => {
    ligarBotao(i);
    mostrarEtapas(i);
  });
  montar();
  // «O teu cenário» está sempre lá: com o limite guardado ou com o inicial.
  const guardado = lerWipGuardado();
  usarWip(guardado ?? WIP_PROPRIO_INICIAL, false, guardado !== null);
  irPara(0);
  requestAnimationFrame(tique);
};
