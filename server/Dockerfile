FROM node:latest

MAINTAINER rlatnfh99 <rlatnfh99@gmail.com>
COPY . .
RUN npm install
COPY . .
EXPOSE 8080
WORKDIR /

CMD node app.js
