#!/usr/bin/env node
// One-command release: npm run release -- <patch|minor|major|x.y.z> [--dry-run]
//
// Bumps the version in package.json and server.json, commits, tags vX.Y.Z and pushes.
// The tag push triggers .github/workflows/publish.yml, which publishes to npm and the MCP Registry.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const bump = args.find((a) => !a.startsWith("--"));

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
const fail = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};

if (!bump) fail("usage: npm run release -- <patch|minor|major|x.y.z> [--dry-run]");

const pkg = readFileSync("package.json", "utf8");
const current = JSON.parse(pkg).version;
const [major, minor, patch] = current.split(".").map(Number);

let next;
if (bump === "patch") next = `${major}.${minor}.${patch + 1}`;
else if (bump === "minor") next = `${major}.${minor + 1}.0`;
else if (bump === "major") next = `${major + 1}.0.0`;
else if (/^\d+\.\d+\.\d+$/.test(bump)) next = bump;
else fail(`"${bump}" is not patch, minor, major or x.y.z`);

console.log(`${current} -> ${next}${dryRun ? " (dry run, nothing changed)" : ""}`);
if (dryRun) process.exit(0);

if (git("status", "--porcelain")) fail("working tree is not clean; commit or stash first");
if (git("branch", "--show-current") !== "main") fail("run releases from main");
git("fetch", "origin", "main");
if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) fail("main is not in sync with origin/main; pull or push first");
if (git("tag", "--list", `v${next}`)) fail(`tag v${next} already exists`);

// Regex replace (not JSON.stringify) so the files' formatting stays untouched.
for (const file of ["package.json", "server.json"]) {
  const text = readFileSync(file, "utf8");
  const updated = text.replaceAll(`"version": "${current}"`, `"version": "${next}"`);
  if (updated === text) fail(`no "${current}" version found in ${file}`);
  writeFileSync(file, updated);
}

git("add", "package.json", "server.json");
git("commit", "-m", `Release ${next}`);
git("tag", `v${next}`);
git("push", "origin", "main", `v${next}`);

console.log(`Pushed v${next}. Watch it publish: https://github.com/faktry/faktry-mcp/actions`);
