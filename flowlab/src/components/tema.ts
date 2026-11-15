// Botão «Modo escuro» no cabeçalho (SCRUM-141, ticket 42). O tema fica no
// atributo data-tema do <html>, que escuro.css, cracha.css e quiz.css usam.
// O index.html já põe o atributo antes de a página aparecer (sem piscar);
// aqui só se liga o botão e se acompanha o sistema enquanto não há escolha.
import './tema.css';
import { CHAVE_TEMA, lerEscolha, temaEfetivo, temaOposto, type Tema } from '../model/tema';
import { ICONES } from './icones';

const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');

// Como no menu (menuLateral.ts): sem localStorage (janela privada,
// armazenamento bloqueado), o botão funciona na mesma, só não se lembra.
function lerGuardado(): Tema | null {
  try {
    return lerEscolha(localStorage.getItem(CHAVE_TEMA));
  } catch {
    return null;
  }
}

function guardar(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    // Sem armazenamento: a escolha vale só até recarregar a página.
  }
}

export function criarBotaoTema(): HTMLButtonElement {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-tema';

  let escolha = lerGuardado();

  function aplicar(): void {
    const tema = temaEfetivo(escolha, sistemaEscuro.matches);
    document.documentElement.dataset.tema = tema;
    const escuro = tema === 'escuro';
    // Botão de alternar: o nome é fixo e aria-pressed diz se está ligado.
    botao.setAttribute('aria-pressed', String(escuro));
    botao.innerHTML = `${escuro ? ICONES.sol : ICONES.lua}<span class="botao-tema__texto">Modo escuro</span>`;
    botao.title = escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro';
  }

  botao.addEventListener('click', () => {
    escolha = temaOposto(temaEfetivo(escolha, sistemaEscuro.matches));
    guardar(escolha);
    aplicar();
  });

  // Enquanto a pessoa não escolher, o site acompanha o sistema.
  sistemaEscuro.addEventListener('change', () => {
    if (escolha === null) aplicar();
  });

  aplicar();
  return botao;
}
