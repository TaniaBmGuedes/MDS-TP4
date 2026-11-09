# Auditoria de acessibilidade e responsividade (H17, SCRUM-73)

Data: 09/11/2026 · Feita por: Tânia Guedes (com Claude Code) · Versão auditada: `main` em `29efd0e`, mais as correções deste ramo.

## Como se fez

- **Ferramenta:** axe-core 4.10 (o motor de acessibilidade que o Lighthouse usa), corrido no Chrome em cada ecrã com conteúdo: Simular, Métricas e Quiz. Regras WCAG 2.0 A e AA, WCAG 2.1 AA e boas práticas.
- **Teclado:** foco visível em todos os elementos (`:focus-visible` global em `shell.css`); menu com `aria-expanded` e `aria-controls`; o número do WIP nas Métricas abre com Enter ou Espaço, além do duplo clique; ao mudar de passo, o foco vai para o título.
- **Contraste:** medido à mão para as variáveis de cor do modo escuro (PR #5): mínimo 5,5:1. No modo claro, o axe não encontrou falhas.
- **Ecrã pequeno e grande:** 360 px (num iframe) e 1512 px. Sem scroll horizontal da página em nenhum ecrã; o menu fecha no telemóvel e não tapa o conteúdo.

## Resultados

| Ecrã | Antes | Depois |
|---|---|---|
| Simular | 0 falhas | 0 falhas |
| Métricas | 1 falha menor: `aria-allowed-role` (`role="group"` num `article`) | 0 falhas |
| Quiz | 0 falhas | 0 falhas |

Correções em `flowlab/src/steps/metricas.ts`:

1. O diapositivo de cada cenário passou de `article` para `div`, que aceita `role="group"`.
2. A etiqueta do número do WIP para leitores de ecrã passou a dizer também «carrega em Enter», e não só «clica duas vezes».

## Sem problemas críticos

Nenhuma falha crítica ou grave. A interface ainda tem poucos ecrãs com conteúdo (Ler o gráfico, O que fazes? e o Quiz estão por fazer), por isso **esta auditoria tem de ser repetida no fim do Sprint 2**, com os ecrãs todos e num telemóvel real (critério do T19).

## O que não se testou

- Leitor de ecrã real (VoiceOver).
- Telemóvel real.
- Pontuação do Lighthouse em si (o axe é o mesmo motor, mas não dá a nota de 0 a 100).
