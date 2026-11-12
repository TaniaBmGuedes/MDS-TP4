// Ecrã 7 · Quiz final (T17), como no Sketch 2: uma pergunta de cada vez, com
// o contador «Pergunta N de 5 · X certas». Depois de responder aparece a
// explicação e dois botões: «Ver no simulador» (abre o simulador com os
// valores da pergunta) e «Próxima pergunta». No fim, a pontuação, a escolha
// feita no dilema e a lista das perguntas certas e erradas.
//
// As respostas e a pergunta atual ficam no store do percurso: quem vai ao
// simulador e volta continua onde estava.
//
// Teclado e leitor de ecrã: as opções são botões; depois de responder ficam
// com aria-disabled (e não disabled, para o foco não se perder). A explicação
// é anunciada (role="status") e, ao mudar de pergunta, o foco vai para ela.
import './quiz.css';
import './resumo.css';
import { PASSOS } from '../data/passos';
import { PERGUNTAS, PREFIXO, textoDilema, textoPontuacao, type PerguntaQuiz } from '../data/quiz';
import { guardarCracha } from '../components/cracha';
import { NOME_NIVEL, contarCertas as certasDe, crachaDoPercurso } from '../data/cracha';
import { estadoConceitos } from '../data/resumo';
import type { EstadoPercurso, Percurso } from '../model/percurso';
import type { Ecra } from './index';

const LETRAS = ['A', 'B', 'C'] as const;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function contarCertas(estado: EstadoPercurso): number {
  return certasDe(estado.respostasQuiz);
}

function botao(texto: string, classe: string, aoCarregar: () => void): HTMLButtonElement {
  const b = el('button', classe, texto);
  b.type = 'button';
  b.addEventListener('click', aoCarregar);
  return b;
}

export const ecraQuiz: Ecra = (contentor, _passo, percurso) => {
  contentor.append(el('p', 'quiz__intro', `${PERGUNTAS.length} perguntas sobre o que experimentaste. Em cada uma podes ver a resposta no simulador.`));
  const caixa = el('div', 'quiz');
  contentor.append(caixa);

  function desenhar(focar: boolean): void {
    const estado = percurso.estado();
    caixa.replaceChildren();
    const titulo =
      estado.perguntaAtual < PERGUNTAS.length
        ? desenharPergunta(caixa, percurso, estado.perguntaAtual, () => desenhar(true))
        : desenharResultado(caixa, percurso, () => desenhar(true));
    if (focar) titulo.focus();
  }

  desenhar(false);
};

/** Desenha uma pergunta e devolve o título, para receber o foco. */
function desenharPergunta(caixa: HTMLElement, percurso: Percurso, indice: number, aoMudar: () => void): HTMLElement {
  const pergunta = PERGUNTAS[indice];

  const topo = el('div', 'quiz__topo');
  const contador = el('p', 'quiz__contador');
  const barra = el('div', 'quiz__barra');
  barra.setAttribute('aria-hidden', 'true');
  const enchimento = el('span');
  barra.append(enchimento);
  topo.append(contador, barra);

  const titulo = el('h2', 'quiz__pergunta', pergunta.texto);
  titulo.tabIndex = -1;

  const lista = el('ul', 'quiz__opcoes');
  const opcoes = pergunta.opcoes.map((texto, i) => {
    const item = el('li');
    const b = el('button', 'quiz__opcao');
    b.type = 'button';
    const marca = el('span', 'quiz__marca');
    b.append(el('span', 'quiz__letra', LETRAS[i]), el('span', 'quiz__texto', texto), marca);
    b.addEventListener('click', () => {
      if (percurso.estado().respostasQuiz[indice] !== null) return;
      percurso.responderQuiz(indice, i);
      atualizar();
    });
    item.append(b);
    lista.append(item);
    return { botao: b, marca };
  });

  const feedback = el('p', 'quiz__feedback');
  feedback.setAttribute('role', 'status');

  const ultima = indice === PERGUNTAS.length - 1;
  const acoes = el('div', 'quiz__acoes');
  acoes.append(
    botao('Ver no simulador', 'quiz__botao quiz__botao--contorno', () => abrirSimulador(percurso, pergunta, indice)),
    botao(ultima ? 'Ver o resultado' : 'Próxima pergunta', 'quiz__botao', () => {
      percurso.proximaPergunta();
      aoMudar();
    }),
  );

  caixa.append(topo, titulo, lista, feedback, acoes);

  function atualizar(): void {
    const estado = percurso.estado();
    const resposta = estado.respostasQuiz[indice];
    const respondidas = estado.respostasQuiz.filter((r) => r !== null).length;
    contador.textContent = `Pergunta ${indice + 1} de ${PERGUNTAS.length} · ${contarCertas(estado)} ${contarCertas(estado) === 1 ? 'certa' : 'certas'}`;
    enchimento.style.width = `${(respondidas / PERGUNTAS.length) * 100}%`;

    const respondeu = resposta !== null;
    opcoes.forEach(({ botao: b, marca }, i) => {
      const certa = i === pergunta.certa;
      const escolhida = i === resposta;
      b.classList.toggle('quiz__opcao--certa', respondeu && certa);
      b.classList.toggle('quiz__opcao--errada', respondeu && escolhida && !certa);
      b.classList.toggle('quiz__opcao--apagada', respondeu && !certa && !escolhida);
      if (respondeu) b.setAttribute('aria-disabled', 'true');
      else b.removeAttribute('aria-disabled');
      // A marca também diz por texto o que a cor mostra.
      marca.textContent = !respondeu ? '' : certa ? (escolhida ? 'Certa, a tua resposta' : 'Resposta certa') : escolhida ? 'A tua resposta' : '';
    });

    acoes.hidden = !respondeu;
    feedback.hidden = !respondeu;
    feedback.className = `quiz__feedback${respondeu ? (resposta === pergunta.certa ? ' quiz__feedback--certa' : ' quiz__feedback--errada') : ''}`;
    feedback.replaceChildren();
    if (respondeu) {
      feedback.append(el('strong', undefined, resposta === pergunta.certa ? PREFIXO.certa : PREFIXO.errada), ` ${pergunta.explicacao}`);
    }
  }

  atualizar();
  return titulo;
}

