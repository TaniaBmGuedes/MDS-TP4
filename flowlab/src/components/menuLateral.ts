// Menu do percurso (T2), à esquerda, com os 5 passos. Só abre e fecha com o
// botão de menu (☰) do cabeçalho: fica como a pessoa o deixar, e a escolha
// é guardada no browser. No computador o conteúdo encolhe para lhe dar
// lugar ao lado; no telemóvel o menu abre por cima do título e empurra-o
// para baixo. Nunca tapa o conteúdo.
//
// Por cima dos passos, o progresso: «Passo 2 de 5 · faltam ~8 min» e uma
// barra com os passos concluídos (H01).
//
// Cada passo mostra o ícone e o nome e tem três estados: concluído (diz
// «Concluído»), atual (em destaque, diz «Estás aqui») e por fazer. Um passo
// fica concluído quando a pessoa sai dele para a frente. Os passos são
// botões (Tab, Enter, Espaço) e o atual tem aria-current="step".
//
// Por baixo dos passos, depois de acabar o quiz, o crachá ganho (T23).
import { textoProgresso, type Passo } from '../data/passos';
import { criarCrachaMenu } from './cracha';
import type { EstadoPercurso, Percurso } from '../model/percurso';
import { ICONES, iconePasso } from './icones';

/** Sem escolha guardada, o menu começa aberto a partir desta largura. */
const ECRA_LARGO = '(min-width: 961px)';

export interface MenuPercurso {
  /** O painel em si, para pôr no body. */
  painel: HTMLElement;
  /** Botão de menu (☰), para pôr no cabeçalho do site. */
  botao: HTMLButtonElement;
}

export function criarMenuLateral(passos: readonly Passo[], percurso: Percurso): MenuPercurso {
  const painel = document.createElement('aside');
  painel.className = 'lateral';
  painel.id = 'painel-percurso';
  painel.setAttribute('aria-labelledby', 'titulo-percurso');
  painel.innerHTML = `
    <h2 class="lateral__titulo" id="titulo-percurso">O teu percurso</h2>
    <div class="progresso">
      <p class="progresso__texto"></p>
      <div class="progresso__barra" aria-hidden="true"><span></span></div>
    </div>
    <div class="lateral__painel">
      <nav aria-label="Passos do percurso">
        <ol class="jornada"></ol>
      </nav>
    </div>
  `;

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'botao-menu';
  botao.setAttribute('aria-controls', painel.id);
  botao.setAttribute('aria-label', 'Menu');
  botao.innerHTML = ICONES.menu;

  const lista = obter<HTMLOListElement>(painel, '.jornada');
  const progressoTexto = obter<HTMLElement>(painel, '.progresso__texto');
  const progressoBarra = obter<HTMLElement>(painel, '.progresso__barra span');
  obter<HTMLElement>(painel, '.lateral__painel').append(criarCrachaMenu(percurso));

  // ---------- Abrir e fechar ----------
  // Quem decide é a pessoa, com o ☰: o menu fica aberto ou fechado como o
  // deixou, mesmo ao mudar de passo ou ao recarregar a página. Sem escolha
  // guardada, começa aberto no computador e fechado no telemóvel.
  const largo = window.matchMedia(ECRA_LARGO);

  function definirAberto(aberto: boolean): void {
    document.body.classList.toggle('percurso-aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
  }

  botao.addEventListener('click', () => {
    const aberto = !document.body.classList.contains('percurso-aberto');
    definirAberto(aberto);
    guardarPreferencia(aberto);
  });
  definirAberto(lerPreferencia() ?? largo.matches);

  const itens = passos.map((passo, i) => {
    const item = document.createElement('li');
    item.className = 'etapa';
    item.dataset.passo = passo.id;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'etapa__botao';
    botao.innerHTML = `
      <span class="etapa__icone">${iconePasso(passo.id)}</span>
      <span class="etapa__texto">
        <span class="etapa__nome">${passo.nome}</span>
        <span class="etapa__info"></span>
      </span>
    `;
    botao.addEventListener('click', () => percurso.irPara(i));
    item.append(botao);
    lista.append(item);
    return {
      item,
      botao,
      info: obter<HTMLElement>(botao, '.etapa__info'),
    };
  });

  let concluidosAntes: readonly boolean[] = [];

  function atualizar(estado: EstadoPercurso): void {
    // Progresso (H01): passo atual, tempo que falta e barra com os passos
    // concluídos. A barra é só visual; o texto diz o mesmo.
    progressoTexto.textContent = textoProgresso(estado.passoAtual);
    const feitos = estado.concluidos.filter(Boolean).length;
    const fracao = feitos / passos.length;
    progressoBarra.style.width = `${fracao * 100}%`;
    // O degradê das cores dos passos ocupa a barra inteira, não só a parte
    // preenchida: cada passo concluído mostra a sua cor.
    progressoBarra.style.backgroundSize = fracao > 0 ? `${100 / fracao}% 100%` : '';

    for (const [i, e] of itens.entries()) {
      const atual = i === estado.passoAtual;
      const concluido = estado.concluidos[i];
      e.item.classList.toggle('etapa--atual', atual);
      e.item.classList.toggle('etapa--concluida', concluido && !atual);
      if (atual) e.botao.setAttribute('aria-current', 'step');
      else e.botao.removeAttribute('aria-current');
      e.info.textContent = atual ? 'Estás aqui' : concluido ? 'Concluído' : '';

      // Pequena animação só no passo que acabou de ficar concluído.
      if (concluido && concluidosAntes.length > 0 && !concluidosAntes[i]) {
        e.item.classList.remove('etapa--celebrar');
        void e.item.offsetWidth; // reinicia a animação
        e.item.classList.add('etapa--celebrar');
      }
    }
    concluidosAntes = estado.concluidos;
  }

  atualizar(percurso.estado());
  percurso.subscrever(atualizar);
  return { painel, botao };
}

function obter<T extends Element>(raiz: ParentNode, seletor: string): T {
  const elemento = raiz.querySelector<T>(seletor);
  if (!elemento) throw new Error(`Menu do percurso incompleto: falta ${seletor}`);
  return elemento;
}

// A preferência fica no localStorage do browser. Pode não existir (janela
// privada, armazenamento bloqueado): nesse caso o menu funciona na mesma,
// só não se lembra da escolha.
const CHAVE_PREFERENCIA = 'flowlab.menuAberto';

function lerPreferencia(): boolean | null {
  try {
    const valor = localStorage.getItem(CHAVE_PREFERENCIA);
    return valor === null ? null : valor === 'true';
  } catch {
    return null;
  }
}

function guardarPreferencia(aberto: boolean): void {
  try {
    localStorage.setItem(CHAVE_PREFERENCIA, String(aberto));
  } catch {
    // Sem armazenamento: a escolha vale só até recarregar a página.
  }
}
