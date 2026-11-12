# Security scope

This project contains synthetic educational examples only. Report vulnerabilities privately using GitHub's private vulnerability reporting feature, where enabled; otherwise open a non-sensitive Issue with a minimal reproduction (never post secrets).

Important constraints:
- No real identity enrollment, authentic agent signatures, network access, production registry or backend authority.
- Financial actions are always excluded; `REVIEW_REQUIRED` is illustrative and does not approve anything.
- Browser content stays on the device. No remote fonts, scripts, telemetry, API calls or storage.
- The site is a static offline-capable example. It does not certify a security system or accessibility standard.
- All inputs are untrusted, bounded and validated in the Node reference.

If contributing changes to any sensitive gate, include negative tests and keep the real-execution flags false.
