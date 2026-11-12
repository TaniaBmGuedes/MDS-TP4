// Secção «Fontes» (T20), no fundo da página, por baixo de todos os passos.
// Fica num rodapé com título próprio, para quem usa leitor de ecrã a
// encontrar pela lista de regiões e de títulos.
import './fontes.css';
import { FONTES, referencia } from '../data/fontes';

export function criarFontes(): HTMLElement {
  const rodape = document.createElement('footer');
  rodape.className = 'fontes';
  rodape.setAttribute('aria-labelledby', 'titulo-fontes');

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

  rodape.append(titulo, intro, lista);
  return rodape;
}
