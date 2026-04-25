"use client";

import { Badge } from "@/components/ui/badge";
import { MODE } from "@/lib/mode";
import { Github, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/60 bg-card/40 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
            A
          </div>
          <div className="font-semibold">Arc Onboard</div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {MODE === "local" ? (
              <>
                <ShieldCheck className="mr-1 h-3 w-3" /> local
              </>
            ) : (
              <>hosted</>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-2">
          <a
            href="https://github.com/circlefin/developer-controlled-wallets-nodejs-sdk"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <Github className="h-3.5 w-3.5" /> Circle SDK
          </a>

          <a
            href="https://github.com/circlefin/developer-controlled-wallets-nodejs-sdk"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <Github className="h-3.5 w-3.5" /> Arc Onboard
          </a>
        </div>

      </div>
    </header>
  );
}
