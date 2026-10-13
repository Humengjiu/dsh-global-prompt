import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const harness = process.env.DSH_HARNESS_DIR
if (!harness) throw new Error('Run npm run build; its wrapper sets DSH_HARNESS_DIR.')
const { clientBundle } = await import(pathToFileURL(resolve(harness, 'packages/client/tsdown.client.ts')).href)
export default clientBundle('dsh-global-prompt', ['lib/types/index.js', 'lib/types/invariant.js'], {
  lib: { noExternal: ['@deepseek-ai/dsh-settings', '@deepseek-ai/schemastery', '@deepseek-ai/cosmokit'] },
})
