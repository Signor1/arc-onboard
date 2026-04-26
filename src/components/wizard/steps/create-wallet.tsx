"use client";

import { useEffect, useState } from "react";
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
import { useWizard, type AccountType } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { CHAINS, chainByCode } from "@/lib/chains";

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
  const chain = chainByCode(blockchain);

  // If the current accountType isn't valid for the picked chain (e.g. user
  // had SCA selected then switched to Solana), force it to the first allowed.
  useEffect(() => {
    if (!chain.accountTypes.includes(accountType as AccountType)) {
      set({ accountType: chain.accountTypes[0] });
    }
  }, [chain.code]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a wallet
        </h1>
        <p className="text-muted-foreground mt-1">
          Pick a chain and account type. The chain controls the address
          format, gas token, USDC contract, and explorer used in the rest of
          the wizard.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-2">
            <Label>Blockchain</Label>
            <Select
              value={blockchain}
              onValueChange={(v) => set({ blockchain: v })}
              disabled={!!wallet}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                    {c.code === "ARC-TESTNET" && " (recommended)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {chain.note && (
              <p className="text-xs text-muted-foreground">{chain.note}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account type</Label>
            <RadioGroup
              value={accountType}
              onValueChange={(v) => set({ accountType: v as AccountType })}
              className="grid grid-cols-2 gap-3"
              disabled={!!wallet}
            >
              <label
                className={`flex items-start gap-3 rounded-md border p-3 ${
                  chain.accountTypes.includes("EOA")
                    ? "cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <RadioGroupItem
                  value="EOA"
                  disabled={!chain.accountTypes.includes("EOA")}
                />
                <div>
                  <div className="text-sm font-medium">EOA</div>
                  <div className="text-xs text-muted-foreground">
                    Standard key-controlled. Wallet pays its own gas.
                  </div>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 rounded-md border p-3 ${
                  chain.accountTypes.includes("SCA")
                    ? "cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <RadioGroupItem
                  value="SCA"
                  disabled={!chain.accountTypes.includes("SCA")}
                />
                <div>
                  <div className="text-sm font-medium">SCA</div>
                  <div className="text-xs text-muted-foreground">
                    Smart contract account. Gas sponsorship + batching.
                    {!chain.accountTypes.includes("SCA") && (
                      <span className="block text-amber-500 mt-0.5">
                        Not available on {chain.label}.
                      </span>
                    )}
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
  const { wallet, blockchain, set, next, prev } = useWizard();
  const chain = chainByCode(blockchain);
  const [addr, setAddr] = useState(wallet?.address ?? "");
  const [id, setId] = useState(wallet?.id ?? "");
  const valid = chain.addressRegex.test(addr);
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
            <li>
              Pick <strong>{chain.label}</strong>, account type{" "}
              <strong>{chain.accountTypes[0]}</strong>.
            </li>
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
                placeholder={chain.addressHint}
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
              blockchain: chain.code,
              accountType: chain.accountTypes[0],
            },
          });
          next();
        }}
        nextDisabled={!id || !valid}
      />
    </div>
  );
}
