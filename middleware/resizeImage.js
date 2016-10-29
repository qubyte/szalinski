'use strict';

const sharp = require('sharp');
const redisClient = require('../lib/redisClient');

function resizeImage() {
  this.get('logger').debug('in resizeImage');

  if (this.get('resized-image-buffer')) {
    return;
  }

  const hash = this.get('image-url-hash');
  const width = this.get('image-width');
  const height = this.get('image-height');

  return sharp(this.get('original-image-buffer'))
    .resize(width, height)
    .max()
    .toFormat(this.get('image-type'))
    .toBuffer()
    .then(buffer => {
      this.set('resized-image-buffer', buffer);

      return redisClient.hset(hash, `${width}:${height}`, buffer.toString('base64'));
    });
}

module.exports = resizeImage;
