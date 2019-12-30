FROM node:12.14.0-alpine3.11

ADD . .
RUN npm install
CMD [ "node", "index.js" ]

