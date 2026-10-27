// FlowLab · mockup do Sprint 0 (MDS TP4, tema 2)

const $ = (id) => document.getElementById(id);
const num = (x) => x.toFixed(1).replace('.', ',');

// ---------- Passo 1: dilema ----------
let escolhaDilema = null;
const textosDilema = {
  gente: 'Trazer mais gente',
  mais: 'Começar mais trabalho',
  menos: 'Fazer menos de cada vez'
};

document.querySelectorAll('#opcoes-dilema .opcao').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('#opcoes-dilema .opcao').forEach((b) => b.classList.remove('escolhida'));
    botao.classList.add('escolhida');
    escolhaDilema = botao.dataset.escolha;
    const r = $('resposta-dilema');
    r.textContent = `Escolheste «${textosDilema[escolhaDilema]}». Guardámos a resposta: no simulador (passo 4) vês o que acontece.`;
    r.classList.remove('escondido');
    mostrarVoltaDilema();
  });
});

// ---------- Passo 2: quadro Kanban ----------
const LIMITE = 3;
const inicial = () => ({
  afazer: ['Corrigir o login', 'Rever o relatório', 'Atualizar a página de ajuda', 'Testar o formulário'],
  curso: ['Preparar a demo', 'Escrever os testes'],
  feito: ['Configurar o Netlify']
});
let quadro = inicial();

function desenharQuadro() {
  const col = (id, lista, classe, acao) => {
    const el = $(id);
    el.innerHTML = '';
    lista.forEach((texto, i) => {
      const b = document.createElement('button');
      b.className = 'tarefa ' + classe;
      b.textContent = texto;
      if (acao) b.addEventListener('click', () => acao(i));
      else b.disabled = true;
      el.appendChild(b);
    });
  };
  col('col-afazer', quadro.afazer, '', comecar);
  col('col-curso', quadro.curso, 'tarefa--curso', acabar);
  col('col-feito', quadro.feito, 'tarefa--feita', null);
  $('n-afazer').textContent = quadro.afazer.length;
  $('n-curso').textContent = `${quadro.curso.length} / ${LIMITE}`;
  $('n-feito').textContent = quadro.feito.length;
  $('coluna-curso').classList.toggle('coluna--cheia', quadro.curso.length >= LIMITE);
}

function comecar(i) {
  if (quadro.curso.length >= LIMITE) {
    $('aviso-wip').classList.remove('escondido');
    return;
  }
  quadro.curso.push(quadro.afazer.splice(i, 1)[0]);
  $('aviso-wip').classList.add('escondido');
  desenharQuadro();
}

function acabar(i) {
  quadro.feito.push(quadro.curso.splice(i, 1)[0]);
  $('aviso-wip').classList.add('escondido');
  desenharQuadro();
}

$('recomecar').addEventListener('click', () => {
  quadro = inicial();
  $('aviso-wip').classList.add('escondido');
  desenharQuadro();
});

// ---------- Passos 3 e 4: simulação ----------
// Equipa de 4 pessoas; cada uma acaba 0,5 tarefas por dia.
// Com mais tarefas a meio do que pessoas, a troca de tarefa reduz o throughput.
const PESSOAS = 4, CHEGADAS = 2, DIAS = 15, FILA_INICIAL = 6;

function simular(wip) {
  const th = wip <= PESSOAS ? 0.5 * wip : 0.5 * PESSOAS * Math.pow(PESSOAS / wip, 0.6);
  let fila = FILA_INICIAL, meio = 0, feitas = 0, somaFila = 0, somaMeio = 0;
  const entradas = [FILA_INICIAL], comecadas = [0], acabadas = [0];
  for (let d = 1; d <= DIAS; d++) {
    fila += CHEGADAS;
    let puxar = Math.min(fila, wip - meio); fila -= puxar; meio += puxar;
    const fim = Math.min(meio, th); meio -= fim; feitas += fim;
    puxar = Math.min(fila, wip - meio); fila -= puxar; meio += puxar;
    somaFila += fila; somaMeio += meio;
    entradas.push(feitas + meio + fila); comecadas.push(feitas + meio); acabadas.push(feitas);
  }
  const mediaFila = somaFila / DIAS, mediaMeio = somaMeio / DIAS;
  return {
    th, fila, meio, feitas, entradas, comecadas, acabadas,
    lead: (mediaFila + mediaMeio) / th,   // Lei de Little no sistema todo
    cycle: mediaMeio / th                 // Lei de Little só no «Em curso»
  };
}

