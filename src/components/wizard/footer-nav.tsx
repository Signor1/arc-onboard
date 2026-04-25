"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function FooterNav({
  onPrev,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  loading,
  showPrev = true,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  showPrev?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-6 border-t mt-6">
      {showPrev ? (
        <Button variant="ghost" onClick={onPrev} disabled={loading}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled || loading}>
          {loading ? "Working…" : nextLabel}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
