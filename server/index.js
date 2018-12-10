'use strict';

const {
  BASE_URL,
  ORG_GATEWAY_URL,
  OAUTH_ISSUER,
  OAUTH_KEY,
  OAUTH_SCOPES,
  OAUTH_SECRET,
  PORT,
} = require('./config');

if (!OAUTH_KEY || !OAUTH_SECRET) {
  console.error('OAuth key and secret are required.');
  return;
}

console.log('Configuration');
console.log('ISSUER:       ' + OAUTH_ISSUER);
console.log('SCOPES:       ' + OAUTH_SCOPES);
console.log('CLIENTID:     ' + OAUTH_KEY);
console.log('ORG_GATEWAY_URL:  ' + ORG_GATEWAY_URL);

const Issuer = require('openid-client').Issuer;
Issuer.defaultHttpOptions.timeout = 10000;

const appFactory = require('./app');

Issuer.discover(OAUTH_ISSUER)
  .then((issuer) => {
    console.log('Discovered endpoints');
    console.log('AUTH:         ' + issuer.authorization_endpoint);
    console.log('REGISTRATION: ' + issuer.registration_endpoint);
    console.log('TOKEN:        ' + issuer.token_endpoint);
    console.log('USER_INFO:    ' + issuer.userinfo_endpoint);

    const app = appFactory(issuer);
    app.listen(PORT);
    console.log(`Server listening at ${BASE_URL}.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
