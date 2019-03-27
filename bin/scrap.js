#!/usr/bin/env node

'use strict';
const scrape = require('website-scraper')
const rimraf = require('rimraf')
const fs = require('fs')
const mv = require('mv')
const path = require('path')
const url = require('url')
const isBinary = require('isbinaryfile')
const puppeteer = require('puppeteer');

class MyPlugin {

  apply(registerAction) {
    /**
     * Replace references of [ghostURL] by [publicURL] in non-binary files
     * @param resource
     */
    registerAction('onResourceSaved', ({ resource }) => {
      let path = tmpFolder + resource.filename;
      console.log(path)
      isBinary(path, (err, result) => {
        if (!result) {
          try {
            let data = fs.readFileSync(path, 'utf8');
            let result = data.replace(new RegExp(ghostURL, 'g'), publicURL);
            fs.writeFileSync(path, result, 'utf8');
          } catch (err) {
            console.error(err);
          }
        }
      })
    })

    registerAction('afterResponse', async ({ response }) => {
      const contentType = response.headers['content-type'];
      const isHtml = contentType && contentType.split(';')[0] === 'text/html';
      if (isHtml) {
        const page = await browser.newPage();
        await page.goto(response.request.href, {
          waitUntil: 'networkidle2'
        })
        const content = await page.content()
        await page.close()
        return content
      } else {
        return response.body
      }
    })

    registerAction('onResourceError', ({ resource, error }) => {
      if (error) console.error(error);
    })
  }
}

/**
 * Find & load options file
 */
const optionsPath = path.join(process.cwd(), 'ghost-static.json');
let mOptions;
try {
  mOptions = require(optionsPath);
} catch (e) {
  throw new Error('Missing file ghost-static.json in current directory. See module documentation.')
}
try {

  console.log('Loaded JSON:');
  console.log(mOptions);
  const reqOptions = ['ghostURL', 'tmpFolder', 'staticFolder', 'publicURL'];
  reqOptions.map(opt => {
    if (!mOptions.hasOwnProperty(opt)) {
      throw new Error(`Missing value for: ${opt}`);
    }
  });
} catch (e) {
  throw e;
}

const ghostURL = mOptions['ghostURL'] // Your Ghost's local instance
const tmpFolder = mOptions['tmpFolder'] // Where to scrap it
const staticFolder = mOptions['staticFolder'] // Where to save it
const publicURL = mOptions['publicURL'] // Your Ghost's public url (with subfolder if needed)

const wsOptions = {
  urls: [ghostURL],
  plugins: [new MyPlugin()],
  directory: tmpFolder,
  recursive: true,
  prettifyUrls: true,
  filenameGenerator: 'bySiteStructure',

  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
    }
  },

  /**
   * Only download files coming from the Ghost instance
   * @param url
   * @returns {boolean}
   */
  urlFilter: url => {
    return url.indexOf(ghostURL) === 0;
  }
}

/**
 * Delete tmp and static folders before scraping
 * @returns {Promise}
 */
function deleteFolders() {
  return new Promise((resolve, reject) => {
    rimraf(tmpFolder, e => {
      if (e) reject(e);
      rimraf(staticFolder, e => {
        if (e) reject(e);
        resolve();
      })
    })
  })
}

/**
 * Move folders from tmp. Wait a bit before this if a file is being written
 */
function moveFolders() {
  setTimeout(() => {
    // Move the site from the tmp folder to the static folder
    const domain = url.parse(ghostURL).host.replace(':', '_');
    mv(path.join(tmpFolder, domain), staticFolder, {
      mkdirp: true
    }, err => {
      if (err) {
        console.log(err);
      }
      console.log('Done!');
      console.log(`Your static blog is stored in ${path.join(process.cwd(), staticFolder)}`)
    });
  }, 1000);
}


let browser;
(async function () {
  try {
    // Init puppeteer
    browser = await puppeteer.launch();

    await deleteFolders()
    console.log('Deleted old content');
    console.log('Scraping ' + ghostURL);
    await scrape(wsOptions)
    await browser.close()
    moveFolders()
  } catch (e) {
    console.error(e)
  }
})()