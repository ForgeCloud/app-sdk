export TENANT=$1
export CLIENT_ID=$2
export CLIENT_SECRET=$3
export ORG_GATEWAY_URL=https://api-$1.forgeblocks.com
export HOST=localhost
export OAUTH_ISSUER=https://openam-$1.forgeblocks.com/oauth2
export OAUTH_SCOPES="openid me.read"

echo Starting sample application...
npm start
