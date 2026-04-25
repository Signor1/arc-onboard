"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { ExternalLink, Eye, EyeOff } from "lucide-react";

export function StepApiKey() {
  const { apiKey, set, next, prev } = useWizard();
  const [show, setShow] = useState(false);
  const valid = /^.+_API_KEY:[a-z0-9]+:[a-z0-9]+$/i.test(apiKey.trim());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paste your API key</h1>
        <p className="text-muted-foreground mt-1">
          Get a Standard API key from the Circle Console, then paste it below.
        </p>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-sm space-y-2">
        <div className="font-medium">Where to get one</div>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>
            Open{" "}
            <a
              href="https://console.circle.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline inline-flex items-center gap-1"
            >
              console.circle.com/api-keys
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>Click <strong>Create a key</strong> → choose <strong>API key</strong> → <strong>Standard Key</strong></li>
          <li>Copy the key (it starts with <code className="font-mono">TEST_API_KEY:</code> or <code className="font-mono">LIVE_API_KEY:</code>)</li>
        </ol>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">Circle API key</Label>
        <div className="flex gap-2">
          <Input
            id="apiKey"
            type={show ? "text" : "password"}
            placeholder="TEST_API_KEY:..."
            value={apiKey}
            onChange={(e) => set({ apiKey: e.target.value.trim() })}
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShow((v) => !v)}
            aria-label="toggle visibility"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {apiKey && !valid && (
          <p className="text-xs text-amber-500">
            That doesn't look like a Circle API key. Expected format:{" "}
            <code className="font-mono">PREFIX_API_KEY:xxxx:yyyy</code>.
          </p>
        )}
      </div>

      <FooterNav onPrev={prev} onNext={next} nextDisabled={!valid} />
    </div>
  );
}
