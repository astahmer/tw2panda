```sh
npx tw2panda -h
```

```sh
tw2panda/0.0.1

Usage:
  $ tw2panda <command> [options]

Commands:
  rewrite <glob>       Output the given file converted to panda, doesn't actually write to disk unless using -w
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
