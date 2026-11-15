// Tema claro ou escuro (SCRUM-141, ticket 42). Só a lógica, sem DOM, para
// poder ser testada no Vitest; o botão está em components/tema.ts.
//
// Sem escolha guardada, o site segue a preferência do sistema. Depois de a
// pessoa carregar no botão, a escolha fica guardada e passa a mandar.

export type Tema = 'claro' | 'escuro';

/** Chave do localStorage onde fica a escolha. O index.html usa a mesma. */
export const CHAVE_TEMA = 'flowlab.tema';

/** Lê o valor guardado. Qualquer outra coisa (ou nada) conta como «sem escolha». */
export function lerEscolha(valor: string | null): Tema | null {
  return valor === 'claro' || valor === 'escuro' ? valor : null;
}

/** O tema a usar: a escolha da pessoa, se houver; senão, o do sistema. */
export function temaEfetivo(escolha: Tema | null, sistemaEscuro: boolean): Tema {
  return escolha ?? (sistemaEscuro ? 'escuro' : 'claro');
}

export function temaOposto(tema: Tema): Tema {
  return tema === 'escuro' ? 'claro' : 'escuro';
}
