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
