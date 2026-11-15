// Navegação no fim de cada ecrã (H24), para avançar como numa lição:
// «Anterior» e «Seguinte» nas pontas, cada um com o nome do passo para onde
// leva, e no meio uma timeline com todos os passos. Clicar num ponto da
// timeline vai direto a esse passo. O primeiro passo não tem «Anterior» e o
// último não tem «Seguinte».
//
// Tudo só muda o passo no store do percurso (irPara): o main.ts já desliza
// até ao passo, põe o foco no título, atualiza o menu e a âncora. São
// <button>, por isso funcionam com Tab, Enter e Espaço.
import './navegacaoPassos.css';
import { PASSOS, passosVizinhos } from '../data/passos';
import type { Percurso } from '../model/percurso';
import { ICONES } from './icones';

function criarBotao(indice: number, direcao: 'anterior' | 'seguinte', percurso: Percurso): HTMLButtonElement {
  const passo = PASSOS[indice];
  const rotulo = direcao === 'anterior' ? 'Anterior' : 'Seguinte';
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `navegacao-passos__botao navegacao-passos__botao--${direcao}`;
  botao.dataset.passo = passo.id;

  const texto = document.createElement('span');
  texto.className = 'navegacao-passos__texto';
  const etiqueta = document.createElement('span');
  etiqueta.className = 'navegacao-passos__rotulo';
  etiqueta.textContent = rotulo;
  const nome = document.createElement('span');
  nome.className = 'navegacao-passos__nome';
  nome.textContent = passo.nome;
  // O leitor de ecrã lê «Seguinte: Métricas».
  const separador = document.createElement('span');
  separador.className = 'escondido-visual';
  separador.textContent = ': ';
  texto.append(etiqueta, separador, nome);

  const icone = direcao === 'anterior' ? ICONES.setaAtras : ICONES.seta;
  if (direcao === 'anterior') botao.insertAdjacentHTML('afterbegin', icone);
  botao.append(texto);
  if (direcao === 'seguinte') botao.insertAdjacentHTML('beforeend', icone);

  botao.addEventListener('click', () => percurso.irPara(indice));
  return botao;
}

/** Timeline com todos os passos; o do ecrã atual fica em destaque. */
function criarTimeline(atual: number, percurso: Percurso): HTMLOListElement {
  const lista = document.createElement('ol');
  lista.className = 'timeline-passos';
  PASSOS.forEach((passo, i) => {
    const item = document.createElement('li');
    const estado = i < atual ? 'feito' : i === atual ? 'atual' : 'depois';
    item.className = `timeline-passos__item timeline-passos__item--${estado}`;

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'timeline-passos__botao';
    botao.dataset.passo = passo.id;
    const ponto = document.createElement('span');
    ponto.className = 'timeline-passos__ponto';
    ponto.setAttribute('aria-hidden', 'true');
    ponto.textContent = String(i + 1);
    const nome = document.createElement('span');
    nome.className = 'timeline-passos__nome';
    nome.textContent = passo.nome;
    botao.append(ponto, nome);

    if (i === atual) {
      // Já se está neste passo: fica marcado e não faz nada ao clicar.
      botao.setAttribute('aria-current', 'step');
      botao.setAttribute('aria-label', `Passo ${i + 1}: ${passo.nome} (estás aqui)`);
    } else {
      botao.setAttribute('aria-label', `Ir para o passo ${i + 1}: ${passo.nome}`);
      botao.addEventListener('click', () => percurso.irPara(i));
    }
    item.append(botao);
    lista.append(item);
  });
  return lista;
}

/** Barra de navegação do passo `indice`, para pôr no fim da secção dele. */
export function criarNavegacaoPassos(indice: number, percurso: Percurso): HTMLElement {
  const { anterior, seguinte } = passosVizinhos(indice);
  const nav = document.createElement('nav');
  nav.className = 'navegacao-passos';
  nav.setAttribute('aria-label', `Navegar a partir de «${PASSOS[indice].nome}»`);

  const esquerda = document.createElement('div');
  esquerda.className = 'navegacao-passos__lado navegacao-passos__lado--anterior';
  if (anterior !== null) esquerda.append(criarBotao(anterior, 'anterior', percurso));

  const direita = document.createElement('div');
  direita.className = 'navegacao-passos__lado navegacao-passos__lado--seguinte';
  if (seguinte !== null) direita.append(criarBotao(seguinte, 'seguinte', percurso));

  nav.append(esquerda, criarTimeline(indice, percurso), direita);
  return nav;
}
