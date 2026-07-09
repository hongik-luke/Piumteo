# FE Security Notes

## Current Auth Model

- The current backend auth contract is `Authorization: Bearer {accessToken}`.
- The frontend stores the access token in localStorage for now.
- This is intentionally not converted to HttpOnly cookie auth in the current MVP scope.

## LocalStorage Policy

- Persist only the values needed to restore the logged-in client state:
  - `userId`
  - `nickname`
  - `role`
  - `accessToken`
- Do not persist email, password, raw API responses, or debug data.
- Remove the stored auth session on logout and on API auth-expired events.

## XSS Guardrails

- Do not log `accessToken`, `Authorization`, or raw auth responses.
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