function desenharCFD(r) {
  const max = Math.ceil(Math.max(...r.entradas) / 5) * 5;
  const X = (i) => 48 + i * (572 / DIAS);
  const Y = (v) => 250 - (v / max) * 230;
  const faixa = (cima, baixo) => {
    let d = `M${X(0)} ${Y(cima[0]).toFixed(1)}`;
    for (let i = 1; i < cima.length; i++) d += ` L${X(i).toFixed(1)} ${Y(cima[i]).toFixed(1)}`;
    for (let i = baixo.length - 1; i >= 0; i--) d += ` L${X(i).toFixed(1)} ${Y(baixo[i]).toFixed(1)}`;
    return d + ' Z';
  };
  const zeros = r.entradas.map(() => 0);
  const eixoX = [0, 5, 10, 15].map((d) =>
    `<text x="${X(d)}" y="272" font-size="12" fill="#475569" text-anchor="middle">${d === 15 ? '15 dias' : d}</text>`).join('');
  $('cfd').innerHTML = `
    <line x1="48" y1="250" x2="620" y2="250" stroke="#94A3B8"/>
    <line x1="48" y1="20" x2="48" y2="250" stroke="#94A3B8"/>
    <path d="${faixa(r.entradas, r.comecadas)}" fill="#CBD5E1"/>
    <path d="${faixa(r.comecadas, r.acabadas)}" fill="#F5A25D"/>
    <path d="${faixa(r.acabadas, zeros)}" fill="#2453D6"/>
    ${eixoX}
    <text x="40" y="24" font-size="12" fill="#475569" text-anchor="end">${max}</text>
    <text x="40" y="254" font-size="12" fill="#475569" text-anchor="end">0</text>
    <text x="56" y="34" font-size="12" fill="#475569">tarefas</text>`;
}

const referencia = simular(PESSOAS);
let wipAtual = 4;

function atualizarSimulacao(wip) {
  wipAtual = wip;
  const r = simular(wip);
  $('wip-slider').value = wip;
  $('wip-valor').textContent = wip;

  // Passo 3: métricas
  $('m-wip').textContent = wip;
  $('m-th').textContent = num(r.th);
  $('m-cycle').textContent = num(r.cycle);
  $('m-lead').textContent = num(r.lead);

  // Passo 4: mini quadro e gráfico
  $('s-espera').textContent = Math.round(r.fila);
  $('s-meio').textContent = Math.round(r.meio);
  $('s-feitas').textContent = Math.round(r.feitas);
  $('g-lead').textContent = `${num(r.lead)} dias`;
  const dif = r.lead - referencia.lead;
  $('g-delta').textContent = wip === PESSOAS
    ? 'o melhor valor para esta equipa'
    : `${dif >= 0 ? '+' : '−'}${num(Math.abs(dif))} dias do que com limite 4`;

  const msg = $('sim-msg');
  msg.className = 'aviso';
  if (wip < PESSOAS) {
    msg.classList.add('aviso--laranja');
    $('sim-msg-titulo').textContent = 'Há pessoas paradas.';
    $('sim-msg-texto').textContent = 'Com menos tarefas do que pessoas, alguém fica sem trabalho: o throughput desce e a fila de espera cresce.';
  } else if (wip === PESSOAS) {
    msg.classList.add('aviso--azul');
    $('sim-msg-titulo').textContent = 'Equilíbrio.';
    $('sim-msg-texto').textContent = 'Cada pessoa acaba uma tarefa antes de pegar noutra. As tarefas acabam depressa e o lead time é baixo.';
  } else {
    msg.classList.add('aviso--vermelho');
    $('sim-msg-titulo').textContent = 'Tarefas a mais ao mesmo tempo.';
    $('sim-msg-texto').textContent = 'Cada pessoa salta entre várias tarefas. Ninguém acaba nada depressa e tudo fica a meio.';
  }

  document.querySelectorAll('.pilula').forEach((p) =>
    p.classList.toggle('ativa', Number(p.dataset.wip) === wip));
  desenharCFD(r);
}

