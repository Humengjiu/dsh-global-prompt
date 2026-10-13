/**
 * Package-owned invariant companion for `dsh-global-prompt`.
 * @module dsh-global-prompt/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-global-prompt'

/** Cordis companion plugin name. */
export const name = 'client-ui-global-prompt-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the settings scope validates and publishes the durable
 * section, while the prompt section reads that scope directly at assembly.
 * Scope-to-prompt agreement is covered directly by this package's Host spec.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
