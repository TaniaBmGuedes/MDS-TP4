// Crachá do fim do percurso (T23). Parte do badge do resultado do quiz (H19)
// e leva-o para fora do quiz: aparece no menu do percurso quando a pessoa
// acaba o quiz e pode ser guardado como imagem SVG.
// Não toca no DOM, por isso é testado com o Vitest.
import { PERGUNTAS } from './quiz';
import { badgePara, type Badge, type NivelBadge } from './resumo';

export interface Cracha extends Badge {
  certas: number;
  total: number;
}

/** Quantas respostas batem certo com a resposta certa de cada pergunta. */
export function contarCertas(respostas: readonly (number | null)[]): number {
  return respostas.filter((r, i) => r !== null && r === PERGUNTAS[i]?.certa).length;
}

/**
 * O crachá ganho, ou null se o quiz ainda não acabou: só há crachá no fim do
 * percurso, depois da última pergunta.
 */
export function crachaDoPercurso(perguntaAtual: number, respostas: readonly (number | null)[]): Cracha | null {
  if (perguntaAtual < PERGUNTAS.length) return null;
  const certas = contarCertas(respostas);
  return { ...badgePara(certas, PERGUNTAS.length), certas, total: PERGUNTAS.length };
}

export const NOME_NIVEL: Record<NivelBadge, string> = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze' };

/** Cores do metal e do fundo de cada nível (as mesmas de resumo.css, modo claro). */
const CORES: Record<NivelBadge, { metal: string; fundo: string }> = {
  ouro: { metal: '#8A6D1F', fundo: '#FBF3DC' },
  prata: { metal: '#5B6670', fundo: '#EEF1F3' },
  bronze: { metal: '#8C4F2B', fundo: '#F8ECE4' },
};

function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** O crachá em SVG, para guardar: selo com a pontuação, nível, nome e o FlowLab. */
export function svgCracha(cracha: Cracha): string {
  const { metal, fundo } = CORES[cracha.nivel];
  const nivel = `Crachá ${NOME_NIVEL[cracha.nivel]}`;
  const pontuacao = `${cracha.certas}/${cracha.total}`;
  const descricao = `${nivel}: ${cracha.nome}, ${cracha.certas} de ${cracha.total} certas no quiz do FlowLab`;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480" role="img">',
    `<title>${escapar(descricao)}</title>`,
    `<rect x="8" y="8" width="384" height="464" rx="28" fill="${fundo}" stroke="${metal}" stroke-width="4"/>`,
    `<circle cx="200" cy="170" r="104" fill="none" stroke="${metal}" stroke-width="4"/>`,
    `<circle cx="200" cy="170" r="88" fill="#FFFFFF" stroke="${metal}" stroke-width="8"/>`,
    `<text x="200" y="188" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="52" font-weight="800" fill="${metal}">${pontuacao}</text>`,
    `<text x="200" y="326" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="${metal}">${escapar(nivel.toUpperCase())}</text>`,
    `<text x="200" y="364" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="700" fill="#202522">${escapar(cracha.nome)}</text>`,
    '<text x="200" y="430" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#4A524D">FlowLab · Kanban e métricas de fluxo</text>',
    '</svg>',
  ].join('');
}

/** Nome do ficheiro ao guardar: «cracha-flowlab-ouro.svg». */
export function nomeFicheiroCracha(cracha: Cracha): string {
  return `cracha-flowlab-${cracha.nivel}.svg`;
}
