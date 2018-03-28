# export OAUTH_ISSUER=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2
# export OAUTH_AUTH_ENDPOINT=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2/authorize
# export OAUTH_TOKEN_ENDPOINT=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2/access_token
# export OAUTH_USERINFO_ENDPOINT=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2/userinfo
# export OAUTH_JWKS_URI=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2/connect/jwk_uri
# export OAUTH_KEY=$1
# export OAUTH_SECRET=$2

export OAUTH_ISSUER=https://accounts.google.com
export OAUTH_AUTH_ENDPOINT=https://accounts.google.com/o/oauth2/v2/auth
export OAUTH_TOKEN_ENDPOINT=https://www.googleapis.com/oauth2/v4/token
export OAUTH_USERINFO_ENDPOINT=https://www.googleapis.com/oauth2/v3/userinfo
export OAUTH_JWKS_URI=https://www.googleapis.com/oauth2/v3/certs
export OAUTH_KEY=$1
export OAUTH_SECRET=$2

echo Starting server
npm start