FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install
RUN npm run compile

EXPOSE 8080

CMD [ "npm", "start" ]