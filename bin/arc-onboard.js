#!/usr/bin/env node
/* eslint-disable */
// Launcher for `npx arc-onboard`. Starts the bundled Next.js standalone server
// on a free localhost port and opens the browser. Credentials only ever touch
// 127.0.0.1 — nothing crosses your network.

const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");

async function findFreePort(start = 4747) {
  for (let p = start; p < start + 50; p++) {
    const free = await new Promise((resolve) => {
      const srv = net.createServer();
      srv.once("error", () => resolve(false));
      srv.once("listening", () => srv.close(() => resolve(true)));
      srv.listen(p, "127.0.0.1");
    });
    if (free) return p;
  }
  throw new Error("No free port found near 4747");
}

async function openBrowser(url) {
  // Lazy-load `open` (ESM-only) so this CommonJS launcher boots fast.
  try {
    const mod = await import("open");
    await mod.default(url);
  } catch {
    console.log(`\n  Open in your browser: ${url}\n`);
  }
}

(async () => {
  const root = path.resolve(__dirname, "..");
  const standaloneServer = path.join(root, ".next", "standalone", "server.js");

  if (!fs.existsSync(standaloneServer)) {
    console.error(
      "arc-onboard: missing build output. If you cloned the repo, run `pnpm build` first."
    );
    process.exit(1);
  }

  const port = await findFreePort();
  const url = `http://127.0.0.1:${port}`;

  console.log(`\n  arc-onboard\n  → ${url}\n`);
  console.log(
    "  Local mode: your API key + entity secret stay on this machine.\n"
  );

  // Copy public/ + static assets next to the standalone server (Next.js
  // standalone output expects them adjacent to server.js).
  const standaloneDir = path.dirname(standaloneServer);
  const publicSrc = path.join(root, "public");
  const publicDst = path.join(standaloneDir, "public");
  const staticSrc = path.join(root, ".next", "static");
  const staticDst = path.join(standaloneDir, ".next", "static");
  try {
    if (fs.existsSync(publicSrc) && !fs.existsSync(publicDst)) {
      fs.cpSync(publicSrc, publicDst, { recursive: true });
    }
    if (fs.existsSync(staticSrc) && !fs.existsSync(staticDst)) {
      fs.cpSync(staticSrc, staticDst, { recursive: true });
    }
  } catch {}

  const child = spawn(process.execPath, [standaloneServer], {
    cwd: standaloneDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      NEXT_PUBLIC_ARC_ONBOARD_MODE: "local",
    },
  });

  // Open the browser after a small delay so the server is listening.
  setTimeout(() => openBrowser(url), 800);

  const shutdown = () => {
    child.kill("SIGTERM");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  child.on("exit", (code) => process.exit(code ?? 0));
})();
