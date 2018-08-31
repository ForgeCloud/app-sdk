# ForgeRock SaaS: Client Application SDK

## Overview

This is a sample Node.js application that authenticates with an OAuth provider using [openid-client](https://www.npmjs.com/package/openid-client).

## Setup

First, create a web app in your ForgeRock SaaS adminstration UI (or via the API). Set the following configuration:

- Login Redirect URL Whitelist: `http://localhost:9080/callback`

Click the **Create Application** button. **Be sure to capture the generated secret,** since it is unrecoverable and will not be shown again.

Now install dependencies and run this sample application:

```bash
npm i
sh start.sh {tenant name} {client id} {secret}
```

## Configuration

| Environment Variable | Default                                     |
| -------------------- | ------------------------------------------- |
| GATEWAY_URL          | http://localhost:8086                       |
| HOST                 | app.example.com                             |
| OAUTH_ISSUER         | http://openam.example.com/openam/oauth2     |
| OAUTH_SCOPES         | openid profile api.forgecloud.com:user.read |
| OAUTH_KEY            | None                                        |
| OAUTH_SECRET         | None                                        |
