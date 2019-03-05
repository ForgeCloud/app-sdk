const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const ParseResponse = require('./parse-response');
const { OPEN_AM } = require('../config');

module.exports = { authenticate, getAppAccessToken };

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

function getAppAccessToken(scope, token) {
  const host = OPEN_AM.split('//')[1];
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('scope', scope);

  return fetch(`${OPEN_AM}/oauth2/access_token`, {
    body: params,
    headers: {
      'Accept-Api-Version': 'resource=2.0, protocol=1.0',
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: host,
      // 'Set-Cookie': 'iPlanetDirectoryPro=0;session-jwt=0;amlbcookie=0',
    },
    method: 'POST',
  })
    .then(ParseResponse)
    .then(({ payload }) => payload)
    .catch((err) => {
      console.log('access token err:', err);
      throw err;
    });
}
