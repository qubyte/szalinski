'use strict';

const imageType = require('image-type');

function checkType(req, res) {
  this.get('logger').debug('in checkOriginalInCache');

  const resized = this.get('resized-image-buffer');
  const original = this.get('original-image-buffer');

  const type = imageType(resized || original);

  if (!type || ['jpg', 'png', 'webp'].indexOf(type.ext) === -1) {
    res.writeHead(400);
    res.end();
    return;
  }

  this.set('image-type', type.ext === 'jpg' ? 'jpeg' : type.ext);
}

module.exports = checkType;
