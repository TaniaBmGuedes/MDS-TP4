// O defineConfig do Vitest estende o do Vite: assim há um único ficheiro de
// configuração, e os testes correm com as mesmas regras que o build.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Os testes (src/model, src/data e src/theme) não usam o DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Por omissão o Vitest troca os .css por texto vazio. O teste de contraste
    // (src/theme/tokens.test.ts) precisa de ler os tokens a sério.
    css: { include: [/theme\/tokens\.css/] },
  },
});
