// Crachá do fim do percurso (T23) fora do quiz: no menu do percurso e como
// imagem para guardar. Só aparece depois da última pergunta do quiz.
import './cracha.css';
import { NOME_NIVEL, crachaDoPercurso, nomeFicheiroCracha, svgCracha, type Cracha } from '../data/cracha';
import { PASSOS } from '../data/passos';
import type { EstadoPercurso, Percurso } from '../model/percurso';

/** Descarrega o crachá como SVG. */
export function guardarCracha(cracha: Cracha): void {
  const blob = new Blob([svgCracha(cracha)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const ligacao = document.createElement('a');
  ligacao.href = url;
  ligacao.download = nomeFicheiroCracha(cracha);
  document.body.append(ligacao);
  ligacao.click();
  ligacao.remove();
  // Dá tempo ao browser de começar a descarga antes de libertar o endereço.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Caixa do crachá para o menu do percurso. Fica escondida até haver crachá
 * e atualiza-se quando a pessoa acaba ou repete o quiz.
 */
export function criarCrachaMenu(percurso: Percurso): HTMLElement {
  const caixa = document.createElement('section');
  caixa.className = 'cracha-menu';
  caixa.setAttribute('aria-labelledby', 'titulo-cracha');
  caixa.hidden = true;

  const titulo = document.createElement('h3');
  titulo.id = 'titulo-cracha';
  titulo.className = 'cracha-menu__titulo';
  titulo.textContent = 'O teu crachá';

  const linha = document.createElement('div');
  linha.className = 'cracha-menu__linha';
  const selo = document.createElement('span');
  selo.className = 'cracha-menu__selo';
  selo.setAttribute('aria-hidden', 'true');
  const texto = document.createElement('p');
  texto.className = 'cracha-menu__texto';
  linha.append(selo, texto);

  const acoes = document.createElement('div');
  acoes.className = 'cracha-menu__acoes';
  const ver = document.createElement('button');
  ver.type = 'button';
  ver.className = 'cracha-menu__botao';
  ver.textContent = 'Ver resultado';
  ver.addEventListener('click', () => percurso.irPara(PASSOS.findIndex((p) => p.id === 'quiz')));
  const guardar = document.createElement('button');
  guardar.type = 'button';
  guardar.className = 'cracha-menu__botao';
  guardar.textContent = 'Guardar';
  acoes.append(ver, guardar);

  caixa.append(titulo, linha, acoes);

  let atual: Cracha | null = null;
  guardar.addEventListener('click', () => {
    if (atual) guardarCracha(atual);
  });

  function atualizar(estado: EstadoPercurso): void {
    atual = crachaDoPercurso(estado.perguntaAtual, estado.respostasQuiz);
    caixa.hidden = atual === null;
    if (!atual) return;
    const nivel = NOME_NIVEL[atual.nivel];
    caixa.className = `cracha-menu cracha-menu--${atual.nivel}`;
    selo.textContent = `${atual.certas}/${atual.total}`;
    texto.replaceChildren();
    const forte = document.createElement('strong');
    forte.textContent = atual.nome;
    texto.append(forte, document.createElement('br'), `Crachá ${nivel} · ${atual.certas} de ${atual.total} certas`);
    guardar.setAttribute('aria-label', `Guardar o crachá ${nivel} como imagem`);
  }

  atualizar(percurso.estado());
  percurso.subscrever(atualizar);
  return caixa;
}
