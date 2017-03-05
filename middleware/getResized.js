'use strict';

const sharp = require('sharp');
const redisClient = require('../lib/redisClient');

async function getResizedFromCache(hash, width, height) {
  const resized = await redisClient.hget(hash, `${width}:${height}`);

  return resized && Buffer.from(resized, 'base64');
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

async function getResized() {
  const logger = this.get('logger');

  logger.debug('in getResized');

  const hash = this.get('image-url-hash');
  const width = this.get('resized-image-width');
  const height = this.get('resized-image-height');

  let buffer = await getResizedFromCache(hash, width, height);

  if (buffer) {
    logger.debug('retrieved resized buffer from cache');

    return this.set('resized-image-buffer', buffer);
  }

  buffer = await createResized(this.get('original-image-buffer'), this.get('image-type'), width, height);

  logger.debug('created resized buffer from original');

  this.set('resized-image-buffer', buffer);

  return persistResized(hash, width, height, buffer);
}

module.exports = getResized;
