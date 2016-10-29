'use strict';

const redisClient = require('../lib/redisClient');

function checkOriginalInCache() {
  this.get('logger').debug('in checkOriginalInCache');

  if (this.has('resized-image-buffer')) {
    return;
  }

  const hash = this.get('image-url-hash');

  return redisClient.hget(hash, 'original')
    .then(result => {
      if (result) {
        this.set('original-image-buffer', Buffer.from(result, 'base64'));
      }
    });
}

module.exports = checkOriginalInCache;
