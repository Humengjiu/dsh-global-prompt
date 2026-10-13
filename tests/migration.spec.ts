import { describe, it, expect } from 'vitest'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { parse } from 'yaml'
describe('legacy migration proposal', () => {
  it('preserves both inputs, neighboring configuration/comments and literal prompt text', async () => {
    await mkdir(resolve('.work'), { recursive: true })
    const dir = await mkdtemp(resolve('.work/migration-'))
    const old = join(dir, 'settings.yaml')
    const current = join(dir, 'cordis.patch.yml')
    const output = join(dir, 'proposal.yml')
    const prose = 'Keep {{literal}}\n  whitespace  '
    const legacy = 'global-prompt:\n  enabled: true\n  text: ' + JSON.stringify(prose) + '\n'
    const patch = '# Keep this operator comment\n- id: ui-theme\n  config:\n    preference: dark\n'
    await writeFile(old, legacy)
    await writeFile(current, patch)
    const result = spawnSync(process.execPath, ['scripts/migrate-settings.mjs', old, current, output], { encoding: 'utf8' })
    expect(result.status, result.stderr).toBe(0)
    const proposal = await readFile(output, 'utf8')
    expect(proposal).toContain('# Keep this operator comment')
    expect(parse(proposal)).toEqual([
      { id: 'ui-theme', config: { preference: 'dark' } },
      { id: 'global-prompt', name: 'dsh-global-prompt', config: { enabled: true, text: prose } },
    ])
    expect(await readFile(old, 'utf8')).toBe(legacy)
    expect(await readFile(current, 'utf8')).toBe(patch)
    const repeated = spawnSync(process.execPath, ['scripts/migrate-settings.mjs', old, current, output], { encoding: 'utf8' })
    expect(repeated.status).not.toBe(0)
    expect(await readFile(output, 'utf8')).toBe(proposal)
  })
})
