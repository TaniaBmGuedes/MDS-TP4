// Ticket do percurso: um cartão de tarefa solto no fundo da página. Com o
// scroll atravessa o ecrã em ziguezague (direita, meio, esquerda, meio, …) e
// desce de cima para baixo, mudando de estado como num quadro. Começa em «Backlog»
// na introdução e chega a «Concluído» no último passo. É decorativo
// (aria-hidden): o menu já diz em que passo se está.
import './ticketPercurso.css';

const ESTADOS = ['Backlog', 'A fazer', 'Em curso', 'Em revisão', 'Em teste', 'Concluído'] as const;

const ICONE_TAREFA =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor"/><path d="M4.5 8.2l2.2 2.2 4.8-4.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export interface TicketPercurso {
  elemento: HTMLElement;
  /**
   * posicao: de 0 (primeiro passo) a numeroPassos - 1, com casas decimais
   * enquanto se está entre dois passos; passo: o passo atual (dá o estado).
   */
  atualizar(posicao: number, passo: number): void;
}

/** Estado do ticket para cada passo; com mais passos do que estados, fica no último. */
export function estadoDoPasso(passo: number, numeroPassos: number): string {
  if (passo >= numeroPassos - 1) return ESTADOS[ESTADOS.length - 1];
  return ESTADOS[Math.max(0, Math.min(passo, ESTADOS.length - 2))];
}

/**
 * Por onde o cartão passa na horizontal, um ponto por passo: 1 é a direita,
 * 0,5 o meio e 0 a esquerda. Com mais passos, o caminho repete-se.
 */
export const CAMINHO = [1, 0.5, 0, 0.5, 1, 0.5] as const;

/**
 * Posição horizontal do cartão (0 = esquerda, 1 = direita) para uma posição
 * do scroll entre passos (ex.: 1.5 = a meio entre o passo 1 e o 2).
 */
export function posicaoHorizontal(posicao: number): number {
  const p = Math.max(0, posicao);
  const i = Math.floor(p);
  const a = CAMINHO[i % CAMINHO.length];
  const b = CAMINHO[(i + 1) % CAMINHO.length];
  return a + (b - a) * (p - i);
}

export function criarTicketPercurso(numeroPassos: number): TicketPercurso {
  const elemento = document.createElement('div');
  elemento.className = 'ticket-percurso';
  elemento.setAttribute('aria-hidden', 'true');
  elemento.style.setProperty('--passos', String(Math.max(1, numeroPassos - 1)));

  const cartao = document.createElement('div');
  cartao.className = 'ticket-percurso__cartao';
  cartao.innerHTML = `<span class="ticket-percurso__resumo">Aprender Kanban</span><span class="ticket-percurso__linha"><span class="ticket-percurso__tipo">${ICONE_TAREFA}</span><span class="ticket-percurso__chave">FL-1</span><span class="ticket-percurso__estado"></span></span>`;
  const estado = cartao.querySelector<HTMLElement>('.ticket-percurso__estado');
  elemento.append(cartao);

  let passoAntes = -1;
  return {
    elemento,
    atualizar(posicao, passo) {
      const p = Math.max(0, Math.min(numeroPassos - 1, posicao));
      elemento.style.setProperty('--posicao', p.toFixed(3));
      elemento.style.setProperty('--x', posicaoHorizontal(p).toFixed(3));
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
