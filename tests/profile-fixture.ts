/** Actual released profile, Loader, configuration editor and settings service. */
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { realpathSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Settings from '@deepseek-ai/dsh-settings'
import ConfigEditor from '@deepseek-ai/dsh-config-editor'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
const cliRequire = createRequire(realpathSync(resolve('node_modules/@deepseek-ai/dsh/package.json')))
const { boot, initProfile, readProfilePatches } = await import(pathToFileURL(cliRequire.resolve('@deepseek-ai/dsh-app-boot')).href)

/**
 * Create isolated profile files and compose the supplied plugin through Loader.
 * @param plugin Function-plugin namespace, source or built artifact.
 * @param existing Reuse a fixture to prove restart persistence.
 */
export async function profileFixture(plugin: object, existing?: { home: string; dir: string }) {
  await mkdir(resolve('.work'), { recursive: true })
  const home = existing?.home ?? await mkdtemp(resolve('.work/profile-'))
  const dir = existing?.dir ?? join(home, 'profiles', 'test')
  if (!existing) {
    initProfile(dir, ['test-bundle'])
    const bundle = join(dir, 'node_modules', 'test-bundle')
    await mkdir(bundle, { recursive: true })
    await writeFile(join(home, 'package.json'), '{"name":"global-prompt-test-installation"}\n')
    await writeFile(join(bundle, 'package.json'), JSON.stringify({
      name: 'test-bundle', version: '1.0.0', dsh: { bundle: { patch: 'cordis.patch.yml' } },
    }))
    await writeFile(join(bundle, 'cordis.patch.yml'), JSON.stringify([{ insert: [
      { id: 'config-editor', name: 'cordis:editor' },
      { id: 'settings', name: 'cordis:settings' },
      { id: 'system-prompt', name: 'cordis:prompt', config: {
        personaPrefix: 'BASE_PERSONA', includeHarnessIdentity: false, includeRuntimeContext: false,
      } },
      { id: 'global-prompt', name: 'cordis:globalPrompt' },
    ] }]))
    await writeFile(join(dir, 'cordis.yml'), '[]\n')
  }
  const profile = {
    name: 'test', startedBundles: ['test-bundle'], dir, patchPath: join(dir, 'cordis.patch.yml'),
    installAnchor: join(home, 'package.json'), cwd: home, home, overlays: [], telemetryDisabledEnv: undefined,
  }
  const ctx: Context = await boot('test', join(dir, 'cordis.yml'), readProfilePatches('test', profile), (ctx: Context) => {
    ctx.provide('profileContext', profile)
    ctx.provide('appReady', { onReady: (listener: () => void) => { listener(); return () => {} } })
    Object.assign(ctx.loader.builtins, { editor: ConfigEditor, settings: Settings, prompt: SystemPrompt, globalPrompt: plugin })
  })
  await ctx.loader.await()
  return { ctx, home, dir, patchPath: profile.patchPath }
}
