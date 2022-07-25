const request = require('request');
const parser = require('node-html-parser');
const {DownloaderHelper} = require('node-downloader-helper');
const https = require('https');
const fs = require('fs');

class VkPageImageParser {
  constructor(models, options) {
    this.models = models;
    this.options = options || {};
  }

  fetchText({
              path,
              method,
              form
            }) {
    const config = {
      url: `https://m.vk.com/${path}`,
      encoding: null,
      method: 'GET',
    };
    return new Promise((accept) => {
      request(config, (err, response, body) => {
        if (body === undefined) {
          throw new Error('No internet connection');
        }
        // const c = iconv.encode(iconv.decode(body, 'cp1251'), 'utf8').toString();
        accept(body.toString());
      });
    });
  }

  download(url) {
    return new Promise((accept, reject) => {
      https.get(url, (res) => {
        // Image will be stored at this path
        const path = global.appRoot + `/upload/place/image/` + this.options.placeId + '.png';
        const filePath = fs.createWriteStream(path);
        res.pipe(filePath);
        filePath.on('finish', () => {
          filePath.close();
          console.log('Download Completed ' + path);
          accept(path)
        })
      })
    });
  }

  async _parse() {
    const html = await this.fetchText({path: this.options.vkPath});
    // console.log(html);
    const root = parser.parse(html);
    const image = root.querySelectorAll('.groupCover__image');
    if (!image || !image[0]) {
      const avatar = root.querySelectorAll('.Avatar__image');
      if (avatar && avatar.length) {
        let style = avatar[0].getAttribute('style');
        let m = style.match(/url\('(.*)'\)/);
        if (m) {
          return m[1];
        } else {
          return false;
        }
      }
      return false;
    }

    let style = image[0].getAttribute('style');
    const m = style.match(/url\('(.*)'\)/);
    if (m) {
      return m[1];
    } else {
      return false;
    }
  }


  async parse() {
    const link = await this._parse();
    if (!link) {
      return false;
    }
    return await this.download(link);
  }


}

module.exports = VkPageImageParser;
