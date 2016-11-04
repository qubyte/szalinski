'use strict';

const fetch = require('node-fetch');
const sharp = require('sharp');
const imageType = require('image-type');
const redisClient = require('../lib/redisClient');

class UnsupportedTypeError extends Error {}

function getOriginalFromCache(hash) {
  return redisClient.hmget(hash, 'original', 'width', 'height', 'type', 'mime')
    .then(([original, width, height, type, mime]) => {
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
    });
}

function getOriginalByUrl(url) {
  return fetch(url)
    .then(response => response.buffer())
    .then(buffer => {
      const type = imageType(buffer);

      if (!type || ['jpg', 'png', 'webp'].indexOf(type.ext) === -1) {
        throw new UnsupportedTypeError();
      }

      return sharp(buffer).metadata()
        .then(meta => {
          return {
            original: buffer,
            width: meta.width,
            height: meta.height,
            type: type.ext === 'jpg' ? 'jpeg' : type.ext,
            mime: type.mime,
            url
          };
        });
    });
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

function getOriginal(req, res) {
  const logger = this.get('logger');

  logger.debug('in getOriginal');

  const hash = this.get('image-url-hash');
  const url = this.get('image-url');

  return getOriginalFromCache(hash)
    .then(details => {
      if (details) {
        logger.debug('got original buffer from cache');

        return setDetails(this, details);
      }

      return getOriginalByUrl(url)
        .then(details => {
          logger.debug('got original buffer by request');

          setDetails(this, details);

          return persistDetails(hash, details);
        });
    })
    .catch(err => {
      if (err instanceof UnsupportedTypeError) {
        res.writeHead(400);
        res.end('URL resolved to an unsupported type.');
        return;
      }

      throw err;
    });
}

module.exports = getOriginal;
