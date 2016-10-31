'use strict';

const assert = require('assert');
const sinon = require('sinon');
const ping = require('../../middleware/ping');

describe('ping', () => {
  const sandbox = sinon.sandbox.create();
  const res = {
    writeHead: sandbox.stub(),
    end: sandbox.stub()
  };

  beforeEach(() => {
    ping({}, res);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('calls writeHead with a status code of 204', () => {
    assert.deepEqual(res.writeHead.args, [[204]]);
  });

  it('ends the response with no data', () => {
    assert.deepEqual(res.end.args, [[]]);
  });

  it('ends the response after setting the status code', () => {
    assert.ok(res.writeHead.calledBefore(res.end));
  });
});
