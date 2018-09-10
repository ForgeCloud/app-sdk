export TENANT=$1
export GATEWAY_URL=https://api-$1.forgeblocks.com
export HOST=localhost
export OAUTH_ISSUER=https://openam-$1.forgeblocks.com/openam/oauth2
export OAUTH_KEY=$2
export OAUTH_SCOPES="openid profile api.forgecloud.com:user.read"
export OAUTH_SECRET=$3

echo Starting sample application...
npm start