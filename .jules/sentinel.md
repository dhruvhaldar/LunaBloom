## 2024-05-24 - Secrets Leaked in Logs
**Vulnerability:** API keys and sensitive environment variables were being explicitly logged to the console in `app/(tabs)/chatbot.tsx` using `console.log`. Additionally, full error objects were being logged, which could expose request headers containing the Authorization bearer token.
**Learning:** Developers sometimes add logging for debugging purposes (to verify env vars are loaded) but forget to remove them before committing. Also, logging full error objects from libraries like Axios is dangerous as they contain the request configuration including secrets.
**Prevention:** Never log `process.env` values or full error objects. Use specific error properties like `error.message`. Implement linting rules or pre-commit hooks to scan for `console.log` usage or specific patterns resembling secret logging.

## 2024-05-24 - PHI Leaked in Logs
**Vulnerability:** Personal Health Information (PHI) such as menstruation cycle dates, symptoms, and notes were being explicitly logged to the console in `app/(tabs)/index.tsx` via `console.log('Logging entry:', entry)`.
**Learning:** Debugging logs that print full data objects can inadvertently expose sensitive user data, which is a critical privacy violation, especially for health apps.
**Prevention:** Strictly enforce a "no console.log" policy for production code. Use a logging service that scrubs sensitive data or ensure logs are stripped during the build process.
