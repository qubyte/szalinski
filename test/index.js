// todo
'use strict';

const redisClient = require('../lib/redisClient');

after(() => {
  redisClient.disconnect();
});
