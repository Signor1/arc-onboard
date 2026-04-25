"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { generateEntitySecretHex } from "@/lib/crypto";
import { downloadText, shorten } from "@/lib/utils";
import { Copy, Download, RefreshCw, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function StepEntitySecret() {
  const { entitySecret, set, next, prev } = useWizard();
  const [savedAck, setSavedAck] = useState(false);

  const generate = () => {
    set({ entitySecret: generateEntitySecretHex() });
    setSavedAck(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(entitySecret);
    toast.success("Entity secret copied");
  };

  const download = () => {
    downloadText(
      `circle-entity-secret-${new Date().toISOString().slice(0, 10)}.txt`,
      `# Circle entity secret (32-byte hex)\n# Generated ${new Date().toISOString()}\n# Treat this like a private key.\n\n${entitySecret}\n`
    );
    toast.success("Saved entity secret to your downloads");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Generate an entity secret
        </h1>
        <p className="text-muted-foreground mt-1">
          A 32-byte private key that secures every wallet you create. Generated
          locally with <code className="font-mono">crypto.getRandomValues</code>
          .
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {!entitySecret ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <KeyRound className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground max-w-sm">
                Click below to generate a fresh 32-byte entity secret. It never
                leaves this browser unencrypted.
              </p>
              <Button onClick={generate}>Generate entity secret</Button>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-xs uppercase text-muted-foreground">
                  Your entity secret
                </Label>
                <div className="font-mono text-xs bg-muted p-3 rounded-md break-all mt-1">
                  {entitySecret}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Preview: {shorten(entitySecret, 8, 6)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={copy}>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button variant="secondary" size="sm" onClick={download}>
                  <Download className="h-3.5 w-3.5" /> Download .txt
                </Button>
                <Button variant="ghost" size="sm" onClick={generate}>
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </Button>
              </div>

              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <strong className="text-amber-700 dark:text-amber-200">
                  Save it now.
                </strong>{" "}
                If you lose it, you lose access to every wallet it creates.
                Store it in a password manager. Circle never stores it for you.
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="ack"
                  checked={savedAck}
                  onCheckedChange={(v) => setSavedAck(v === true)}
                />
                <Label htmlFor="ack" className="leading-relaxed">
                  I have saved this entity secret somewhere safe.
                </Label>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!entitySecret || !savedAck}
      />
    </div>
  );
}
