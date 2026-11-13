// O dilema do início (H23): três opções. Ao escolher, a escolha fica guardada
// no percurso (percurso.responderDilema), vê-se logo um resultado com números
// do modelo e o ecrã Equipa refere-a em «A resposta ao dilema». Voltar a este
// ecrã mostra a escolha anterior e o resultado, e dá para mudar de ideias.
//
// Teclado: as opções são botões nativos (Tab, Enter, Espaço) com aria-pressed.
// O resultado fica numa região aria-live="polite", para quem usa leitor de
// ecrã o ouvir ao escolher, sem mudar o foco.
import './dilema.css';
import { OPCOES_DILEMA, TEXTOS_DILEMA, resultadoDilema, type OpcaoDilema } from '../data/dilema';
import type { EscolhaDilema, Percurso } from '../model/percurso';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe?: string, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/** Desenha o dilema (subtítulo, opções e resultado) dentro do contentor. */
export function montarDilema(contentor: HTMLElement, percurso: Percurso): void {
  contentor.append(el('p', 'ecra-info__subtitulo', TEXTOS_DILEMA.subtitulo));

  const grelha = el('div', 'ecra-info__opcoes');
  grelha.setAttribute('role', 'group');
  grelha.setAttribute('aria-label', 'Opções do dilema');
  const resultado = el('div', 'dilema__resultado');
  resultado.setAttribute('aria-live', 'polite');
  resultado.hidden = true;

  const botoes = new Map<EscolhaDilema, HTMLButtonElement>();

  function mostrar(escolha: EscolhaDilema | null): void {
    for (const [id, botao] of botoes) {
      const ativo = id === escolha;
      botao.classList.toggle('cartao-opcao--selecionado', ativo);
      botao.setAttribute('aria-pressed', String(ativo));
    }
    if (escolha === null) {
      resultado.hidden = true;
      resultado.replaceChildren();
      return;
    }
    const r = resultadoDilema(escolha);
    resultado.replaceChildren(
      el('p', 'dilema__etiqueta', TEXTOS_DILEMA.etiquetaResultado),
      el('p', 'dilema__veredicto', r.veredicto),
      el('p', 'dilema__explicacao', r.explicacao),
      el('p', 'dilema__numeros', r.numeros),
    );
    resultado.hidden = false;
  }

  function criarOpcao(opcao: OpcaoDilema): HTMLButtonElement {
    const botao = el('button', 'cartao-opcao');
    botao.type = 'button';
    botao.append(el('h2', 'cartao-opcao__titulo', opcao.titulo), el('p', 'cartao-opcao__desc', opcao.descricao));
    botao.addEventListener('click', () => {
      percurso.responderDilema(opcao.id);
      mostrar(opcao.id);
    });
    return botao;
  }

  for (const opcao of OPCOES_DILEMA) {
    const botao = criarOpcao(opcao);
    botoes.set(opcao.id, botao);
    grelha.append(botao);
  }

  contentor.append(grelha, resultado);
  // Se a pessoa já tinha escolhido, mostra-se logo (sem a anunciar de novo).
  mostrar(percurso.estado().respostaDilema);
}
