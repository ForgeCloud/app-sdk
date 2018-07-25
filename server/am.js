const fetch = require('node-fetch');
const resolve = require('url').resolve;
const { AM_URL = 'http://openam.fr-saas-hog.forgeblocks.com' } = process.env;

async function getServerInfo(ssoToken) {
  const path = 'serverinfo/version';
  const headers = {
    'Accept-API-Version': 'resource=1.0',
    //iplanetDirectoryPro: ssoToken,
  };
  const res = await send('GET', path, headers);
  return res.body;
}

async function send(method, path, headers, data) {
  try {
    const absUrl = url(path);

    const defaultHeaders = { Accept: 'application/json' };
    if (data) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const effectiveHeaders = { ...defaultHeaders, ...headers };

    const options = {
      body: data ? JSON.stringify(data) : undefined,
      headers: effectiveHeaders,
      method,
    };

    console.log(`AM ${method}: ${absUrl}`);

    const res = await fetch(absUrl, options);
    const json = await res.json();
    const error = parseError(json);

    return {
      body: error ? undefined : json,
      error: error || undefined,
      status: res.status,
    };
  } catch (error) {
    return {
      body: undefined,
      error: error.message || error.toString(),
      status: 500,
    };
  }
}

function url(path) {
  return resolve(AM_URL, `/openam/json/${path}`);
}

function parseError(res) {
  if (res && res.code && res.message && res.reason) {
    return res.message;
  }
  return null;
}

module.exports = {
  getServerInfo,
};
