'use strict';

const onHeaders = require('on-headers');

function responseTime(req, res) {
  const t0 = Date.now();

  onHeaders(res, () => {
    const hash = this.get('image-url-hash');

    if (hash) {
      res.setHeader('Szalinski-Hash', hash);
    }

    res.setHeader('X-Response-Time', `${Date.now() - t0}ms`);

    this.get('logger').debug({ res }, 'Outgoing response.');
  });
}

module.exports = responseTime;
