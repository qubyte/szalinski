# szalinski

In image resizing service, written in Node.js with Toisu! and backed by an LRU
redis cache.

## Test coverage:

Most test modules have been written. The tests for
[`getOriginal`](test/middleware/getOriginal.tests.js) and
[`getResized`](test/middleware/getResized.tests.js) take a behavioural approach
which requires redis to be running.

 - [ ] index.js
 - lib
  - [ ] app.js
  - [x] config.js
  - [x] logger.js
  - [x] redisClient.js
 - middleware
  - [x] calculateResizedDimensions.js
  - [x] getOriginal.js
  - [x] getResized.js
  - [x] parseAndValidateQuery.js
  - [x] ping.js
  - [x] requestLogger.js
  - [x] responseTime.js
  - [x] sendImage.js

## Docker

This application behaves as intended when the redis instance it pairs with is
configured as an LRU cache. A [docker-compose](docker-compose.yml) file is
provided to run both this application and such a redis instance.

Run `docker-compose up` to start the app and redis. Navigate to
`127.0.0.1:8080/resize?url=some-url&width=1234`. Only one of width or height is
required, but both may be given (the app will use the most constraining and
maintain aspect ratio).

## Notes

### The name

The name is a reference to Honey I shunk the kids.

### Toisu!

[Toisu!](https://github.com/qubyte/toisu) is a small server framework I put
together as an experiment into replacing Express with something built to use
promises. The result is something that still uses middleware functions, but
these functions now only have request and response arguments, much like a
vanilla Node request handler function. The `next` callback goes away because
synchronous middleware just returns undefined, and asynchronous middleware
returns a promise. This is especially fun when async-await is available.

Toisu! borrows the idea of a shared context from Koa. Unlike Koa, the shared
context is a `Map` instance (which may be used as a plain object) and provides
nothing out of the box. The intention is that middleware functions use this as a
way to communicate with and provide methods for later middleware.

Toisu! does not include routing out of the box. This is provided by
`toisu-router`. This router was originally developed for REST APIs (it provides
automatic 405 responses for example). As it has only been used for REST, I
had not realised that it handled query parameters improperly. This exercise led
to [a fix for that issue](https://github.com/qubyte/toisu-router/pull/7).

Since this is a demonstration, and since the ioredis module is very promise
friendly, I opted to use Toisu! and explore where it would take me. In a
production scenario I'd be more likely to opt for a more battle-tested framework
like Express.

### Clustering

Clustering has been omitted since the app is intended to run via docker in a
cluster.

### Config

I used a module called [konfiga](https://github.com/chrisnewtn/konfiga). Its
development is owned by a friend of mine, and I contribute to it now and then. I
find it nice because I favour 12 factor apps (configured by environment), but
command line flags can be convenient for development.

### Logging

I've used bunyan for logging. Each log entry is a single line and parsable as
JSON. Having the log all on one line is handy for grepping, and lots of context
can be stored in the JSON snippet. In the case of this app, each
request-response cycle gets its own UUID, and this is injected into each log
entry from the cycle.

To pretty-print logs, pipe them to the bunyan cli utility.

### Image processing

I've used `sharp` and `image-type` for processing images. The latter can
determine the type of an image from a buffer, and the former can be used to do
the image resizing.

### Making requests

I've used node-fetch, since it has a simple API and prodides a response method
which resolves to a buffer. It is also promise based, which makes it a good fit
with the server framework.

### Redis

The redis server is configured as a LRU cache. All data for each image is stored
in a redis hash, so accessing the original or any resized version of an image
will encourage redis not to drop data for that URL when the database becomes
full.

I've stored images as base64 encoded strings. Each image URL is hashed, and that
hash used as a key of a redis hash. The original image is set on the `original`
key of the hash, and resized versions set on a key formatted as
`<width>:<height>`. Other metadata of the original image stored in redis include
width, height, mime-type, and URL.

The client module I've used is ioredis, which provides a nice promise based API.

### Potential improvements

This service keeps entire buffers in memory. Streams would likely allow buffers
to be piped to the client to avoid memory consumption per request.
