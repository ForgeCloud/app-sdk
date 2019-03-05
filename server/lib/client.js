const { CLIENT_ID, CLIENT_SECRET } = require('../config');

let client;

module.exports = (issuer) => {
  if (!client) {
    client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      id_token_signed_response_alg: 'HS256',
    });
    client.CLOCK_TOLERANCE = 5;
  }
  return client;
};
