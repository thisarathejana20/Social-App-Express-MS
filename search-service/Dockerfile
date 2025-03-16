# use node 18 as the base image with alpine linux OS
FROM node:22-alpine

WORKDIR /use/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3004

CMD [ "node", "src/server.js" ]