function mostrarVoltaDilema() {
  if (!escolhaDilema) return;
  const el = $('volta-dilema');
  const respostas = {
    menos: 'No passo 1 escolheste «Fazer menos de cada vez». Acertaste: limitar o trabalho em curso baixa o lead time.',
    mais: 'No passo 1 escolheste «Começar mais trabalho». Experimenta o cenário de 12 tarefas: o lead time dispara.',
    gente: 'No passo 1 escolheste «Trazer mais gente». Ajuda, mas se o trabalho em curso crescer com as pessoas, o ganho desaparece. Primeiro limita o WIP.'
  };
  el.textContent = respostas[escolhaDilema];
  el.classList.remove('escondido');
}

$('wip-slider').addEventListener('input', (e) => atualizarSimulacao(Number(e.target.value)));
document.querySelectorAll('.pilula').forEach((p) =>
  p.addEventListener('click', () => atualizarSimulacao(Number(p.dataset.wip))));

// ---------- Passo 5: diagnosticar o gráfico ----------
document.querySelectorAll('#diagnostico .opcao').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('#diagnostico .opcao').forEach((b) => b.classList.remove('certa', 'errada'));
    const certo = botao.dataset.certo === 'sim';
    botao.classList.add(certo ? 'certa' : 'errada');
    const r = $('diag-resposta');
    r.className = 'aviso ' + (certo ? 'aviso--verde' : 'aviso--vermelho');
    r.textContent = botao.dataset.explica;
  });
});

// ---------- Passo 6: quiz ----------
const perguntas = [
  {
    p: 'A equipa tem 4 pessoas e decide começar o dobro das tarefas ao mesmo tempo. O que acontece ao lead time?',
    o: ['Desce, porque há mais trabalho a avançar', 'Sobe, porque o WIP sobe e o throughput não acompanha', 'Fica igual, só muda o throughput'],
    c: 1,
    e: 'Pela Lei de Little, mais trabalho em curso com o mesmo throughput dá mais tempo por tarefa.'
  },
  {
    p: 'Qual é a diferença entre lead time e cycle time?',
    o: ['São a mesma coisa', 'O lead time conta desde o pedido; o cycle time só desde que se começa', 'O cycle time conta desde o pedido; o lead time só desde que se começa'],
    c: 1,
    e: 'O lead time inclui a espera em «A fazer». O cycle time conta só o tempo em curso.'
  },
  {
    p: 'No gráfico cumulativo, a faixa «Em curso» está a ficar cada vez mais larga. O que quer dizer?',
    o: ['Começa-se mais trabalho do que se acaba', 'A equipa está a entregar mais depressa', 'Não entram tarefas novas'],
    c: 0,
    e: 'Uma faixa a alargar mostra que as tarefas entram nesse estado mais depressa do que saem.'
  },
  {
    p: 'O que mede o throughput?',
    o: ['Quanto tempo demora uma tarefa', 'Quantas tarefas estão a meio', 'Quantas tarefas a equipa acaba por unidade de tempo'],
    c: 2,
    e: 'É a velocidade de entrega: tarefas feitas por dia ou por semana.'
  }
];
let q = 0, certas = 0, respondida = false;

function mostrarPergunta() {
  const atual = perguntas[q];
  respondida = false;
  $('quiz-contador').textContent = `Pergunta ${q + 1} de ${perguntas.length} · ${certas} certas`;
  $('quiz-barra').style.width = `${(q / perguntas.length) * 100}%`;
  $('quiz-pergunta').textContent = atual.p;
  $('quiz-feedback').classList.add('escondido');
  $('quiz-seguinte').classList.add('escondido');
  const lista = $('quiz-opcoes');
  lista.innerHTML = '';
  atual.o.forEach((texto, i) => {
    const b = document.createElement('button');
    b.className = 'opcao';
    b.textContent = texto;
    b.addEventListener('click', () => responder(i, b));
    lista.appendChild(b);
  });
}

