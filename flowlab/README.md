# FlowLab

Página interativa sobre Kanban e métricas de fluxo (MDS 2026/2027, TP4, tema 2), em TypeScript.

## Requisitos

Node.js 26 (a versão está em `.nvmrc`).

## Comandos

Instalar as dependências uma vez:

```
npm install
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Abre o site em modo de desenvolvimento, em http://localhost:5173 |
| `npm run build` | Verifica os tipos (`tsc --noEmit`) e gera o site em `dist/` |
| `npm run preview` | Serve localmente o resultado do build |
| `npm run lint` | Analisa o código com o ESLint |
| `npm test` | Corre os testes com o Vitest |
| `npm run typecheck` | Só verifica os tipos |

## Estrutura

- `src/main.ts`: ponto de entrada
- `src/style.css`: estilos, vindos do protótipo v1
- `src/steps/`: um ficheiro por ecrã do percurso
- `src/components/`: peças de interface reutilizadas
- `src/model/`: lógica sem interface, como o motor do simulador (com testes)
- `src/data/`: conteúdo e valores, como os cenários e as perguntas do quiz

## Publicar no Netlify

Site público: **(URL por preencher depois de ligar o site no Netlify)**

O deploy é automático: cada push para `main` faz o Netlify correr `npm run build` (verificação de tipos com `tsc --noEmit` e depois `vite build`) e publicar a pasta `dist`. Se houver erros de tipos, o build falha e o site fica na versão anterior.

A configuração está no `netlify.toml` da raiz do repositório, com `flowlab` como diretório base, por isso não é preciso mudar nada nas definições do site no Netlify. A versão do Node vem do `.nvmrc`.
