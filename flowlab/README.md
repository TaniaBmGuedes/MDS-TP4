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

O `netlify.toml` define o comando (`npm run build`) e a pasta a publicar (`dist`). Como o projeto está numa subpasta do repositório, o site no Netlify tem de usar `flowlab` como diretório base.
