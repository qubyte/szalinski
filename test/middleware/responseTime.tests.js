'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('responseTime', () => {
  let onHeadersStub;
  let nowStub;
  let debugStub;
  let responseTime;
  let context;
  let res;

  beforeEach(() => {
    onHeadersStub = sinon.stub();
    nowStub = sinon.stub();
    debugStub = sinon.stub();

    nowStub.onCall(0).returns(10);
    nowStub.onCall(1).returns(23);

    responseTime = SandboxedModule.require('../../middleware/responseTime', {
      requires: {
        'on-headers': onHeadersStub
      },
      globals: {
        Date: {
          now: nowStub
        }
      }
    });

    context = new Map([['logger', { debug: debugStub }]]);

    res = {
      setHeader: sinon.stub()
    };
  });

  describe('when a response is about to end and no hash is on the middleware context', () => {
    beforeEach(() => {
      responseTime.call(context, {}, res);

      onHeadersStub.yield();
    });

    it('sets one header', () => {
      assert.equal(res.setHeader.callCount, 1);
    });

    it('sets an X-Response-Time header with the time difference', () => {
      assert.equal(res.setHeader.withArgs('X-Response-Time').args[0][1], '13ms');
    });

    it('logs the outgoing response', () => {
      assert.equal(debugStub.callCount, 1);
      assert.equal(debugStub.args[0][0].res, res);
      assert.equal(debugStub.args[0][1], 'Outgoing response.');
    });
  });

  describe('when a response is about to end and a hash is on the middleware context', () => {
    beforeEach(() => {
      context.set('image-url-hash', 'abcd');

      responseTime.call(context, {}, res);

      onHeadersStub.yield();
    });

    it('sets one header', () => {
      assert.equal(res.setHeader.callCount, 2);
    });

    it('sets an X-Response-Time header with the time difference', () => {
      assert.equal(res.setHeader.withArgs('X-Response-Time').args[0][1], '13ms');
    });

    it('sets a Szalinski-Hash header with the image URL hash', () => {
      assert.equal(res.setHeader.withArgs('Szalinski-Hash').args[0][1], 'abcd');
    });

    it('logs the outgoing response', () => {
      assert.equal(debugStub.callCount, 1);
      assert.equal(debugStub.args[0][0].res, res);
      assert.equal(debugStub.args[0][1], 'Outgoing response.');
    });
  });
});
