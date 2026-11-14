# src/components

Peças de interface usadas em mais do que um ecrã.

- `graficoCumulativo.ts`: gráfico de fluxo cumulativo (T05), com legenda, destaque das 3 regras de leitura e tabela com os valores de cada dia.
- `menuLateral.ts` e `icones.ts`: menu do percurso e ícones (T2).
- `fontes.ts`: botão «Fontes» no cabeçalho que abre uma janela com as referências do relatório (`data/fontes.ts`) (T20).
- `cracha.ts`: crachá do fim do percurso no menu e «Guardar o crachá» em SVG (`data/cracha.ts`) (T23).
- `animacoes.ts`: blocos dos passos a aparecer com o scroll, traço do título a crescer e fio de leitura no cabeçalho; nada se esconde com «reduzir movimento».
- `ticketPercurso.ts`: ticket no cabeçalho que atravessa as colunas de um quadro com o scroll, de «Backlog» (introdução) a «Concluído» (último passo).
- `ajusteEcra.ts`: um ecrã por tema; no computador, cada passo tem a altura do ecrã e, se o conteúdo não couber, reduz a escala até caber (ou cresce, se nem assim couber).
- `efeitos.ts`: efeitos «wow» (H31): ecrã de carregamento, botões magnéticos, cartões com inclinação 3D, palavras a subir e palavra a descodificar; nada corre com «reduzir movimento».
