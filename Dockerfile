FROM node:slim

WORKDIR /src
COPY index.js index.js
COPY node_modules node_modules

EXPOSE 8080
CMD ["node", "."]
