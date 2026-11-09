import { describe, expect, it, vi } from 'vitest';
import { PASSOS } from '../data/passos';
import { criarPercurso } from './percurso';

describe('criarPercurso', () => {
  it('começa no primeiro passo, só com esse visto', () => {
    const p = criarPercurso(5, 4);
    expect(p.estado().passoAtual).toBe(0);
    expect(p.estado().vistos).toEqual([true, false, false, false, false]);
    expect(p.estado().respostaDilema).toBeNull();
    expect(p.estado().respostasQuiz).toEqual([null, null, null, null]);
  });

  it('avançar marca os passos como vistos; voltar não os desmarca', () => {
    const p = criarPercurso(5, 0);
    p.avancar();
    p.avancar();
    p.voltar();
    expect(p.estado().passoAtual).toBe(1);
    expect(p.estado().vistos).toEqual([true, true, true, false, false]);
  });

  it('só conclui um passo quando se sai dele para a frente', () => {
    const p = criarPercurso(5, 0);
    expect(p.estado().concluidos).toEqual([false, false, false, false, false]);
    p.avancar(); // conclui o 0
    p.irPara(3); // conclui o 1; o 2 foi saltado
    p.voltar(); // voltar não conclui o 3
    expect(p.estado().concluidos).toEqual([true, true, false, false, false]);
    p.avancar(); // conclui o 2
    p.voltar();
    expect(p.estado().concluidos).toEqual([true, true, true, false, false]);
  });

  it('não sai dos limites do percurso', () => {
    const p = criarPercurso(3, 0);
    p.voltar();
    expect(p.estado().passoAtual).toBe(0);
    p.irPara(99);
    expect(p.estado().passoAtual).toBe(2);
    p.avancar();
    expect(p.estado().passoAtual).toBe(2);
  });

  it('guarda a resposta ao dilema e as do quiz', () => {
    const p = criarPercurso(5, 3);
    p.responderDilema('menos');
    p.responderQuiz(1, 2);
    expect(p.estado().respostaDilema).toBe('menos');
    expect(p.estado().respostasQuiz).toEqual([null, 2, null]);
    expect(() => p.responderQuiz(3, 0)).toThrow(RangeError);
  });

  it('avisa os ouvintes só quando o estado muda', () => {
    const p = criarPercurso(5, 0);
    const ouvinte = vi.fn();
    const desligar = p.subscrever(ouvinte);
    p.voltar(); // já está no início: não muda nada
    p.avancar();
    expect(ouvinte).toHaveBeenCalledTimes(1);
    desligar();
    p.avancar();
    expect(ouvinte).toHaveBeenCalledTimes(1);
  });

  it('não deixa alterar o estado anterior por fora', () => {
    const p = criarPercurso(5, 0);
    const antes = p.estado();
    p.avancar();
    expect(antes.passoAtual).toBe(0);
    expect(antes.vistos[1]).toBe(false);
  });
});

describe('PASSOS', () => {
  it('são 6 e o tempo restante ao avançar é ~8, ~6, ~4, ~3, ~1 min', () => {
    expect(PASSOS).toHaveLength(6);
    expect(PASSOS.slice(1).map((p) => p.minutosRestantes)).toEqual([8, 6, 4, 3, 1]);
  });
});
