// Ecrã de introdução (H20): diz logo à entrada qual é o tema do site e o que
// a pessoa vai aprender, antes de qualquer simulador (feedback do cliente na
// review do Sprint 1, R1). O título vem do main.ts; o botão «Começar» leva ao
// primeiro passo do percurso, tal como o «Seguinte» no fim do ecrã.
import './inicio.css';
import { PASSOS } from '../data/passos';
import { ICONES, iconePasso } from '../components/icones';
import type { Ecra } from './index';

const APRENDER = [
  { passo: 'simular', texto: 'Porque é que começar menos tarefas ao mesmo tempo faz acabar mais depressa.' },
  { passo: 'info', texto: 'O que é um quadro Kanban e porque se limita o trabalho em curso.' },
  { passo: 'metricas', texto: 'Ler as três métricas do fluxo: trabalho em curso, throughput e lead time.' },
  { passo: 'equipa', texto: 'Decidir entre trazer mais gente ou fazer menos de cada vez.' },
] as const;

export const ecraInicio: Ecra = (seccao, _passo, percurso) => {
  const tema = document.createElement('p');
  tema.className = 'inicio__tema';
  tema.innerHTML = '<strong>FlowLab</strong> é uma lição curta e interativa sobre <strong>Kanban e métricas de fluxo</strong>: como pôr o trabalho de uma equipa a andar sem acumular tarefas a meio.';

  const objetivo = document.createElement('p');
  objetivo.className = 'inicio__objetivo';
  objetivo.textContent = `O objetivo é perceberes, a experimentar e não só a ler, porque é que limitar o trabalho em curso faz as entregas chegarem mais cedo. São ${PASSOS.length - 1} passos e cerca de ${PASSOS[0].minutosRestantes} minutos.`;

  const subtitulo = document.createElement('h2');
  subtitulo.className = 'inicio__subtitulo';
  subtitulo.textContent = 'O que vais aprender';

  const lista = document.createElement('ul');
  lista.className = 'inicio__lista';
  for (const item of APRENDER) {
    const li = document.createElement('li');
    li.className = 'inicio__item';
    li.dataset.passo = item.passo;
    const icone = document.createElement('span');
    icone.className = 'inicio__icone';
    icone.innerHTML = iconePasso(item.passo);
    const texto = document.createElement('span');
    texto.textContent = item.texto;
    li.append(icone, texto);
    lista.append(li);
  }

  const comecar = document.createElement('button');
  comecar.type = 'button';
  comecar.className = 'inicio__comecar';
  comecar.innerHTML = `<span>Começar o percurso</span>${ICONES.seta}`;
  comecar.addEventListener('click', () => percurso.avancar());

  seccao.append(tema, objetivo, subtitulo, lista, comecar);
};
