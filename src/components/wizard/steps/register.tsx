"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { callApi } from "@/lib/api-client";
import { downloadText, cn } from "@/lib/utils";
import { MODE } from "@/lib/mode";
import {
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

type RegisterResp = { ok: boolean; recoveryFile: string };
type Path = "register" | "skip";

export function StepRegister() {
  const {
    apiKey,
    entitySecret,
    entitySecretSource,
    registered,
    recoveryFileSaved,
    set,
    next,
    prev,
  } = useWizard();

  // Auto-pick the path based on how the user obtained the entity secret.
  // They can still flip it manually.
  const initialPath: Path =
    entitySecretSource === "existing" ? "skip" : "register";
  const [path, setPath] = useState<Path>(initialPath);
  const [savedAck, setSavedAck] = useState(recoveryFileSaved);

  // If the user comes back to this step after generating a different secret,
  // recompute the recommended path.
  useEffect(() => {
    setPath(entitySecretSource === "existing" ? "skip" : "register");
  }, [entitySecretSource]);

  const register = useMutation({
    mutationFn: () =>
      callApi<RegisterResp>(
        "registerEntitySecret",
        "/api/register-entity-secret",
        { apiKey, entitySecret }
      ),
    onSuccess: (data) => {
      set({ registered: true });
      const filename = `circle-recovery-file-${new Date()
        .toISOString()
        .slice(0, 10)}.dat`;
      downloadText(filename, data.recoveryFile);
      toast.success("Entity secret registered. Recovery file downloaded.");
    },
    onError: (err: Error) => {
      const msg = err.message ?? "Registration failed";
      // 409 is the canonical "already registered" — explicitly steer the user
      // to the skip path instead of leaving them stuck on the error.
      if (msg.includes("409") || /already/i.test(msg)) {
        toast.error(
          "An entity secret is already registered on this Circle account. Switching to the 'already registered' path."
        );
        setPath("skip");
      } else {
        toast.error(msg);
      }
    },
  });

  if (MODE === "hosted") {
    return <HostedRegister />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Register entity secret
        </h1>
        <p className="text-muted-foreground mt-1">
          Each Circle account holds one entity secret at a time. Pick the path
          that matches your situation.
        </p>
      </div>

      {/* TWO PATHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PathCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title="First time"
          desc="Register the entity secret you just generated with Circle. You'll get a recovery file."
          active={path === "register"}
          recommended={initialPath === "register"}
          onClick={() => setPath("register")}
        />
        <PathCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          title="I already have one registered"
          desc="An entity secret is already registered on this Circle account (e.g. from a previous run). Skip registration."
          active={path === "skip"}
          recommended={initialPath === "skip"}
          onClick={() => setPath("skip")}
        />
      </div>

      {path === "register" ? (
        <RegisterPath
          register={register}
          registered={registered}
          recoveryFile={register.data?.recoveryFile}
          savedAck={savedAck}
          setSavedAck={(v) => {
            setSavedAck(v);
            set({ recoveryFileSaved: v });
          }}
        />
      ) : (
        <SkipPath
          registered={registered}
          savedAck={savedAck}
          setSavedAck={(v) => {
            setSavedAck(v);
            set({ recoveryFileSaved: v });
          }}
          markRegistered={() => set({ registered: true })}
        />
      )}

      <FooterNav
        onPrev={prev}
        onNext={next}
        nextDisabled={!registered || !savedAck}
        loading={register.isPending}
      />
    </div>
  );
}

function PathCard({
  icon,
  title,
  desc,
  active,
  recommended,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  active: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-md border p-4 transition-colors",
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="font-medium text-sm">{title}</div>
        {recommended && (
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold ml-auto">
            recommended
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}

function RegisterPath({
  register,
  registered,
  recoveryFile,
  savedAck,
  setSavedAck,
}: {
  register: ReturnType<typeof useMutation<RegisterResp, Error, void>>;
  registered: boolean;
  recoveryFile?: string;
  savedAck: boolean;
  setSavedAck: (b: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {!registered ? (
          <>
            <p className="text-sm text-muted-foreground">
              This call sends your entity secret (RSA-encrypted) to Circle and
              registers it on your account. The response includes the{" "}
              <strong>only</strong> recovery file you will ever get for it.
            </p>
            <Button
              onClick={() => register.mutate()}
              disabled={register.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {register.isPending ? "Registering…" : "Register entity secret"}
            </Button>
            {register.isError && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> Registration failed
                </div>
                <div className="mt-1 font-mono break-all">
                  {register.error?.message}
                </div>
                <div className="mt-2 text-foreground">
                  If this is a <code className="font-mono">409 Conflict</code>,
                  an entity secret is already registered on this Circle account.
                  So switch to the <strong>I already have one registered</strong>{" "}
                  path above and paste your existing entity secret on the
                  previous step.
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
              Entity secret registered with Circle.
            </div>
            {recoveryFile && (
              <Button
                variant="secondary"
                onClick={() => {
                  const filename = `circle-recovery-file-${new Date()
                    .toISOString()
                    .slice(0, 10)}.dat`;
                  downloadText(filename, recoveryFile);
                  toast.success("Recovery file re-downloaded");
                }}
              >
                <Download className="h-3.5 w-3.5" /> Re-download recovery file
              </Button>
            )}
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <strong className="text-amber-700 dark:text-amber-200">
                The recovery file is the only way to reset your entity secret
                if you lose it.
              </strong>{" "}
              Store it in a different place than the entity secret itself.
              Ideally a different password manager or encrypted vault.
            </div>
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs space-y-2">
              <div>
                <strong className="text-red-700 dark:text-red-300">
                  Heads up: a duplicate copy of the recovery file was written
                  to your project folder.
                </strong>{" "}
                Circle&apos;s SDK writes it to the server&apos;s working
                directory as a side effect — when running{" "}
                <code className="font-mono">pnpm dev</code> that&apos;s the
                project root. The file is named{" "}
                <code className="font-mono">
                  recovery_file_&lt;timestamp&gt;.dat
                </code>
                .
              </div>
              <div>
                After saving the copy you downloaded above, move that{" "}
                <code className="font-mono">.dat</code> out of the project
                folder (or delete it). The repo&apos;s{" "}
                <code className="font-mono">.gitignore</code> already excludes
                it, but treat it like a private key.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="rec-ack"
                checked={savedAck}
                onCheckedChange={(v) => setSavedAck(v === true)}
              />
              <Label htmlFor="rec-ack" className="leading-relaxed">
                I have saved the recovery file somewhere safe and removed any
                copy from the project folder.
              </Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkipPath({
  registered,
  savedAck,
  setSavedAck,
  markRegistered,
}: {
  registered: boolean;
  savedAck: boolean;
  setSavedAck: (b: boolean) => void;
  markRegistered: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4 text-sm">
        <p>
          Skip this step if your entity secret is already registered on this
          Circle account. Common reasons:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>You ran this wizard before with a different API key.</li>
          <li>A teammate registered an entity secret on this account.</li>
          <li>
            You hit a <code className="font-mono">409 Conflict</code> trying to
            register a new one — that&apos;s Circle telling you it already
            exists.
          </li>
        </ul>
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <strong className="text-amber-700 dark:text-amber-200">
            Sanity check:
          </strong>{" "}
          confirm the entity secret you pasted on the previous step is the one
          actually registered on this account. If it isn&apos;t, every API
          call in the rest of this wizard will fail with an authentication
          error.
        </div>

        {!registered ? (
          <Button onClick={markRegistered}>
            <CheckCircle2 className="h-4 w-4" /> Confirm and continue
          </Button>
        ) : (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300">
            Marked as already registered. Wallet creation will use this entity
            secret.
          </div>
        )}

        <div className="flex items-start gap-3">
          <Checkbox
            id="rec-ack-skip"
            checked={savedAck}
            onCheckedChange={(v) => setSavedAck(v === true)}
            disabled={!registered}
          />
          <Label htmlFor="rec-ack-skip" className="leading-relaxed">
            I have my entity secret <em>and</em> its recovery file stored
            safely from when it was originally registered.
          </Label>
        </div>
      </CardContent>
    </Card>
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
          In hosted mode, registration happens directly on Circle&apos;s site.
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
              field.
            </li>
            <li>
              Click <strong>Register</strong>, then save the recovery file.
            </li>
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
              <Label htmlFor="reg-ack">
                I registered the entity secret on Circle Console.
              </Label>
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
              <Label htmlFor="rec-ack">
                I downloaded and saved the recovery file.
              </Label>
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
