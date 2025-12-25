## 2024-05-24 - Secrets Leaked in Logs
**Vulnerability:** API keys and sensitive environment variables were being explicitly logged to the console in `app/(tabs)/chatbot.tsx` using `console.log`. Additionally, full error objects were being logged, which could expose request headers containing the Authorization bearer token.
**Learning:** Developers sometimes add logging for debugging purposes (to verify env vars are loaded) but forget to remove them before committing. Also, logging full error objects from libraries like Axios is dangerous as they contain the request configuration including secrets.
**Prevention:** Never log `process.env` values or full error objects. Use specific error properties like `error.message`. Implement linting rules or pre-commit hooks to scan for `console.log` usage or specific patterns resembling secret logging.

## 2024-05-24 - Sensitive User Data (PHI) Leaked in Logs
**Vulnerability:** Full user objects containing menstruation data (PHI) were being logged to the console in `app/(tabs)/index.tsx` and `app/(tabs)/insights.tsx`. This violates privacy standards by exposing sensitive health information in logs.
**Learning:** Debugging logs often include full object dumps to inspect state, but these must be removed before production. PHI requires stricter handling than regular user data.
**Prevention:** Establish a strict policy against logging full data objects. Use dedicated logger utilities that can strip sensitive fields or strictly forbid `console.log` in production builds.
