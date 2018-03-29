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
1.  Enter `http://localhost:8100/callback` for the **Redirection URIs** (adjust the port as necessary)
1.  Add scopes named "openid" and "profile"
1.  Click the **Create** button

## Configuration

| Environment Variable | Default                                 |
| -------------------- | --------------------------------------- |
| OAUTH_ISSUER         | http://openam.example.com/openam/oauth2 |
| OAUTH_KEY            | None                                    |
| OAUTH_SECRET         | None                                    |

## Running the App

Use the `start.sh` script to set environment variables before starting the app server. Specify your app ClientID and Key as arguments. E.g.

```bash
sh start.sh my-client-id my-app-secret
```
