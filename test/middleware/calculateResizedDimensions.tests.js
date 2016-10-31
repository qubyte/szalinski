'use strict';

const sinon = require('sinon');
const assert = require('assert');
const calculateResizedDimensions = require('../../middleware/calculateResizedDimensions');

describe('calculateResizedDimensions', () => {
  let context;

  beforeEach(() => {
    context = new Map([
      ['original-image-width', 200],
      ['original-image-height', 75],
      ['logger', { debug: sinon.stub(), info: sinon.stub() }]
    ]);
  });

  describe('when a width but no height is given', () => {
    beforeEach(() => {
      context.set('requested-image-width', 100);
      context.set('requested-image-height', null);

      calculateResizedDimensions.call(context);
    });

    it('sets the rounded resized image width and height based on the requested width and the original dimensions', () => {
      assert.equal(context.get('resized-image-width'), 100);
      assert.equal(context.get('resized-image-height'), 38);
    });
  });

  describe('when a height but no width is given', () => {
    beforeEach(() => {
      context.set('requested-image-width', null);
      context.set('requested-image-height', 50);

      calculateResizedDimensions.call(context);
    });

    it('sets the rounded resized image width and height based on the requested height and the original dimensions', () => {
      assert.equal(context.get('resized-image-width'), 133);
      assert.equal(context.get('resized-image-height'), 50);
    });
  });

  describe('when the height and width are given, and result is width constrained', () => {
    beforeEach(() => {
      context.set('requested-image-width', 100);
      context.set('requested-image-height', 50);

      calculateResizedDimensions.call(context);
    });

    it('sets the rounded resized image width and height based on the requested width and the original dimensions', () => {
      assert.equal(context.get('resized-image-width'), 100);
      assert.equal(context.get('resized-image-height'), 38);
    });
  });

  describe('when the height and width are given, and result is height constrained', () => {
    beforeEach(() => {
      context.set('requested-image-width', 150);
      context.set('requested-image-height', 50);

      calculateResizedDimensions.call(context);
    });

    it('sets the rounded resized image width and height based on the requested height and the original dimensions', () => {
      assert.equal(context.get('resized-image-width'), 133);
      assert.equal(context.get('resized-image-height'), 50);
    });
  });
});
