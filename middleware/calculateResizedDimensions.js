'use strict';

function calculateResizedDimensions() {
  this.get('logger').debug('in calculateResizedDimensions');

  const requestedWidth = this.get('requested-image-width');
  const requestedHeight = this.get('requested-image-height');
  const originalWidth = this.get('original-image-width');
  const originalHeight = this.get('original-image-height');

  let resizedWidth = requestedWidth;
  let resizedHeight = requestedHeight;

  if (resizedWidth === null) {
    resizedWidth = Math.round(resizedHeight * originalWidth / originalHeight);
  } else if (resizedHeight === null) {
    resizedHeight = Math.round(resizedWidth * originalHeight / originalWidth);
  } else if (requestedWidth / requestedHeight > originalWidth / originalHeight) {
    resizedWidth = Math.round(resizedHeight * originalWidth / originalHeight);
  } else {
    resizedHeight = Math.round(resizedWidth * originalHeight / originalWidth);
  }

  this.get('logger').info(`Resizing to ${resizedWidth}:${resizedHeight}`);

  this.set('resized-image-width', resizedWidth);
  this.set('resized-image-height', resizedHeight);
}

module.exports = calculateResizedDimensions;
