'use strict';

const fetch = require('node-fetch');
const sharp = require('sharp');
const imageType = require('image-type');
const redisClient = require('../lib/redisClient');

class UnsupportedTypeError extends Error {}

async function getOriginalFromCache(hash) {
  const [original, width, height, type, mime] = await redisClient.hmget(hash, 'original', 'width', 'height', 'type', 'mime');

  if (!original) {
    return false;
  }

  return {
    original: Buffer.from(original, 'base64'),
    width: parseInt(width, 10),
    height: parseInt(height, 10),
    type,
    mime
  };
}

async function getOriginalByUrl(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const type = imageType(buffer);

  if (!type || ['jpg', 'png', 'webp'].indexOf(type.ext) === -1) {
    throw new UnsupportedTypeError();
  }

  const meta = await sharp(buffer).metadata();

  return {
    original: buffer,
    width: meta.width,
    height: meta.height,
    type: type.ext === 'jpg' ? 'jpeg' : type.ext,
    mime: type.mime,
    url
  };
}

function setDetails(context, details) {
  context.set('original-image-buffer', details.original);
  context.set('original-image-width', details.width);
  context.set('original-image-height', details.height);
  context.set('image-type', details.type);
  context.set('mime-type', details.mime);
}

function persistDetails(hash, details) {
  return redisClient.hmset(hash, Object.assign({}, details, { original: details.original.toString('base64') }));
}

async function getOriginal(req, res) {
  const logger = this.get('logger');

  logger.debug('in getOriginal');

  const hash = this.get('image-url-hash');
  const url = this.get('image-url');

  let details = await getOriginalFromCache(hash);

  if (details) {
    logger.debug('got original buffer from cache');

    return setDetails(this, details);
  }

  try {
    details = await getOriginalByUrl(url);
  } catch (e) {
    if (e instanceof UnsupportedTypeError) {
      res.writeHead(400);
      res.end('URL resolved to an unsupported type.');
      return;
    }

    throw e;
  }

  logger.debug('got original buffer by request');

  setDetails(this, details);

  return persistDetails(hash, details);
}

module.exports = getOriginal;
