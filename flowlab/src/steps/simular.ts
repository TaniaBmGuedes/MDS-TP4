// Ecrã 1 · Simulador (T05): a pessoa mexe no limite de WIP e vê o gráfico de
// fluxo cumulativo mudar, sem recarregar. Por baixo, a explicação das bandas
// e as 3 regras de leitura: ao escolher uma, a zona fica destacada no gráfico
// e um texto diz o que ela mostra neste cenário.
//
// Teclado: o slider usa as setas, Home e End; os cenários e as regras são
// botões (Tab, Enter, Espaço), com aria-pressed. As mudanças de números e o
// texto da regra são anunciados pelo leitor de ecrã (aria-live).
//
// Vindo do quiz («Ver no simulador», T17), abre com o WIP e a regra da
// pergunta e mostra um aviso com o botão «Voltar ao quiz».
//
// Pergunta guia (SCRUM-28): o ecrã abre com «Fazer mais coisas ao mesmo tempo
// é melhor?» e pede uma previsão antes de experimentar. Em cada cenário
// sugerido aparece uma frase «Repara…» com o que observar no resultado.
import './simular.css';
import { criarGraficoCumulativo } from '../components/graficoCumulativo';
import { REGRAS, TEXTOS, WIP_SLIDER_MAX, WIP_SLIDER_MIN, type IdRegra } from '../data/grafico';
import { PERGUNTA_GUIA, PREVISAO, reparaEm, respostaPrevisao } from '../data/guia';
import { cenarioPersonalizado, conclusao, numero, throughput } from '../data/metricas';
import { PASSOS } from '../data/passos';
import { CENARIOS_WIP, EQUIPA_INICIAL } from '../data/simulacao';
import { alturaBanda } from '../model/cfd';
import { simular } from '../model/simulador';
import type { Ecra } from './index';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

