// Ticket do percurso: no cabeçalho, um cartão de tarefa atravessa as
// colunas de um quadro à medida que se desce na página. Começa em «Backlog»
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

export function criarTicketPercurso(numeroPassos: number): TicketPercurso {
  const elemento = document.createElement('div');
  elemento.className = 'ticket-percurso';
  elemento.setAttribute('aria-hidden', 'true');
  elemento.style.setProperty('--colunas', String(numeroPassos));

  const pista = document.createElement('div');
  pista.className = 'ticket-percurso__pista';
  const colunas = Array.from({ length: numeroPassos }, (_, i) => {
    const coluna = document.createElement('span');
    coluna.className = 'ticket-percurso__coluna';
    coluna.textContent = estadoDoPasso(i, numeroPassos);
    pista.append(coluna);
    return coluna;
  });

  const cartao = document.createElement('div');
  cartao.className = 'ticket-percurso__cartao';
  cartao.innerHTML = `<span class="ticket-percurso__tipo">${ICONE_TAREFA}</span><span class="ticket-percurso__estado"></span>`;
  const estado = cartao.querySelector<HTMLElement>('.ticket-percurso__estado');
  pista.append(cartao);
  elemento.append(pista);

  let passoAntes = -1;
  return {
    elemento,
    atualizar(posicao, passo) {
      const p = Math.max(0, Math.min(numeroPassos - 1, posicao));
      elemento.style.setProperty('--posicao', p.toFixed(3));
      if (passo === passoAntes) return;
      const primeiraVez = passoAntes === -1;
      passoAntes = passo;
      const texto = estadoDoPasso(passo, numeroPassos);
      if (estado) estado.textContent = texto;
      cartao.dataset.estado = String(Math.min(passo, numeroPassos - 1));
      cartao.classList.toggle('ticket-percurso__cartao--feito', passo >= numeroPassos - 1);
      colunas.forEach((c, i) => c.classList.toggle('ticket-percurso__coluna--passada', i < passo));
      if (!primeiraVez) {
        cartao.classList.remove('ticket-percurso__cartao--mudou');
        void cartao.offsetWidth; // recomeça a animação
        cartao.classList.add('ticket-percurso__cartao--mudou');
      }
    },
  };
}
