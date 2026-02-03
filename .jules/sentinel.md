## 2024-05-24 - Secrets Leaked in Logs
**Vulnerability:** API keys and sensitive environment variables were being explicitly logged to the console in `app/(tabs)/chatbot.tsx` using `console.log`. Additionally, full error objects were being logged, which could expose request headers containing the Authorization bearer token.
**Learning:** Developers sometimes add logging for debugging purposes (to verify env vars are loaded) but forget to remove them before committing. Also, logging full error objects from libraries like Axios is dangerous as they contain the request configuration including secrets.
**Prevention:** Never log `process.env` values or full error objects. Use specific error properties like `error.message`. Implement linting rules or pre-commit hooks to scan for `console.log` usage or specific patterns resembling secret logging.

## 2024-05-24 - PHI Leaked in Logs
**Vulnerability:** Personal Health Information (PHI) such as menstruation cycle dates, symptoms, and notes were being explicitly logged to the console in `app/(tabs)/index.tsx` via `console.log('Logging entry:', entry)`.
**Learning:** Debugging logs that print full data objects can inadvertently expose sensitive user data, which is a critical privacy violation, especially for health apps.
**Prevention:** Strictly enforce a "no console.log" policy for production code. Use a logging service that scrubs sensitive data or ensure logs are stripped during the build process.

## 2026-01-10 - Unverified Model Download Integrity
**Vulnerability:** The AI model (800MB) was downloaded from a remote URL without any integrity verification (checksum or file size). This exposed the app to corrupted downloads (causing crashes) or potential man-in-the-middle attacks replacing the model.
**Learning:** Relying on HTTPS alone is insufficient for large binary assets, especially when the file can be partially downloaded (network interruption) and appear "exists" to the filesystem check.
**Prevention:** Always verify the integrity of downloaded binaries using a checksum (SHA256/MD5) or at least an exact file size check before loading them.

## 2026-01-16 - PHI Remanence in Cache
**Vulnerability:** When importing a backup file, `DocumentPicker` with `copyToCacheDirectory: true` created a temporary copy of the file containing sensitive PHI. This file was not deleted after processing, leaving plain text health data in the cache directory indefinitely.
**Learning:** Utilities like `DocumentPicker` often cache files by default. If these files contain sensitive data, relying on the OS to eventually clear the cache is insufficient for privacy compliance (like HIPAA/GDPR).
**Prevention:** Always wrap file operations involving sensitive data in a `try...finally` block that explicitly deletes the temporary file using `FileSystem.deleteAsync`, regardless of success or failure.

## 2026-01-20 - LLM Prompt Injection via Special Tokens
**Vulnerability:** The `sanitizePromptInput` function only redacted role keywords like "System:", but allowed Llama 3 special tokens (e.g., `<|start_header_id|>`) to pass through. This allowed users to inject fake role headers and potential instructions into the prompt structure.
**Learning:** Simple string replacement is insufficient for modern LLMs which rely on specific control tokens for structure. Security mechanisms must account for the specific tokenization scheme of the model in use.
**Prevention:** Explicitly strip known special tokens (like `<|start_header_id|>`, `<|eot_id|>`) from user input before constructing the prompt.

## 2026-02-05 - DoS via Large File Import
**Vulnerability:** The app read the entire backup file into memory using `FileSystem.readAsStringAsync` without checking its size, allowing attackers (or accidental users) to crash the app (OOM) with large files.
**Learning:** `FileSystem.readAsStringAsync` is dangerous for untrusted files without size checks. Always check `fileInfo.size` first.
**Prevention:** Enforce `MAX_BACKUP_FILE_SIZE` check using `FileSystem.getInfoAsync` before reading file content.

## 2026-02-12 - Insecure Android Backup of Health Data
**Vulnerability:** The Android configuration allowed automatic OS backups (`android:allowBackup="true"`), enabling extraction of unencrypted sensitive health data from `AsyncStorage` via ADB or cloud backups.
**Learning:** Default framework configurations (like React Native/Expo defaults) often prioritize convenience over security. For health/finance apps, sticking to defaults for data backup is a privacy risk.
**Prevention:** Explicitly disable backup (`android:allowBackup="false"`) or use `android:fullBackupContent` to exclude sensitive databases if `SecureStore` is not used.

## 2026-02-18 - PHI in Memory (Cache Clearing)
**Vulnerability:** Sensitive PHI stored in in-memory cache variable (`cachedEntries`) remained in RAM when the app was backgrounded, posing a risk of memory scraping or forensic analysis if the device is compromised while running the app.
**Learning:** Even if data is protected at rest, data in memory is often overlooked. Mobile apps should practice "Memory Hygiene" by clearing sensitive buffers when not in use or when the app is not active.
**Prevention:** Listen to `AppState` changes and explicitly wipe sensitive in-memory caches when the app transitions to the `background` state.
