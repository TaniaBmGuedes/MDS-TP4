import { describe, expect, it } from 'vitest';
import { EQUIPA_INICIAL } from '../data/simulacao';
import { alturaBanda, bandaQueAlarga, limitesBanda, travessia, type SeriesCumulativas } from './cfd';
import { simular } from './simulador';

const DIAS = EQUIPA_INICIAL.dias;

describe('limitesBanda e alturaBanda', () => {
  it('as três bandas encaixam umas nas outras e somam tudo o que entrou', () => {
    const s = simular(12, EQUIPA_INICIAL);
    for (let dia = 0; dia <= DIAS; dia++) {
      expect(limitesBanda(s, 'feito', dia).baixo).toBe(0);
      expect(limitesBanda(s, 'emCurso', dia).baixo).toBe(limitesBanda(s, 'feito', dia).cima);
      expect(limitesBanda(s, 'aFazer', dia).baixo).toBe(limitesBanda(s, 'emCurso', dia).cima);
      const soma = alturaBanda(s, 'aFazer', dia) + alturaBanda(s, 'emCurso', dia) + alturaBanda(s, 'feito', dia);
      expect(soma).toBeCloseTo(s.entradas[dia]);
    }
  });

  it('a altura de «Em curso» é o WIP e nunca passa o limite', () => {
    for (const wip of [1, 2, 4, 12]) {
      const s = simular(wip, EQUIPA_INICIAL);
      for (let dia = 0; dia <= DIAS; dia++) {
        expect(alturaBanda(s, 'emCurso', dia)).toBeLessThanOrEqual(wip + 1e-9);
      }
    }
  });
});

describe('travessia', () => {
  it('com uma tarefa por pessoa, as tarefas do dia 3 ficam feitas uns dias depois', () => {
    const t = travessia(simular(4, EQUIPA_INICIAL), 3);
    expect(t.nivel).toBe(EQUIPA_INICIAL.filaInicial + 3 * EQUIPA_INICIAL.chegadasPorDia);
    expect(t.diaSaida).not.toBeNull();
    expect(t.diaSaida!).toBeGreaterThan(3);
    expect(t.diaSaida!).toBeLessThanOrEqual(DIAS);
  });

  it('demora mais com tarefas a mais do que com uma por pessoa', () => {
    const focada = travessia(simular(4, EQUIPA_INICIAL), 3).diaSaida ?? Infinity;
    const dispersa = travessia(simular(12, EQUIPA_INICIAL), 3).diaSaida ?? Infinity;
    expect(dispersa).toBeGreaterThan(focada);
  });

  it('fica null quando o nível não é alcançado dentro dos dias simulados', () => {
    const s: SeriesCumulativas = { entradas: [4, 6, 8], comecadas: [1, 2, 3], acabadas: [0, 1, 2] };
    expect(travessia(s, 1).diaSaida).toBeNull();
  });

  it('interpola entre dias', () => {
    const s: SeriesCumulativas = { entradas: [2, 4, 6], comecadas: [0, 4, 6], acabadas: [0, 2, 6] };
    // Nível 4 (dia 1): acabadas passa de 2 para 6 entre o dia 1 e o 2.
    expect(travessia(s, 1).diaSaida).toBeCloseTo(1.5);
  });
});

describe('bandaQueAlarga', () => {
  it('com tarefas a mais, «A fazer» alarga: a fila cresce', () => {
    const a = bandaQueAlarga(simular(12, EQUIPA_INICIAL), 1, DIAS);
    expect(a?.banda).toBe('aFazer');
    expect(a!.fim).toBeGreaterThan(a!.inicio);
  });

  it('com uma tarefa por pessoa, nenhuma banda alarga', () => {
    expect(bandaQueAlarga(simular(4, EQUIPA_INICIAL), 1, DIAS)).toBeNull();
  });

  it('ignora «Feito», que cresce sempre', () => {
    const s: SeriesCumulativas = { entradas: [0, 10, 20], comecadas: [0, 10, 20], acabadas: [0, 10, 20] };
    expect(bandaQueAlarga(s, 0, 2)).toBeNull();
  });
});
