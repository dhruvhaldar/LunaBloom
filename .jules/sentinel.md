## 2024-05-24 - Secrets Leaked in Logs
**Vulnerability:** API keys and sensitive environment variables were being explicitly logged to the console in `app/(tabs)/chatbot.tsx` using `console.log`. Additionally, full error objects were being logged, which could expose request headers containing the Authorization bearer token.
**Learning:** Developers sometimes add logging for debugging purposes (to verify env vars are loaded) but forget to remove them before committing. Also, logging full error objects from libraries like Axios is dangerous as they contain the request configuration including secrets.
**Prevention:** Never log `process.env` values or full error objects. Use specific error properties like `error.message`. Implement linting rules or pre-commit hooks to scan for `console.log` usage or specific patterns resembling secret logging.

## 2024-05-24 - PHI Data Leaked in Logs
**Vulnerability:** Sensitive Personal Health Information (PHI) including menstruation dates, symptoms, and notes was being logged to the console in `app/(tabs)/index.tsx`.
**Learning:** While `console.log` is useful for debugging, logging entire data objects containing user health data violates privacy standards and can leak sensitive information in production logs or to other apps reading logcat/syslog.
**Prevention:** Strictly avoid logging objects that may contain PHI. If debugging is necessary, log only non-sensitive identifiers or remove the logs before committing. Code reviews must specifically check for logging of sensitive data structures.
