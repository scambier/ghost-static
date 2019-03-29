# Ghost static

[![npm version](https://badge.fury.io/js/ghost-static.svg)](https://badge.fury.io/js/ghost-static) [![dep](https://david-dm.org/scambier/ghost-static.svg)](https://david-dm.org/scambier/ghost-static#info=devDependencies)

**Convert your dynamic Ghost blog to a static website.**

Works without any external dependency, tested on Windows with Ghost 2 and the default Casper theme.

## Installation

`$ npm install -g ghost-static`

## Usage

```
$ ghost-static -h

Usage: ghost-static [options] [command]

Commands:
  help     Display help
  version  Display version

Options:
  -d, --dest [value]     The folder where the static files will be downloaded (defaults to "static")
  -h, --help             Output usage information
  -p, --publish [value]  The url that will point to the static Ghost site (defaults to "http://localhost:8080")
  -s, --source [value]   The current running instance of Ghost (defaults to "http://localhost:2368")
  -v, --version          Output the version number
```

## Issues

If your Ghost setup or theme doesn't work, fill a bug and I'll see what I can do.

## Requirements

Node LTS
