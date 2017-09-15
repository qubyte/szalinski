# szalinski

[![Greenkeeper badge](https://badges.greenkeeper.io/qubyte/szalinski.svg)](https://greenkeeper.io/)

An image resizing service, written in Node.js with Toisu! and backed by an LRU
redis cache. This service was written as a technical demo for a job application,
and now serves as an example Toisu! service.

## Usage

This application behaves as intended when the redis instance it pairs with is
configured as an LRU cache. A [docker-compose](docker-compose.yml) file is
provided to run both this application and such a redis instance. In order to
follow the instructions below, you must have docker and docker compose
installed.

Clone this repository and run

```
docker-compose up
```

in the repository directory from a terminal to start the app and redis. Navigate
to `127.0.0.1:8080/resize?url=<an image url>&width=<desired width>`. Only one of
width or height is required, but both may be given (the app will use the most
constraining and maintain aspect ratio).

If you wish to run szalinski without docker, you may use Node.js v7.6 or up, and
must have a redis instance running. If the redis instance is running on the same
machine, the default configuration of the app will suffice and you can boot
using

```
node .
```

## Configuration

The app may be configured by environment variables.

| option    | environment variable   | default     |
| --------- | ---------------------- | ----------- |
| appPort   | `SZALINSKI_APP_PORT`   | `8080`      |
| logLevel  | `SZALINSKI_LOG_LEVEL`  | debug       |
| redisHost | `SZALINSKI_REDIS_HOST` | `127.0.0.1` |
| redisPort | `SZALINSKI_REDIS_PORT` | `6379`      |

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

## Notes

### The name

The name is a reference to Honey, I Shunk the Kids.

### Toisu!

[Toisu!](https://github.com/qubyte/toisu) is a small server framework I put
together as an experiment into replacing Express with something built to use
promises. The result is something that still uses middleware functions, but
these functions now only have request and response arguments, much like a
vanilla Node request handler function. The `next` callback goes away because
synchronous middleware just returns undefined, and asynchronous middleware
returns a promise. This is especially fun when using async-await is to build
middleware.

Toisu! borrows the idea of a shared context from Koa. Unlike Koa, the shared
context is a `Map` instance (which may be used as a plain object) and provides
nothing out of the box. The intention is that middleware functions use this as a
way to communicate with and provide methods for later middleware.

Toisu! does not include routing out of the box. This is provided by
`toisu-router`. This router was originally developed for REST APIs (it provides
automatic 405 responses for example). As it has only been used for REST, I
had not realised that it handled query parameters improperly. This exercise led
to [a fix for that issue](https://github.com/qubyte/toisu-router/pull/7).

### Clustering

Clustering has been omitted since the app is intended to run via docker in a
cluster.

### Config

I used a module called [configeur](https://github.com/qubyte/configeur), which
I built to parse environment variables and provide defaults. In the spirit of
12-factor apps.

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

When two requests for the same image, or same new size of an image, come in at
the same time, the image will be processed and cached twice. This can be avoided
with the use of a lock and redis pubsub.
