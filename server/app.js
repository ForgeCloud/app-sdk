'use strict';

module.exports = (baseUrl, amUrl, issuer, scopes, key, secret) => {
  const express = require('express');
  const exphbs = require('express-handlebars');
  const http = require('http');
  const path = require('path');
  const session = require('express-session');
  const app = express();

  const clientDir = path.join(__dirname, '../client');

  app.use(session({ secret: 'secret ponies' }));
  app.use(express.static(path.join(clientDir, 'static')));
  app.engine(
    '.hbs',
    exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: {
        json: (obj) => JSON.stringify(obj, null, 2),
      },
      layoutsDir: path.join(clientDir, 'views/layouts/'),
      partialsDir: path.join(clientDir, 'views/partials/'),
    }),
  );
  app.set('view engine', '.hbs');
  app.set('views', path.join(clientDir, 'views/'));

  app.get('/', async (req, res) => {
    if (!req.session.idToken) {
      return login(res);
    }

    res.render('info', { amUrl });
  });

  app.get('/callback', (req, res) => {
    log('callback params %j', req.query);

    const client = getClient();

    client
      .authorizationCallback(baseUrl + 'callback', req.query)
      .then((tokenSet) => {
        log('Received and validated tokens %j', tokenSet);
        log('Validated id_token claims %j', tokenSet.claims);

        client
          .userinfo(tokenSet.access_token)
          .then(function(user) {
            log('userinfo %j', user);
            req.session.idToken = tokenSet.id_token;
            res.redirect('/');
          })
          .catch(function(err) {
            res.end('Access error ' + err);
          });
      })
      .catch((err) => {
        res.end('Auth error ' + err);
      });
  });

  app.get('/logout', (req, res) => {
    if (req.session.idToken) {
      const endSessionUrl = `${issuer.end_session_endpoint}?id_token_hint=${
        req.session.idToken
      }&post_logout_redirect_uri=${baseUrl}`;
      req.session.idToken = undefined;
      res.redirect(endSessionUrl);
    } else {
      res.redirect('/');
    }
  });

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

  function getClient() {
    return new issuer.Client({
      client_id: key,
      client_secret: secret,
    });
  }

  function login(res) {
    const authz = getClient().authorizationUrl({
      claims: {
        id_token: { email_verified: null },
        userinfo: { sub: null, email: null },
      },
      redirect_uri: baseUrl + 'callback',
      scope: scopes,
    });
    log(`Redirecting to ${authz}`);
    res.redirect(authz);
  }

  const server = http.createServer(app);
  server.on('error', onError);

  return server;
};
