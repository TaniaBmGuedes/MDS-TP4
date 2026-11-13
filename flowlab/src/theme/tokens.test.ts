import { describe, expect, it } from 'vitest';
// "?raw" é do Vite: importa o ficheiro como texto, por isso o teste lê o
// tokens.css verdadeiro e falha se alguém mudar uma cor para uma que não passa.
import css from './tokens.css?raw';
import { contraste, lerTokensDeCor } from './contraste';

const tokens = lerTokensDeCor(css);
const cor = (nome: string): string => {
  const valor = tokens.get(nome);
  if (!valor) throw new Error(`Token em falta: --${nome}`);
  return valor;
};

describe('contraste()', () => {
  it('dá 21:1 para preto sobre branco e 1:1 para cores iguais', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contraste('#2557D6', '#2557D6')).toBeCloseTo(1, 5);
  });
});

// Pares [texto, fundo] que o site usa. WCAG 1.4.3 (AA): texto normal >= 4,5:1.
const TEXTO: [string, string][] = [
  ['cor-texto', 'cor-fundo'],
  ['cor-texto', 'cor-superficie'],
  ['cor-texto-medio', 'cor-superficie'],
  ['cor-texto-suave', 'cor-fundo'],
  ['cor-texto-suave', 'cor-superficie'],
  ['cor-texto-suave', 'cor-superficie-suave'],
  ['cor-primaria', 'cor-superficie'],
  ['cor-primaria', 'cor-fundo'],
  ['cor-texto-invertido', 'cor-primaria'],
  ['cor-texto-invertido', 'cor-escura'],
  ['cor-texto-invertido-suave', 'cor-escura'],
  ['cor-primaria-escura', 'cor-primaria-clara'],
  ['cor-throughput-texto', 'cor-throughput-clara'],
  // Cor de cada passo: texto sobre branco, sobre o fundo claro do passo e
  // branco sobre a cor do passo (botão «Seguinte»).
  ...['simular', 'info', 'metricas', 'equipa', 'quiz', 'grafico'].flatMap((p): [string, string][] => [
    [`cor-passo-${p}`, 'cor-superficie'],
    [`cor-passo-${p}`, `cor-passo-${p}-clara`],
    ['cor-texto-invertido', `cor-passo-${p}`],
  ]),
];

describe('tokens de cor: texto (AA, 4,5:1)', () => {
  it.each(TEXTO)('--%s sobre --%s', (texto, fundo) => {
    expect(contraste(cor(texto), cor(fundo))).toBeGreaterThanOrEqual(4.5);
  });
});

// WCAG 1.4.11: bordas de componentes de interface >= 3:1.
describe('tokens de cor: componentes (3:1)', () => {
  it.each([['cor-superficie'], ['cor-fundo']])('--cor-borda-controlo sobre --%s', (fundo) => {
    expect(contraste(cor('cor-borda-controlo'), cor(fundo))).toBeGreaterThanOrEqual(3);
  });
});
