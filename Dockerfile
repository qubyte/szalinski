FROM node:6

ENV NODE_ENV production

WORKDIR /src
COPY . .
RUN npm install

HEALTHCHECK --interval=5s CMD curl -f http://127.0.0.1:8080/ping || exit 1

EXPOSE 8080
CMD ["node", "."]