function responder(i, botao) {
  if (respondida) return;
  respondida = true;
  const atual = perguntas[q];
  const certo = i === atual.c;
  if (certo) certas++;
  botao.classList.add(certo ? 'certa' : 'errada');
  if (!certo) $('quiz-opcoes').children[atual.c].classList.add('certa');
  const f = $('quiz-feedback');
  f.className = 'aviso ' + (certo ? 'aviso--verde' : 'aviso--vermelho');
  f.textContent = (certo ? 'Certo. ' : 'Não é bem assim. ') + atual.e;
  $('quiz-seguinte').textContent = q === perguntas.length - 1 ? 'Ver o resultado' : 'Próxima pergunta';
  $('quiz-seguinte').classList.remove('escondido');
  $('quiz-contador').textContent = `Pergunta ${q + 1} de ${perguntas.length} · ${certas} certas`;
}

$('quiz-seguinte').addEventListener('click', () => {
  q++;
  if (q < perguntas.length) return mostrarPergunta();
  $('quiz-barra').style.width = '100%';
  $('quiz-corpo').classList.add('escondido');
  $('quiz-fim').classList.remove('escondido');
  $('quiz-resultado').textContent = `${certas} de ${perguntas.length}. ${certas >= 3 ? 'Já sabes o que é Kanban.' : 'Vale a pena rever as métricas.'}`;
  $('quiz-resumo').textContent = escolhaDilema
    ? `No início escolheste «${textosDilema[escolhaDilema]}». Agora sabes porque é que limitar o trabalho em curso resulta melhor.`
    : 'Agora sabes porque é que limitar o trabalho em curso resulta melhor.';
});

$('quiz-repetir').addEventListener('click', () => {
  q = 0; certas = 0;
  $('quiz-fim').classList.add('escondido');
  $('quiz-corpo').classList.remove('escondido');
  mostrarPergunta();
});

// ---------- Chat (simulado; no site final é o BOTSchool.ai) ----------
const respostasChat = [
  { k: ['wip', 'curso', 'simult'], r: 'WIP é o trabalho em curso: as tarefas começadas e ainda não acabadas. Limitá-lo faz as tarefas acabarem mais depressa.' },
  { k: ['lead', 'cycle'], r: 'O lead time conta desde o pedido até estar feito, incluindo a espera. O cycle time só conta desde que alguém começa a tarefa.' },
  { k: ['gráfico', 'grafico', 'cfd', 'cumulativo'], r: 'No gráfico cumulativo, cada faixa é um estado. Se a faixa do meio engorda, o trabalho acumula-se. A inclinação de «Feitas» é o throughput.' },
  { k: ['throughput', 'velocidade'], r: 'Throughput é quantas tarefas a equipa acaba por dia ou por semana.' },
  { k: ['little'], r: 'A Lei de Little diz que o tempo médio é o trabalho em curso a dividir pelo throughput.' }
];

function abrirChat(abrir) {
  $('chat').classList.toggle('escondido', !abrir);
  $('chat-abrir').setAttribute('aria-expanded', String(abrir));
  if (abrir) $('chat-input').focus();
}

function enviar(texto) {
  if (!texto.trim()) return;
  const caixa = $('chat-mensagens');
  const eu = document.createElement('p');
  eu.className = 'msg msg--eu';
  eu.textContent = texto;
  caixa.appendChild(eu);
  const t = texto.toLowerCase();
  const achada = respostasChat.find((x) => x.k.some((k) => t.includes(k)));
  const bot = document.createElement('p');
  bot.className = 'msg msg--bot';
  bot.textContent = achada ? achada.r : 'Boa pergunta! No site final, o bot do BOTSchool.ai responde com base nas fontes do projeto.';
  setTimeout(() => { caixa.appendChild(bot); caixa.scrollTop = caixa.scrollHeight; }, 400);
  caixa.scrollTop = caixa.scrollHeight;
}

$('chat-abrir').addEventListener('click', () => abrirChat($('chat').classList.contains('escondido')));
$('chat-fechar').addEventListener('click', () => abrirChat(false));
$('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  enviar($('chat-input').value);
  $('chat-input').value = '';
});
document.querySelectorAll('#chat-sugestoes button').forEach((b) =>
  b.addEventListener('click', () => enviar(b.textContent)));

// ---------- Navegação: marcar o passo visível ----------
const links = document.querySelectorAll('.passos a');
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (en.isIntersecting) {
      links.forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + en.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => observador.observe(s));

// ---------- Arranque ----------
desenharQuadro();
atualizarSimulacao(wipAtual);
mostrarPergunta();
