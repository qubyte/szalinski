'use strict';

function ping(req, res) {
  res.writeHead(204);
  res.end();
}

module.exports = ping;
