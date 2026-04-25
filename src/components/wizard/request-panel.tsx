"use client";

import { useWizard } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function fmt(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function RequestPanel() {
  const log = useWizard((s) => s.log);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Request inspector
        </div>
        <Badge variant="outline" className="text-[10px]">
          {log.length} call{log.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto">
        {log.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">
            API calls will appear here as you progress through the wizard. The
            request inspector helps you understand exactly what's being sent to
            Circle.
          </div>
        ) : (
          <ul className="divide-y">
            {log.map((e) => (
              <li key={e.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{e.label}</span>
                    {e.error ? (
                      <Badge variant="warn" className="text-[10px]">
                        error
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        ok
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </div>
                <details>
                  <summary className="cursor-pointer text-[11px] text-muted-foreground">
                    Request
                  </summary>
                  <pre
                    className={cn(
                      "mt-1 overflow-x-auto rounded-md bg-muted/40 p-2 font-mono text-[11px] leading-snug"
                    )}
                  >
                    {fmt(e.request)}
                  </pre>
                </details>
                <details>
                  <summary className="cursor-pointer text-[11px] text-muted-foreground mt-1">
                    {e.error ? "Error" : "Response"}
                  </summary>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-muted/40 p-2 font-mono text-[11px] leading-snug">
                    {e.error ?? fmt(e.response)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
