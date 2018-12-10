const fetch = require('node-fetch');

const ParseResponse = require('./parse-response');
const { OPEN_AM } = require('../config');

module.exports = authenticate;

function authenticate(username, password) {
  return fetch(`${OPEN_AM}/json/realms/root/authenticate`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept-Api-Version': 'resource=2.0, protocol=1.0',
      'Content-Type': 'application/json',
      'Set-Cookie': 'iPlanetDirectoryPro=0;session-jwt=0;amlbcookie=0',
      'X-Openam-Password': password,
      'X-Openam-Username': username,
    },
  })
    .then(ParseResponse)
    .then(({ payload }) => payload)
    .catch((err) => {
      console.log('authenticate err:', err);
      throw err;
    });
}
