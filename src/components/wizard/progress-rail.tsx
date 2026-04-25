"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useWizard } from "@/lib/store";

const STEPS = [
  "Disclaimer",
  "API key",
  "Entity secret",
  "Register",
  "Wallet set",
  "Create wallet",
  "Fund + verify",
  "First transfer",
  "Export .env",
];

export function ProgressRail() {
  const { step, setStep } = useWizard();
  return (
    <ol className="space-y-1">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={i}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                active && "bg-primary/10 text-foreground",
                !active && done && "text-foreground hover:bg-muted",
                !active && !done && "text-muted-foreground",
                i > step && "cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && !done && "border-primary text-primary",
                  !done && !active && "border-muted-foreground/40"
                )}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="truncate">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export const TOTAL_STEPS = STEPS.length;
