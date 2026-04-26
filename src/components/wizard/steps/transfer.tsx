"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { MODE } from "@/lib/mode";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { chainByCode, explorerTxUrl } from "@/lib/chains";

type CreateResp = { transaction: { id: string; state: string } };
type GetResp = {
  transaction: { id: string; state: string; txHash?: string };
};

export function StepTransfer() {
  const { apiKey, entitySecret, wallet, blockchain, next, prev } = useWizard();
  const chain = chainByCode(blockchain);

  const [dest, setDest] = useState("");
  const [tokenAddress, setTokenAddress] = useState(chain.usdcDefault ?? "");
  const [amount, setAmount] = useState("0.1");
  const [state, setState] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // When the user navigates back and changes chains, reset chain-specific
  // defaults so a Solana mint isn't stale on an EVM chain (or vice versa).
  useEffect(() => {
    setTokenAddress(chain.usdcDefault ?? "");
    setDest("");
    setState("");
    setTxHash("");
  }, [chain.code]);

  const destValid = dest === "" || chain.addressRegex.test(dest);
  const canSend =
    chain.addressRegex.test(dest) &&
    tokenAddress.trim().length > 0 &&
    parseFloat(amount) > 0;

  const send = useMutation({
    mutationFn: async () => {
      const create = await callApi<CreateResp>(
        "createTransfer",
        "/api/transfer",
        {
          apiKey,
          entitySecret,
          blockchain,
          walletAddress: wallet?.address,
          destinationAddress: dest,
          amount,
          tokenAddress: tokenAddress.trim(),
        }
      );
      const id = create.transaction?.id;
      if (!id) throw new Error("No transaction ID");
      setState(create.transaction.state ?? "INITIATED");
      const terminal = new Set([
        "COMPLETE",
        "FAILED",
        "CANCELLED",
        "DENIED",
      ]);
      let s = create.transaction.state ?? "";
      while (!terminal.has(s)) {
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await callApi<GetResp>(
          "getTransaction",
          "/api/transaction",
          { apiKey, entitySecret, id }
        );
        s = poll.transaction?.state ?? s;
        setState(s);
        if (poll.transaction?.txHash) setTxHash(poll.transaction.txHash);
      }
      if (s !== "COMPLETE") throw new Error(`Ended in state: ${s}`);
      return create;
    },
    onSuccess: () => toast.success("Transfer complete"),
    onError: (err: Error) => toast.error(err.message),
  });

  if (MODE === "hosted") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            First transfer (skipped in hosted mode)
          </h1>
          <p className="text-muted-foreground mt-1">
            For your first transfer, follow the{" "}
            <a
              className="underline"
              href="https://developers.circle.com/wallets/dev-controlled/transfer-tokens-across-wallets"
              target="_blank"
              rel="noreferrer"
            >
              SDK quickstart <ExternalLink className="inline h-3 w-3" />
            </a>{" "}
            with the .env you&apos;ll export on the next step.
          </p>
        </div>
        <FooterNav onPrev={prev} onNext={next} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Send your first transfer (optional)
        </h1>
        <p className="text-muted-foreground mt-1">
          Send a small USDC amount on <strong>{chain.label}</strong>. The
          token contract address is pre-filled where Circle has published
          one — verify against{" "}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline inline-flex items-center gap-1"
          >
            faucet.circle.com <ExternalLink className="h-3 w-3" />
          </a>{" "}
          if you&apos;re unsure.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dest">Recipient address</Label>
            <Input
              id="dest"
              className="font-mono"
              value={dest}
              onChange={(e) => setDest(e.target.value.trim())}
              placeholder={chain.addressHint}
            />
            {!destValid && (
              <p className="text-xs text-amber-500">
                Doesn&apos;t look like a valid {chain.label} address. Expected{" "}
                {chain.addressHint}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="token">USDC contract / mint address</Label>
              {chain.usdcVerified && (
                <Badge variant="success" className="text-[10px]">
                  verified
                </Badge>
              )}
            </div>
            <Input
              id="token"
              className="font-mono text-xs"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value.trim())}
              placeholder={chain.addressHint}
            />
            <p className="text-xs text-muted-foreground">
              {chain.usdcDefault
                ? chain.usdcVerified
                  ? "Pre-filled from Circle's quickstart. Verify on faucet.circle.com if anything looks off."
                  : "Pre-filled from a community-known address. Verify on faucet.circle.com before sending non-trivial amounts."
                : "No pre-filled default for this chain. Copy the USDC address from faucet.circle.com after selecting the network there."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amt">Amount (USDC)</Label>
            <Input
              id="amt"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button
            onClick={() => send.mutate()}
            disabled={!canSend || send.isPending}
          >
            {send.isPending ? "Sending…" : "Send"}
          </Button>

          {state && (
            <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge
                  variant={state === "COMPLETE" ? "success" : "outline"}
                  className="font-mono"
                >
                  {state}
                </Badge>
              </div>
              {txHash && chain.explorerTxBase && (
                <a
                  href={explorerTxUrl(chain, txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline break-all inline-flex items-center gap-1"
                >
                  View on {chain.label} Explorer{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <FooterNav onPrev={prev} onNext={next} />
    </div>
  );
}
