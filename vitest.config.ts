import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
export default defineConfig({
  resolve: { alias: [
    { find: 'dsh-global-prompt/client', replacement: resolve('src/client/index.ts') },
    { find: 'dsh-global-prompt', replacement: resolve('src/index.ts') },
  ] },
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'], pool: 'forks',
    execArgv: process.allowedNodeEnvironmentFlags.has('--webstorage') ? ['--no-webstorage'] : [],
    server: { deps: { inline: [/@deepseek-ai\/dsh-client-ui-primitives/] } },
  },
})
