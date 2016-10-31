'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('config', () => {
  let konfigaStub;
  let config;

  before(() => {
    konfigaStub = sinon.stub().returns('konfiga-return-val');

    config = SandboxedModule.require('../../lib/config', {
      requires: {
        konfiga: konfigaStub
      }
    });
  });

  it('calls konfiga once', () => {
    assert.equal(konfigaStub.callCount, 1);
  });

  it('exports konfiga\'s return value', () => {
    assert.equal(config, 'konfiga-return-val');
  });

  it('passes an object with 4 keys to konfiga', () => {
    assert.equal(Object.keys(konfigaStub.args[0][0]).length, 4);
  });

  describe('appPort', () => {
    let appPort;

    before(() => {
      appPort = konfigaStub.args[0][0].appPort;
    });

    it('has a default value of 8080', () => {
      assert.equal(appPort.defaultValue, 8080);
    });

    it('has an env variable name of SZALINSKI_APP_PORT', () => {
      assert.equal(appPort.envVariableName, 'SZALINSKI_APP_PORT');
    });

    it('has a command line name of app-port', () => {
      assert.equal(appPort.cmdLineArgName, 'app-port');
    });

    it('has a type of Number', () => {
      assert.equal(appPort.type, Number);
    });
  });

  describe('logLevel', () => {
    let logLevel;

    before(() => {
      logLevel = konfigaStub.args[0][0].logLevel;
    });

    it('has a default value of debug', () => {
      assert.equal(logLevel.defaultValue, 'debug');
    });

    it('has an env variable name of SZALINSKI_LOG_LEVEL', () => {
      assert.equal(logLevel.envVariableName, 'SZALINSKI_LOG_LEVEL');
    });

    it('has a command line name of log-level', () => {
      assert.equal(logLevel.cmdLineArgName, 'log-level');
    });

    it('has a type of String', () => {
      assert.equal(logLevel.type, String);
    });
  });

  describe('redisHost', () => {
    let redisHost;

    before(() => {
      redisHost = konfigaStub.args[0][0].redisHost;
    });

    it('has a default value of 127.0.0.1', () => {
      assert.equal(redisHost.defaultValue, '127.0.0.1');
    });

    it('has an env variable name of SZALINSKI_REDIS_HOST', () => {
      assert.equal(redisHost.envVariableName, 'SZALINSKI_REDIS_HOST');
    });

    it('has a command line name of redis-host', () => {
      assert.equal(redisHost.cmdLineArgName, 'redis-host');
    });

    it('has a type of String', () => {
      assert.equal(redisHost.type, String);
    });
  });

  describe('redisPort', () => {
    let redisPort;

    before(() => {
      redisPort = konfigaStub.args[0][0].redisPort;
    });

    it('has a default value of 6379', () => {
      assert.equal(redisPort.defaultValue, 6379);
    });

    it('has an env variable name of SZALINSKI_REDIS_PORT', () => {
      assert.equal(redisPort.envVariableName, 'SZALINSKI_REDIS_PORT');
    });

    it('has a command line name of redis-port', () => {
      assert.equal(redisPort.cmdLineArgName, 'redis-port');
    });

    it('has a type of Number', () => {
      assert.equal(redisPort.type, Number);
    });
  });
});
