'use strict';

const fetch = require('node-fetch');
const redisClient = require('../lib/redisClient');

function imageRequest() {
  this.get('logger').debug('in imageRequest');

  if (this.has('resized-image-buffer') && this.has('original-image-buffer')) {
    return;
  }

  return fetch(this.get('image-url'))
    .then(res => {
      if (!res.ok) {
        res.writeHead(502);
        res.end();
        return;
      }

      return res.buffer().then(buffer => {
        this.set('original-image-buffer', buffer);

        return redisClient.hset(this.get('image-url-hash'), 'original', buffer.toString('base64'));
      });
    });
}

module.exports = imageRequest;
