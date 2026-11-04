// Motor do simulador, migrado do protótipo v1 (mockup/v1/src/main.js).
// É uma função pura: não toca no DOM, por isso pode ser testada com o Vitest e
// reutilizada pelo simulador e pelo gráfico cumulativo.

export interface ParametrosSimulacao {
  pessoas: number;
  /** Tarefas que chegam à fila em cada dia. */
  chegadasPorDia: number;
  dias: number;
  filaInicial: number;
  /** Tarefas que uma pessoa acaba por dia, quando se foca numa só. */
  tarefasPorPessoaDia: number;
  /** Quanto mais alto, mais a troca de tarefa reduz o throughput. */
  custoTroca: number;
}

export interface ResultadoSimulacao {
  throughput: number;
  /** Valores no fim do último dia. */
  fila: number;
  meio: number;
  feitas: number;
  /** Séries diárias do gráfico cumulativo (o índice 0 é o estado inicial). */
  entradas: number[];
  comecadas: number[];
  acabadas: number[];
  leadTime: number;
  cycleTime: number;
}

/** Com mais tarefas a meio do que pessoas, a troca de tarefa reduz o throughput. */
export function calcularThroughput(wip: number, p: ParametrosSimulacao): number {
  if (wip <= p.pessoas) return p.tarefasPorPessoaDia * wip;
  return p.tarefasPorPessoaDia * p.pessoas * Math.pow(p.pessoas / wip, p.custoTroca);
}

export function simular(wip: number, p: ParametrosSimulacao): ResultadoSimulacao {
  const throughput = calcularThroughput(wip, p);
  let fila = p.filaInicial;
  let meio = 0;
  let feitas = 0;
  let somaFila = 0;
  let somaMeio = 0;
  const entradas = [p.filaInicial];
  const comecadas = [0];
  const acabadas = [0];

  for (let dia = 1; dia <= p.dias; dia++) {
    fila += p.chegadasPorDia;

    // Puxa da fila até ao limite de WIP, trabalha, e volta a puxar para ocupar
    // os lugares que ficaram livres com as tarefas acabadas hoje.
    let puxar = Math.min(fila, wip - meio);
    fila -= puxar;
    meio += puxar;

    const acabadasHoje = Math.min(meio, throughput);
    meio -= acabadasHoje;
    feitas += acabadasHoje;

    puxar = Math.min(fila, wip - meio);
    fila -= puxar;
    meio += puxar;

    somaFila += fila;
    somaMeio += meio;
    entradas.push(feitas + meio + fila);
    comecadas.push(feitas + meio);
    acabadas.push(feitas);
  }

  const mediaFila = somaFila / p.dias;
  const mediaMeio = somaMeio / p.dias;

  return {
    throughput,
    fila,
    meio,
    feitas,
    entradas,
    comecadas,
    acabadas,
    // Lei de Little: tempo médio = trabalho em curso ÷ throughput.
    // O lead time conta o sistema todo; o cycle time conta só o «Em curso».
    leadTime: (mediaFila + mediaMeio) / throughput,
    cycleTime: mediaMeio / throughput,
  };
}
