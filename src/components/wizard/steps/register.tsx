"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { downloadText } from "@/lib/utils";
import { MODE } from "@/lib/mode";
import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type RegisterResp = { ok: boolean; recoveryFile: string };

export function StepRegister() {
  const { apiKey, entitySecret, registered, recoveryFileSaved, set, next, prev } =
    useWizard();
  const [savedAck, setSavedAck] = useState(recoveryFileSaved);

  const register = useMutation({
    mutationFn: () =>
      callApi<RegisterResp>("registerEntitySecret", "/api/register-entity-secret", {
        apiKey,
        entitySecret,
      }),
    onSuccess: (data) => {
      set({ registered: true });
      const filename = `circle-recovery-file-${new Date()
        .toISOString()
        .slice(0, 10)}.dat`;
      downloadText(filename, data.recoveryFile);
      toast.success("Entity secret registered. Recovery file downloaded.");
    },
    onError: (err: Error) => toast.error(err.message ?? "Registration failed"),
  });

  if (MODE === "hosted") {
    return <HostedRegister />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Register entity secret with Circle
        </h1>
        <p className="text-muted-foreground mt-1">
          Encrypts your secret with Circle's public key and registers the
          ciphertext. You'll get a recovery file you must save.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          {!registered ? (
            <Button onClick={() => register.mutate()} disabled={register.isPending}>
              <ShieldCheck className="h-4 w-4" />
              {register.isPending ? "Registering…" : "Register entity secret"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
                Entity secret registered with Circle.
              </div>
              {register.data?.recoveryFile && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const filename = `circle-recovery-file-${new Date()
                      .toISOString()
                      .slice(0, 10)}.dat`;
                    downloadText(filename, register.data!.recoveryFile);
                    toast.success("Recovery file re-downloaded");
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> Re-download recovery file
                </Button>
              )}
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
                <strong className="text-amber-700 dark:text-amber-200">
                  This is the only way to reset your entity secret if you lose
                  it.
                </strong>{" "}
                Store the recovery file separately from the entity secret —
                ideally a different password manager or encrypted vault.
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rec-ack"
                  checked={savedAck}
                  onCheckedChange={(v) => {
                    const checked = v === true;
                    setSavedAck(checked);
                    set({ recoveryFileSaved: checked });
                  }}
                />
                <Label htmlFor="rec-ack" className="leading-relaxed">
                  I have saved the recovery file somewhere safe.
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!registered || !savedAck}
        loading={register.isPending}
      />
    </div>
  );
}

function HostedRegister() {
  const { entitySecret, set, next, prev } = useWizard();
  const [registeredAck, setRegisteredAck] = useState(false);
  const [savedAck, setSavedAck] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Register on Circle Console
        </h1>
        <p className="text-muted-foreground mt-1">
          In hosted mode, registration happens directly on Circle's site.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4 text-sm">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Open{" "}
              <a
                href="https://console.circle.com/wallets/dev/configurator"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                console.circle.com → Wallets → Configurator
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Paste your entity secret into the <strong>Entity Secret</strong>{" "}
              field. We pre-filled the clipboard.
            </li>
            <li>Click <strong>Register</strong>, then save the recovery file.</li>
          </ol>

          <div className="rounded-md bg-muted p-3 font-mono text-xs break-all">
            {entitySecret}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(entitySecret);
              toast.success("Entity secret copied to clipboard");
            }}
          >
            Copy entity secret
          </Button>

          <div className="space-y-2 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="reg-ack"
                checked={registeredAck}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setRegisteredAck(checked);
                  set({ registered: checked });
                }}
              />
              <Label htmlFor="reg-ack">I registered the entity secret on Circle Console.</Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="rec-ack"
                checked={savedAck}
                onCheckedChange={(v) => {
                  const checked = v === true;
                  setSavedAck(checked);
                  set({ recoveryFileSaved: checked });
                }}
              />
              <Label htmlFor="rec-ack">I downloaded and saved the recovery file.</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!registeredAck || !savedAck}
      />
    </div>
  );
}
