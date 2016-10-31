'use strict';

const assert = require('assert');
const sinon = require('sinon');
const sendImage = require('../../middleware/sendImage');

describe('sendImage', () => {
  const sandbox = sinon.sandbox.create();
  const debugStub = sandbox.stub();

  let context;
  let res;
  let buffer;

  beforeEach(() => {
    buffer = { length: 123 };

    context = new Map([
      ['logger', { debug: debugStub }],
      ['resized-image-buffer', buffer],
      ['mime-type', 'the-mime-type']
    ]);

    res = {
      writeHead: sandbox.stub(),
      end: sandbox.stub()
    };

    sendImage.call(context, {}, res);
  });

  it('calls res.writeHead with a status code of 200, and Content-Type and Content-Length headers', () => {
    assert.deepEqual(res.writeHead.args, [[
      200,
      { 'Content-Type': 'the-mime-type', 'Content-Length': 123 }
    ]]);
  });

  it('calls res.end with the resized image buffer', () => {
    assert.equal(res.end.callCount, 1);
    assert.equal(res.end.args[0][0], buffer);
  });

  it('calls res.end after res.writeHead', () => {
    assert.ok(res.writeHead.calledBefore(res.end));
  });
});
