# Ghost-static
Convert your dynamic Ghost blog to a static website.

This tool has been tested for Ghost 0.11 and Ghost 1.0.0-rc.1  
This is a work in progress, some Ghost themes may not work correctly.

## Installation

`npm install -g ghost-static`

Create a `ghost-static.json` in your Ghost directory:
```
{
  "ghostURL": "http://localhost:2368",
  "tmpFolder": "tmp/",
  "staticFolder": "blog/",
  "publicURL": "https://scambier.github.io/blog"
}
```
- `ghostURL`: the url to the local instance of Ghost.
- `tmpFolder`: a temporary folder where the Ghost blog will be scraped
- `static`: the "final" folder where you'll find your static files
- `publicURL`: the public url that is (or will be) used to acces your static blog

## Usage

Type `ghost-static` once your local Ghost instance is up and running.

## Requirements

NodeJS 4.8+