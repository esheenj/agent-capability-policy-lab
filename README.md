# Agent Capability Policy Lab

**Support this open-source project (optional):** [Esheen Labs crypto support](https://esheenj.github.io/compound-intelligence-starter/support.html) accepts maintainer-supplied BTC on Bitcoin and USDT on Solana, Ethereum/ERC-20 or Tron/TRC-20. The destination addresses are **custodial Pionex exchange deposits** and may change; check the exact network, current address and minimum before sending. Contributions do not buy priority, access or execution authority. All demos and source remain free.

**Before an AI agent acts, inspect what it can actually request.**

An original, standalone **offline agent-permission sandbox** from Esheen Labs. Check an invented agent's registration, revocation, expiration and scoped capabilities. High-impact actions are routed to simulated human review; money movement is always excluded. The tool makes no real identity, authorization or execution claims.

**[Explore the live browser playground](https://esheenj.github.io/agent-capability-policy-lab/)** · [View all Esheen Labs demos](https://esheenj.github.io/compound-intelligence-starter/) · [Contribute](CONTRIBUTING.md)

> The browser URL is relevant only after its separately verified GitHub Pages publication. Source or CI success alone does not prove hosting.

## For builders

Try four real developer workflows using *fictional* inputs:

- **Low-risk read:** a sample agent has a matching `public.read` grant; the result is `SIMULATION_PASS`, not authorization.
- **Scope escalation:** a read-only agent claims full access, yet a write request is denied.
- **Revocation and expiry:** an otherwise valid scope is overridden by stale or revoked enrollment.
- **Consequential action:** a scoped publisher receives `REVIEW_REQUIRED`; a financial transfer is denied outright.

Run locally (Node.js 20+, no dependencies or accounts):

```sh
npm test
npm run demo
npm run check:site
npm run stage
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist/pages
```

Open http://127.0.0.1:8000. The browser and CLI share the **same original pure policy module** at `src/policy.mjs`, keeping outcomes deterministic. Browser UI is static HTML/CSS and one local ES module; there are no external scripts, images, models, analytics, API calls, credentials or storage.

CLI:

```sh
node bin/audit.mjs examples/cases.json
```

The output records per-check results, reason codes, risk classification and the next simulated step. Inputs are bounded to 64 KiB by the CLI. Supply only original or invented sample data; do not paste real agents, secrets or customer records.

## What it actually proves

It demonstrates the importance of **fail-closed local policy**, scoped grants and separating a self-asserted claim from an independently enrolled authority. It does **not** prove an agent's identity. The example registry and reference clock (`2030-01-01T12:00:00Z`) are supplied locally and can be controlled by the caller.

A real production integration needs independent signed challenges, trusted registry issuance, durable replay prevention, trusted clock and revocation, server-side enforcement, external human authorization for consequential operations and independently reconciled audit logs. No such integrations are present.

`SIMULATION_PASS` is never permission to access accounts, execute trades, write files, move money or send messages. No financial, private infrastructure or trading authority is part of this project.

## Repository map

| Path | Purpose |
|---|---|
| `src/policy.mjs` | Pure original policy simulator, strict validation, bounded results |
| `index.html`, `app.mjs` | Interactive offline visitor experience |
| `examples/cases.json` | Fictional scenarios |
| `bin/audit.mjs` | Reproducible CLI |
| `tests/policy.test.mjs` | Negative tests and scenario checks |
| `scripts/stage-site.mjs` | Exact static GitHub Pages publishing allowlist |
| `scripts/browser-check.mjs` | Independent real Chrome behaviour checks in CI |
| `.github/workflows/` | CI-gated publishing, no paid service |

## Safety and release integrity

- MIT-licensed original content; no private Esheen Labs or employer repository history is included.
- The `pages` workflow publishes only three allowlisted source files plus `.nojekyll`, after green `main` CI.
- A PR is source proposed work, not a release. Published HTTPS reachability and real interaction checks must be recorded separately.
- [Security reporting](SECURITY.md) · [Contribution guide](CONTRIBUTING.md).

Additional recurring infrastructure spend: **R0**.
