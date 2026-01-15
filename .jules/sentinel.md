## 2024-05-24 - Secrets Leaked in Logs
**Vulnerability:** API keys and sensitive environment variables were being explicitly logged to the console in `app/(tabs)/chatbot.tsx` using `console.log`. Additionally, full error objects were being logged, which could expose request headers containing the Authorization bearer token.
**Learning:** Developers sometimes add logging for debugging purposes (to verify env vars are loaded) but forget to remove them before committing. Also, logging full error objects from libraries like Axios is dangerous as they contain the request configuration including secrets.
**Prevention:** Never log `process.env` values or full error objects. Use specific error properties like `error.message`. Implement linting rules or pre-commit hooks to scan for `console.log` usage or specific patterns resembling secret logging.

## 2024-05-24 - PHI Leaked in Logs
**Vulnerability:** Personal Health Information (PHI) such as menstruation cycle dates, symptoms, and notes were being explicitly logged to the console in `app/(tabs)/index.tsx` via `console.log('Logging entry:', entry)`.
**Learning:** Debugging logs that print full data objects can inadvertently expose sensitive user data, which is a critical privacy violation, especially for health apps.
**Prevention:** Strictly enforce a "no console.log" policy for production code. Use a logging service that scrubs sensitive data or ensure logs are stripped during the build process.

## 2025-05-01 - Client-Side API Key Exposure
**Vulnerability:** The application was calling the OpenAI API directly from the client using `EXPO_PUBLIC_API_KEY`. This exposed the secret key to anyone capable of inspecting the app's bundle or network traffic.
**Learning:** Client-side apps cannot keep secrets. Any key stored in the frontend code is considered public.
**Prevention:** Transitioned to a Local LLM (`llama.rn`) running on-device. This removes the need for API keys entirely and ensures user data (prompts) never leaves the device, providing superior privacy and security.
