# ForgeRock SaaS: Client Application SDK

## Overview

This is a sample Node.js application that implements an OAuth flow with Google using [openid-client](https://www.npmjs.com/package/openid-client). We'll eventually use this to demonstrate OAuth with AM when the integration details are available.

## Google Setup

The basics are listed below. See [here](https://developers.google.com/identity/protocols/OpenIDConnect) for full information. In the [Google Developer Console](https://console.developers.google.com/apis/dashboard):

1.  Create a new set of **OAuth Client ID** credentials for **Web Application**
1.  Set your **Authorized Redirect URI** to match your desired host and port, and use a path of `/callback` (e.g. http://localhost:8100/callback)
1.  Complete the form to generate a client key and secret

Configure the following environment variables. Only the key and secret are required.

| Environment Variable | Default                                 |
| -------------------- | --------------------------------------- |
| OAUTH_ISSUER         | http://openam.example.com/openam/oauth2 |
| OAUTH_KEY            | None                                    |
| OAUTH_SECRET         | None                                    |

Now run `npm start` and view the site in a browser.

Alternatively, use the `start.sh` script to set environment variables before starting the app server. Specify your app ClientID and Key as arguments. E.g.

```bash
sh start.sh my-client-id my-app-secret
```

## Next Steps

1.  Test against brand new AM instance.
