'use strict';

const assert = require('assert');
const sinon = require('sinon');
const uuid = require('uuid');
const logger = require('../../lib/logger');
const requestLogger = require('../../middleware/requestLogger');

describe('requestLogger', () => {
  const sandbox = sinon.sandbox.create();

  let context;
  let childLogger;

  beforeEach(() => {
    childLogger = {
      debug: sandbox.stub()
    };

    sandbox.stub(uuid, 'v4').returns('a-uuid');
    sandbox.stub(logger, 'child').returns(childLogger);

    context = new Map();

    requestLogger.call(context, 'a-request');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a child logger using a UUID', () => {
    assert.deepEqual(logger.child.args, [[{ uuid: 'a-uuid' }]]);
  });

  it('appends the child logger to the middleware context', () => {
    assert.equal(context.get('logger'), childLogger);
  });

  it('appends the UUID to the middleware context', () => {
    assert.equal(context.get('uuid'), 'a-uuid');
  });

  it('logs the incoming request', () => {
    assert.deepEqual(childLogger.debug.args, [[{ req: 'a-request' }, 'Incoming request.']]);
  });
});
