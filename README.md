# Ghost-static

Convert your dynamic Ghost blog to a static website. Works without any external dependecy.

**This a work in progress, some Ghost themes and features may not work correctly.**

This module works as intended on Windows, with the default Casper theme.

## Installation

For ease of use, I recommend a global installation:

`npm install -g ghost-static`

## Setup

You can optionally create a `ghost-static.json` in your local directory.

Here are the default values:

```
{
  "localURL": "http://localhost:2368",
  "destFolder": "static/",
  "publishURL": "http://localhost:8080"
}
```

- `localURL`: the url to the local instance of Ghost
- `destFolder`: where to save static files
- `publishURL`: the public url that is used to acces your static blog

## Usage

Type `ghost-static` once your local Ghost instance is up and running. All files will be downloaded in your destination folder.

## Requirements

NodeJS 8+
