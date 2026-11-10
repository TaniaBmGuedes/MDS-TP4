// Ecrã 6 · Simulador da equipa (T03, SCRUM-21): «Mais gente ou mais trabalho?
// Experimenta.» A pessoa escolhe um cenário ou ajusta, com os steppers, as
// pessoas da equipa e as tarefas em curso (WIP); o throughput, o lead time e
// a Lei de Little atualizam-se na hora, sem recarregar. O cálculo está em
// model/equipa.ts e os cenários e textos em data/scenarios.ts.
//
// Teclado: os cenários e os botões − / + são botões nativos (Tab, Enter,
// Espaço); os cenários usam aria-pressed. Nos limites, o botão fica com
// aria-disabled (e não disabled) para o foco não se perder. As mudanças são
// anunciadas num só texto aria-live, só depois de a pessoa mexer.
import './equipa.css';
import {
  CENARIOS_EQUIPA,
  EQUIPA_BASE,
  ESCALA_BARRAS,
  LIMITES,
  TEXTOS,
  cenarioAtivo,
  compararComInicial,
  formulaLittle,
  larguraBarra,
  leadTimeEmDias,
  situacao,
  textoDiferenca,
  throughputPorDia,
} from '../data/scenarios';
import { calcularEquipa, type Diferenca, type Equipa } from '../model/equipa';
import type { Ecra } from './index';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

interface Stepper {
  elemento: HTMLElement;
  /** Desenha as peças (avatares ou caixas) e o valor. */
  mostrar(valor: number): void;
}

/** Stepper − / valor / + com as peças desenhadas ao lado (só decoração). */
function criarStepper(opcoes: {
  titulo: string;
  menos: string;
  mais: string;
  min: number;
  max: number;
  peca: (indice: number) => HTMLElement;
  aoMudar: (delta: number) => void;
}): Stepper {
  const { titulo, menos, mais, min, max, peca, aoMudar } = opcoes;
  const elemento = el('div', 'eq__stepper');
  const texto = el('div', 'eq__stepper-texto');
  texto.append(el('span', 'eq__rotulo', titulo));
  const pecas = el('div', 'eq__pecas');
  pecas.setAttribute('aria-hidden', 'true');
  texto.append(pecas);

  const botao = (simbolo: string, rotulo: string, delta: number): HTMLButtonElement => {
    const b = el('button', 'eq__botao', simbolo);
    b.type = 'button';
    b.setAttribute('aria-label', rotulo);
    b.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') !== 'true') aoMudar(delta);
    });
    return b;
  };
  const bMenos = botao('−', menos, -1);
  const bMais = botao('+', mais, 1);
  const valor = el('output', 'eq__valor');

  const controlos = el('div', 'eq__controlos');
  controlos.append(bMenos, valor, bMais);
  elemento.append(texto, controlos);

  return {
    elemento,
    mostrar(n) {
      valor.textContent = String(n);
      pecas.replaceChildren(...Array.from({ length: n }, (_, i) => peca(i)));
      bMenos.setAttribute('aria-disabled', String(n <= min));
      bMais.setAttribute('aria-disabled', String(n >= max));
    },
  };
}

/** Linha de uma métrica: nome, valor, barra e diferença face à equipa inicial. */
function criarMetrica(nome: string, classe: string) {
  const bloco = el('div', `eq__metrica eq__metrica--${classe}`);
  const linha = el('div', 'eq__metrica-linha');
  const valor = el('span', 'eq__metrica-valor');
  linha.append(el('span', 'eq__rotulo', nome), valor);
  const barra = el('div', 'eq__barra');
  barra.setAttribute('aria-hidden', 'true');
  const enchimento = el('div', 'eq__barra-cheia');
  barra.append(enchimento);
  const dif = el('span', 'eq__diferenca');
  bloco.append(linha, barra, dif);
  return {
    elemento: bloco,
    mostrar(texto: string, largura: number, d: Diferenca) {
      valor.textContent = texto;
      enchimento.style.width = `${largura}%`;
      dif.textContent = textoDiferenca(d);
      dif.dataset.estado = d.melhor === null ? 'igual' : d.melhor ? 'melhor' : 'pior';
    },
  };
}

