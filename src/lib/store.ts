"use client";

import { create } from "zustand";

// Blockchain codes are validated against the chain config in `lib/chains.ts`.
// Kept as a plain string so adding a chain to chains.ts doesn't require a
// matching type-system change.
export type Blockchain = string;

export type AccountType = "EOA" | "SCA";

export type RequestLogEntry = {
  id: string;
  ts: number;
  label: string;
  request: unknown;
  response?: unknown;
  error?: string;
  redacted?: boolean;
};

type WalletInfo = {
  id: string;
  address: string;
  blockchain: string;
  accountType: string;
};

export type EntitySecretSource = "generated" | "existing";

type State = {
  step: number;
  apiKey: string;
  entitySecret: string;
  entitySecretSource?: EntitySecretSource;
  registered: boolean;
  recoveryFileSaved: boolean;
  walletSetId: string;
  walletSetName: string;
  blockchain: Blockchain;
  accountType: AccountType;
  wallet?: WalletInfo;
  secondWallet?: WalletInfo;
  log: RequestLogEntry[];
  setStep: (n: number) => void;
  next: () => void;
  prev: () => void;
  set: (patch: Partial<State>) => void;
  pushLog: (entry: RequestLogEntry) => void;
  reset: () => void;
};

const initial = {
  step: 0,
  apiKey: "",
  entitySecret: "",
  entitySecretSource: undefined as EntitySecretSource | undefined,
  registered: false,
  recoveryFileSaved: false,
  walletSetId: "",
  walletSetName: "Arc Onboarding",
  blockchain: "ARC-TESTNET" as Blockchain,
  accountType: "EOA" as AccountType,
  wallet: undefined,
  secondWallet: undefined,
  log: [] as RequestLogEntry[],
};

export const useWizard = create<State>((set) => ({
  ...initial,
  setStep: (n) => set({ step: n }),
  next: () => set((s) => ({ step: s.step + 1 })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  set: (patch) => set(patch),
  pushLog: (entry) => set((s) => ({ log: [entry, ...s.log].slice(0, 50) })),
  reset: () => set(initial),
}));
