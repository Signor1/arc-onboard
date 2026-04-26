"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { ExternalLink, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { chainByCode, explorerAddressUrl } from "@/lib/chains";

type Resp = {
  tokenBalances: Array<{
    amount: string;
    token: { symbol?: string };
  }>;
};

export function StepFund() {
  const { apiKey, entitySecret, wallet, blockchain, next, prev } = useWizard();
  const chain = chainByCode(blockchain);
  const [balances, setBalances] = useState<Resp["tokenBalances"]>([]);

  const check = useMutation({
    mutationFn: () =>
      callApi<Resp>("getBalance", "/api/balance", {
        apiKey,
        entitySecret,
        walletId: wallet?.id,
      }),
    onSuccess: (data) => {
      setBalances(data.tokenBalances ?? []);
      const usdc = data.tokenBalances?.find((b) => b.token?.symbol === "USDC");
      if (usdc && parseFloat(usdc.amount) > 0) {
        toast.success(`USDC balance: ${usdc.amount}`);
      } else {
        toast.message(
          "No USDC yet — wait a moment after using the faucet, then refresh."
        );
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const usdc = balances.find((b) => b.token?.symbol === "USDC");
  const funded = usdc && parseFloat(usdc.amount) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Fund the wallet via faucet
        </h1>
        <p className="text-muted-foreground mt-1">
          Open the Circle faucet, paste your wallet address, and request USDC
          on <strong>{chain.label}</strong>. Then come back and refresh the
          balance.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="font-mono text-xs break-all">
              {wallet?.address}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (wallet?.address) {
                    await navigator.clipboard.writeText(wallet.address);
                    toast.success("Address copied");
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              {wallet?.address && chain.explorerAddressBase && (
                <a
                  href={explorerAddressUrl(chain, wallet.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-primary underline ml-2"
                >
                  Explorer <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          </div>

          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>
              Open{" "}
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                faucet.circle.com <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Choose <strong>{chain.label}</strong> and paste your address.
            </li>
            <li>
              Click <strong>Send USDC</strong>. The faucet page also shows the
              canonical USDC contract address for this chain — copy it if you
              need it for the transfer step.
            </li>
            <li>Wait ~10s, then check the balance below.</li>
          </ol>

          {MODE === "local" ? (
            <>
              <Button
                variant="secondary"
                onClick={() => check.mutate()}
                disabled={check.isPending}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {check.isPending ? "Checking…" : "Check balance"}
              </Button>
              {balances.length > 0 && (
                <div className="space-y-1">
                  {balances.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm border-b py-1.5 last:border-0"
                    >
                      <span className="font-mono">
                        {b.token?.symbol ?? "?"}
                      </span>
                      <Badge
                        variant={
                          b.token?.symbol === "USDC" ? "success" : "outline"
                        }
                      >
                        {b.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Verify your funded balance directly on the explorer before
              continuing.
            </p>
          )}
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={MODE === "local" ? !funded : false}
      />
    </div>
  );
}
