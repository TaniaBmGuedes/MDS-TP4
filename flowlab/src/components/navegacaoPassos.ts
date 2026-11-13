// Botões «Anterior» e «Seguinte» no fim de cada ecrã (fluxo contínuo, R5 do
// feedback do cliente): quem acaba uma parte passa à seguinte sem ir ao menu.
// O «Seguinte» leva a cor e o ícone do passo para onde vai, e diz o nome
// dele, para se perceber que há uma sequência.
import './navegacaoPassos.css';
import { PASSOS, vizinhos } from '../data/passos';
import type { Percurso } from '../model/percurso';
import { ICONES, iconePasso } from './icones';

export function criarNavegacaoPassos(indice: number, percurso: Percurso): HTMLElement {
  const { anterior, seguinte } = vizinhos(indice);

  const nav = document.createElement('nav');
  nav.className = 'navegacao-passos';
  nav.setAttribute('aria-label', 'Passo anterior e seguinte');

  const contador = document.createElement('p');
  contador.className = 'navegacao-passos__contador';
  contador.textContent = `Passo ${indice + 1} de ${PASSOS.length}`;

  const botoes = document.createElement('div');
  botoes.className = 'navegacao-passos__botoes';

  if (anterior) {
    const voltar = document.createElement('button');
    voltar.type = 'button';
    voltar.className = 'navegacao-passos__anterior';
    voltar.innerHTML = `${ICONES.setaAtras}<span>Anterior <span class="navegacao-passos__nome"></span></span>`;
    preencherNome(voltar, anterior.nome);
    voltar.addEventListener('click', () => percurso.voltar());
    botoes.append(voltar);
  }

  if (seguinte) {
    const avancar = document.createElement('button');
    avancar.type = 'button';
    avancar.className = 'navegacao-passos__seguinte';
    avancar.dataset.passo = seguinte.id;
    avancar.innerHTML = `
      <span class="navegacao-passos__icone">${iconePasso(seguinte.id)}</span>
      <span class="navegacao-passos__texto">
        <span class="navegacao-passos__rotulo">Seguinte</span>
        <span class="navegacao-passos__nome"></span>
      </span>
      ${ICONES.seta}
    `;
    preencherNome(avancar, seguinte.nome);
    avancar.addEventListener('click', () => percurso.avancar());
    botoes.append(avancar);
  } else {
    const fim = document.createElement('p');
    fim.className = 'navegacao-passos__fim';
    fim.textContent = 'Chegaste ao fim do percurso.';
    botoes.append(fim);
  }

  nav.append(contador, botoes);
  return nav;
}

// O nome vem dos dados dos passos: vai por textContent e não pelo innerHTML.
function preencherNome(botao: HTMLElement, nome: string): void {
  const alvo = botao.querySelector<HTMLElement>('.navegacao-passos__nome');
  if (alvo) alvo.textContent = nome;
}
