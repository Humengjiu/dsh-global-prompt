import { defineConfig } from 'tsdown'
import { readFile } from 'node:fs/promises'
import { dirname, resolve, basename } from 'node:path'
import { transform } from 'lightningcss'

const platform = ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives']
const cssPrefix = '\0global-prompt-css:'
export default defineConfig([
  {
    entry: { index: 'lib/types/index.js' }, outDir: 'lib', format: 'esm',
    platform: 'node', target: 'es2024', fixedExtension: false, clean: false, dts: false,
  },
  {
    entry: { client: 'src/client/index.ts' }, outDir: 'lib', format: 'cjs',
    platform: 'browser', target: 'es2024', clean: false, dts: false, sourcemap: true,
    deps: { neverBundle: platform },
    plugins: [{
      name: 'global-prompt-css-modules',
      resolveId(source, importer) {
        if (!source.endsWith('.module.css')) return null
        return cssPrefix + resolve(dirname(importer!), source) + '.mjs'
      },
      async load(id) {
        if (!id.startsWith(cssPrefix)) return null
        const file = id.slice(cssPrefix.length, -4)
        this.addWatchFile(file)
        const result = transform({ filename: file, code: await readFile(file),
          cssModules: { pattern: '[hash]_[local]' }, minify: true })
        const classes = Object.fromEntries(Object.entries(result.exports ?? {}).map(([name, entry]) => [name, entry.name]))
        const tagId = 'dsh-global-prompt/' + basename(file)
        return [
          'const css = ' + JSON.stringify(result.code.toString()) + ';',
          'const tagId = ' + JSON.stringify(tagId) + ';',
          'if (typeof document !== "undefined" && !document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]")) {',
          ' const tag = document.createElement("style"); tag.dataset.plugin = "dsh-global-prompt";',
          ' tag.dataset.pluginCss = tagId; tag.textContent = css; document.head.appendChild(tag);',
          '}',
          'export default ' + JSON.stringify(classes) + ';',
        ].join('\n')
      },
    }],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({id:"dsh-global-prompt",factory:(require)=>{',
      intro: 'var module={exports:{}};var exports=module.exports;',
      footer: 'return module.exports;}});',
    },
  },
])
