// Original educational reference: inputs are entirely caller-controlled and fictional.
// Passing this evaluation NEVER grants a real agent permission or identity.
export const FIXTURE_TIME = "2030-01-01T12:00:00Z";
export const ACTIONS = Object.freeze({
  READ_PUBLIC: { scope: "public.read", risk: "LOW", description: "Read a public document" },
  SUMMARIZE: { scope: "content.summarize", risk: "LOW", description: "Summarize public notes" },
  PUBLISH_DRAFT: { scope: "content.publish", risk: "HIGH", description: "Publish a prepared draft" },
  WRITE_RECORD: { scope: "records.write", risk: "HIGH", description: "Change a record" },
  TRANSFER_FUNDS: { scope: "funds.transfer", risk: "PROHIBITED", description: "Move money" }
});
export const SAMPLE_REGISTRY = Object.freeze([
  { id: "reader-demo", status: "ACTIVE", expiresAt: "2032-01-01T00:00:00Z", scopes: ["public.read", "content.summarize"] },
  { id: "publisher-demo", status: "ACTIVE", expiresAt: "2032-01-01T00:00:00Z", scopes: ["public.read", "content.publish"] },
  { id: "revoked-demo", status: "REVOKED", expiresAt: "2032-01-01T00:00:00Z", scopes: ["public.read"] },
  { id: "expired-demo", status: "ACTIVE", expiresAt: "2028-01-01T00:00:00Z", scopes: ["public.read"] }
]);
const IDENT = /^[a-z][a-z0-9-]{1,39}$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const SCOPES = new Set(Object.values(ACTIONS).map(a => a.scope));
const own = (x,k) => Object.prototype.hasOwnProperty.call(x,k);
const obj = x => x !== null && typeof x === "object" && !Array.isArray(x) &&
  (Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null);
const exact = (x,names) => obj(x) && Object.keys(x).length === names.length &&
  names.every(k => own(x,k));
function instant(value) {
  if (typeof value !== "string" || !DATE.test(value)) return null;
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) && new Date(epoch).toISOString().replace(".000Z","Z") === value ? epoch : null;
}
export function validateRegistry(registry) {
  if (!Array.isArray(registry) || registry.length < 1 || registry.length > 20) throw Error("INVALID_REGISTRY_SIZE");
  const ids = new Set();
  for (const agent of registry) {
    if (!exact(agent, ["id","status","expiresAt","scopes"]) ||
      typeof agent.id !== "string" || !IDENT.test(agent.id) ||
      !["ACTIVE","REVOKED"].includes(agent.status) || instant(agent.expiresAt) === null ||
      !Array.isArray(agent.scopes) || agent.scopes.length > 12 ||
      new Set(agent.scopes).size !== agent.scopes.length ||
      !agent.scopes.every(s => typeof s === "string" && SCOPES.has(s))) throw Error("INVALID_REGISTRY_AGENT");
    if (ids.has(agent.id)) throw Error("DUPLICATE_AGENT_ID");
    ids.add(agent.id);
  }
  return true;
}
export function auditAction({ registry, agentId, action, claimedFullAccess = false, asOf = FIXTURE_TIME }) {
  validateRegistry(registry);
  if (typeof agentId !== "string" || !IDENT.test(agentId)) throw Error("INVALID_AGENT_ID");
  if (typeof action !== "string" || !own(ACTIONS, action)) throw Error("UNKNOWN_ACTION");
  if (typeof claimedFullAccess !== "boolean") throw Error("INVALID_CLAIM");
  const timestamp = instant(asOf);
  if (timestamp === null) throw Error("INVALID_FIXTURE_TIME");
  const rule = ACTIONS[action], agent = registry.find(x => x.id === agentId);
  const codes = [], checks = [];
  const gate = (label, ok, failCode, detail) => {
    checks.push({ label, status: ok ? "PASS" : "FAIL", detail });
    if (!ok) codes.push(failCode);
  };
  gate("Registered agent", Boolean(agent), "NOT_REGISTERED",
    agent ? "Found in the fictional local registry." : "No matching local registry entry.");
  gate("Not revoked", Boolean(agent && agent.status === "ACTIVE"), "REVOKED_OR_UNKNOWN",
    agent && agent.status === "ACTIVE" ? "Local status is ACTIVE." : "Agent is revoked or missing.");
  gate("Enrollment unexpired", Boolean(agent && instant(agent.expiresAt) > timestamp), "EXPIRED_OR_UNKNOWN",
    agent ? "Compared with the fixed fictional reference clock." : "No expiry can be checked.");
  gate("Capability granted", Boolean(agent && agent.scopes.includes(rule.scope)), "SCOPE_NOT_GRANTED",
    agent && agent.scopes.includes(rule.scope) ? "Registry includes " + rule.scope + "." :
      "The registry does not grant " + rule.scope + ".");
  gate("Action inside demonstration boundary", rule.risk !== "PROHIBITED", "ACTION_OUT_OF_SCOPE",
    rule.risk === "PROHIBITED" ? "Financial orders and transfers are excluded." :
      rule.risk === "HIGH" ? "Consequential action requires external human review." :
      "Low-impact fictional action.");
  const status = codes.length ? "DENY" : rule.risk === "HIGH" ? "REVIEW_REQUIRED" : "SIMULATION_PASS";
  if (status === "REVIEW_REQUIRED") codes.push("HUMAN_REVIEW_REQUIRED");
  checks.push({ label: "Agent's self-declared full access", status: "IGNORED",
    detail: claimedFullAccess ? "Claimed by caller; cannot expand registry permissions." :
      "No extra claim supplied. Claims never grant authority." });
  return {
    schema: "esheen-agent-capability-policy-lab-v1",
    agentId, action, requestedScope: rule.scope, risk: rule.risk, status,
    reasonCodes: codes, checks, claimedFullAccess,
    nextStep: status === "SIMULATION_PASS" ? "Simulation passed. Real identity and authorization still require independent enforcement." :
      status === "REVIEW_REQUIRED" ? "Route to a real independently authorized human approval workflow; this lab cannot approve or execute." :
      "Deny the example request. Correct the registration, scope, expiry or prohibited action before reconsidering.",
    realExecutionAllowed: false, realIdentityVerified: false, financialAuthority: false
  };
}
