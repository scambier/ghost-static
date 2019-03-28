#!/usr/bin/env node

'use strict'
const scrape = require('website-scraper')
const rimraf = require('rimraf')
const fs = require('fs')
const mv = require('mv')
const path = require('path')
const url = require('url')
const isBinary = require('isbinaryfile')
const puppeteer = require('puppeteer')

class MyPlugin {
  apply (registerAction) {
    /**
     * Replace references of [localURL] by [publishURL] in non-binary files
     * @param resource
     */
    registerAction('onResourceSaved', ({ resource }) => {
      console.log('saved')
      let path = scraper.tmpFolder + resource.filename
      isBinary(path, (err, result) => {
        if (err) throw err
        if (!result) {
          try {
            let data = fs.readFileSync(path, 'utf8')
            let result = data.replace(
              new RegExp(scraper.localURL, 'g'),
              scraper.publishURL
            )
            fs.writeFileSync(path, result, 'utf8')
          } catch (e) {
            console.error(e)
          }
        }
      })
    })

    registerAction('afterResponse', async ({ response }) => {
      console.log(response.request.href)
      const contentType = response.headers['content-type']
      const isHtml = contentType && contentType.split(';')[0] === 'text/html'
      if (isHtml) {
        const page = await scraper.browser.newPage()
        await page.goto(response.request.href, {
          waitUntil: 'networkidle2'
        })
        await page.waitFor(1000)
        const content = await page.content()
        await page.close()
        return content
      } else {
        return response.body
      }
    })

    registerAction('onResourceError', ({ resource, error }) => {
      if (error) console.error(error)
    })
  }
}

class Scraper {
  constructor () {
    this.optionsPath = path.join(process.cwd(), 'ghost-static.json')
    let options = {}
    try {
      options = require(this.optionsPath)
    } catch (e) {
      console.log('Missing options file, will user default values')
    }
    this.loadOptions(options)
  }

  loadOptions ({
    localURL = 'http://localhost:2368',
    publishURL = 'http://localhost:8081',
    tmpFolder = 'tmp/',
    destFolder = 'static/'
  }) {
    this.localURL = localURL
    this.publishURL = publishURL
    this.tmpFolder = tmpFolder
    this.destFolder = destFolder
  }

  getScraperOptions () {
    return {
      urls: [this.localURL],
      plugins: [new MyPlugin(this.tmpFolder, this.publishURL)],
      directory: this.tmpFolder,
      recursive: true,
      prettifyUrls: true,
      filenameGenerator: 'bySiteStructure',

      request: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
        }
      },

      /**
       * Only download files coming from the Ghost instance
       * @param url
       * @returns {boolean}
       */
      urlFilter: url => {
        return url.indexOf(this.localURL) === 0
      }
    }
  }

  async start () {
    try {
      this.browser = await puppeteer.launch({ headless: true })
      await this.deleteFolders()
      console.log('Deleted old content')
      console.log('Scraping ' + this.localURL)
      await scrape(this.getScraperOptions())
      await this.browser.close()
      this.moveFolders()
    } catch (e) {
      console.error(e)
    }
  }

  deleteFolders () {
    return new Promise((resolve, reject) => {
      rimraf(this.tmpFolder, e => {
        if (e) reject(e)
        rimraf(this.destFolder, e => {
          if (e) reject(e)
          resolve()
        })
      })
    })
  }

  moveFolders () {
    setTimeout(() => {
      // Move the site from the tmp folder to the static folder
      const domain = url.URL(this.localURL).host.replace(':', '_')
      mv(
        path.join(this.tmpFolder, domain),
        this.destFolder,
        {
          mkdirp: true
        },
        err => {
          if (err) {
            console.log(err)
          }
          console.log('Done!')
          console.log(
            `Your static blog is stored in ${path.join(
              process.cwd(),
              this.destFolder
            )}`
          )
        }
      )
    }, 1000)
  }
}

const scraper = new Scraper()
scraper.start()
