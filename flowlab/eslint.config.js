import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // A pasta dist é gerada pelo build: não faz sentido analisá-la.
  globalIgnores(['dist']),
  js.configs.recommended,
  tseslint.configs.recommended,
]);
