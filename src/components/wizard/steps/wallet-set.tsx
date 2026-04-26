"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, FolderPlus } from "lucide-react";
import { toast } from "sonner";

type Resp = { walletSet: { id: string; name: string } };
type Mode = "create" | "existing";

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function StepWalletSet() {
  const { walletSetId, set, next, prev } = useWizard();
  const [mode, setMode] = useState<Mode>(walletSetId ? "existing" : "create");

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    // Clear the stored ID so the user explicitly re-confirms in the chosen
    // path. Otherwise toggling looks like a no-op and is confusing.
    set({ walletSetId: "" });
  };

  if (MODE === "hosted") return <HostedWalletSet />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wallet set</h1>
        <p className="text-muted-foreground mt-1">
          A wallet set is an HD grouping that holds your wallets. Over a 10
          million wallets per set, across many chains.{" "}
          <strong>You can have as many wallet sets as you want</strong> on the
          same Circle account; the API has no uniqueness or naming constraint.
        </p>
      </div>

      {/* SEGMENTED MODE TOGGLE */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-md border bg-muted/30">
        <button
          type="button"
          onClick={() => switchMode("create")}
          className={cn(
            "rounded-md py-2 text-sm font-medium transition-colors",
            mode === "create"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Create new
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
          Use existing
        </button>
      </div>

      {mode === "create" ? <CreateMode /> : <ExistingMode />}

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!walletSetId}
      />
    </div>
  );
}

function CreateMode() {
  const { apiKey, entitySecret, walletSetName, walletSetId, set } = useWizard();

  const create = useMutation({
    mutationFn: () =>
      callApi<Resp>("createWalletSet", "/api/wallet-set", {
        apiKey,
        entitySecret,
        name: walletSetName,
      }),
    onSuccess: (data) => {
      set({ walletSetId: data.walletSet.id });
      toast.success("Wallet set created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ws-name">Name</Label>
          <Input
            id="ws-name"
            value={walletSetName}
            onChange={(e) => set({ walletSetName: e.target.value })}
            disabled={!!walletSetId}
            placeholder="e.g. Arc Onboarding"
          />
          <p className="text-xs text-muted-foreground">
            Names don&apos;t have to be unique. Pick something you&apos;ll
            recognize in the Console.
          </p>
        </div>

        {walletSetId ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
            <div className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Created
            </div>
            <div className="font-mono text-xs mt-1 break-all">
              {walletSetId}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => create.mutate()}
            disabled={!walletSetName || create.isPending}
          >
            <FolderPlus className="h-4 w-4" />
            {create.isPending ? "Creating…" : "Create wallet set"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ExistingMode() {
  const { walletSetId, set } = useWizard();
  const [val, setVal] = useState(walletSetId);
  const [touched, setTouched] = useState(false);
  const valid = UUID_RE.test(val.trim());

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Reuse a wallet set you already own. For example, the one you
          created on a previous wizard run. Find the ID in your previous{" "}
          <code className="font-mono">.env</code> as{" "}
          <code className="font-mono">CIRCLE_WALLET_SET_ID</code>, or list
          existing sets at{" "}
          <a
            className="text-primary underline inline-flex items-center gap-1"
            href="https://console.circle.com/wallets/dev/wallet-sets"
            target="_blank"
            rel="noreferrer"
          >
            console.circle.com → Wallet sets
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>

        <div className="space-y-2">
          <Label htmlFor="ws-id-existing">Wallet set ID</Label>
          <Input
            id="ws-id-existing"
            value={val}
            onChange={(e) => {
              setTouched(true);
              setVal(e.target.value.trim());
            }}
            placeholder="e.g. 01928e9c-1a3b-7c4d-9e5f-abcdef012345"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          {touched && val && !valid && (
            <p className="text-xs text-amber-500">
              Expected a UUID (e.g. <code className="font-mono">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>).
            </p>
          )}
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <strong className="text-amber-700 dark:text-amber-200">
            Sanity check:
          </strong>{" "}
          this wallet set must belong to the same Circle account as the API
          key + entity secret you&apos;re using. Otherwise wallet creation in
          the next step will fail.
        </div>

        {walletSetId === val.trim() && valid ? (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
            <div className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Using this wallet set
            </div>
            <div className="font-mono text-xs mt-1 break-all">
              {walletSetId}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              set({ walletSetId: val.trim() });
              toast.success("Wallet set ID saved");
            }}
            disabled={!valid}
          >
            <CheckCircle2 className="h-4 w-4" /> Use this wallet set
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function HostedWalletSet() {
  const { walletSetId, set, next, prev } = useWizard();
  const [val, setVal] = useState(walletSetId);
  const valid = UUID_RE.test(val.trim());
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create or reuse a wallet set on Console
        </h1>
        <p className="text-muted-foreground mt-1">
          Then paste the wallet set ID below so the wizard can continue.
        </p>
      </div>
      <Card>
        <CardContent className="p-5 space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Open{" "}
              <a
                href="https://console.circle.com/wallets/dev/wallet-sets"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Wallet sets <ExternalLink className="h-3 w-3" />
              </a>
              .
            </li>
            <li>
              Either click <strong>Create wallet set</strong>, or pick one you
              already own.
            </li>
            <li>Copy the wallet set ID and paste it below.</li>
          </ol>
          <div className="space-y-2">
            <Label htmlFor="ws-id">Wallet set ID</Label>
            <Input
              id="ws-id"
              placeholder="01928e..."
              value={val}
              onChange={(e) => setVal(e.target.value.trim())}
              className="font-mono"
            />
          </div>
        </CardContent>
      </Card>
      <FooterNav
        onPrev={prev}
        onNext={() => {
          set({ walletSetId: val.trim() });
          next();
        }}
        nextDisabled={!valid}
      />
    </div>
  );
}
