"use client";

import { useState } from "react";
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

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";

type CreateResp = { transaction: { id: string; state: string } };
type GetResp = {
  transaction: { id: string; state: string; txHash?: string };
};

export function StepTransfer() {
  const { apiKey, entitySecret, wallet, blockchain, next, prev } = useWizard();
  const [dest, setDest] = useState("0xb505c4ad888c05bc8c6f2bf237f57f2b1a11a0d2");
  const [amount, setAmount] = useState("0.1");
  const [state, setState] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

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
          tokenAddress: ARC_TESTNET_USDC,
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
        const poll = await callApi<GetResp>("getTransaction", "/api/transaction", {
          apiKey,
          entitySecret,
          id,
        });
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
            with the .env you'll export on the next step.
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
          Send a small USDC amount to any Arc Testnet address.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Recipient address</Label>
            <Input
              className="font-mono"
              value={dest}
              onChange={(e) => setDest(e.target.value.trim())}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount (USDC)</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button onClick={() => send.mutate()} disabled={send.isPending}>
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
              {txHash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline break-all inline-flex items-center gap-1"
                >
                  View on Arc Explorer <ExternalLink className="h-3 w-3" />
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
