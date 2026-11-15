// Afasta rótulos empilhados na vertical para não se sobreporem (rótulos no
// fim das bandas do gráfico cumulativo). Função pura: recebe as posições
// ideais, de cima para baixo, e devolve posições com pelo menos `espaco`
// píxeis entre si, dentro de [min, max], mexendo o mínimo possível.

export function afastarRotulos(ideais: readonly number[], espaco: number, min: number, max: number): number[] {
  const y = ideais.map((v) => Math.min(max, Math.max(min, v)));
  // Para baixo: cada rótulo fica pelo menos `espaco` abaixo do anterior.
  for (let i = 1; i < y.length; i++) y[i] = Math.max(y[i], y[i - 1] + espaco);
  // Se o último passou do fundo, empurra tudo para cima.
  if (y.length > 0 && y[y.length - 1] > max) {
    y[y.length - 1] = max;
    for (let i = y.length - 2; i >= 0; i--) y[i] = Math.min(y[i], y[i + 1] - espaco);
  }
  return y;
}
