// Per-chain configuration for the wizard. The wizard supports the testnet
// networks Circle exposes for dev-controlled wallets. Adding a new chain is a
// one-entry change here — every step reads from this list.
//
// USDC token addresses change occasionally. The canonical source is Circle's
// own faucet page at https://faucet.circle.com — when you select a network
// there, the page shows the current USDC contract / mint address. The
// wizard's transfer step always lets the user override the pre-filled value.

export type ChainKind = "evm" | "solana";

export type ChainConfig = {
  /** Circle's blockchain code (sent as `blockchain` / `blockchains[]` to the SDK). */
  code: string;
  /** Human-readable label for the dropdown. */
  label: string;
  /** Address / token format. */
  kind: ChainKind;
  /** Account types this wizard exposes for the chain. SCA is EVM-only and not
   *  available on every EVM chain (Ethereum mainnet excepted, but mainnet is
   *  out of scope here). For Solana, only EOA is supported by Circle. */
  accountTypes: Array<"EOA" | "SCA">;
  /** Pre-filled USDC contract address (or SPL mint). Empty = no default; the
   *  user must paste one from faucet.circle.com. */
  usdcDefault?: string;
  /** URL prefix for transaction hash. Append `<txHash>`. */
  explorerTxBase?: string;
  /** URL prefix for an address. Append `<address>`. */
  explorerAddressBase?: string;
  /** Validation regex for destination address input. */
  addressRegex: RegExp;
  /** Hint shown under the destination field. */
  addressHint: string;
  /** Optional note shown on chain-specific UI (e.g. "EOA only"). */
  note?: string;
  /** Whether USDC pre-fill is from a verified Circle quickstart (vs.
   *  community-known but may need verification). */
  usdcVerified?: boolean;
};

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
// Solana addresses are base58 (no 0/I/O/l), 32–44 characters.
const SOL_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const CHAINS: ChainConfig[] = [
  {
    code: "ARC-TESTNET",
    label: "Arc Testnet",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x3600000000000000000000000000000000000000",
    usdcVerified: true,
    explorerTxBase: "https://testnet.arcscan.app/tx/",
    explorerAddressBase: "https://testnet.arcscan.app/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "ETH-SEPOLIA",
    label: "Ethereum Sepolia",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    explorerTxBase: "https://sepolia.etherscan.io/tx/",
    explorerAddressBase: "https://sepolia.etherscan.io/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "BASE-SEPOLIA",
    label: "Base Sepolia",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    explorerTxBase: "https://sepolia.basescan.org/tx/",
    explorerAddressBase: "https://sepolia.basescan.org/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "MATIC-AMOY",
    label: "Polygon Amoy",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    explorerTxBase: "https://amoy.polygonscan.com/tx/",
    explorerAddressBase: "https://amoy.polygonscan.com/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "ARB-SEPOLIA",
    label: "Arbitrum Sepolia",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    explorerTxBase: "https://sepolia.arbiscan.io/tx/",
    explorerAddressBase: "https://sepolia.arbiscan.io/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "OP-SEPOLIA",
    label: "Optimism Sepolia",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    explorerTxBase: "https://sepolia-optimism.etherscan.io/tx/",
    explorerAddressBase: "https://sepolia-optimism.etherscan.io/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "AVAX-FUJI",
    label: "Avalanche Fuji",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    usdcDefault: "0x5425890298aed601595a70AB815c96711a31Bc65",
    explorerTxBase: "https://testnet.snowtrace.io/tx/",
    explorerAddressBase: "https://testnet.snowtrace.io/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
  },
  {
    code: "MONAD-TESTNET",
    label: "Monad Testnet",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    // No widely-published canonical USDC mint on Monad testnet — leave blank.
    explorerTxBase: "https://testnet.monadexplorer.com/tx/",
    explorerAddressBase: "https://testnet.monadexplorer.com/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
    note: "Paste the USDC contract address from faucet.circle.com when you fund.",
  },
  {
    code: "UNI-SEPOLIA",
    label: "Unichain Sepolia",
    kind: "evm",
    accountTypes: ["EOA", "SCA"],
    explorerTxBase: "https://sepolia.uniscan.xyz/tx/",
    explorerAddressBase: "https://sepolia.uniscan.xyz/address/",
    addressRegex: EVM_ADDRESS,
    addressHint: "0x… (40 hex chars)",
    note: "Paste the USDC contract address from faucet.circle.com when you fund.",
  },
  {
    code: "SOL-DEVNET",
    label: "Solana Devnet",
    kind: "solana",
    accountTypes: ["EOA"],
    // Circle's published Solana Devnet USDC mint. Verify on faucet.circle.com.
    usdcDefault: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    explorerTxBase: "https://explorer.solana.com/tx/",
    explorerAddressBase: "https://explorer.solana.com/address/",
    addressRegex: SOL_ADDRESS,
    addressHint: "Base58 (32–44 chars)",
    note: "Solana supports EOA only — Circle does not offer SCA on Solana.",
  },
];

export const DEFAULT_CHAIN_CODE = "ARC-TESTNET";

export function chainByCode(code: string): ChainConfig {
  return CHAINS.find((c) => c.code === code) ?? CHAINS[0];
}

/** Append `?cluster=devnet` to Solana explorer links so the user lands on the
 *  right cluster. Other chains pass through unchanged. */
export function explorerTxUrl(chain: ChainConfig, txHash: string): string {
  if (!chain.explorerTxBase) return "";
  if (chain.code === "SOL-DEVNET") {
    return `${chain.explorerTxBase}${txHash}?cluster=devnet`;
  }
  return `${chain.explorerTxBase}${txHash}`;
}

export function explorerAddressUrl(
  chain: ChainConfig,
  address: string
): string {
  if (!chain.explorerAddressBase) return "";
  if (chain.code === "SOL-DEVNET") {
    return `${chain.explorerAddressBase}${address}?cluster=devnet`;
  }
  return `${chain.explorerAddressBase}${address}`;
}
