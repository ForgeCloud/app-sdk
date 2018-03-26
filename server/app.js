'use strict';

const {
  GOOGLE_ISSUER = 'https://accounts.google.com',
  GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth',
  GOOGLE_TOKEN_ENDPOINT = 'https://www.googleapis.com/oauth2/v4/token',
  GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo',
  GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs',
  GOOGLE_KEY,
  GOOGLE_SECRET,
} = process.env;

module.exports = (baseUrl) => {
  const express = require('express');
  const http = require('http');
  const session = require('express-session');
  const app = express();
  const Issuer = require('openid-client').Issuer;

  const googleIssuer = new Issuer({
    issuer: GOOGLE_ISSUER,
    authorization_endpoint: GOOGLE_AUTH_ENDPOINT,
    token_endpoint: GOOGLE_TOKEN_ENDPOINT,
    userinfo_endpoint: GOOGLE_USERINFO_ENDPOINT,
    jwks_uri: GOOGLE_JWKS_URI,
  });

  app.use(session({ secret: 'secret ponies' }));

  app.use(express.static('client'));

  app.get('/login/:provider', (req, res) => {
    let client;
    try {
      client = getClient(req.params.provider);
    } catch (err) {
      res.end(err.message);
      return;
    }

    req.session.provider = req.params.provider;

    const authz = client.authorizationUrl({
      claims: {
        id_token: { email_verified: null },
        userinfo: { sub: null, email: null },
      },
      redirect_uri: baseUrl + 'callback',
      scope: 'openid',
    });
    log(`Redirecting to ${authz}`);
    res.redirect(authz);
  });

  app.get('/callback', (req, res) => {
    log('callback params %j', req.query);

    let client;
    try {
      client = getClient(req.session.provider);
    } catch (err) {
      res.end(err.message);
      return;
    }

    client
      .authorizationCallback(baseUrl + 'callback', req.query)
      .then(function(tokenSet) {
        log('received and validated tokens %j', tokenSet);
        log('validated id_token claims %j', tokenSet.claims);

        client
          .userinfo(tokenSet.access_token)
          .then(function(user) {
            req.session.user = user;
            log('userinfo %j', user);
            res.redirect('/user');
          })
          .catch(function(err) {
            res.end('Access error ' + err);
          });
      })
      .catch(function(err) {
        res.end('Auth error ' + err);
      });
  });

  app.get('/user', (req, res) => {
    if (!req.session.user) {
      res.redirect('/login');
      return;
    }

    res.send(
      `<p>Hello ${req.session.user.name}</p><a href="logout">Log out</a>`,
    );
  });

  app.get('/login', (req, res) => {
    res.send(
      '<a href="login/google">Google</a> | <a href="login/forgerock">ForgeRock</a>',
    );
  });

  app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
  });

  const server = http.createServer(app);
  server.on('error', onError);

  function onError(error) {
    log(`Error: ${error}`);
  }

  function log(msg, options) {
    console.log('=============================');
    if (options) {
      console.log(msg, options);
    } else {
      console.log(msg);
    }
  }

  function getClient(provider) {
    switch (provider) {
      case 'google':
        return new googleIssuer.Client({
          client_id: GOOGLE_KEY,
          client_secret: GOOGLE_SECRET,
        });
      case 'forgerock':
        throw new Error('ForgeRock is not implemented');
      default:
        throw new Error("Unsupported provider '" + provider + "'");
    }
  }

  return server;
};
