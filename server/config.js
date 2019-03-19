const {
  CLIENT_ID,
  CLIENT_SECRET,
  ORG_GATEWAY_URL = 'http://localhost:8086',
  HOST = 'app.example.com',
  OAUTH_ISSUER = 'https://openam-example.com/oauth2',
  OAUTH_SCOPES = 'openid',
  PORT = 9080,
  PROTOCOL = 'http',
  TENANT = '',
} = process.env;

const BASE_URL = `${PROTOCOL}://${HOST}${PORT == 80 ? '' : `:${PORT}`}`;
const CALLBACK_HOSTED = `${BASE_URL}/callback`;
const CALLBACK_NON_HOSTED = `${BASE_URL}/callback/non-hosted`;
const OPEN_AM = `https://openam-${TENANT}.forgeblocks.com`;

module.exports = {
  CLIENT_ID,
  CLIENT_SECRET,
  BASE_URL,
  CALLBACK_HOSTED,
  CALLBACK_NON_HOSTED,
  ORG_GATEWAY_URL,
  HOST,
  OAUTH_ISSUER,
  OAUTH_SCOPES,
  OPEN_AM,
  PORT,
  PROTOCOL,
  TENANT,
};
