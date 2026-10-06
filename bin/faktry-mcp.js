#!/usr/bin/env node
// stdio bridge to the hosted faktry MCP server (https://faktry.ai/api/mcp).
//
// With FAKTRY_API_KEY set, requests are authenticated with that key.
// Without it, mcp-remote falls back to the browser OAuth flow.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const DEFAULT_URL = "https://faktry.ai/api/mcp";

const require = createRequire(import.meta.url);
const proxy = join(dirname(require.resolve("mcp-remote/package.json")), "dist", "proxy.js");

const url = process.env.FAKTRY_MCP_URL || DEFAULT_URL;
const apiKey = process.env.FAKTRY_API_KEY?.trim();

const args = [proxy, url];
const env = { ...process.env };

if (apiKey) {
  // mcp-remote expands ${VAR} in header values, so the key never appears in argv
  // (visible in process listings) and the value has no spaces for a shell to split.
  env.FAKTRY_AUTH_HEADER = `Bearer ${apiKey}`;
  args.push("--header", "Authorization:${FAKTRY_AUTH_HEADER}");
}

// stdout is the MCP channel; diagnostics must go to stderr.
const child = spawn(process.execPath, args, { stdio: "inherit", env });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (err) => {
  console.error(`faktry-mcp: failed to start bridge: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
