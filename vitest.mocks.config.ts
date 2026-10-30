import { defineConfig } from 'vitest/config';

// Tests "contrat ↔ mocks" exécutés en Node pur (msw/node), sans Angular.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/selfcare-web/src/mocks/**/*.test.ts'],
  },
});
