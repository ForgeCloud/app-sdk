'use strict';

const { authenticate, getAppAccessToken } = require('./lib/authenticate');
const {
  BASE_URL,
  CALLBACK_HOSTED,
  CALLBACK_NON_HOSTED,
  ORG_GATEWAY_URL,
  PORT,
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
  app.get('/reset-password', resetPasswordPage);
  app.get('/recover-username', recoverUsernamePage);
  app.get('/callback', hostedCallbackHandler);
  app.get('/callback/non-hosted', nonHostedCallbackHandler);
  app.get('/logout', logoutHandler);
  app.post('/signin-hosted', hostedSigninHandler);
  app.post('/signin-non-hosted', nonHostedSigningHandler);
  app.post('/forgot-password', forgotPasswordHandler);
  app.post('/reset-password', resetPasswordHandler);
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

  function resetPasswordPage(req, res) {
    const data = {};
    const { token } = req.query;
    if (!token) {
      data.failure = 'Token required';
    }
    res.render('signin/reset-password', data);
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
    try {
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
    try {
      username = typeof username == 'string' ? username.trim() : undefined;
      email = typeof email == 'string' ? email.trim() : undefined;
      if (!username || !email) {
        throw new Error(
          `${req.status}: Bad Request, username &amp; email required`,
        );
      }

      const resp = {};
      const destinationUrl = `http://localhost:${PORT}/reset-password`;
      const token = await getAppAccessToken('selfservice.reset-password');
      console.log('token', token);

      const url = resolve(ORG_GATEWAY_URL, '/v1/selfservice/reset-password');
      const req = await fetch(url, {
        body: JSON.stringify({ destinationUrl, email, userName: username }),
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!(resp.success = req.ok)) {
        throw new Error(`${req.status}: ${req.statusText}`);
      }
      res.render('signin/forgot-password', { resp });
    } catch (err) {
      console.log(err);
      res.render('signin/forgot-password', {
        resp: { problem: true },
        err,
        userName: username,
        email,
      });
    }
  }

  async function resetPasswordHandler(req, res) {
    try {
      const { token } = req.query;
      if (!token) {
        throw new Error('Token required');
      }

      let { password } = req.body;
      password = typeof password == 'string' ? password.trim() : undefined;
      if (!password) {
        throw new Error('Password required');
      }

      const accessTokenRes = await getAppAccessToken('selfservice.reset-password');
      console.log('accessTokenRes', accessTokenRes);

      const url = resolve(ORG_GATEWAY_URL, `/v1/selfservice/reset-password/${token}`);
      const response = await fetch(url, {
        body: JSON.stringify({ password }),
        headers: {
          Authorization: `Bearer ${accessTokenRes.access_token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      res.render('signin/reset-password', { success: true });
    } catch (err) {
      res.render('signin/reset-password', { failure: err.message });
    }
  }

  async function recoverUsernameHandler(req, res) {
    let { email } = req.body;
    try {
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

      const resp = {};
      const token = await getAppAccessToken('selfservice.recover-username');
      const url = resolve(ORG_GATEWAY_URL, '/v1/selfservice/recover-username');
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
        throw `${req.status}: ${req.statusText}`;
      }
      res.render('signin/recover-username', { resp });
    } catch (err) {
      const resp = { problem: true };
      res.render('signin/recover-username', { resp, err, email });
    }
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
