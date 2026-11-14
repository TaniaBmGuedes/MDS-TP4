// «Fontes» (T20): as referências abrem numa janela (<dialog>) a partir do
// botão «Fontes» no cabeçalho, em vez de ocuparem o fundo da página. O
// <dialog> nativo prende o foco lá dentro, fecha com Esc e devolve o foco
// ao botão que o abriu.
import './fontes.css';
import { FONTES, referencia } from '../data/fontes';
import { ICONES } from './icones';

export interface FontesJanela {
  /** Botão «Fontes», para pôr no cabeçalho. */
  botao: HTMLButtonElement;
  /** A janela, para pôr no body. */
  janela: HTMLDialogElement;
}

export function criarFontes(): FontesJanela {
  const janela = document.createElement('dialog');
  janela.className = 'fontes';
  janela.setAttribute('aria-labelledby', 'titulo-fontes');

  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'fontes__fechar';
  fechar.innerHTML = `${ICONES.fechar}<span>Fechar</span>`;
  fechar.addEventListener('click', () => janela.close());
  // Clicar fora da caixa (no fundo escurecido) também fecha.
  janela.addEventListener('click', (e) => {
    if (e.target === janela) janela.close();
  });

  const titulo = document.createElement('h2');
  titulo.id = 'titulo-fontes';
  titulo.className = 'fontes__titulo';
  titulo.textContent = 'Fontes';

  const intro = document.createElement('p');
  intro.className = 'fontes__intro';
  intro.textContent = 'O conteúdo do FlowLab foi revisto com estas referências, as mesmas do relatório do projeto.';

  const lista = document.createElement('ol');
  lista.className = 'fontes__lista';
  for (const fonte of FONTES) {
    const item = document.createElement('li');
    item.className = 'fontes__item';

    const ref = document.createElement('p');
    ref.className = 'fontes__ref';
    ref.textContent = referencia(fonte);
    if (fonte.url) {
      const ligacao = document.createElement('a');
      ligacao.href = fonte.url;
      ligacao.rel = 'noopener';
      ligacao.target = '_blank';
      ligacao.textContent = fonte.url.replace(/^https:\/\//, '');
      ligacao.setAttribute('aria-label', `${fonte.titulo} (abre noutro separador)`);
      ref.append(' ', ligacao);
    }

    const uso = document.createElement('p');
    uso.className = 'fontes__uso';
    uso.textContent = `Usada em: ${fonte.usadaEm}`;

    item.append(ref, uso);
    lista.append(item);
  }

  const corpo = document.createElement('div');
  corpo.className = 'fontes__corpo';
  const topo = document.createElement('div');
  topo.className = 'fontes__topo';
  topo.append(titulo, fechar);
  corpo.append(topo, intro, lista);
  janela.append(corpo);

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-fontes';
  botao.setAttribute('aria-haspopup', 'dialog');
  botao.innerHTML = `${ICONES.livro}<span>Fontes</span>`;
  botao.addEventListener('click', () => janela.showModal());

  return { botao, janela };
}
