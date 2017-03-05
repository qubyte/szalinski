'use strict';

const assert = require('assert');
const sinon = require('sinon');
const SandboxedModule = require('sandboxed-module');

describe('redisClient', () => {
  const fakeRedisClient = {};
  const ioredisStub = sinon.stub().returns(fakeRedisClient);

  let redisClient;

  before(() => {
    redisClient = SandboxedModule.require('../../lib/redisClient', {
      requires: {
        './config': {
          SZALINSKI_REDIS_HOST: 'the-redis-host',
          SZALINSKI_REDIS_PORT: 'the-redis-port'
        },
        ioredis: ioredisStub
      }
    });
  });

  it('configures a new redis client with a host and port', () => {
    assert.ok(ioredisStub.calledWithNew());
    assert.deepEqual(ioredisStub.args, [['the-redis-port', 'the-redis-host']]);
  });

  it('exports the redisClient', () => {
    assert.equal(redisClient, fakeRedisClient);
  });
});
