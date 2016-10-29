'use strict';

const redisClient = require('../lib/redisClient');

function checkResizedInCache() {
  this.get('logger').debug('in checkResizedInCache');

  const hash = this.get('image-url-hash');
  const width = this.get('image-width');
  const height = this.get('image-height');

  return redisClient.hget(hash, `${width}:${height}`)
    .then(result => {
      if (result) {
        this.set('resized-image-buffer', Buffer.from(result, 'base64'));
      }
    });
}

module.exports = checkResizedInCache;
