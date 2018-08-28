'use strict';

const {
  GATEWAY_URL = 'http://localhost:8086',
  HOST = 'app.example.com',
  OAUTH_ISSUER = 'http://openam.example.com/openam/oauth2',
  OAUTH_KEY,
  OAUTH_SCOPES = 'openid',
  OAUTH_SECRET,
  PORT = 9080,
  PROTOCOL = 'http',
} = process.env;

if (!OAUTH_KEY || !OAUTH_SECRET) {
  console.error('OAuth key and secret are required.');
  return;
}

console.log('Configuration');
console.log('ISSUER:       ' + OAUTH_ISSUER);
console.log('SCOPES:       ' + OAUTH_SCOPES);
console.log('CLIENTID:     ' + OAUTH_KEY);
console.log('GATEWAY_URL:     ' + GATEWAY_URL);

const baseUrl = PROTOCOL + '://' + HOST + (PORT !== 80 ? ':' + PORT : '') + '/';

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

    const app = appFactory(
      baseUrl,
      GATEWAY_URL,
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
