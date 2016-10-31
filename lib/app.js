'use strict';

const Toisu = require('toisu');
const Router = require('toisu-router');

const ping = require('../middleware/ping');
const requestLogger = require('../middleware/requestLogger');
const responseTime = require('../middleware/responseTime');
const parseAndValidateQuery = require('../middleware/parseAndValidateQuery');
const getOriginal = require('../middleware/getOriginal');
const calculateResizedDimensions = require('../middleware/calculateResizedDimensions');
const getResized = require('../middleware/getResized');
const sendImage = require('../middleware/sendImage');

const app = new Toisu();
const router = new Router();

router.route('/ping', {
  get: [ping]
});

router.route('/resize', {
  get: [
    parseAndValidateQuery,
    getOriginal,
    calculateResizedDimensions,
    getResized,
    sendImage
  ]
});

app.use(requestLogger);
app.use(responseTime);
app.use(router.middleware);

app.handleError = function (req, res, err) {
  this.get('logger').error(err, 'Error processing request.');
  Toisu.defaultHandleError.call(this, req, res, err);
};

module.exports = app;
