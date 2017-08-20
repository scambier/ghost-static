# Ghost-static
Convert your dynamic Ghost blog to a static website.

**This is a buggy work in progress, some Ghost themes and features may not work correctly.**  
I do not plan to actively maintain this module as I switched to Jekyll.

## Installation

`npm install -g ghost-static`

Create a `ghost-static.json` in your Ghost directory:
```
{
  "ghostURL": "http://localhost:2368",
  "tmpFolder": "tmp/",
  "staticFolder": "blog/",
  "publicURL": "https://yourawesomeblog.com"
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
