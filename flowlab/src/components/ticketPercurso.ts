// Ticket do percurso: um cartão de tarefa que acompanha o scroll e muda de
// estado como num quadro, de «Backlog» (introdução) a «Concluído» (último
// passo). Fica a meio da altura do ecrã, numa faixa vazia que cada passo
// guarda de lado, alternando: direita no 1.º passo, esquerda no 2.º, direita
// no 3.º, … Ao passar de um passo ao seguinte, o cartão atravessa a página
// para o outro lado. Nunca fica por trás de texto. É decorativo (aria-hidden):
// o menu já diz em que passo se está.
import './ticketPercurso.css';

const ESTADOS = ['Backlog', 'A fazer', 'Em curso', 'Em revisão', 'Em teste', 'Concluído'] as const;

const ICONE_TAREFA =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor"/><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export interface TicketPercurso {
  elemento: HTMLElement;
  /**
   * lado: 0 encostado à esquerda, 1 à direita (ver ladoNaLinha); passo: o
   * passo atual (dá o estado).
   */
  atualizar(lado: number, passo: number): void;
}

/** Estado do ticket para cada passo; com mais passos do que estados, fica no último. */
export function estadoDoPasso(passo: number, numeroPassos: number): string {
  if (passo >= numeroPassos - 1) return ESTADOS[ESTADOS.length - 1];
  return ESTADOS[Math.max(0, Math.min(passo, ESTADOS.length - 2))];
}

/** Altura do ecrã (fração) a que fica o centro do cartão. */
export const LINHA_DO_TICKET = 0.5;

/** De que lado está a faixa do ticket em cada passo: 1 direita, 0 esquerda. */
export function ladoDoPasso(passo: number): number {
  return passo % 2 === 0 ? 1 : 0;
}

export interface Faixa {
  top: number;
  bottom: number;
}

/**
 * Lado do cartão (0 esquerda, 1 direita) quando a linha do ticket está à
 * altura y: o lado do passo que lá está. Se a linha cair num intervalo entre
 * dois passos, fica a meio caminho, proporcional ao que já se desceu.
 */
export function ladoNaLinha(passos: readonly Faixa[], y: number): number {
  if (passos.length === 0) return ladoDoPasso(0);
  for (let i = 0; i < passos.length; i++) {
    const atual = passos[i];
    if (y < atual.top) {
      if (i === 0) return ladoDoPasso(0);
      const antes = passos[i - 1];
      const t = (y - antes.bottom) / Math.max(1, atual.top - antes.bottom);
      const a = ladoDoPasso(i - 1);
      return a + (ladoDoPasso(i) - a) * Math.min(1, Math.max(0, t));
    }
    if (y <= atual.bottom) return ladoDoPasso(i);
  }
  return ladoDoPasso(passos.length - 1);
}

export function criarTicketPercurso(numeroPassos: number): TicketPercurso {
  const elemento = document.createElement('div');
  elemento.className = 'ticket-percurso';
  elemento.setAttribute('aria-hidden', 'true');

  const cartao = document.createElement('div');
  cartao.className = 'ticket-percurso__cartao';
  cartao.innerHTML = `<span class="ticket-percurso__titulo">O teu ticket</span><span class="ticket-percurso__resumo">Aprender Kanban</span><span class="ticket-percurso__linha"><span class="ticket-percurso__tipo">${ICONE_TAREFA}</span><span class="ticket-percurso__chave">FL-1</span><span class="ticket-percurso__estado"></span></span>`;
  const estado = cartao.querySelector<HTMLElement>('.ticket-percurso__estado');
  elemento.append(cartao);

  let passoAntes = -1;
  return {
    elemento,
    atualizar(lado, passo) {
      elemento.style.setProperty('--x', Math.max(0, Math.min(1, lado)).toFixed(3));
      if (passo === passoAntes) return;
      const primeiraVez = passoAntes === -1;
      passoAntes = passo;
      const texto = estadoDoPasso(passo, numeroPassos);
      if (estado) estado.textContent = texto;
      cartao.dataset.estado = String(Math.min(passo, numeroPassos - 1));
      cartao.classList.toggle('ticket-percurso__cartao--feito', passo >= numeroPassos - 1);
      if (!primeiraVez) {
        cartao.classList.remove('ticket-percurso__cartao--mudou');
        void cartao.offsetWidth; // recomeça a animação
        cartao.classList.add('ticket-percurso__cartao--mudou');
      }
    },
  };
}
