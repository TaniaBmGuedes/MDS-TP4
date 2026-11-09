# Correspondência commits → tickets

Repositório: https://github.com/TaniaBmGuedes/MDS-TP4
Quadro: https://isec-team-mfrdhjnv.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog

Os IDs P01–P06, T01–T29 e C01–C08 vêm da `Sprint 1/Proposta de planeamento/TP4_Proposta_Tickets_Conjunta.docx`.
A coluna **Jira** fica por preencher com a chave `SCRUM-N` de cada ticket.

Daqui para a frente, cada mensagem de commit deve começar pela chave do ticket (ex.: `SCRUM-12 deploy no Netlify`).

## Épico 0 · Fechar o Sprint 0

| Ticket | Jira | Commit | Data | Autor | O que entrou |
|---|---|---|---|---|---|
| P01 Define | | [d282140](https://github.com/TaniaBmGuedes/MDS-TP4/commit/d28214029dcef670070019199acb13904d7ce1fc) | 27/10 | Tânia | Requisitos do cliente (Ricardo) |
| P01/P02 Define e Ideate | | [9d031d3](https://github.com/TaniaBmGuedes/MDS-TP4/commit/9d031d3ccf5af979c2487ba9c6ad0162559814b2) | 27/10 | Tânia | Design Thinking do Sprint 0, sketch do Miguel (PDF) |
| P01/P02 Define e Ideate | | [b31da21](https://github.com/TaniaBmGuedes/MDS-TP4/commit/b31da21be55d41484064c973d72fda0996e280ef) | 27/10 | Tânia | Design Thinking do Sprint 0 (Tânia) |
| P02 Ideate | | [06106f4](https://github.com/TaniaBmGuedes/MDS-TP4/commit/06106f43e439df83e8322fec62159df3ff633269) | 27/10 | Miguel | Sketch FlowLab Kanban, passo 4 |
| P02 Ideate | | [d707b53](https://github.com/TaniaBmGuedes/MDS-TP4/commit/d707b53a3dcd0be6fef7adb2318af4603d8a712a) | 27/10 | Ricardo | Mockup da página (desktop) |
| P02 Ideate | | [38fa6ae](https://github.com/TaniaBmGuedes/MDS-TP4/commit/38fa6aed21aec8ae796139ae31a7f719e0d6ef4b) | 27/10 | Tânia | Protótipo v1 (FlowLab) |
| P02 Ideate | | [0f45399](https://github.com/TaniaBmGuedes/MDS-TP4/commit/0f453992b1eb5da87515b7ba863367c9ee492653) | 27/10 | Tânia | Protótipo v1 organizado em `mockup/v1` |
| P03 Feedback ao v1 | | [19fb406](https://github.com/TaniaBmGuedes/MDS-TP4/commit/19fb4065bc70502cbb8c83e1343e908176291220) | 27/10 | Ricardo | `mockup/v1/feedback_prototipo.txt` |
| P05 Backlog e quadro | | [1cb5653](https://github.com/TaniaBmGuedes/MDS-TP4/commit/1cb5653e8c8ab37b491fa0a1b4cf2a61a23e2b3f) | 27/10 | Tânia | Proposta de tickets (Tânia) |
| P05 Backlog e quadro | | [3a50e80](https://github.com/TaniaBmGuedes/MDS-TP4/commit/3a50e8086fe88ebea5a7e8c14d5bedb5385aa5af) | 29/10 | Tiago | Proposta de tickets (Tiago) |
| P05 Backlog e quadro (+ P01/P02) | | [cb18875](https://github.com/TaniaBmGuedes/MDS-TP4/commit/cb1887517d32c293cbf6b1f8d5438e82657844c2) | 30/10 | Tânia | Fusão das propostas; Design Thinking atualizado |
| P05 Backlog e quadro | | [56624ad](https://github.com/TaniaBmGuedes/MDS-TP4/commit/56624adbf6d976cd034960587a64a2f0a9094591) | 30/10 | Yan | Proposta de tickets (Yan) |
| P05 Backlog e quadro | | [f50dbf8](https://github.com/TaniaBmGuedes/MDS-TP4/commit/f50dbf83f02301b1be65d4b9046580cb2196e21b) | 01/11 | Miguel | Proposta de tickets (Miguel) |
| P05 Backlog e quadro | | [489a17f](https://github.com/TaniaBmGuedes/MDS-TP4/commit/489a17f7ef550776de7eb7fac55f94776c040731) | 01/11 | Ricardo | Proposta de tickets (Ricardo) |
| P05 Backlog e quadro | | [bad306a](https://github.com/TaniaBmGuedes/MDS-TP4/commit/bad306ac83afc809632f83048a5d8ff36fa7b02e) | 02/11 | Tânia | Proposta conjunta final |
| P05 Backlog e quadro | | [149697f](https://github.com/TaniaBmGuedes/MDS-TP4/commit/149697f8b4a3a07e320025fd0dd9b2020a4bb95c) | 03/11 | Tiago | Screenshots da criação dos tickets e da board no Jira |

## Sprint 1

| Ticket | Jira | Commit | Data | Autor | O que entrou |
|---|---|---|---|---|---|
| T01 Deploy no Netlify | SCRUM-16 | [f0e88f3](https://github.com/TaniaBmGuedes/MDS-TP4/commit/f0e88f3a07519b997cb9134237dea736868b7c9a) | 09/11 | Tânia | `netlify.toml` na raiz com base `flowlab`; build com `tsc --noEmit` + `vite build` |
| T01 Deploy no Netlify | SCRUM-16 | [77e7152](https://github.com/TaniaBmGuedes/MDS-TP4/commit/77e7152a98f8a7980227cde6b55934de24e3c911) | 09/11 | Tânia | URL público (https://delicate-quokka-e180ac.netlify.app) e badge no README |
| T01 Deploy no Netlify | SCRUM-16 | [c38e08b](https://github.com/TaniaBmGuedes/MDS-TP4/commit/c38e08bb71416d2cdec4df8f70dfa8d066b1b092) | 09/11 | Tânia | Merge do PR #3 para `main`, primeiro deploy automático |
| T05 Ecrã 1 · Simulador e gráfico cumulativo | SCRUM-23 | [c71082e](https://github.com/TaniaBmGuedes/MDS-TP4/commit/c71082e0732c5a1021328544099b0b17c16e0519) | 09/11 | Miguel | Slider do WIP e cenários; gráfico de fluxo cumulativo (`components/graficoCumulativo.ts`) com legenda, 3 regras de leitura com destaque, texto alternativo e tabela por dia; contas em `model/cfd.ts`, com testes |
| T05 Ecrã 1 · Simulador e gráfico cumulativo | SCRUM-23 | [a767d22](https://github.com/TaniaBmGuedes/MDS-TP4/commit/a767d2283dfb8df40a1cf81d46834aaa4dd22395) | 09/11 | Tânia | Merge do PR #11 para `main` |

## Sprint 2

| Ticket | Jira | Commit | Data | Autor | O que entrou |
|---|---|---|---|---|---|
| T17 Ecrã 7 · Quiz final | SCRUM-7 | [112dc76](https://github.com/TaniaBmGuedes/MDS-TP4/commit/112dc764a5d4cd64489ce56424696316912dd909) | 09/11 | Miguel | 5 perguntas tipadas em `data/quiz.ts`; contador e explicação; «Ver no simulador» abre o simulador com o WIP e a regra da pergunta; ecrã final com pontuação e escolha do dilema; pergunta atual guardada no store do percurso |

## Registos contínuos (C01–C08)

| Ticket | Jira | Commit | Data | Autor | O que entrou |
|---|---|---|---|---|---|
| C | | [9d6260f](https://github.com/TaniaBmGuedes/MDS-TP4/commit/9d6260f84dc2a852eea307b02481a45d63538a9c) | 27/10 | Tânia | Screenshots (Tania.docx) |
| C | | [fee5684](https://github.com/TaniaBmGuedes/MDS-TP4/commit/fee568408f188776c078868c646c94f2cc39e6ad) | 03/11 | Ricardo | Registo de utilização de IA (Kanban) |

## Sem ticket (preparação do repositório)

| Commit | Data | Autor | O que entrou |
|---|---|---|---|
| [62fe46b](https://github.com/TaniaBmGuedes/MDS-TP4/commit/62fe46b2355d785d4fb8dfaf3a429904b43ba18b) | 27/10 | Tânia | Enunciado (`assignment4.pdf`) |
| [06ae161](https://github.com/TaniaBmGuedes/MDS-TP4/commit/06ae161add8da3aae05b8350b13b392ea3e9c96e) | 27/10 | Tânia | Enunciado movido para `theme/` |
| [7537f4b](https://github.com/TaniaBmGuedes/MDS-TP4/commit/7537f4b92c728ac95f8d177f046bbeb187f670b3) | 27/10 | Tânia | Pasta `Registos` |

## Por associar

Os restantes tickets do Sprint 1 (T02–T29) ainda não estão associados aqui.
