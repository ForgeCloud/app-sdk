'use strict';

const Issuer = require('openid-client').Issuer;

const {
  HOST = 'localhost',
  OAUTH_ISSUER = 'http://openam.example.com/openam/oauth2',
  OAUTH_KEY,
  OAUTH_SCOPES = 'openid',
  OAUTH_SECRET,
  PORT = 8100,
  PROTOCOL = 'http',
} = process.env;

if (!OAUTH_KEY || !OAUTH_SECRET) {
  console.error('OAuth key and secret are required.');
  return;
}

const baseUrl = PROTOCOL + '://' + HOST + (PORT !== 80 ? ':' + PORT : '') + '/';

const appFactory = require('./app');

Issuer.discover(OAUTH_ISSUER)
  .then((issuer) => {
    const app = appFactory(
      baseUrl,
      issuer,
      OAUTH_SCOPES,
      OAUTH_KEY,
      OAUTH_SECRET,
    );
    app.listen(PORT);
    console.log(`Server listening at ${baseUrl}.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
