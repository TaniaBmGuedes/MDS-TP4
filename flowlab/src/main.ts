// Ponto de entrada da aplicação. Por agora só mostra uma página provisória que
// prova que o TypeScript, o CSS e o modelo funcionam em conjunto. A estrutura
// real da página (cabeçalho e passos) chega com o T2 e os tickets dos ecrãs.
import './style.css';
import { EQUIPA_INICIAL } from './data/simulacao';
import { simular } from './model/simulador';

// Com o modo strict, querySelector pode devolver null: é preciso tratar esse
// caso em vez de assumir que o elemento existe.
const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Falta o elemento #app no index.html');

const formatar = (valor: number): string => valor.toFixed(1).replace('.', ',');
const resultado = simular(EQUIPA_INICIAL.pessoas, EQUIPA_INICIAL);

app.innerHTML = `
  <section class="seccao">
    <p class="etiqueta">Base do projeto · Sprint 1</p>
    <h1>FlowLab</h1>
    <p class="lead">Página interativa sobre Kanban e métricas de fluxo. Os passos do percurso são acrescentados nos tickets seguintes.</p>
    <p class="suave">Verificação do modelo: com ${EQUIPA_INICIAL.pessoas} pessoas e limite de ${EQUIPA_INICIAL.pessoas} tarefas em curso, o throughput é ${formatar(resultado.throughput)} por dia e o lead time é ${formatar(resultado.leadTime)} dias.</p>
  </section>
`;
