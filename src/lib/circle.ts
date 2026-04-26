// Server-only wrapper that constructs a fresh SDK client per request.
// Credentials arrive in the request body, are used in-process, and discarded.
import "server-only";
import {
  initiateDeveloperControlledWalletsClient,
  registerEntitySecretCiphertext,
} from "@circle-fin/developer-controlled-wallets";

export function client(apiKey: string, entitySecret: string) {
  return initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });
}

// HEADS UP: The Circle SDK writes a copy of the recovery file to the server's
// current working directory as a side effect of registration (file name
// `recovery_file_<timestamp>.dat`). When you run `pnpm dev`, that's the
// project root. The browser also receives the file contents in the response
// and forces a download — so the user always gets a copy they can save
// wherever they want — but the on-disk copy still lands here.
//
// We surface this prominently in the UI (see steps/register.tsx). The
// project's .gitignore covers `*.dat` and `recovery*` so the file cannot be
// accidentally committed; the user is responsible for deleting / moving the
// file to secure storage after the wizard run.
//
// Don't try to redirect the path or silently delete the file — both have
// caused the SDK call to fail in testing.
export async function registerSecret(apiKey: string, entitySecret: string) {
  return registerEntitySecretCiphertext({ apiKey, entitySecret });
}

export function redactError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}
