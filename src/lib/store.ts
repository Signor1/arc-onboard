"use client";

import { create } from "zustand";

export type Blockchain =
  | "ARC-TESTNET"
  | "ETH-SEPOLIA"
  | "BASE-SEPOLIA"
  | "MATIC-AMOY"
  | "ARB-SEPOLIA"
  | "OP-SEPOLIA"
  | "AVAX-FUJI";

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

type State = {
  step: number;
  apiKey: string;
  entitySecret: string;
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
