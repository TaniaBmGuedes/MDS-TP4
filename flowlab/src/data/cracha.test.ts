import { describe, expect, it } from 'vitest';
import { contarCertas, crachaDoPercurso, nomeFicheiroCracha, svgCracha } from './cracha';
import { PERGUNTAS } from './quiz';

const certas = PERGUNTAS.map((p) => p.certa);
const erradas = PERGUNTAS.map((p) => (p.certa + 1) % 3);
const fim = PERGUNTAS.length;

describe('contarCertas', () => {
  it('conta só as respostas certas, ignorando as por responder', () => {
    expect(contarCertas(certas)).toBe(PERGUNTAS.length);
    expect(contarCertas(erradas)).toBe(0);
    expect(contarCertas(certas.map((r, i) => (i === 0 ? null : r)))).toBe(PERGUNTAS.length - 1);
  });
});

describe('crachaDoPercurso', () => {
  it('não há crachá antes de acabar o quiz', () => {
    expect(crachaDoPercurso(0, PERGUNTAS.map(() => null))).toBeNull();
    expect(crachaDoPercurso(fim - 1, certas)).toBeNull();
  });

  it('no fim, o crachá leva o nível e a pontuação do quiz', () => {
    expect(crachaDoPercurso(fim, certas)).toMatchObject({ nivel: 'ouro', certas: fim, total: fim });
    expect(crachaDoPercurso(fim, erradas)).toMatchObject({ nivel: 'bronze', certas: 0, total: fim });
  });
});

describe('svgCracha', () => {
  it('tem a pontuação, o nível, o nome e um título para leitores de ecrã', () => {
    const cracha = crachaDoPercurso(fim, certas);
    if (!cracha) throw new Error('sem crachá');
    const svg = svgCracha(cracha);
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain(`>${fim}/${fim}<`);
    expect(svg).toContain('CRACHÁ OURO');
    expect(svg).toContain(cracha.nome);
    expect(svg).toMatch(/<title>[^<]+<\/title>/);
    expect(nomeFicheiroCracha(cracha)).toBe('cracha-flowlab-ouro.svg');
  });

  it('escapa o texto', () => {
    const svg = svgCracha({ nivel: 'prata', nome: 'A & <B>', descricao: '', certas: 3, total: 5 });
    expect(svg).toContain('A &amp; &lt;B&gt;');
    expect(svg).not.toContain('<B>');
  });
});
