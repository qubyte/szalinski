'use strict';

const assert = require('assert');
const sinon = require('sinon');
const parseAndValidateQuery = require('../../middleware/parseAndValidateQuery');

describe('parseAndValidateQuery', () => {
  const sandbox = sinon.sandbox.create();

  let context;
  let req;
  let res;

  beforeEach(() => {
    context = new Map([['logger', { debug: sandbox.stub() }]]);

    res = {
      writeHead: sandbox.stub(),
      end: sandbox.stub()
    };
  });

  describe('when no url query parameter is found', () => {
    beforeEach(() => {
      req = {
        url: '?width=10&height=20'
      };

      parseAndValidateQuery.call(context, req, res);
    });

    it('responds with a 400 status and an error message', () => {
      assert.deepEqual(res.writeHead.args, [[400]]);
      assert.deepEqual(res.end.args, [['url and one or both of width or height must be given as query parameters.']]);
      assert.ok(res.writeHead.calledBefore(res.end));
    });
  });

  describe('when neither width not height query parameters are found', () => {
    beforeEach(() => {
      req = {
        url: '?url=http%3A%2F%2Fexample.com%2Fimage.png'
      };

      parseAndValidateQuery.call(context, req, res);
    });

    it('responds with a 400 status and an error message', () => {
      assert.deepEqual(res.writeHead.args, [[400]]);
      assert.deepEqual(res.end.args, [['url and one or both of width or height must be given as query parameters.']]);
      assert.ok(res.writeHead.calledBefore(res.end));
    });
  });

  describe('when url and width query parameters are given', () => {
    beforeEach(() => {
      req = {
        url: '?url=http%3A%2F%2Fexample.com%2Fimage.png&width=100'
      };

      parseAndValidateQuery.call(context, req, res);
    });

    it('sets the image URL on the middleware context', () => {
      assert.equal(context.get('image-url'), 'http://example.com/image.png');
    });

    it('sets a sha256 hash of the URL on the middleware context', () => {
      assert.equal(context.get('image-url-hash'), 'a766752812b074840fc25839f331ab69f7987c29d462b124bfc44dc7a22fc376');
    });

    it('sets the parsed width on the middleware context', () => {
      assert.strictEqual(context.get('requested-image-width'), 100);
    });

    it('sets the height on the middleware context as null', () => {
      assert.strictEqual(context.get('requested-image-height'), null);
    });

    it('does not call res.writeHead or res.end', () => {
      assert.equal(res.writeHead.callCount, 0);
      assert.equal(res.end.callCount, 0);
    });
  });

  describe('when url and height query parameters are given', () => {
    beforeEach(() => {
      req = {
        url: '?url=http%3A%2F%2Fexample.com%2Fimage.png&height=100'
      };

      parseAndValidateQuery.call(context, req, res);
    });

    it('sets the image URL on the middleware context', () => {
      assert.equal(context.get('image-url'), 'http://example.com/image.png');
    });

    it('sets a sha256 hash of the URL on the middleware context', () => {
      assert.equal(context.get('image-url-hash'), 'a766752812b074840fc25839f331ab69f7987c29d462b124bfc44dc7a22fc376');
    });

    it('sets the parsed height on the middleware context', () => {
      assert.strictEqual(context.get('requested-image-height'), 100);
    });

    it('sets the width on the middleware context as null', () => {
      assert.strictEqual(context.get('requested-image-width'), null);
    });

    it('does not call res.writeHead or res.end', () => {
      assert.equal(res.writeHead.callCount, 0);
      assert.equal(res.end.callCount, 0);
    });
  });

  describe('when url, width and height query parameters are given', () => {
    beforeEach(() => {
      req = {
        url: '?url=http%3A%2F%2Fexample.com%2Fimage.png&width=100&height=50'
      };

      parseAndValidateQuery.call(context, req, res);
    });

    it('sets the image URL on the middleware context', () => {
      assert.equal(context.get('image-url'), 'http://example.com/image.png');
    });

    it('sets a sha256 hash of the URL on the middleware context', () => {
      assert.equal(context.get('image-url-hash'), 'a766752812b074840fc25839f331ab69f7987c29d462b124bfc44dc7a22fc376');
    });

    it('sets the parsed width on the middleware context', () => {
      assert.strictEqual(context.get('requested-image-width'), 100);
    });

    it('sets the parsed height on the middleware context', () => {
      assert.strictEqual(context.get('requested-image-height'), 50);
    });

    it('does not call res.writeHead or res.end', () => {
      assert.equal(res.writeHead.callCount, 0);
      assert.equal(res.end.callCount, 0);
    });
  });
});
