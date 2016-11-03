'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('logger', () => {
  const createLoggerStub = sinon.stub().returns('the-logger-instance');

  before(() => {
    SandboxedModule.require('../../lib/logger', {
      requires: {
        bunyan: {
          createLogger: createLoggerStub,
          stdSerializers: {
            res: 'std-res-serializer',
            req: 'std-req-serializer'
          }
        },
        './config': {
          logLevel: 'the-log-level'
        }
      }
    });
  });

  it('creates a logger instance', () => {
    assert.equal(createLoggerStub.callCount, 1);
  });

  it('configures the logger instance with the name, level, and serializers fields', () => {
    assert.deepEqual(Object.keys(createLoggerStub.args[0][0]).sort(), ['level', 'name', 'serializers']);
  });

  it('uses the app name to configure the instance', () => {
    assert.equal(createLoggerStub.args[0][0].name, 'szalinski');
  });

  it('uses logLevel from config to configure the instance', () => {
    assert.equal(createLoggerStub.args[0][0].level, 'the-log-level');
  });

  it('uses the bunyan standard serializers, overriding the res serializer', () => {
    assert.equal(createLoggerStub.args[0][0].serializers.req, 'std-req-serializer');
    assert.notEqual(createLoggerStub.args[0][0].serializers.res, 'std-res-serializer');
  });

  describe('the res serializer', () => {
    let resSerializer;

    before(() => {
      resSerializer = createLoggerStub.args[0][0].serializers.res;
    });

    it('returns undefined when called with undefined', () => {
      assert.strictEqual(resSerializer(), undefined);
    });

    it('returns the object it is called with when the object lacks a statusCode field', () => {
      const res = {};

      assert.strictEqual(resSerializer(res), res);
    });

    it('returns an object with the statusCode and header from _headers', () => {
      const res = { statusCode: 123, _headers: 'the-headers', _header: 'the-header' };

      assert.deepEqual(resSerializer(res), {
        statusCode: 123,
        header: 'the-headers'
      });
    });

    it('defaults to _header when _headers is not available', () => {
      const res = { statusCode: 123, _header: 'the-header' };

      assert.deepEqual(resSerializer(res), {
        statusCode: 123,
        header: 'the-header'
      });
    });
  });
});
