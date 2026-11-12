#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { auditAction } from "../src/policy.mjs";
const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  console.error("Usage: node bin/audit.mjs examples/cases.json");
  process.exitCode = 2;
} else {
  try {
    const raw = readFileSync(file);
    if (raw.byteLength > 65536) throw Error("INPUT_TOO_LARGE");
    const data = JSON.parse(raw.toString("utf8"));
    if (!Array.isArray(data.requests) || data.requests.length > 40) throw Error("INVALID_REQUESTS");
    const results = data.requests.map(q => auditAction({
      registry: data.registry, agentId: q.agentId, action: q.action,
      claimedFullAccess: q.claimedFullAccess ?? false, asOf: data.asOf
    }));
    console.log(JSON.stringify({ schema: "esheen-agent-capability-policy-lab-results-v1",
      fictional: true, reviewed: results.length, results }, null, 2));
  } catch (error) {
    console.error("REJECTED: " + error.message);
    process.exitCode = 2;
  }
}
