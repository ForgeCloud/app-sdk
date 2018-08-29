#!/bin/bash

echo "npm i"
npm i
echo "npm i nodemon"
npm i --no-save nodemon
echo "nodemon..."
./node_modules/.bin/nodemon -w client -w server -e js,jsx,ts,tsx,hbs --exec 'node ./server/index.js'