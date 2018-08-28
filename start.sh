export GATEWAY_URL=$1
export HOST=localhost
export OAUTH_ISSUER=$2
export OAUTH_KEY=$3
export OAUTH_SCOPES="openid profile api.forgecloud.com:user.read"
export OAUTH_SECRET=$4

echo Starting server
npm start