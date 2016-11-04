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
      .get('/image.jpg');
  });

  afterEach(() => {
    redisClient.del('the-test-url-hash');
    nock.cleanAll();
  });

  after(() => {
    nock.restore();
  });

  describe('when no original image is cached', () => {
    let promise;
    let res;

    beforeEach(() => {
      res = {
        writeHead: sandbox.stub(),
        end: sandbox.stub()
      };

      promise = getResized.call(context, {}, res);
    });

    it('requests the image by URL', () => {
      const scope = nockScope.reply(200, original);

      return promise.then(() => {
        assert.ok(scope.isDone());
      });
    });

    describe('when the URL does not resolve to a supported type', () => {
      beforeEach(() => {
        nockScope.reply(200, 'blah');

        return promise;
      });

      it('responds to the client request with a 400 status code', () => {
        assert.deepEqual(res.writeHead.args, [[400]]);
        assert.deepEqual(res.end.args, [['URL resolved to an unsupported type.']]);
        assert.ok(res.end.calledAfter(res.writeHead));
      });
    });

    describe('when the URL resolves to a supported type', () => {
      beforeEach(() => {
        nockScope.reply(200, original);

        return promise;
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
  });

  describe('when an original image cached', () => {
    let scope;

    beforeEach(() => {
      scope = nockScope.reply(200, original);

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
      assert.ok(!scope.isDone());
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
