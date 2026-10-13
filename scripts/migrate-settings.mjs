/** Produce a comment-preserving proposed profile patch; never overwrite either input. */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse, parseDocument, isSeq, isMap } from 'yaml'

const [legacyPath, profilePath, outputPath] = process.argv.slice(2)
if (!legacyPath || !profilePath || !outputPath) {
  console.error('Usage: node migrate-settings.mjs <old settings.yaml or .imported> <current cordis.patch.yml> <new patch file>')
  process.exit(1)
}
const input = resolve(legacyPath)
const profile = resolve(profilePath)
const output = resolve(outputPath)
if (output === input || output === profile) throw new Error('Choose a new output file; input files are preserved.')
const legacy = parse(await readFile(input, 'utf8'))
const value = legacy?.['global-prompt']
if (!value || typeof value.enabled !== 'boolean' || typeof value.text !== 'string') {
  throw new Error('Expected global-prompt.enabled (boolean) and global-prompt.text (string) in the legacy document.')
}
let raw
try { raw = await readFile(profile, 'utf8') }
catch (error) { if (error.code !== 'ENOENT') throw error; raw = '[]\n' }
const document = parseDocument(raw, {
  customTags: [{ tag: 'tag:yaml.org,2002:js', resolve: text => text }],
})
if (document.errors.length) throw document.errors[0]
if (!isSeq(document.contents)) throw new Error('The current profile patch must be a YAML sequence.')
const matches = document.contents.items.map((node, index) => ({ node, index }))
  .filter(({node}) => isMap(node) && node.get('id') === 'global-prompt' && !node.has('insert'))
if (matches.length > 1) throw new Error('Multiple global-prompt overrides exist; review them before migrating.')
const config = { enabled: value.enabled, text: value.text }
if (matches.length) {
  document.setIn([matches[0].index, 'name'], 'dsh-global-prompt')
  document.setIn([matches[0].index, 'config'], document.createNode(config))
} else document.add(document.createNode({ id: 'global-prompt', name: 'dsh-global-prompt', config }))
await writeFile(output, String(document), { flag: 'wx', mode: 0o600 })
console.log('Created a proposed profile patch. Review it before replacing the current patch; both inputs are unchanged.')
