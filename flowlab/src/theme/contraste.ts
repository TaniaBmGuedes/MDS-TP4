// Cálculo do contraste entre duas cores, segundo a WCAG 2.x.
// Serve para testar automaticamente que os tokens de cor cumprem o nível AA,
// em vez de confiar numa verificação feita à mão uma única vez.

/** Converte "#RRGGBB" nos três canais entre 0 e 1. */
function canais(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(limpo)) {
    throw new Error(`Cor inválida: ${hex} (esperado #RRGGBB)`);
  }
  const canal = (i: number) => parseInt(limpo.slice(i, i + 2), 16) / 255;
  return [canal(0), canal(2), canal(4)];
}

/**
 * Luminância relativa (0 = preto, 1 = branco).
 * Os canais passam primeiro de sRGB para valores lineares, porque o olho não
 * percebe o brilho de forma linear; depois pesam-se (o verde conta mais).
 */
export function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre 1:1 (iguais) e 21:1 (preto sobre branco). */
export function contraste(corA: string, corB: string): number {
  const a = luminancia(corA);
  const b = luminancia(corB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Lê os tokens "--nome: #RRGGBB;" de um ficheiro CSS para um mapa. */
export function lerTokensDeCor(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const [, nome, valor] of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens.set(nome, valor);
  }
  return tokens;
}
