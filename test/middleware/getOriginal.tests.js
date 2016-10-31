'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const sinon = require('sinon');
const nock = require('nock');
const redisClient = require('../../lib/redisClient');
const getResized = require('../../middleware/getOriginal');

const original = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'original.jpg')); // eslint-disable-line no-sync

describe('getOriginal', () => {
  const sandbox = sinon.sandbox.create();

  let context;
  let nockScope;

  beforeEach(() => {
    context = new Map([
      ['logger', { debug: sandbox.stub() }],
      ['image-url', 'http://example.com/image.jpg'],
      ['image-url-hash', 'the-test-url-hash']
    ]);

    nockScope = nock('http://example.com')
      .get('/image.jpg')
      .reply(200, original);
  });

  afterEach(() => {
    redisClient.del('the-test-url-hash');
    nock.cleanAll();
  });

  after(() => {
    nock.restore();
  });

  describe('when no original image is cached', () => {
    beforeEach(() => {
      return getResized.call(context);
    });

    it('requests the image by URL', () => {
      assert.ok(nockScope.isDone());
    });

    it('sets the image buffer encoded as base64 in redis', () => {
      return redisClient.hget('the-test-url-hash', 'original')
        .then(result => {
          assert.equal(result, original.toString('base64'));
        });
    });

    it('sets the width to redis', () => {
      return redisClient.hget('the-test-url-hash', 'width')
        .then(width => assert.equal(width, 800));
    });

    it('sets the height to redis', () => {
      return redisClient.hget('the-test-url-hash', 'height')
        .then(height => assert.equal(height, 533));
    });

    it('sets the image type to redis', () => {
      return redisClient.hget('the-test-url-hash', 'type')
        .then(type => assert.equal(type, 'jpeg'));
    });

    it('sets the image mime-type to redis', () => {
      return redisClient.hget('the-test-url-hash', 'mime')
        .then(mime => assert.equal(mime, 'image/jpeg'));
    });

    it('sets the image url to redis', () => {
      return redisClient.hget('the-test-url-hash', 'url')
        .then(mime => assert.equal(mime, 'http://example.com/image.jpg'));
    });

    it('appends the image buffer to the context as "original-image-buffer"', () => {
      assert.ok(original.equals(context.get('original-image-buffer')));
    });

    it('appends the image type to the context as "image-type"', () => {
      assert.equal(context.get('image-type'), 'jpeg');
    });

    it('appends the mime type to the context as "mime-type"', () => {
      assert.equal(context.get('mime-type'), 'image/jpeg');
    });

    it('appends the width to the context as "original-image-width"', () => {
      assert.strictEqual(context.get('original-image-width'), 800);
    });

    it('appends the height to the context as "original-image-height"', () => {
      assert.strictEqual(context.get('original-image-height'), 533);
    });
  });

  describe('when an original image cached', () => {
    beforeEach(() => {
      return redisClient
        .hmset('the-test-url-hash', {
          original: original.toString('base64'),
          width: '800',
          height: '533',
          type: 'jpeg',
          mime: 'image/jpeg'
        })
        .then(() => getResized.call(context));
    });

    it('does not request the image by URL', () => {
      assert.ok(!nockScope.isDone());
    });

    it('appends the image buffer to the context as "original-image-buffer"', () => {
      assert.ok(original.equals(context.get('original-image-buffer')));
    });

    it('appends the image type to the context as "image-type"', () => {
      assert.equal(context.get('image-type'), 'jpeg');
    });

    it('appends the mime type to the context as "mime-type"', () => {
      assert.equal(context.get('mime-type'), 'image/jpeg');
    });

    it('appends the width to the context as "original-image-width"', () => {
      assert.strictEqual(context.get('original-image-width'), 800);
    });

    it('appends the height to the context as "original-image-height"', () => {
      assert.strictEqual(context.get('original-image-height'), 533);
    });
  });
});
