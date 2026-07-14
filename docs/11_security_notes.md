# FE Security Notes

## Current Auth Model

- The current backend auth contract is an `accessToken` HttpOnly Cookie.
- The frontend must not store or read the JWT access token.
- The frontend includes cookies on API requests through the shared API client.

## LocalStorage Policy

- Do not persist access tokens in localStorage or sessionStorage.
- Non-sensitive UI preferences such as guest key, location consent, and last map view may remain in localStorage.
- Restore logged-in state with `GET /api/auth/me`.

## XSS Guardrails

- Do not log `accessToken`, Cookie headers, Authorization headers, or raw auth responses.
- Do not use `dangerouslySetInnerHTML` for comments, place names, descriptions, nicknames, or server messages.
- Render user-generated text as React text nodes so it is escaped by React.
- Avoid adding third-party scripts outside the explicit map SDK and build tooling needs.

## CSP Deployment Recommendation

Do not add a CSP meta tag in `index.html` for this project. Configure CSP as deployment headers so it can be changed per environment.

Recommended starting point for staging:

```http
Content-Security-Policy:
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  script-src 'self' https://oapi.map.naver.com;
  connect-src 'self' https://*.naver.com https://*.naver.net https://*.ncloud.com;
  img-src 'self' data: blob: https://*.pstatic.net https://*.naver.com;
  style-src 'self' 'unsafe-inline';
```

Before production, verify the exact Naver Maps domains in the browser network panel and tighten `connect-src` and `img-src` to the observed hosts.
