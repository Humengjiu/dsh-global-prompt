# dsh-global-prompt

A community plugin that adds durable, user-owned global prompt settings to a pinned DeepSeek Harness development snapshot.

[中文](README.md) · [Original implementation](https://github.com/Humengjiu/deepseek-harness/pull/1)

Independently maintained by Humengjiu under MIT. This is not an official DeepSeek plugin or an accepted upstream contribution.

## Compatibility

Version 0.1.0 is a community preview for `Humengjiu/deepseek-harness` commit `efdbb6694b639cf9bf7aeac727d7c0a79a18c0b6` (workspace package version `0.1.0-rc.5`). Current upstream and the npm `0.0.1-rc.1` release are unverified. Development uses the pinned source checkout because the matching workspace versions are not all published to npm.

## Behavior

The Web Settings section provides localized enable/disable and multiline text editing. Defaults are disabled and empty text. The Host registers `global-prompt` settings and a `user:global-prompt` section at order 5, immediately after persona. Enabled non-whitespace text is injected unchanged at each subsequent assembly; disabled or blank text contributes nothing. The textarea retains its draft while focused and adopts the committed value on blur.

## Development

Requires Git, Node `^22.19.0 || >=24` and pnpm 11.7.0:

```sh
npm run setup
npm test
npm run build
npm run smoke
npm run pack
```

The setup script obtains the pinned clean checkout under `.work/harness` and links dependencies without changing harness sources. Set `DSH_HARNESS_DIR` to reuse that exact clean checkout. Build generates the Host remote interfaces, checks relevant Client types and emits the plugin's Node, invariant and browser factory entries. Pack writes `dist/dsh-global-prompt-0.1.0.tgz`.

The runtime browser factory is registered as `dsh-global-prompt`. Host-provided peers are optional in package metadata to prevent installation of a second incompatible harness; the matching Host services are still required.

## Installation on the supported snapshot

Build the complete supported dsh checkout first. Then, from that checkout:

```sh
pnpm dsh plugin --profile web add /absolute/path/dsh-global-prompt-0.1.0.tgz
pnpm dsh web --patch /absolute/path/global-prompt.patch.yml
```

Use the included `examples/global-prompt.patch.yml`, which replaces the original `ui-global-prompt` row so both implementations cannot register the same namespace. Open Settings → Global prompt, enable the toggle and enter your instruction.

Persistence follows the Host settings provider (`$DSH_HOME/settings.yaml` by default for the local provider). Remote browsers follow the pinned settings-scope policy; durable remote writes must not be assumed.

## Validation

See [validation.md](docs/validation.md). The tests use an in-memory Host provider, a test transport and jsdom. Actual browser integration, restart persistence and assembled model request/log behavior require further acceptance testing.

## Model Experience

Enabled text adds its tokens to every session's subsequent requests. Disabled or blank values contribute no section. Mid-session editing changes the system prompt and can invalidate the KV-cache prefix. Per-session preferences remain an agent preset persona concern.

## Known Limitations and Deferred Work

Current upstream is unverified. Text changes write individually without debounce. Built Loader composition and file persistence/restart have been checked; real Web journeys, model request/log and failure-path acceptance remain to be added. No npm registry publication is claimed; this is a GitHub community preview.

## License

MIT. Original DeepSeek attribution is preserved in [LICENSE](LICENSE) and [NOTICE](NOTICE).
