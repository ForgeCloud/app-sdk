const btoa = require('btoa');

const {
  ORG_GATEWAY_URL = 'http://localhost:8086',
  HOST = 'app.example.com',
  OAUTH_ISSUER = 'https://openam-example.com/oauth2',
  OAUTH_KEY,
  OAUTH_SCOPES = 'openid',
  OAUTH_SECRET,
  PORT = 9080,
  PROTOCOL = 'http',
  TENANT = '',
} = process.env;

const BASE_URL = `${PROTOCOL}://${HOST}${PORT == 80 ? '' : `:${PORT}`}`;
const CALLBACK_HOSTED = `${BASE_URL}/callback`;
const CALLBACK_NON_HOSTED = `${BASE_URL}/callback/non-hosted`;
const OPEN_AM = `https://openam-${TENANT}.forgeblocks.com`;
const OAUTH_ACCESS_TOKEN = btoa(`${OAUTH_KEY}:${OAUTH_SECRET}`);

module.exports = {
  BASE_URL,
  CALLBACK_HOSTED,
  CALLBACK_NON_HOSTED,
  ORG_GATEWAY_URL,
  HOST,
  OAUTH_ACCESS_TOKEN,
  OAUTH_ISSUER,
  OAUTH_KEY,
  OAUTH_SCOPES,
  OAUTH_SECRET,
  OPEN_AM,
  PORT,
  PROTOCOL,
  TENANT,
};
