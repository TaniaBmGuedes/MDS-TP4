// T25 (SCRUM-39): que células da tabela do gráfico correspondem ao destaque
// de cada regra de leitura. Quem usa leitor de ecrã não vê as chavetas e as
// setas desenhadas no SVG; com isto, a tabela marca as mesmas células, para
// a regra se poder seguir também pelos números.
//
// Fica fora do componente (sem DOM) para se poder testar com o Vitest.
import type { IdBanda } from '../model/cfd';
import type { Destaque } from './grafico';

/** Uma célula da tabela: um dia e uma banda, ou a linha inteira (banda null). */
export interface CelulaDestacada {
  dia: number;
  banda: IdBanda | null;
}

/**
 * Células a marcar na tabela para um destaque.
 * - altura: a banda «Em curso» no dia medido (a altura é o WIP);
 * - horizontal: as linhas do dia de entrada e do dia de saída, porque a regra
 *   compara dois dias e não uma banda (a saída arredonda-se ao dia mais
 *   próximo, já que a tabela só tem dias inteiros);
 * - alargar: a banda que alarga, no primeiro e no último dia comparados;
 * - estavel: nada a marcar.
 */
export function celulasDestacadas(d: Destaque | null, ultimoDia: number): CelulaDestacada[] {
  if (!d) return [];
  switch (d.tipo) {
    case 'altura':
      return [{ dia: d.dia, banda: 'emCurso' }];
    case 'horizontal': {
      const celulas: CelulaDestacada[] = [{ dia: d.diaEntrada, banda: null }];
      if (d.diaSaida !== null) {
        const saida = Math.min(ultimoDia, Math.round(d.diaSaida));
        if (saida !== d.diaEntrada) celulas.push({ dia: saida, banda: null });
      }
      return celulas;
    }
    case 'alargar':
      return [
        { dia: d.de, banda: d.banda },
        { dia: d.ate, banda: d.banda },
      ];
    case 'estavel':
      return [];
  }
}

/** Verdadeiro se a célula (dia, banda) está entre as destacadas. */
export function estaDestacada(celulas: readonly CelulaDestacada[], dia: number, banda: IdBanda): boolean {
  return celulas.some((c) => c.dia === dia && (c.banda === null || c.banda === banda));
}
