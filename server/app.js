'use strict';

const btoa = require('btoa');
const { authenticate, getAppAccessToken } = require('./lib/authenticate');
const {
  BASE_URL,
  CALLBACK_HOSTED,
  CALLBACK_NON_HOSTED,
  OAUTH_ACCESS_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  ORG_GATEWAY_URL,
} = require('./config');

module.exports = (issuer) => {
  const express = require('express');
  const exphbs = require('express-handlebars');
  const fetch = require('node-fetch');
  const http = require('http');
  const path = require('path');
  const resolve = require('url').resolve;
  const session = require('express-session');
  const bodyParser = require('body-parser');
  const app = express();

  const staticDir = path.join(__dirname, '../client');
  const oidcClient = require('./lib/client')(issuer);
  const authorize = require('./lib/authorize')(oidcClient);

  app.use(session({ secret: 'secret ponies' }));
  app.use(express.static(path.join(staticDir, 'static')));
  app.engine(
    '.hbs',
    exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: {
        json: (obj) => JSON.stringify(obj, null, 2),
      },
      layoutsDir: path.join(staticDir, 'views/layouts/'),
      partialsDir: path.join(staticDir, 'views/partials/'),
    }),
  );
  app.set('view engine', '.hbs');
  app.set('views', path.join(staticDir, 'views/'));
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get('/', indexPage);
  app.get('/signin', signinPage);
  app.get('/signin-non-hosted', nonHostedSigninPage);
  app.get('/forgot-password', forgotPasswordPage);
  app.get('/recover-username', recoverUsernamePage);

  app.get('/callback', hostedCallbackHandler);
  app.get('/callback/non-hosted', nonHostedCallbackHandler);
  app.get('/logout', logoutHandler);
  app.post('/signin-hosted', hostedSigninHandler);
  app.post('/signin-non-hosted', nonHostedSigningHandler);
  app.post('/forgot-password', forgotPasswordHandler);
  app.post('/recover-username', recoverUsernameHandler);

  async function indexPage(req, res) {
    if (!req.session.accessToken) {
      return res.redirect('/signin');
    }
    try {
      let user = await getUserInfo(req.session.accessToken);
      res.render('info', { data: user });
    } catch (err) {
      res.render('info', { data: err });
    }
  }

  function nonHostedSigninPage(req, res) {
    res.render('signin/non-hosted', {});
  }

  function nonHostedCallbackHandler(req, res) {
    res.json(req.query);
  }

  function signinPage(req, res) {
    res.render('signin/index', {});
  }

  function forgotPasswordPage(req, res) {
    res.render('signin/forgot-password', {});
  }

  function recoverUsernamePage(req, res) {
    res.render('signin/recover-username', {});
  }

  async function hostedCallbackHandler(req, res) {
    log('callback params %j', req.query);
    try {
      const { access_token, id_token } = await authorize.callback(
        CALLBACK_HOSTED,
        req.query,
      );
      setTokensAndRedirect(req, res, access_token, id_token);
    } catch (err) {
      res.end('Auth error ' + err);
    }
  }

  function logoutHandler(req, res) {
    if (req.session.idToken) {
      const endSessionUrl = `${issuer.end_session_endpoint}?id_token_hint=${
        req.session.idToken
      }&post_logout_redirect_uri=${BASE_URL}`;
      req.session.accessToken = undefined;
      req.session.idToken = undefined;
      res.redirect(endSessionUrl);
    } else {
      res.redirect('/');
    }
  }

  async function nonHostedSigningHandler(req, res) {
    let { password, username } = req.body;
    username = typeof username == 'string' ? username.trim() : undefined;
    password = typeof password == 'string' ? password.trim() : undefined;
    if (!username || !password) {
      return res.render('signin/non-hosted', {
        err: {
          status: 400,
          reason: 'Bad Request',
          help: 'username & password are required',
        },
        username,
        password,
      });
    }
    try {
      const { tokenId } = await authenticate(username, password);
      const authPayload = await authorize.nonHosted(tokenId);
      const { access_token, id_token } = await authorize.callback(
        CALLBACK_NON_HOSTED,
        authPayload,
      );
      setTokensAndRedirect(req, res, access_token, id_token);
    } catch (err) {
      switch (err.reason) {
        case 'Bad Request':
          err.help = 'Ensure your login redirect urls are configured properly';
          err.docs =
            'https://github.com/ForgeCloud/app-sdk/tree/810-authcode#redirect_uris';
          break;
      }
      res.render('signin/non-hosted', { err: err, username, password });
    }
  }

  async function forgotPasswordHandler(req, res) {
    let { username, email } = req.body;
    username = typeof username == 'string' ? username.trim() : undefined;
    email = typeof email == 'string' ? email.trim() : undefined;
    if (!username || !email) {
      return res.render('signin/forgot-password', {
        err: {
          status: 400,
          reason: 'Bad Request',
          help: 'username & email are required',
        },
        username,
        email,
      });
    }

    const clientCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const resp = {};
    const token = await getAppAccessToken(
      'user.reset-password',
      clientCredentials,
    );
    try {
      const url = resolve(ORG_GATEWAY_URL, '/v1/users/reset-password');
      const req = await fetch(url, {
        body: JSON.stringify({ email, userName: username }),
        headers: {
          Authorization: 'Bearer ' + token.access_token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!(resp.success = req.ok)) {
        resp.problem = true;
        throw `${req.status}: ${req.statusText}`;
      }
    } catch (err) {
      res.render('signin/forgot-password', { resp, err, username, email });
      return;
    }
    res.render('signin/forgot-password', { resp });
  }

  async function recoverUsernameHandler(req, res) {
    let { email } = req.body;
    email = typeof email == 'string' ? email.trim() : undefined;
    if (!email) {
      return res.render('signin/recover-username', {
        err: {
          status: 400,
          reason: 'Bad Request',
          help: 'email is required',
        },
        email,
      });
    }

    const clientCredentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const resp = {};
    const token = await getAppAccessToken(
      'user.recover-username',
      clientCredentials,
    );
    try {
      const url = resolve(ORG_GATEWAY_URL, '/v1/users/recover-username');
      const req = await fetch(url, {
        body: JSON.stringify({
          email,
        }),
        headers: {
          Authorization: 'Bearer ' + token.access_token,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!(resp.success = req.ok)) {
        resp.problem = true;
        throw `${req.status}: ${req.statusText}`;
      }
    } catch (err) {
      res.render('signin/recover-username', { resp, err, email });
      return;
    }
    res.render('signin/recover-username', { resp });
  }

  function hostedSigninHandler(req, res) {
    authorize.hosted(res);
  }

  async function getUserInfo(token) {
    const url = resolve(ORG_GATEWAY_URL, '/v1/me');
    const res = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (res.headers.get('Content-Type').startsWith('application/json')) {
      return await res.json();
    } else {
      return await res.text();
    }
  }

  function setTokensAndRedirect(req, res, access_token, id_token) {
    log('access_token: %j', access_token);
    log('id_token: %j', id_token);
    req.session.accessToken = access_token;
    req.session.idToken = id_token;
    res.redirect('/');
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  function log(msg, options) {
    console.log('=============================');
    if (options) {
      console.log(msg, options);
    } else {
      console.log(msg);
    }
  }

  const server = http.createServer(app);
  server.on('error', onError);

  return server;
};
