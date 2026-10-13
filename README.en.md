# dsh-global-prompt

A community plugin for durable, literal standing instructions across sessions in a DeepSeek Harness profile.

[Download v0.2.0 preview](https://github.com/Humengjiu/dsh-global-prompt/releases/tag/v0.2.0) · [中文](README.md) · [Validation](docs/validation.md)

Independently maintained by Humengjiu under MIT; not an accepted official DeepSeek contribution.

## Compatibility

Plugin 0.2.0 targets official **DeepSeek Harness 0.2.1-alpha.2**, tag `dsh-v0.2.1-alpha.2`, commit `d743267388641bc76f17c45ce8b4c231aed1d32c`. Version 0.1.0 remains the historical preview for the original development snapshot. Future API versions are not claimed compatible.

The Web profile was installed and exercised on Windows with actual released npm artifacts. Desktop shares the Web plugin protocol but has not been separately acceptance-tested. No compatibility exemption is needed or recommended.

## Installation

Download the preview tarball and install it into a matching Web profile:

```sh
dsh plugin --profile web add /absolute/path/dsh-global-prompt-0.2.0.tgz
```

Restart dsh Web, then open Settings → Global prompt. Enable the switch, enter your standing instruction and wait for saving to finish.

The package declares its own bundle patch, so installation enables the `global-prompt` entry. No harness source edits or old command-line overlay are required. Settings are live volatile Config fields persisted through the official ConfigForms/configuration editor into the profile's `cordis.patch.yml`. The default is disabled with empty text. Failed text saves retain the mounted editor's draft and provide retry; read-only or non-loopback connections cannot write the Host setting.

A first installation enables the bundle. Updating an existing dependency preserves its selection state; if the settings entry is absent after upgrading, enable `dsh-global-prompt` on the sidebar Plugins page and restart if prompted.

## Upgrade

See [the upgrade guide](docs/upgrade-v0.2.md) before migrating old `settings.yaml` values or removing the original overlay. The migration helper writes a new proposed profile patch and preserves both inputs.

## Model Experience

Enabled non-whitespace text contributes `user:global-prompt` after the deployment persona prefix. Text is literal, including `{{braces}}`. Each assembly reads live values; volatile edits notify prompt consumers without remounting the plugin. Disabled or blank text contributes nothing.

The enabled text adds its tokens to model input. Editing changes the KV-cache prefix. The setting applies to sessions in profiles where this bundle is installed; official complete-system-prompt overrides continue to suppress other sections.

## Development

Dependencies come directly from released npm packages:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm run smoke
pnpm run pack
```

Node `^22.19.0 || >=24`, pnpm 11.28.5. The build emits Node and browser entries, inline plugin CSS and declarations. Tags publish previews only after verification.

## Validation and limitations

See [validation.md](docs/validation.md) for real profile/Loader persistence, released browser-factory integration, component failure handling, migration preservation and actual Web installation/interaction evidence.

Real model API calls, Desktop installation and mobile layouts were not tested. Text writes remain queued per change without debounce. No npm registry publication is claimed; use the GitHub preview tarball.

## License

MIT. Original attribution is preserved in [LICENSE](LICENSE) and [NOTICE](NOTICE).