export const ecraSimular: Ecra = (contentor, _passo, percurso) => {
  // ---------- Pergunta guia e previsão (SCRUM-28) ----------
  const guia = el('section', 'guia');
  guia.setAttribute('aria-labelledby', 'guia-pergunta');
  const pergunta = el('h2', 'guia__pergunta', PERGUNTA_GUIA);
  pergunta.id = 'guia-pergunta';
  const previsao = el('p', 'guia__previsao', PREVISAO.pergunta);
  previsao.id = 'guia-previsao';
  const opcoesPrevisao = el('div', 'guia__opcoes');
  opcoesPrevisao.setAttribute('role', 'group');
  opcoesPrevisao.setAttribute('aria-labelledby', 'guia-previsao');
  const respostaGuia = el('p', 'guia__resposta');
  respostaGuia.setAttribute('role', 'status');
  respostaGuia.hidden = true;
  let previsto: number | null = null;
  const botoesPrevisao = CENARIOS_WIP.map((c) => {
    const b = el('button', 'guia__opcao', `${c.nome} (${c.wip})`);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => prever(c.wip));
    opcoesPrevisao.append(b);
    return { botao: b, wip: c.wip };
  });
  guia.append(pergunta, previsao, el('p', 'guia__ajuda', PREVISAO.ajuda), opcoesPrevisao, respostaGuia);
  contentor.append(guia, el('p', 'sim__intro', TEXTOS.intro));

  // A previsão fica como foi dada: a ideia é comparar o instinto com o
  // resultado, não ir trocando até acertar.
  function prever(wipPrevisto: number): void {
    if (previsto !== null) return;
    previsto = wipPrevisto;
    for (const { botao, wip: w } of botoesPrevisao) {
      botao.setAttribute('aria-pressed', String(w === wipPrevisto));
      botao.setAttribute('aria-disabled', 'true');
    }
    respostaGuia.textContent = respostaPrevisao(wipPrevisto);
    respostaGuia.hidden = false;
    usarWip(wipPrevisto);
  }

  const pedido = percurso.tirarPedidoSimulador();
  if (pedido) {
    const aviso = el('div', 'sim__vindo');
    aviso.append(el('p', undefined, `Vieste da pergunta ${pedido.pergunta + 1} do quiz: o simulador abriu com o limite de WIP dessa pergunta.`));
    const voltar = el('button', 'sim__voltar', 'Voltar ao quiz');
    voltar.type = 'button';
    voltar.addEventListener('click', () => percurso.irPara(PASSOS.findIndex((p) => p.id === 'quiz')));
    aviso.append(voltar);
    contentor.append(aviso);
  }

  const painel = el('div', 'sim');

  // ---------- Controlos ----------
  const controlos = el('div', 'sim__controlos');

  const campo = el('div', 'sim__campo');
  const rotulo = el('label', 'sim__rotulo', TEXTOS.rotuloWip);
  rotulo.htmlFor = 'sim-wip';
  const valor = el('output', 'sim__valor');
  valor.htmlFor.add('sim-wip');
  const topo = el('div', 'sim__campo-topo');
  topo.append(rotulo, valor);
  const slider = el('input', 'sim__slider');
  slider.type = 'range';
  slider.id = 'sim-wip';
  slider.min = String(WIP_SLIDER_MIN);
  slider.max = String(WIP_SLIDER_MAX);
  slider.step = '1';
  slider.setAttribute('aria-describedby', 'sim-wip-ajuda');
  const ajuda = el('p', 'sim__ajuda', TEXTOS.ajudaWip);
  ajuda.id = 'sim-wip-ajuda';
  campo.append(topo, slider, ajuda);

  const cenarios = el('div', 'sim__cenarios');
  cenarios.setAttribute('role', 'group');
  cenarios.setAttribute('aria-labelledby', 'sim-experimenta');
  const experimenta = el('span', 'sim__experimenta', TEXTOS.experimenta);
  experimenta.id = 'sim-experimenta';
  cenarios.append(experimenta);
  const botoesCenario = CENARIOS_WIP.map((c) => {
    const b = el('button', 'sim__pilula', `${c.nome} (${c.wip})`);
    b.type = 'button';
    b.addEventListener('click', () => usarWip(c.wip));
    cenarios.append(b);
    return { botao: b, wip: c.wip };
  });

  // «Repara…»: só aparece nos cenários sugeridos (SCRUM-28).
  const repara = el('p', 'sim__repara');

  const resumo = el('dl', 'sim__resumo');
  const caixa = (classe: string, nome: string): HTMLElement => {
    const item = el('div', `sim__caixa sim__caixa--${classe}`);
    const v = el('dd');
    item.append(el('dt', undefined, nome), v);
    resumo.append(item);
    return v;
  };
  const vAFazer = caixa('aFazer', 'A fazer');
  const vEmCurso = caixa('emCurso', 'Em curso');
  const vFeito = caixa('feito', 'Feitas');
  const quando = el('p', 'sim__quando', `No fim do dia ${EQUIPA_INICIAL.dias}`);

  const metricas = el('p', 'sim__metricas');
  const veredicto = el('p', 'sim__veredicto');
  // Um só anúncio por mudança, curto: os números do fim e o veredicto.
  const anuncio = el('p', 'escondido-visual');
  anuncio.setAttribute('aria-live', 'polite');

  controlos.append(campo, cenarios, repara, quando, resumo, metricas, veredicto, anuncio);

  // ---------- Gráfico ----------
  const grafico = criarGraficoCumulativo(TEXTOS.tituloGrafico);
  const lado = el('div', 'sim__grafico');
  lado.append(grafico.elemento, el('p', 'sim__bandas', TEXTOS.bandas));

  painel.append(controlos, lado);
  contentor.append(painel);

  // ---------- Regras de leitura ----------
  const regras = el('section', 'regras');
  regras.setAttribute('aria-labelledby', 'regras-titulo');
  const tituloRegras = el('h2', 'regras__titulo', TEXTOS.tituloRegras);
  tituloRegras.id = 'regras-titulo';
  const lista = el('div', 'regras__lista');
  lista.setAttribute('role', 'group');
  lista.setAttribute('aria-labelledby', 'regras-titulo');
  const explica = el('p', 'regras__explica');
  explica.setAttribute('aria-live', 'polite');
  const botoesRegra = REGRAS.map((r) => {
    const b = el('button', 'regra');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.append(el('span', 'regra__numero', String(r.numero)), el('span', 'regra__titulo', r.titulo), el('span', 'regra__resumo', r.resumo));
    b.addEventListener('click', () => escolherRegra(regraAtiva === r.id ? null : r.id));
    lista.append(b);
    return { botao: b, regra: r };
  });
  regras.append(tituloRegras, el('p', 'regras__ajuda', TEXTOS.ajudaRegras), lista, explica);
  // As regras ficam por baixo do gráfico, no mesmo cartão: o passo cabe num
  // ecrã e quem escolhe uma regra vê logo o destaque ao lado (SCRUM-135).
  lado.append(regras);

  // ---------- Estado ----------
  let wip = pedido?.wip ?? EQUIPA_INICIAL.pessoas;
  let regraAtiva: IdRegra | null = pedido?.regra ?? null;
  let series = simular(wip, EQUIPA_INICIAL);

  function mostrarRegra(): void {
    const r = REGRAS.find((x) => x.id === regraAtiva);
    for (const { botao, regra } of botoesRegra) botao.setAttribute('aria-pressed', String(regra.id === regraAtiva));
    if (!r) {
      grafico.destacar(null);
      explica.textContent = '';
      explica.hidden = true;
      return;
    }
    const d = r.destaque(series);
    const texto = r.explicar(d);
    // A mesma frase vai para o texto alternativo do gráfico (T25).
    grafico.destacar(d, texto);
    explica.hidden = false;
    explica.textContent = texto;
  }

  function escolherRegra(id: IdRegra | null): void {
    regraAtiva = id;
    mostrarRegra();
  }

  function usarWip(novo: number, mostrarRepara = true): void {
    wip = Math.min(WIP_SLIDER_MAX, Math.max(WIP_SLIDER_MIN, Math.round(novo)));
    series = simular(wip, EQUIPA_INICIAL);
    const fim = EQUIPA_INICIAL.dias;
    const cenario = cenarioPersonalizado(wip);

    slider.value = String(wip);
    valor.textContent = String(wip);
    for (const { botao, wip: w } of botoesCenario) botao.setAttribute('aria-pressed', String(w === wip));

    const aFazer = numero(alturaBanda(series, 'aFazer', fim));
    const emCurso = numero(alturaBanda(series, 'emCurso', fim));
    const feito = numero(alturaBanda(series, 'feito', fim));
    vAFazer.textContent = aFazer;
    vEmCurso.textContent = emCurso;
    vFeito.textContent = feito;
    metricas.replaceChildren(
      'Throughput ',
      el('strong', undefined, `${throughput(series.throughput)} por dia`),
      ' · Lead time ',
      el('strong', undefined, `${numero(series.leadTime)} dias`),
    );
    veredicto.textContent = conclusao(cenario);
    veredicto.classList.toggle('sim__veredicto--alerta', !cenario.estavel || wip > EQUIPA_INICIAL.pessoas);
    // Ao abrir não há frase: o cenário inicial é a resposta certa à previsão
    // e a frase dava-a antes de a pessoa escolher. Aparece ao mudar de cenário.
    const fraseRepara = mostrarRepara ? reparaEm(wip) : null;
    repara.textContent = fraseRepara ?? '';
    repara.hidden = fraseRepara === null;
    anuncio.textContent = `Limite ${wip}. No fim do dia ${fim}: ${aFazer} a fazer, ${emCurso} em curso, ${feito} feitas. ${veredicto.textContent}${fraseRepara ? ` ${fraseRepara}` : ''}`;

    grafico.atualizar(series, TEXTOS.descricao(series, wip));
    mostrarRegra();
  }

  slider.addEventListener('input', () => usarWip(Number(slider.value)));
  // Vindo do quiz, a pessoa já experimentou: mostra logo a frase.
  usarWip(wip, pedido !== null);
  // O primeiro desenho não é anunciado: só as mudanças feitas pela pessoa.
  anuncio.textContent = '';
};
