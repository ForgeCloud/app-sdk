'use strict';

const { OAUTH_KEY, OAUTH_SECRET } = process.env;

module.exports = (baseUrl, issuer) => {
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
      res.render('user', { user: req.session.user });
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
      scope: 'openid profile',
    });
    log(`Redirecting to ${authz}`);
    res.redirect(authz);
  });

  app.get('/callback', (req, res) => {
    log('callback params %j', req.query);

    const client = getClient();

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
      client_id: OAUTH_KEY,
      client_secret: OAUTH_SECRET,
    });
  }

  return server;
};
