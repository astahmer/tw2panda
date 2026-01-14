# tw2panda & panda2tw

Easily migrate code between Tailwind CSS and Panda CSS

![Screenshot 2023-08-08 at 01 34 49](https://github.com/astahmer/tw2panda/assets/47224540/47992889-6330-47fa-8e15-a0ccd2e4ae02)

## Packages

This monorepo contains two complementary tools:

### 📦 [tw2panda](./packages/tw2panda) - Tailwind → Panda CSS

Migrate code from Tailwind CSS to Panda CSS with automatic conversion of classes to `css()` and `cva()` function calls.

**Features:**
- `rewrite`, `extract` and `convert` CLI commands
- Custom [`panda.config`](https://panda-css.com/docs/references/config) and `tailwind.config` support
- Converts [`class-variance-authority`](https://cva.style/docs) to panda's [`cva`](https://panda-css.com/docs/concepts/recipes#atomic-recipe-or-cva)
- VSCode extension: https://marketplace.visualstudio.com/items?itemName=astahmer.tw2panda-vscode

### 📦 [panda2tw](./packages/panda2tw) - Panda CSS → Tailwind

Migrate code back from Panda CSS to Tailwind CSS with automatic conversion of `css()` and `cva()` calls to class strings.

**Features:**
- `rewrite` and `convert` CLI commands
- Handles responsive modifiers, pseudo-selectors, and conditions
- Batch file conversion support

## Quick Start

### tw2panda (Tailwind → Panda)

```sh
npx tw2panda rewrite ./src/button.tsx -w
```

### panda2tw (Panda → Tailwind)

```sh
npx panda2tw rewrite ./src/button.tsx -w
```

## VSCode Extension

Select the text you want to convert and run the `tw2panda: Rewrite tw to Panda CSS` command.
https://marketplace.visualstudio.com/items?itemName=astahmer.tw2panda-vscode

## Install & Usage

### tw2panda

```sh
pnpm add tw2panda
```

[Full tw2panda documentation](./packages/tw2panda)

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
