"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { generateEntitySecretHex } from "@/lib/crypto";
import { downloadText, shorten, cn } from "@/lib/utils";
import { Copy, Download, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Mode = "generate" | "existing";

export function StepEntitySecret() {
  const { entitySecret, entitySecretSource, set, next, prev } = useWizard();
  // Default the segmented control based on what's already in the store, so a
  // user who came back to this step doesn't have their choice silently flipped.
  const [mode, setMode] = useState<Mode>(
    entitySecretSource === "existing" ? "existing" : "generate"
  );
  const [savedAck, setSavedAck] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setSavedAck(false);
    // Clear any value carried over from the other mode so the user explicitly
    // re-confirms, and the source flag matches what's in `entitySecret`.
    set({ entitySecret: "", entitySecretSource: undefined });
  };

  const isHex64 = /^[0-9a-fA-F]{64}$/.test(entitySecret);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Entity secret
        </h1>
        <p className="text-muted-foreground mt-1">
          A 32-byte private key that secures every wallet on your account.{" "}
          <strong>Pick one path:</strong> generate a brand-new secret, or paste
          one you already have.
        </p>
      </div>

      {/* SEGMENTED MODE TOGGLE */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-md border bg-muted/30">
        <button
          type="button"
          onClick={() => switchMode("generate")}
          className={cn(
            "rounded-md py-2 text-sm font-medium transition-colors",
            mode === "generate"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Generate new
        </button>
        <button
          type="button"
          onClick={() => switchMode("existing")}
          className={cn(
            "rounded-md py-2 text-sm font-medium transition-colors",
            mode === "existing"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          I already have one
        </button>
      </div>

      {mode === "generate" ? (
        <GenerateMode savedAck={savedAck} setSavedAck={setSavedAck} />
      ) : (
        <ExistingMode
          showExisting={showExisting}
          setShowExisting={setShowExisting}
          savedAck={savedAck}
          setSavedAck={setSavedAck}
        />
      )}

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={
          !savedAck ||
          (mode === "generate" && !entitySecret) ||
          (mode === "existing" && !isHex64)
        }
      />
    </div>
  );
}

function GenerateMode({
  savedAck,
  setSavedAck,
}: {
  savedAck: boolean;
  setSavedAck: (b: boolean) => void;
}) {
  const { entitySecret, set } = useWizard();

  const generate = () => {
    set({
      entitySecret: generateEntitySecretHex(),
      entitySecretSource: "generated",
    });
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
    <Card>
      <CardContent className="p-5 space-y-4">
        {!entitySecret ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <KeyRound className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Click below to generate a fresh 32-byte entity secret. Generated
              locally with <code className="font-mono">crypto.getRandomValues</code>
              ; never leaves this browser.
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
                id="ack-gen"
                checked={savedAck}
                onCheckedChange={(v) => setSavedAck(v === true)}
              />
              <Label htmlFor="ack-gen" className="leading-relaxed">
                I have saved this entity secret somewhere safe.
              </Label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ExistingMode({
  showExisting,
  setShowExisting,
  savedAck,
  setSavedAck,
}: {
  showExisting: boolean;
  setShowExisting: (b: boolean) => void;
  savedAck: boolean;
  setSavedAck: (b: boolean) => void;
}) {
  const { entitySecret, set } = useWizard();
  const [touched, setTouched] = useState(false);
  const isHex64 = /^[0-9a-fA-F]{64}$/.test(entitySecret);

  const onChange = (v: string) => {
    setTouched(true);
    set({ entitySecret: v.trim(), entitySecretSource: "existing" });
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Use this if you registered an entity secret on this Circle account
          before — for example, on a previous wizard run or via a teammate&apos;s
          script. Your new API key will work fine with the original entity
          secret.
        </p>

        <div className="space-y-2">
          <Label htmlFor="es-existing">
            Entity secret <span className="text-muted-foreground">(64-char hex)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="es-existing"
              type={showExisting ? "text" : "password"}
              className="font-mono"
              placeholder="abcdef0123…"
              value={entitySecret}
              onChange={(e) => onChange(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowExisting(!showExisting)}
              aria-label="toggle visibility"
            >
              {showExisting ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {touched && entitySecret && !isHex64 && (
            <p className="text-xs text-amber-500">
              Expected exactly 64 hexadecimal characters (the original was 32
              bytes hex-encoded).
            </p>
          )}
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          You should also still have the <strong>recovery file</strong> from
          when you originally registered. If not, generate a fresh one via the
          rotation flow on Circle Console before you ship anything serious.
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="ack-existing"
            checked={savedAck}
            onCheckedChange={(v) => setSavedAck(v === true)}
            disabled={!isHex64}
          />
          <Label htmlFor="ack-existing" className="leading-relaxed">
            This entity secret is already registered on my Circle account, and
            I have it (and its recovery file) stored safely.
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
