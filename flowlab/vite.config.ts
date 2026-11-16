// O defineConfig do Vitest estende o do Vite: assim há um único ficheiro de
// configuração, e os testes correm com as mesmas regras que o build.
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  // `npm run dev:https` (SCRUM-72): o chat do BOTSchool.ai só aparece em sites
  // com HTTPS, por isso para o testar localmente o servidor de desenvolvimento
  // corre em https://localhost com um certificado autoassinado. O browser
  // avisa que o certificado não é de confiança; é normal e só acontece em
  // desenvolvimento. O build e o `npm run dev` normal não mudam.
  plugins: mode === 'https' ? [basicSsl()] : [],
  test: {
    // Os testes (src/model, src/data e src/theme) não usam o DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Por omissão o Vitest troca os .css por texto vazio. O teste de contraste
    // (src/theme/tokens.test.ts) precisa de ler os tokens a sério.
    css: { include: [/theme\/tokens\.css/] },
  },
}));
