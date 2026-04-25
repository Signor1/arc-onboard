"use client";

import { useWizard } from "@/lib/store";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg =
      (json as { error?: string })?.error ??
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return json as T;
}

function redact(body: Record<string, unknown>) {
  const out = { ...body };
  if (typeof out.apiKey === "string") {
    out.apiKey = `${(out.apiKey as string).slice(0, 12)}…`;
  }
  if (typeof out.entitySecret === "string") {
    out.entitySecret = "[redacted]";
  }
  return out;
}

export async function callApi<T>(
  label: string,
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const ts = Date.now();
  try {
    const response = await postJson<T>(path, body);
    useWizard.getState().pushLog({
      id,
      ts,
      label,
      request: redact(body),
      response,
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    useWizard.getState().pushLog({
      id,
      ts,
      label,
      request: redact(body),
      error: message,
    });
    throw err;
  }
}
