# FlowLab

Página interativa sobre Kanban e métricas de fluxo (MDS 2026/2027, TP4, tema 2).

## Correr no computador

```
npm install
npm run dev
```

Abre em http://localhost:5173.

## Estrutura

- `index.html`: a página (6 passos e o chat)
- `src/style.css`: estilos
- `src/main.js`: quadro Kanban, simulador, gráfico cumulativo, quiz e chat simulado

## Publicar no Netlify

`netlify.toml` já tem o comando de build (`npm run build`) e a pasta a publicar (`dist`).
