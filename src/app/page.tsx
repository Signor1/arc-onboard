"use client";

import { Header } from "@/components/header";
import { ProgressRail, TOTAL_STEPS } from "@/components/wizard/progress-rail";
import { RequestPanel } from "@/components/wizard/request-panel";
import { useWizard } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

import { StepDisclaimer } from "@/components/wizard/steps/disclaimer";
import { StepApiKey } from "@/components/wizard/steps/api-key";
import { StepEntitySecret } from "@/components/wizard/steps/entity-secret";
import { StepRegister } from "@/components/wizard/steps/register";
import { StepWalletSet } from "@/components/wizard/steps/wallet-set";
import { StepCreateWallet } from "@/components/wizard/steps/create-wallet";
import { StepFund } from "@/components/wizard/steps/fund";
import { StepTransfer } from "@/components/wizard/steps/transfer";
import { StepExportEnv } from "@/components/wizard/steps/export-env";

const STEP_COMPONENTS = [
  StepDisclaimer,
  StepApiKey,
  StepEntitySecret,
  StepRegister,
  StepWalletSet,
  StepCreateWallet,
  StepFund,
  StepTransfer,
  StepExportEnv,
];

export default function Page() {
  const step = useWizard((s) => s.step);
  const Step = STEP_COMPONENTS[step] ?? StepDisclaimer;
  const pct = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <Progress value={pct} className="rounded-none h-1" />
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_360px] gap-6">
          <aside className="hidden lg:block sticky top-6 self-start">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-3">
              Steps
            </div>
            <ProgressRail />
          </aside>
          <section className="min-w-0 max-w-2xl">
            <Step />
          </section>
          <aside className="hidden lg:block sticky top-6 self-start max-h-[calc(100vh-6rem)] rounded-md border bg-card overflow-hidden">
            <RequestPanel />
          </aside>
        </div>
      </main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Arc Onboard · Opensource · Built by <a
          href="https://github.com/signor1"
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
        >
          SignorDev
        </a>
      </footer>
    </div>
  );
}
