#!/usr/bin/env node
// Reads your local Claude Code usage logs and publishes a short summary to Supabase.
//
// Usage:
//   node scripts/claude-usage.mjs --dry-run      print the summary, send nothing
//   node scripts/claude-usage.mjs                send to Supabase (needs the two env vars below)
//
// Env vars (keep these on your computer only, never in the repo):
//   SUPABASE_URL          the Project URL, e.g. https://xyz.supabase.co
//   SUPABASE_SECRET_KEY   the secret / service_role key (Project Settings -> API)
//   CLAUDE_CONFIG_DIR     optional, defaults to ~/.claude

import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const TZ = "Asia/Dhaka";
const dryRun = process.argv.includes("--dry-run");
const root = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const projects = join(root, "projects");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith(".jsonl")) yield path;
  }
}

// Local calendar day (Dhaka) as YYYY-MM-DD.
const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

// "claude-opus-4-5-20251101" -> "opus-4-5"
const modelName = (raw = "unknown") => raw.replace(/^claude-/, "").replace(/-\d{8}$/, "");

const now = new Date();
const todayKey = dayKey(now);
const thisMonth = todayKey.slice(0, 7);
const seen = new Set();
const daily = new Map();
const models = new Map();
const breakdown = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };
let allTime = 0;
let month = 0;
let today = 0;
let files = 0;

try {
  for await (const file of walk(projects)) {
    files++;
    const lines = (await readFile(file, "utf8")).split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const usage = entry?.message?.usage;
      const when = entry?.timestamp ? new Date(entry.timestamp) : null;
      if (!usage || !when || Number.isNaN(when.getTime())) continue;

      // Claude Code can write the same API response on more than one line; count it once.
      const id = entry.message?.id ? `${entry.message.id}:${entry.requestId ?? ""}` : null;
      if (id) {
        if (seen.has(id)) continue;
        seen.add(id);
      }

      const input = usage.input_tokens ?? 0;
      const output = usage.output_tokens ?? 0;
      const cacheWrite = usage.cache_creation_input_tokens ?? 0;
      const cacheRead = usage.cache_read_input_tokens ?? 0;
      const total = input + output + cacheWrite + cacheRead;
      if (!total) continue;

      const key = dayKey(when);
      daily.set(key, (daily.get(key) ?? 0) + total);
      allTime += total;
      if (key === todayKey) today += total;
      if (key.startsWith(thisMonth)) {
        month += total;
        breakdown.input += input;
        breakdown.output += output;
        breakdown.cacheWrite += cacheWrite;
        breakdown.cacheRead += cacheRead;
        const name = modelName(entry.message?.model);
        models.set(name, (models.get(name) ?? 0) + total);
      }
    }
  }
} catch (error) {
  console.error(`Could not read Claude Code logs at ${projects}: ${error.message}`);
  process.exit(1);
}

const last14 = Array.from({ length: 14 }, (_, i) => {
  const date = dayKey(new Date(now.getTime() - (13 - i) * 86_400_000));
  return { date, tokens: daily.get(date) ?? 0 };
});

const topModels = [...models.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([name, tokens]) => ({ name, tokens, pct: month ? Math.round((tokens / month) * 100) : 0 }));

const summary = {
  timezone: TZ,
  generatedAt: now.toISOString(),
  filesScanned: files,
  today,
  month,
  monthLabel: new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "long", year: "numeric" }).format(now),
  allTime,
  last14,
  models: topModels,
  breakdown,
};

if (dryRun || !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  if (!dryRun) console.error("SUPABASE_URL / SUPABASE_SECRET_KEY not set: printing only. Use --dry-run to silence this.");
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

const base = process.env.SUPABASE_URL.replace(/\/+$/, "");
const key = process.env.SUPABASE_SECRET_KEY;
const response = await fetch(`${base}/rest/v1/claude_usage?on_conflict=id`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  },
  body: JSON.stringify([{ id: "main", data: summary, updated_at: now.toISOString() }]),
});

if (!response.ok) {
  console.error(`Supabase rejected the update: ${response.status} ${await response.text()}`);
  process.exit(1);
}
console.log(`Synced: today ${today.toLocaleString()} tokens, month ${month.toLocaleString()}, all-time ${allTime.toLocaleString()} (${files} log files).`);
