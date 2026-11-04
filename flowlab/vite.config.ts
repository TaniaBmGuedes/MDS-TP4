// O defineConfig do Vitest estende o do Vite: assim há um único ficheiro de
// configuração, e os testes correm com as mesmas regras que o build.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Só os módulos de src/model e src/data têm testes, e não usam o DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
