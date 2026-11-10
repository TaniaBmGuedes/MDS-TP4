// Ícones em SVG (traço, herdam a cor do texto). São decorativos: o texto ao
// lado já diz o que é, por isso levam aria-hidden.
import type { IdPasso } from '../data/passos';

function svg(conteudo: string, tamanho = 20): string {
  return `<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${conteudo}</svg>`;
}

const DESENHOS: Record<IdPasso, string> = {
  // Controlos deslizantes
  simular: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  // Gráfico de áreas
  grafico: '<path d="M3 3v18h18"/><path d="M7 16l4-5 3 3 5-7"/>',
  // Lâmpada
  info: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>',
  // Mostrador
  metricas: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1"/>',
  // Duas pessoas
  equipa: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a4 4 0 0 1 4 4v1"/>',
  // Prancheta com visto
  quiz: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 13l2 2 4-4"/>',
};

export function iconePasso(id: IdPasso, tamanho?: number): string {
  return svg(DESENHOS[id], tamanho);
}

export const ICONES = {
  seta: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
  setaAtras: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', 18),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 22),
  pausa: svg('<path d="M9 5v14M15 5v14"/>', 18),
  continuar: svg('<path d="M7 5l12 7-12 7z"/>', 18),
  anterior: svg('<path d="M15 6l-6 6 6 6"/>', 18),
  seguinte: svg('<path d="M9 6l6 6-6 6"/>', 18),
};
