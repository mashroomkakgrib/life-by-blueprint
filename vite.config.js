import { defineConfig } from 'vite';

// GitHub Actions supplies owner/repository; local builds remain portable.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.PAGES_BASE_PATH || (
  repository ? (repository.endsWith('.github.io') ? '/' : `/${repository}/`) : './'
);

export default defineConfig({ base });
