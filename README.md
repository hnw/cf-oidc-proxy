# cf-oidc-proxy
A reverse proxy on Cloudflare Workers that provides OpenID Connect authentication.

## Development

Edit `.dev.vars`

```
OIDC_AUTH_SECRET = <JWT secret (at least 32 letters)>
OIDC_ISSUER = <OpenID issuer URL>
OIDC_CLIENT_ID = <client id>
OIDC_CLIENT_SECRET = <client secret>
```

```
npm install
npm run dev
```

## Deploy

```
wrangler secret put OIDC_AUTH_SECRET
wrangler secret put OIDC_ISSUER
wrangler secret put OIDC_CLIENT_ID
wrangler secret put OIDC_CLIENT_SECRET
```

```
npm run deploy
```
