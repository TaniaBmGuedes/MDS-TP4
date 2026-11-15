import { describe, expect, it } from 'vitest';
import { lerEscolha, temaEfetivo, temaOposto } from './tema';

describe('lerEscolha()', () => {
  it('aceita «claro» e «escuro»', () => {
    expect(lerEscolha('claro')).toBe('claro');
    expect(lerEscolha('escuro')).toBe('escuro');
  });

  it('trata o resto como «sem escolha»', () => {
    expect(lerEscolha(null)).toBeNull();
    expect(lerEscolha('')).toBeNull();
    expect(lerEscolha('dark')).toBeNull();
    expect(lerEscolha('Escuro')).toBeNull();
  });
});

describe('temaEfetivo()', () => {
  it('sem escolha, segue o sistema', () => {
    expect(temaEfetivo(null, true)).toBe('escuro');
    expect(temaEfetivo(null, false)).toBe('claro');
  });

  it('com escolha, ignora o sistema', () => {
    expect(temaEfetivo('claro', true)).toBe('claro');
    expect(temaEfetivo('escuro', false)).toBe('escuro');
  });
});

describe('temaOposto()', () => {
  it('troca claro por escuro e vice-versa', () => {
    expect(temaOposto('claro')).toBe('escuro');
    expect(temaOposto('escuro')).toBe('claro');
  });
});
