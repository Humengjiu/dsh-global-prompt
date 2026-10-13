/** Evaluate the official browser factory artifacts against their shared module table. */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import * as Cordis from '@deepseek-ai/cordis'
import * as Store from '@deepseek-ai/dsh-client-store'
import * as Slots from '@deepseek-ai/dsh-client-ui-slots'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as Primitives from '@deepseek-ai/dsh-client-ui-primitives'
const require = createRequire(import.meta.url)
const seeds: Record<string, object> = {
  '@deepseek-ai/cordis': Cordis,
  '@deepseek-ai/dsh-client-store': Store,
  '@deepseek-ai/dsh-client-ui-slots': Slots,
  '@deepseek-ai/dsh-client-ui-primitives': Primitives,
  react: React, 'react-dom': ReactDOM, 'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': require('react/jsx-runtime'),
}
export function officialClient(name: string) {
  const file = resolve(dirname(require.resolve(name + '/package.json')), 'lib/client.js')
  let exports: object | undefined
  runInNewContext(readFileSync(file, 'utf8'), {
    window: { __ModuleLoader__: { load(entry: { factory: (require: (name: string) => object) => object }) {
      exports = entry.factory((specifier) => {
        const value = seeds[specifier]
        if (!value) throw new Error('Unexpected official platform module: ' + specifier)
        return value
      })
    } } },
    console, setTimeout, clearTimeout, queueMicrotask, AbortController, structuredClone,
    navigator: globalThis.navigator,
    ...(typeof document === 'undefined' ? {} : { document }),
  })
  if (!exports) throw new Error('Official browser factory did not load')
  return exports
}
