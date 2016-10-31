'use strict';

const url = require('url');
const crypto = require('crypto');

function parseAndValidateQuery(req, res) {
  this.get('logger').debug('in parseAndValidateQuery');

  const query = url.parse(req.url, true).query;
  const imageUrl = query.url;
  const width = parseInt(query.width, 10) || null;
  const height = parseInt(query.height, 10) || null;

  if (width === null && height === null || !imageUrl) {
    res.writeHead(400);
    res.end('url and one or both of width or height must be given as query parameters.');
    return;
  }

  const hash = crypto
    .createHash('sha256')
    .update(imageUrl)
    .digest('hex');

  this.set('image-url', imageUrl);
  this.set('image-url-hash', hash);
  this.set('requested-image-width', width);
  this.set('requested-image-height', height);
}

module.exports = parseAndValidateQuery;
