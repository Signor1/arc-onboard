"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FooterNav } from "../footer-nav";
import { useWizard, type Blockchain, type AccountType } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

const CHAINS: { value: Blockchain; label: string }[] = [
  { value: "ARC-TESTNET", label: "Arc Testnet (recommended)" },
  { value: "ETH-SEPOLIA", label: "Ethereum Sepolia" },
  { value: "BASE-SEPOLIA", label: "Base Sepolia" },
  { value: "MATIC-AMOY", label: "Polygon Amoy" },
  { value: "ARB-SEPOLIA", label: "Arbitrum Sepolia" },
  { value: "OP-SEPOLIA", label: "Optimism Sepolia" },
  { value: "AVAX-FUJI", label: "Avalanche Fuji" },
];

type Resp = {
  wallets: Array<{
    id: string;
    address: string;
    blockchain: string;
    accountType: string;
  }>;
};

export function StepCreateWallet() {
  const {
    apiKey,
    entitySecret,
    walletSetId,
    blockchain,
    accountType,
    wallet,
    set,
    next,
    prev,
  } = useWizard();

  const create = useMutation({
    mutationFn: () =>
      callApi<Resp>("createWallet", "/api/wallet", {
        apiKey,
        entitySecret,
        walletSetId,
        blockchain,
        accountType,
        count: 1,
      }),
    onSuccess: (data) => {
      const w = data.wallets?.[0];
      if (!w) {
        toast.error("No wallet returned");
        return;
      }
      set({
        wallet: {
          id: w.id,
          address: w.address,
          blockchain: w.blockchain,
          accountType: w.accountType,
        },
      });
      toast.success("Wallet created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (MODE === "hosted") return <HostedCreateWallet />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create a wallet</h1>
        <p className="text-muted-foreground mt-1">
          Pick a chain and account type. EOA is recommended for getting started.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-2">
            <Label>Blockchain</Label>
            <Select
              value={blockchain}
              onValueChange={(v) => set({ blockchain: v as Blockchain })}
              disabled={!!wallet}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account type</Label>
            <RadioGroup
              value={accountType}
              onValueChange={(v) => set({ accountType: v as AccountType })}
              className="grid grid-cols-2 gap-3"
              disabled={!!wallet}
            >
              <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                <RadioGroupItem value="EOA" />
                <div>
                  <div className="text-sm font-medium">EOA</div>
                  <div className="text-xs text-muted-foreground">
                    Standard key-controlled. Wallet pays its own gas.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer">
                <RadioGroupItem value="SCA" />
                <div>
                  <div className="text-sm font-medium">SCA</div>
                  <div className="text-xs text-muted-foreground">
                    Smart contract account. Supports gas sponsorship + batching.
                  </div>
                </div>
              </label>
            </RadioGroup>
          </div>

          {wallet ? (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm space-y-1">
              <div className="font-medium text-green-700 dark:text-green-300">
                Wallet created on {wallet.blockchain}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs break-all">
                  {wallet.address}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={async () => {
                    await navigator.clipboard.writeText(wallet.address);
                    toast.success("Address copied");
                  }}
                  aria-label="copy"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create wallet"}
            </Button>
          )}
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!wallet}
        loading={create.isPending}
      />
    </div>
  );
}

function HostedCreateWallet() {
  const { wallet, set, next, prev } = useWizard();
  const [addr, setAddr] = useState(wallet?.address ?? "");
  const [id, setId] = useState(wallet?.id ?? "");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a wallet on Console
        </h1>
      </div>
      <Card>
        <CardContent className="p-5 space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Open{" "}
              <a
                href="https://console.circle.com/wallets/dev/wallets"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                Wallets <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and click <strong>Create wallet</strong>.
            </li>
            <li>Pick <strong>Arc Testnet</strong>, account type <strong>EOA</strong>.</li>
            <li>Copy the wallet ID and address back here.</li>
          </ol>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="w-id">Wallet ID</Label>
              <Input
                id="w-id"
                value={id}
                onChange={(e) => setId(e.target.value.trim())}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-addr">Wallet address</Label>
              <Input
                id="w-addr"
                value={addr}
                onChange={(e) => setAddr(e.target.value.trim())}
                className="font-mono"
                placeholder="0x..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <FooterNav
        onPrev={prev}
        onNext={() => {
          set({
            wallet: {
              id,
              address: addr,
              blockchain: "ARC-TESTNET",
              accountType: "EOA",
            },
          });
          next();
        }}
        nextDisabled={!id || !/^0x[a-fA-F0-9]{40}$/.test(addr)}
      />
    </div>
  );
}
