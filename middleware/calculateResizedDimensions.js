'use strict';

function calculateResizedDimensions() {
  const logger = this.get('logger');

  logger.debug('in calculateResizedDimensions');

  const requestedWidth = this.get('requested-image-width') || Infinity;
  const requestedHeight = this.get('requested-image-height') || Infinity;
  const originalWidth = this.get('original-image-width');
  const originalHeight = this.get('original-image-height');

  let resizedWidth = requestedWidth;
  let resizedHeight = requestedHeight;

  if (requestedWidth / requestedHeight > originalWidth / originalHeight) {
    resizedWidth = Math.round(resizedHeight * originalWidth / originalHeight);
  } else {
    resizedHeight = Math.round(resizedWidth * originalHeight / originalWidth);
  }

  logger.info(`Resizing to ${resizedWidth}:${resizedHeight}`);

  this.set('resized-image-width', resizedWidth);
  this.set('resized-image-height', resizedHeight);
}

module.exports = calculateResizedDimensions;
