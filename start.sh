export OAUTH_ISSUER=http://openam.fr-saas-hog.forgeblocks.com/openam/oauth2
export OAUTH_KEY=$1
export OAUTH_SCOPES="openid profile"
export OAUTH_SECRET=$2

echo Starting server
npm start