export const ecraEquipa: Ecra = (contentor, _passo, percurso) => {
  contentor.append(el('p', 'eq__intro', TEXTOS.intro));

  const inicial = calcularEquipa(EQUIPA_BASE);
  let equipa: Equipa = { ...EQUIPA_BASE };

  // ---------- Cenários ----------
  const cenarios = el('div', 'eq__cenarios');
  cenarios.setAttribute('role', 'group');
  cenarios.setAttribute('aria-label', TEXTOS.cenarios);
  const botoesCenario = CENARIOS_EQUIPA.map((c) => {
    const b = el('button', 'eq__pilula', c.nome);
    b.type = 'button';
    b.addEventListener('click', () => usar({ ...c.equipa }));
    cenarios.append(b);
    return { botao: b, id: c.id };
  });
  contentor.append(cenarios);

  // ---------- Painel das pessoas e do WIP ----------
  const painel = el('div', 'eq');
  const controlos = el('section', 'eq__cartao');
  controlos.setAttribute('aria-label', 'Equipa e trabalho em curso');

  const stepperPessoas = criarStepper({
    titulo: TEXTOS.pessoas,
    menos: 'Menos pessoas',
    mais: 'Mais pessoas',
    min: LIMITES.pessoasMin,
    max: LIMITES.pessoasMax,
    peca: (i) => el('span', 'eq__pessoa', `P${i + 1}`),
    aoMudar: (d) => usar({ ...equipa, pessoas: equipa.pessoas + d }),
  });
  const stepperWip = criarStepper({
    titulo: TEXTOS.wip,
    menos: 'Menos tarefas em curso',
    mais: 'Mais tarefas em curso',
    min: LIMITES.wipMin,
    max: LIMITES.wipMax,
    peca: () => el('span', 'eq__tarefa'),
    aoMudar: (d) => usar({ ...equipa, wip: equipa.wip + d }),
  });
  const texto = el('p', 'eq__situacao');
  controlos.append(stepperPessoas.elemento, stepperWip.elemento, texto, el('p', 'eq__nota', TEXTOS.nota));

  // ---------- Painel das métricas ----------
  const resultados = el('section', 'eq__cartao');
  resultados.setAttribute('aria-label', 'Resultados');
  const mThroughput = criarMetrica(TEXTOS.throughput, 'throughput');
  const mLead = criarMetrica(TEXTOS.leadTime, 'lead');
  const little = el('div', 'eq__little');
  const littleFormula = el('p', 'eq__little-conta');
  little.append(el('p', 'eq__little-titulo', TEXTOS.little), littleFormula);
  // Um só anúncio por mudança, curto, só depois de a pessoa mexer.
  const anuncio = el('p', 'escondido-visual');
  anuncio.setAttribute('aria-live', 'polite');
  resultados.append(mThroughput.elemento, mLead.elemento, little, anuncio);

  painel.append(controlos, resultados);
  contentor.append(painel);

  // ---------- A resposta ao dilema ----------
  const resposta = el('section', 'eq__resposta');
  resposta.setAttribute('aria-labelledby', 'eq-resposta-titulo');
  const titulo = el('h2', 'eq__resposta-titulo', TEXTOS.respostaTitulo);
  titulo.id = 'eq-resposta-titulo';
  const nav = el('div', 'eq__nav');
  const anterior = el('button', 'botao botao--contorno', `← ${TEXTOS.anterior}`);
  anterior.type = 'button';
  anterior.addEventListener('click', () => percurso.voltar());
  const seguinte = el('button', 'botao', `${TEXTOS.seguinte} →`);
  seguinte.type = 'button';
  seguinte.addEventListener('click', () => percurso.avancar());
  nav.append(anterior, seguinte);
  resposta.append(el('p', 'eq__resposta-etiqueta', TEXTOS.respostaEtiqueta), titulo, el('p', 'eq__resposta-texto', TEXTOS.resposta), nav);
  contentor.append(resposta);

  function usar(nova: Equipa): void {
    equipa = {
      pessoas: Math.min(LIMITES.pessoasMax, Math.max(LIMITES.pessoasMin, nova.pessoas)),
      wip: Math.min(LIMITES.wipMax, Math.max(LIMITES.wipMin, nova.wip)),
    };
    const r = calcularEquipa(equipa);
    const d = compararComInicial(r, inicial);

    // O botão ativo só fica destacado se os valores ainda coincidem com o cenário.
    const ativo = cenarioAtivo(equipa);
    for (const { botao, id } of botoesCenario) botao.setAttribute('aria-pressed', String(id === ativo?.id));

    stepperPessoas.mostrar(equipa.pessoas);
    stepperWip.mostrar(equipa.wip);
    texto.textContent = situacao(equipa);
    mThroughput.mostrar(throughputPorDia(r.throughput), larguraBarra(r.throughput, ESCALA_BARRAS.throughput), d.throughput);
    mLead.mostrar(leadTimeEmDias(r.leadTime), larguraBarra(r.leadTime, ESCALA_BARRAS.leadTime), d.leadTime);
    littleFormula.textContent = formulaLittle(equipa.wip, r);

    anuncio.textContent =
      `${equipa.pessoas} pessoas, ${equipa.wip} tarefas em curso. ` +
      `Throughput ${throughputPorDia(r.throughput)}, ${textoDiferenca(d.throughput)}. ` +
      `Lead time ${leadTimeEmDias(r.leadTime)}, ${textoDiferenca(d.leadTime)}.`;
  }

  usar(equipa);
  // O primeiro desenho não é anunciado: só as mudanças feitas pela pessoa.
  anuncio.textContent = '';
};
