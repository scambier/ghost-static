#!/usr/bin/env node

'use strict'
const args = require('args')
const scrape = require('website-scraper')
const rimraf = require('rimraf')
const fs = require('fs')
const mv = require('mv')
const path = require('path')
const url = require('url')
const isBinary = require('isbinaryfile').isBinaryFile

args
  .option('source', 'The current running instance of Ghost. This url will be replaced by the [publish] one.','http://localhost:2368')
  .option('dest', 'The folder where the static files will be downloaded', 'static')
  .option('publish', 'The url that will point to the static Ghost site', 'http://localhost:8080')
  .option('to-replace', 'List of comma-separated urls, if you want to replace other URLs than [source] by [publish].')
  

const flags = args.parse(process.argv, {
  usageFilter(usage) {
    return usage.replace('scrap.js', 'ghost-static')
  }
})

class RewritterPlugin {
  apply (registerAction) {
    /**
     * Replace references of [localURL] by [publishURL] in non-binary files
     * @param resource
     */
    registerAction('onResourceSaved', async ({ resource }) => {
      let resPath = path.join(scraper.tmpFolder, resource.filename)
      const binary = await isBinary(fs.readFileSync(resPath))
      if (!binary) {
        try {
          let data = fs.readFileSync(resPath, 'utf8')
          for (const url of this.replaceUrls) {
            data = data.replace(new RegExp(scraper.localURL, 'g'), url)
          }
          fs.writeFileSync(resPath, data, 'utf8')
        } catch (e) {
          console.error(e)
        }
      }
    })

    registerAction('afterResponse', async ({ response }) => {
      console.log(response.request.href)
      return response.body
    })

    registerAction('onResourceError', ({ resource, error }) => {
      if (error) console.error(error)
    })
  }
}

class Scraper {
  constructor () {
    this.localURL = flags.source
    this.publishURL = flags.publish
    this.destFolder = path.resolve(flags.dest)
    this.tmpFolder = path.resolve('tmp')
    this.replaceUrls = flags['to-replace'] ? flags['to-replace'].replace(/\s/g, '').split(',') : [this.publishURL]

    console.log('----')
    console.log(`Will download from ${this.localURL} to ${path.resolve(this.destFolder)}`)
    console.log(`All references to ${this.localURL} will be replaced by ${this.publishURL}`)
    console.log('----')
  }

  getScraperOptions () {
    return {
      urls: [this.localURL],
      plugins: [new RewritterPlugin()],
      requestConcurrency: 1,
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
      await this.deleteFolders()
      await scrape(this.getScraperOptions())
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
      const domain = new url.URL(this.localURL).host.replace(':', '_')
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
            `Your static blog is stored in ${this.destFolder}`
          )
        }
      )
    }, 1000)
  }
}

const scraper = new Scraper()
scraper.start()
