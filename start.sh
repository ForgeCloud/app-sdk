export PROFILE_ENDPOINT=http://private-anon-79356d9ac2-kaforgerockmanagementapi.apiary-mock.com/v1/users/2819c223-7f76-453a-919d-413861904646
export OAUTH_ISSUER=http://openam.house-of-gordon-am.forgeblocks.com/openam/oauth2
export OAUTH_KEY=$1
export OAUTH_SCOPES="openid profile"
export OAUTH_SECRET=$2

echo Starting server
npm start