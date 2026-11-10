import { describe, expect, it } from 'vitest';
import { PASSOS } from './passos';
import { PERGUNTAS } from './quiz';
import { CONCEITOS, badgePara, estadoConceitos } from './resumo';

const certas = PERGUNTAS.map((p) => p.certa);
const erradas = PERGUNTAS.map((p) => (p.certa + 1) % 3);

describe('CONCEITOS', () => {
  it('cada conceito aponta para perguntas e um passo que existem', () => {
    for (const c of CONCEITOS) {
      expect(c.perguntas.length).toBeGreaterThan(0);
      for (const id of c.perguntas) expect(PERGUNTAS.some((p) => p.id === id)).toBe(true);
      expect(PASSOS.some((p) => p.id === c.passo)).toBe(true);
    }
  });

  it('todas as perguntas do quiz entram em pelo menos um conceito', () => {
    for (const p of PERGUNTAS) {
      expect(CONCEITOS.some((c) => c.perguntas.includes(p.id))).toBe(true);
    }
  });
});

describe('estadoConceitos', () => {
  it('tudo certo: todos dominados', () => {
    expect(estadoConceitos(certas).every((e) => e.dominado)).toBe(true);
  });

  it('tudo errado ou por responder: nenhum dominado', () => {
    expect(estadoConceitos(erradas).some((e) => e.dominado)).toBe(false);
    expect(estadoConceitos(PERGUNTAS.map(() => null)).some((e) => e.dominado)).toBe(false);
  });

  it('um conceito com duas perguntas precisa das duas certas', () => {
    const iPouco = PERGUNTAS.findIndex((p) => p.id === 'pouco-wip');
    const respostas = certas.map((r, i) => (i === iPouco ? erradas[i] : r));
    const estado = Object.fromEntries(estadoConceitos(respostas).map((e) => [e.conceito.id, e.dominado]));
    expect(estado['limite-wip']).toBe(false);
    expect(estado['little']).toBe(true);
  });
});

describe('badgePara', () => {
  it('dá ouro, prata ou bronze conforme a pontuação', () => {
    expect(badgePara(5, 5).nivel).toBe('ouro');
    expect(badgePara(4, 5).nivel).toBe('prata');
    expect(badgePara(3, 5).nivel).toBe('prata');
    expect(badgePara(2, 5).nivel).toBe('bronze');
    expect(badgePara(0, 5).nivel).toBe('bronze');
  });
});