function abrirSimulador(percurso: Percurso, pergunta: PerguntaQuiz, indice: number): void {
  percurso.pedirSimulador({ ...pergunta.simulador, pergunta: indice });
  percurso.irPara(PASSOS.findIndex((p) => p.id === 'simular'));
}

/**
 * O crachá (H19, T23): um selo com o nível, o nome e a pontuação. O nível
 * também está escrito, para não depender só da cor. O botão guarda o crachá
 * como imagem; o mesmo crachá aparece no menu do percurso.
 */
function desenharBadge(estado: EstadoPercurso): HTMLElement {
  const cracha = crachaDoPercurso(estado.perguntaAtual, estado.respostasQuiz);
  if (!cracha) throw new Error('O crachá só existe depois da última pergunta');
  const caixa = el('div', `resumo__badge resumo__badge--${cracha.nivel}`);
  const selo = el('div', 'resumo__selo');
  selo.setAttribute('aria-hidden', 'true');
  selo.append(el('span', 'resumo__selo-num', `${cracha.certas}/${cracha.total}`));
  const texto = el('div', 'resumo__badge-texto');
  texto.append(
    el('p', 'resumo__badge-nivel', `Crachá ${NOME_NIVEL[cracha.nivel]}`),
    el('p', 'resumo__badge-nome', cracha.nome),
    el('p', 'resumo__badge-desc', cracha.descricao),
  );
  const guardar = botao('Guardar o crachá', 'resumo__guardar', () => guardarCracha(cracha));
  guardar.setAttribute('aria-label', `Guardar o crachá ${NOME_NIVEL[cracha.nivel]} como imagem`);
  caixa.append(selo, texto, guardar);
  return caixa;
}

/** Os conceitos do percurso (H19), cada um dominado ou a rever. */
function desenharConceitos(percurso: Percurso, respostas: readonly (number | null)[]): HTMLElement {
  const seccao = el('section', 'resumo__conceitos');
  const titulo = el('h3', 'resumo__subtitulo', 'Os conceitos que levas');
  titulo.id = 'resumo-conceitos';
  seccao.setAttribute('aria-labelledby', titulo.id);
  const lista = el('ul', 'resumo__lista');
  for (const { conceito, dominado } of estadoConceitos(respostas)) {
    const item = el('li', dominado ? 'resumo__conceito resumo__conceito--dominado' : 'resumo__conceito resumo__conceito--rever');
    const icone = el('span', 'resumo__icone', dominado ? '✓' : '↺');
    icone.setAttribute('aria-hidden', 'true');
    const corpo = el('div', 'resumo__corpo');
    const nome = el('p', 'resumo__nome');
    nome.append(el('strong', undefined, conceito.nome), el('span', 'resumo__estado', dominado ? 'Dominado' : 'A rever'));
    corpo.append(nome, el('p', 'resumo__frase', conceito.resumo));
    item.append(icone, corpo);
    if (!dominado) {
      const indice = PASSOS.findIndex((p) => p.id === conceito.passo);
      const rever = botao(`Rever em «${PASSOS[indice].nome}»`, 'resumo__rever', () => percurso.irPara(indice));
      rever.setAttribute('aria-label', `Rever ${conceito.nome} no passo ${PASSOS[indice].nome}`);
      item.append(rever);
    }
    lista.append(item);
  }
  seccao.append(titulo, lista);
  return seccao;
}

/** O ecrã final: pontuação, badge, conceitos, escolha do dilema e revisão. Devolve o título. */
function desenharResultado(caixa: HTMLElement, percurso: Percurso, aoMudar: () => void): HTMLElement {
  const estado = percurso.estado();
  const certas = contarCertas(estado);

  const etiqueta = el('p', 'quiz__etiqueta', 'Resultado');
  const titulo = el('h2', 'quiz__resultado', textoPontuacao(certas, PERGUNTAS.length));
  titulo.tabIndex = -1;
  const dilema = el('p', 'quiz__dilema', textoDilema(estado.respostaDilema));

  const revisao = el('ol', 'quiz__revisao');
  revisao.setAttribute('aria-label', 'As tuas respostas');
  PERGUNTAS.forEach((p, i) => {
    const acertou = estado.respostasQuiz[i] === p.certa;
    const item = el('li', acertou ? 'quiz__item quiz__item--certa' : 'quiz__item quiz__item--errada');
    const icone = el('span', 'quiz__icone', acertou ? '✓' : '✗');
    icone.setAttribute('aria-hidden', 'true');
    item.append(icone, el('span', 'escondido-visual', acertou ? 'Certa: ' : 'Errada: '), el('span', undefined, p.texto));
    revisao.append(item);
  });

  const repetir = botao('Repetir o quiz', 'quiz__botao quiz__botao--contorno', () => {
    percurso.reiniciarQuiz();
    aoMudar();
  });

  const subRevisao = el('h3', 'resumo__subtitulo', 'As tuas respostas');

  caixa.append(etiqueta, titulo, desenharBadge(estado), dilema, desenharConceitos(percurso, estado.respostasQuiz), subRevisao, revisao, repetir);
  return titulo;
}
