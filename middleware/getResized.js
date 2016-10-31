'use strict';

const sharp = require('sharp');
const redisClient = require('../lib/redisClient');

function getResizedFromCache(hash, width, height) {
  return redisClient.hget(hash, `${width}:${height}`)
    .then(resized => resized && Buffer.from(resized, 'base64'));
}

function createResized(buffer, type, width, height) {
  return sharp(buffer)
    .resize(width, height)
    .max()
    .toFormat(type)
    .toBuffer();
}

function persistResized(hash, width, height, buffer) {
  return redisClient.hset(hash, `${width}:${height}`, buffer.toString('base64'));
}

function getResized() {
  const logger = this.get('logger');

  logger.debug('in getResized');

  const hash = this.get('image-url-hash');
  const width = this.get('resized-image-width');
  const height = this.get('resized-image-height');

  return getResizedFromCache(hash, width, height)
    .then(buffer => {
      if (buffer) {
        logger.debug('retrieved resized buffer from cache');

        return this.set('resized-image-buffer', buffer);
      }

      return createResized(this.get('original-image-buffer'), this.get('image-type'), width, height)
        .then(buffer => {
          logger.debug('created resized buffer from original');

          this.set('resized-image-buffer', buffer);

          return persistResized(hash, width, height, buffer);
        });
    });
}

module.exports = getResized;
