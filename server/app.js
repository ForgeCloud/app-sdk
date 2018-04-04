'use strict';

module.exports = (baseUrl, issuer, scopes, profileEndpoint, key, secret) => {
  const express = require('express');
  const exphbs = require('express-handlebars');
  const http = require('http');
  const session = require('express-session');
  const app = express();

  app.use(session({ secret: 'secret ponies' }));
  app.use(express.static('client/static'));
  app.engine(
    '.hbs',
    exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: {
        json: (obj) => JSON.stringify(obj, null, 2),
      },
      layoutsDir: 'client/views/layouts/',
      partialsDir: 'client/views/partials/',
    }),
  );
  app.set('view engine', '.hbs');
  app.set('views', 'client/views/');

  app.get('/', (req, res) => {
    if (req.session.user) {
      res.redirect('/user');
    } else {
      res.redirect('/login');
    }
  });

  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
  });

  app.get('/user', (req, res) => {
    if (req.session.user) {
      res.render('user', { raw: req.session.raw, user: req.session.user });
    } else {
      res.redirect('/login');
    }
  });

  app.post('/login', (req, res) => {
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
  });

  app.get('/callback', (req, res) => {
    log('callback params %j', req.query);

    getClient()
      .authorizationCallback(baseUrl + 'callback', req.query)
      .then((tokenSet) => {
        log('Received and validated tokens %j', tokenSet);
        log('Validated id_token claims %j', tokenSet.claims);

        const fetch = require('node-fetch');

        fetch(profileEndpoint, {
          headers: {
            access_token: tokenSet.access_token,
          },
        })
          .then((res) => res.text())
          .then((text) => {
            var data = JSON.parse(text);
            req.session.raw = data;
            req.session.user = data.length ? data[0] : null;
            log('userinfo %j', req.session.user);
            res.redirect('/user');
          })
          .catch((err) => {
            res.end('Access error ' + err);
          });
      })
      .catch((err) => {
        res.end('Auth error ' + err);
      });
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

  function getClient() {
    return new issuer.Client({
      client_id: key,
      client_secret: secret,
    });
  }

  return server;
};
