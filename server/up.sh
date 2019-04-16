#!/bin/sh
docker stop chat_server
docker rm chat_server
docker rmi chat_server:test
docker build --tag chat_server:test .
docker run -itd --name chat_server -p 8080:8080 chat_server:test

