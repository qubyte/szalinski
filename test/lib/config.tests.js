'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('config', () => {
  let configeurStub;
  let config;

  before(() => {
    configeurStub = sinon.stub().returns('configeur-return-val');

    config = SandboxedModule.require('../../lib/config', {
      requires: {
        configeur: configeurStub
      }
    });
  });

  it('calls configeur once', () => {
    assert.equal(configeurStub.callCount, 1);
  });

  it('exports configeur\'s return value', () => {
    assert.equal(config, 'configeur-return-val');
  });

  it('passes an object with 4 keys to configeur', () => {
    assert.equal(Object.keys(configeurStub.args[0][0]).length, 4);
  });

  describe('SZALINSKI_APP_PORT', () => {
    let appPort;

    before(() => {
      appPort = configeurStub.args[0][0].SZALINSKI_APP_PORT;
    });

    it('has a default value of 8080', () => {
      assert.equal(appPort.defaultValue, 8080);
    });

    it('has a type of \'number\'', () => {
      assert.equal(appPort.type, 'number');
    });
  });

  describe('logLevel', () => {
    let logLevel;

    before(() => {
      logLevel = configeurStub.args[0][0].SZALINSKI_LOG_LEVEL;
    });

    it('has a default value of debug', () => {
      assert.equal(logLevel.defaultValue, 'debug');
    });

    it('has the default type (string)', () => {
      assert.strictEqual(logLevel.type, undefined);
    });
  });

  describe('redisHost', () => {
    let redisHost;

    before(() => {
      redisHost = configeurStub.args[0][0].SZALINSKI_REDIS_HOST;
    });

    it('has a default value of \'127.0.0.1\'', () => {
      assert.equal(redisHost.defaultValue, '127.0.0.1');
    });

    it('has the default type (string)', () => {
      assert.strictEqual(redisHost.type, undefined);
    });
  });

  describe('redisPort', () => {
    let redisPort;

    before(() => {
      redisPort = configeurStub.args[0][0].SZALINSKI_REDIS_PORT;
    });

    it('has a default value of \'6379\'', () => {
      assert.equal(redisPort.defaultValue, '6379');
    });

    it('has a type of \'number\'', () => {
      assert.equal(redisPort.type, 'number');
    });
  });
});
