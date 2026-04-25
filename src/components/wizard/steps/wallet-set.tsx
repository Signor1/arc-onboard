"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Resp = { walletSet: { id: string; name: string } };

export function StepWalletSet() {
  const { apiKey, entitySecret, walletSetName, walletSetId, set, next, prev } =
    useWizard();

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

  if (MODE === "hosted") return <HostedWalletSet />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a wallet set
        </h1>
        <p className="text-muted-foreground mt-1">
          A wallet set is a hierarchical-deterministic group; you can create
          millions of wallets inside one. One set is plenty for getting started.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              value={walletSetName}
              onChange={(e) => set({ walletSetName: e.target.value })}
              disabled={!!walletSetId}
            />
          </div>
          {walletSetId ? (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
              <div className="font-medium text-green-700 dark:text-green-300">
                Created
              </div>
              <div className="font-mono text-xs mt-1">{walletSetId}</div>
            </div>
          ) : (
            <Button
              onClick={() => create.mutate()}
              disabled={!walletSetName || create.isPending}
            >
              {create.isPending ? "Creating…" : "Create wallet set"}
            </Button>
          )}
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!walletSetId}
        loading={create.isPending}
      />
    </div>
  );
}

function HostedWalletSet() {
  const { walletSetId, set, next, prev } = useWizard();
  const [val, setVal] = useState(walletSetId);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a wallet set on Console
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
              </a>{" "}
              and click <strong>Create wallet set</strong>.
            </li>
            <li>Name it (e.g. <em>Arc Onboarding</em>) and confirm.</li>
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
          set({ walletSetId: val });
          next();
        }}
        nextDisabled={!val}
      />
    </div>
  );
}
