# ForgeRock SaaS: Client Application SDK

## Overview

This is a sample Node.js application that authenticates with an OAuth provider using [openid-client](https://www.npmjs.com/package/openid-client).

## AM Setup

**Configure the OAuth Provider**

1.  Log in to the AM instance and click the **Top Level Realm** card on the Dashboard
1.  Click **Configure OAuth Provider**, then **Configure OpenID Connect**
1.  Click the **Create** button in the upper-right corner of the page to accept the default settings

**Add the OAuth Client**

1.  Select **Applications** > **OAuth 2.0** from the left menu, then click **Add Client**
1.  Enter the **Client ID** and **Client Secret** you'll use for the sample application
1.  Enter `http://localhost:9080/callback` for the **Redirection URIs** \*
1.  Add desired scopes (e.g. "openid", "profile", etc)
1.  On the **OpenID Connect** tab, enter `http://localhost:9080/` for the **Post Logout Redirect URIs** \*
1.  Click the **Create** button

\* Adjust the port number to match your configuration

**Enable Self-Registration (Optional)**

1.  Select **Services** from the left menu, then click **Add a Service**
1.  Select service type **User Self-Service**
1.  Enter the **Encryption Key Pair Alias** and **Signing Secret Key Alias** values
1.  On the **User Registration** tab, disable **Email Verification**
1.  Refer to the [AM documentation](https://ea.forgerock.com/docs/am/user-self-service-guide/index.html#chap-uss-implementation) for details

## Configuration

| Environment Variable | Default                                     |
| -------------------- | ------------------------------------------- |
| GATEWAY_URL          | http://localhost:8086                       |
| HOST                 | app.example.com                             |
| OAUTH_ISSUER         | http://openam.example.com/openam/oauth2     |
| OAUTH_SCOPES\*       | openid profile api.forgecloud.com:user.read |
| OAUTH_KEY            | None                                        |
| OAUTH_SECRET         | None                                        |

\* Scopes should be specified as space-delimited values matching what's configured in AM for your client

## Running the App

When you initially set up the app, first install dependencies via npm.

```bash
npm i
```

Use the `start.sh` script to set environment variables before starting the app server.

```bash
sh ./start.sh {GATEWAY_URL} {OAUTH URL} {APP ID} {APP SECRET}
```
