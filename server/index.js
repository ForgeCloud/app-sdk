'use strict';

const Issuer = require('openid-client').Issuer;

const {
  HOST = 'localhost',
  OAUTH_ISSUER = 'http://openam.example.com/openam/oauth2',
  OAUTH_SCOPES = 'openid',
  PORT = 8100,
  PROFILE_ENDPOINT = '',
  PROTOCOL = 'http',
} = process.env;

const baseUrl = PROTOCOL + '://' + HOST + (PORT !== 80 ? ':' + PORT : '') + '/';

const appFactory = require('./app');

Issuer.discover(OAUTH_ISSUER)
  .then((issuer) => {
    const app = appFactory(baseUrl, issuer, OAUTH_SCOPES, PROFILE_ENDPOINT);
    app.listen(PORT);
    console.log(`Server listening at ${baseUrl}.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
