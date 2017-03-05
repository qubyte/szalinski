'use strict';

const Redis = require('ioredis');
const config = require('./config');

module.exports = new Redis(config.SZALINSKI_REDIS_PORT, config.SZALINSKI_REDIS_HOST);
