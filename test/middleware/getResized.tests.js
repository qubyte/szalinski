'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const sinon = require('sinon');
const sharp = require('sharp');
const redisClient = require('../../lib/redisClient');
const getResized = require('../../middleware/getResized');

const original = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'original.jpg')); // eslint-disable-line no-sync

describe('getResized', () => {
  const sandbox = sinon.sandbox.create();

  let context;
  let resized;

  before(() => {
    return sharp(original)
      .resize(300, 300, { fit: 'inside' })
      .toBuffer()
      .then(data => {
        resized = data;
      });
  });

  beforeEach(() => {
    context = new Map([
      ['logger', { debug: sandbox.stub() }],
      ['image-url-hash', 'the-test-url-hash'],
      ['resized-image-width', 300],
      ['resized-image-height', 200],
      ['original-image-buffer', original],
      ['image-type', 'jpeg']
    ]);
  });

  afterEach(() => {
    redisClient.del('the-test-url-hash');
  });

  describe('when no resized image is cached', () => {
    beforeEach(() => {
      return getResized.call(context);
    });

    it('creates a resized version and sets it in redis in base64 encoding', () => {
      return redisClient.hget('the-test-url-hash', '300:200')
        .then(result => {
          assert.equal(result, resized.toString('base64'));
        });
    });

    it('appends the resized image buffer to the context', () => {
      assert.ok(resized.equals(context.get('resized-image-buffer')));
    });
  });

  describe('when a matching resized image is cached', () => {
    let resizedBuffer;

    beforeEach(() => {
      resizedBuffer = Buffer.from('Hello, world!');

      return redisClient.hset('the-test-url-hash', '300:200', resizedBuffer.toString('base64'))
        .then(() => getResized.call(context));
    });

    it('appends the cached resized image buffer to the context', () => {
      assert.ok(resizedBuffer.equals(context.get('resized-image-buffer')));
    });
  });
});
