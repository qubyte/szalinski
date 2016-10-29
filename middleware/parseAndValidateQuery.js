'use strict';

const url = require('url');
const crypto = require('crypto');

function parseAndValidateQuery(req, res) {
  this.get('logger').debug('in parseQuery');

  const query = url.parse(req.url, true).query;
  const imageUrl = query.url;
  const width = parseInt(query.width, 10) || Infinity;
  const height = parseInt(query.height, 10) || Infinity;

  if (width === Infinity && height === Infinity || !imageUrl) {
    res.writeHead(400);
    res.end();
    return;
  }

  const hash = crypto
    .createHash('sha256')
    .update(imageUrl)
    .digest('hex');

  this.set('image-url', imageUrl);
  this.set('image-url-hash', hash);
  this.set('image-width', width);
  this.set('image-height', height);
}

module.exports = parseAndValidateQuery;
