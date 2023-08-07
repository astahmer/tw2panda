# tw2panda

Easily migrate code from tailwind to Panda CSS

## Features

- `rewrite`, `extract` and `convert` CLI commands
- use your own custom [`panda.config`](https://panda-css.com/docs/references/config) and/or custom `tailwind.config`
  file
- also rewrites [`class-variance-authority`](https://cva.style/docs) to panda's
  [`cva`](https://panda-css.com/docs/concepts/recipes#atomic-recipe-or-cva) function

You can look at this file for an example of what it can do:
[example](./packages/tw2panda/tests/rewrite-tw-file-content-to-panda.test.ts)

## VSCode extension

Select the text you want to convert and run the `tw2panda: Rewrite tw to Panda CSS` command.
https://marketplace.visualstudio.com/items?itemName=astahmer.tw2panda-vscode

## Install & usage

```sh
pnpm add tw2panda
```

It exports a bunch of functions that can be used to build your own tooling on top of it. You can look at the
[CLI code](packages/tw2panda/src/cli.ts) or the
[tests](packages/tw2panda/tests/rewrite-tw-file-content-to-panda.test.ts) to see how it can be used.

## CLI

```sh
npx tw2panda -h
```

```sh
tw2panda/0.1.0

Usage:
  $ tw2panda <command> [options]

Commands:
  rewrite <file>       Output the given file converted to panda, doesn't actually write to disk unless using -w
  extract <file>       Extract each tailwind candidate and show its converted output, doesn't actually write to disk
  convert <classList>  Example: inline-flex disabled:pointer-events-none underline-offset-4

For more info, run any command with the `--help` flag:
  $ tw2panda rewrite --help
  $ tw2panda extract --help
  $ tw2panda convert --help

Options:
  -h, --help     Display this message
  -v, --version  Display version number
```

### rewrite

```sh
Usage:
  $ tw2panda rewrite <file>

Options:
  --tw, --tailwind <file>  Path to tailwind.config.js
  -w, --write              Write to disk instead of stdout
  -s, --shorthands         Use shorthands instead of longhand properties
  -c, --config <path>      Path to panda config file
  --cwd <cwd>              Current working directory (default: /Users/astahmer/dev/alex/tailwind-to-css-in-js/packages/tw2panda)
  -h, --help               Display this message
```

### extract

```sh
Usage:
  $ tw2panda extract <file>

Options:
  --tw, --tailwind <file>  Path to tailwind.config.js
  -s, --shorthands         Use shorthands instead of longhand properties
  -h, --help               Display this message
```

### convert

```sh
Usage:
  $ tw2panda convert <classList>

Options:
  -s, --shorthands  Use shorthands instead of longhand properties
  -h, --help        Display this message
```

## Alternatives

https://github.com/jherr/tw2panda-cli / you can see the live demo here
https://www.youtube.com/watch?v=fKSemrudovo&t=442s

## Contributing

- `pnpm i`
- `pnpm build`
- `pnpm test`

When you're done with your changes, please run `pnpm changeset` in the root of the repo and follow the instructions
described [here](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md).
