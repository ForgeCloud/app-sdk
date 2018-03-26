# ForgeRock SaaS: Client Application SDK

## Overview

This is a sample Node.js application that implements an OAuth flow with Google using [openid-client](https://www.npmjs.com/package/openid-client). We'll eventually use this to demonstrate OAuth with AM when the integration details are available.

## Google Setup

The basics are listed below. See [here](https://developers.google.com/identity/protocols/OpenIDConnect) for full information. In the [Google Developer Console](https://console.developers.google.com/apis/dashboard):

1.  Create a new set of **OAuth Client ID** credentials for **Web Application**
1.  Set your **Authorized Redirect URI** to match your desired host and port, and use a path of `/callback` (e.g. http://localhost:8100/callback)
1.  Complete the form to generate a client key and secret

Configure the following environment variables. Only the key and secret are required.

| Environment Variable     | Default                                       |
| ------------------------ | --------------------------------------------- |
| GOOGLE_ISSUER            | https://accounts.google.com                   |
| GOOGLE_AUTH_ENDPOINT     | https://accounts.google.com/o/oauth2/v2/auth  |
| GOOGLE_TOKEN_ENDPOINT    | https://www.googleapis.com/oauth2/v4/token    |
| GOOGLE_USERINFO_ENDPOINT | https://www.googleapis.com/oauth2/v3/userinfo |
| GOOGLE_JWKS_URI          | https://www.googleapis.com/oauth2/v3/certs    |
| GOOGLE_KEY               | None                                          |
| GOOGLE_SECRET            | None                                          |

Now run `npm start` and view the site in a browser.

## Next Steps

1.  Determine how much we want to dress up the SDK examples.
1.  Understand AM OAuth configuration and update this project to support AM.
