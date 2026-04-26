"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FooterNav } from "../footer-nav";
import { useWizard } from "@/lib/store";
import { MODE } from "@/lib/mode";
import {
  ShieldCheck,
  Globe,
  Server,
  Key,
  FileKey2,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export function StepDisclaimer() {
  const next = useWizard((s) => s.next);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Arc Onboard
        </h1>
        <p className="text-muted-foreground mt-1">
          A guided wizard for setting up Circle dev-controlled wallets on Arc
          Testnet. Take three minutes to read this, it will save you panic
          later.
        </p>
      </div>

      {/* SECURITY MODEL */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security model
          </CardTitle>
          <CardDescription>
            Where your credentials live during this wizard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {MODE === "local" ? (
            <div className="flex gap-3">
              <Server className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Running locally on your machine.
                </div>
                <p className="text-muted-foreground mt-1">
                  Whether you launched via{" "}
                  <code className="font-mono">npx @signordev/arc-onboard</code>{" "}
                  or cloned the repo and ran{" "}
                  <code className="font-mono">pnpm dev</code>, your API key
                  and entity secret stay in this browser tab and on your
                  localhost server. They are sent to Circle directly through
                  a Next.js API route running on{" "}
                  <code className="font-mono">localhost</code>. Nothing is
                  written to disk by this app, and no third-party server sees
                  your credentials.
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Heads-up: Circle&apos;s SDK writes a copy of your{" "}
                  <strong>recovery file</strong> to the server&apos;s working
                  directory as a side effect of registration. With{" "}
                  <code className="font-mono">pnpm dev</code> that is the
                  project folder; with{" "}
                  <code className="font-mono">npx</code> it lands in the npx
                  cache (
                  <code className="font-mono">~/.npm/_npx/…</code>). You also
                  get a browser-initiated download which is the canonical
                  copy you should keep. The Register step will remind you to
                  remove the on-disk duplicate.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Globe className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
              <div>
                <div className="font-medium">
                  Hosted mode — your credentials never leave your browser.
                </div>
                <p className="text-muted-foreground mt-1">
                  This site does not call Circle on your behalf. The wizard
                  generates your entity secret locally and hands you off to{" "}
                  <a
                    className="underline"
                    href="https://console.circle.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    console.circle.com
                  </a>{" "}
                  for any operation that touches your API key. We are a smart
                  checklist, not a proxy.
                </p>
                <p className="text-muted-foreground mt-2">
                  For maximum security, run this locally instead:{" "}
                  <code className="font-mono">npx arc-onboard</code>.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HOW CIRCLE DEV WALLETS WORK */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            How Circle dev wallets actually work
          </CardTitle>
          <CardDescription>
            The mental model that makes everything else click.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex gap-3">
            <Key className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <div className="font-medium">API key — a credential</div>
              <p className="text-muted-foreground mt-0.5">
                How your code authenticates with Circle. You can mint many,
                rotate freely, and delete old ones without affecting your
                wallets. Nothing about your wallets is bound to a specific API
                key.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <FileKey2 className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <div className="font-medium">
                Entity secret — the master key
              </div>
              <p className="text-muted-foreground mt-0.5">
                A 32-byte private key that participates in signing every wallet
                operation (Circle uses MPC; the entity secret is one of the
                two parties). It is{" "}
                <strong>scoped to your Circle account</strong>, not to an API
                key. <strong>You only have one at a time.</strong> Trying to
                register a second one returns <code className="font-mono">409</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <div className="font-medium">
                Recovery file — the only path back
              </div>
              <p className="text-muted-foreground mt-0.5">
                Generated by Circle the moment you register your entity
                secret, and only at that moment. It is the only credential
                that can <em>reset</em> a lost or compromised entity secret.
                Lose this file and your entity secret, and there is no way for
                Circle to help you, you start over with a new circle account.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Wallet className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <div className="font-medium">Wallets — what you actually use</div>
              <p className="text-muted-foreground mt-0.5">
                Created under your entity secret, organized into wallet sets.
                A single wallet set can hold millions of wallets across many
                chains; on EVM the same address can be reused across chains.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HEADS UP */}
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Things that
            trip people up
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="font-medium">
              &ldquo;I deleted my old API key, why won&apos;t the new one
              register an entity secret?&rdquo;
            </div>
            <p className="text-muted-foreground mt-0.5">
              Because the entity secret is bound to your <em>account</em>, not
              your API key. Deleting an API key does not delete the entity
              secret. The new key inherits the existing entity secret. Just
              reuse the original entity secret you saved. The wizard&apos;s
              Register step has an &ldquo;I already have one registered&rdquo;
              path for exactly this case.
            </p>
          </div>
          <div>
            <div className="font-medium">
              &ldquo;Where is my recovery file?&rdquo;
            </div>
            <p className="text-muted-foreground mt-0.5">
              In local mode, the SDK writes a duplicate copy to your project
              folder named{" "}
              <code className="font-mono">recovery_file_&lt;timestamp&gt;.dat</code>{" "}
              in addition to the browser-initiated download. After saving the
              copy you want, move that on-disk file to secure storage (or
              delete it). It is already covered by{" "}
              <code className="font-mono">.gitignore</code> but treat it like
              a private key.
            </p>
          </div>
          <div>
            <div className="font-medium">
              &ldquo;Can I just generate a new entity secret if I lose
              mine?&rdquo;
            </div>
            <p className="text-muted-foreground mt-0.5">
              Only with the recovery file. The reset flow on Circle Console
              accepts the recovery file and a freshly generated entity secret;
              it deprecates the old one. Without the recovery file there is
              no reset, period!
            </p>
          </div>
          <div>
            <div className="font-medium">
              &ldquo;What if my entity secret leaks?&rdquo;
            </div>
            <p className="text-muted-foreground mt-0.5">
              Use the rotation flow on Circle Console (requires the current
              entity secret) to swap it out. If you no longer have the secret
              but have the recovery file, use reset instead.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CHECKLIST OF WHAT TO STORE */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Before you continue</CardTitle>
          <CardDescription>
            Decide where each of these will live <em>before</em> the wizard
            generates them.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Entity secret</strong> →
              password manager (1Password / Bitwarden / vault entry).
            </li>
            <li>
              <strong className="text-foreground">Recovery file (.dat)</strong>{" "}
              → a <em>different</em> secure location from the entity secret.
              If both live in the same place and that place gets compromised,
              an attacker has total control.
            </li>
            <li>
              <strong className="text-foreground">API key</strong> → environment
              variables / secrets manager. Easier to rotate, but still don&apos;t
              commit it.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* AGREE */}
      <div className="rounded-md border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
          />
          <Label htmlFor="agree" className="leading-relaxed">
            I&apos;ve read the above. I understand that I am solely responsible
            for safeguarding my entity secret and recovery file, and that
            losing both is unrecoverable.
          </Label>
        </div>
      </div>

      <FooterNav showPrev={false} onNext={next} nextDisabled={!agreed} />
    </div>
  );
}
