'use strict';

function sendImage(req, res) {
  this.get('logger').debug('in sendImage');

  const buffer = this.get('resized-image-buffer');
  const mime = this.get('mime-type');

  res.writeHead(200, { 'Content-Type': mime, 'Content-Length': buffer.length });
  res.end(buffer);
}

module.exports = sendImage;
