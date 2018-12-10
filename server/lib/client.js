const { OAUTH_KEY, OAUTH_SECRET } = require('../config');

let client;

module.exports = (issuer) => {
  if (!client) {
    client = new issuer.Client({
      client_id: OAUTH_KEY,
      client_secret: OAUTH_SECRET,
      id_token_signed_response_alg: 'HS256',
    });
    client.CLOCK_TOLERANCE = 5;
  }
  return client;
};
