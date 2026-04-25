"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { MODE } from "@/lib/mode";
import { ShieldCheck, Globe, Server } from "lucide-react";

export function StepDisclaimer() {
  const next = useWizard((s) => s.next);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Arc Onboard
        </h1>
        <p className="text-muted-foreground mt-1">
          A guided wizard for setting up Circle dev-controlled wallets on Arc
          Testnet — entity secret, wallet set, and a funded wallet ready for
          your first transfer.
        </p>
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security model
          </CardTitle>
          <CardDescription>
            How your credentials are handled in this session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {MODE === "local" ? (
            <div className="flex gap-3">
              <Server className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <div className="font-medium">Running locally on your machine.</div>
                <p className="text-muted-foreground mt-1">
                  Your API key and entity secret stay in this browser tab and
                  on your localhost server. They are sent to Circle directly
                  through a Next.js API route running on{" "}
                  <code className="font-mono">127.0.0.1</code>. Nothing is
                  written to disk by this app, and no third-party server sees
                  your credentials.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Globe className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Hosted mode — your credentials never leave your browser.
                </div>
                <p className="text-muted-foreground mt-1">
                  This site does not call Circle on your behalf. The wizard
                  generates your entity secret locally and hands you off to{" "}
                  <a
                    className="underline"
                    href="https://console.circle.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    console.circle.com
                  </a>{" "}
                  for any operation that touches your API key. We are a smart
                  checklist, not a proxy.
                </p>
                <p className="text-muted-foreground mt-2">
                  For maximum security, run this locally instead:
                  <code className="font-mono ml-1">npx arc-onboard</code>.
                </p>
              </div>
            </div>
          )}
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200 text-xs">
            <strong>What we don't do:</strong> store, log, or persist your API
            key, entity secret, or recovery file. They live only in this
            browser tab and disappear when you close it.
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3">
        <Checkbox
          id="agree"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
        />
        <Label htmlFor="agree" className="leading-relaxed">
          I understand the security model above and that I am responsible for
          safeguarding my entity secret and recovery file.
        </Label>
      </div>

      <FooterNav showPrev={false} onNext={next} nextDisabled={!agreed} />
    </div>
  );
}
