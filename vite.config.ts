/// <reference types="vitest/config" />
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const LOCAL_RESUME = 'resume.local.json';

/**
 * Личное резюме лежит в `public/`, чтобы дев-сервер отдавал его без лишней
 * возни, — но `vite build` копирует `public/` целиком, и файл уехал бы в
 * `dist/`, а оттуда на любой хостинг. Выкидываем его из готовой сборки:
 * телефон и фото не должны попасть в открытый доступ вместе с деплоем.
 */
const excludeLocalResume = (): Plugin => ({
  name: 'exclude-local-resume',
  apply: 'build',
  closeBundle() {
    rmSync(fileURLToPath(new URL(`dist/${LOCAL_RESUME}`, import.meta.url)), {
      force: true,
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), excludeLocalResume()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
