#!/bin/bash

git pull
cd ./app
npm install && npm run build
cd ..
cd ./bot
npm install
cd ..
pm2 start ecosystem.config.js --env production