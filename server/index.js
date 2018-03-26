'use strict';

const { HOST = 'localhost', PORT = 8100, PROTOCOL = 'http' } = process.env;

const appFactory = require('./app');

const baseUrl = PROTOCOL + '://' + HOST + (PORT !== 80 ? ':' + PORT : '') + '/';

const app = appFactory(baseUrl);
app.listen(PORT);
console.log(`Server listening at ${baseUrl}.`);
