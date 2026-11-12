import { auditAction, SAMPLE_REGISTRY, FIXTURE_TIME } from "./src/policy.mjs";
const agent = document.getElementById("agent");
const action = document.getElementById("action");
const claim = document.getElementById("claim");
const status = document.getElementById("status");
const summary = document.getElementById("summary");
const checks = document.getElementById("checks");
const next = document.getElementById("next");
const receipt = document.getElementById("receipt");
const presets = [...document.querySelectorAll("[data-scenario]")];
const scenarios = Object.freeze({
  safe: { agentId: "reader-demo", action: "READ_PUBLIC", claimedFullAccess: false },
  escalation: { agentId: "reader-demo", action: "WRITE_RECORD", claimedFullAccess: true },
  review: { agentId: "publisher-demo", action: "PUBLISH_DRAFT", claimedFullAccess: false },
  revoked: { agentId: "revoked-demo", action: "READ_PUBLIC", claimedFullAccess: false },
  transfer: { agentId: "publisher-demo", action: "TRANSFER_FUNDS", claimedFullAccess: true }
});
function activate(name) {
  const input = scenarios[name];
  if (!input) return;
  agent.value = input.agentId;
  action.value = input.action;
  claim.checked = input.claimedFullAccess;
  for (const b of presets) b.setAttribute("aria-pressed", String(b.dataset.scenario === name));
  evaluate();
}
function evaluate() {
  checks.replaceChildren();
  try {
    const result = auditAction({ registry: SAMPLE_REGISTRY, agentId: agent.value,
      action: action.value, claimedFullAccess: claim.checked, asOf: FIXTURE_TIME });
    document.body.dataset.state = result.status;
    status.textContent = result.status.replaceAll("_"," ");
    summary.textContent = result.status === "SIMULATION_PASS" ? "The example meets its local low-risk conditions." :
      result.status === "REVIEW_REQUIRED" ? "Do not execute. Review is required." :
      "One or more safety gates rejected the request.";
    for (const item of result.checks) {
      const li = document.createElement("li");
      li.className = "check";
      li.dataset.check = item.status;
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-hidden","true");
      const contents = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.label + " — " + item.status;
      const description = document.createElement("p");
      description.textContent = item.detail;
      contents.append(title,description);
      li.append(dot,contents);
      checks.append(li);
    }
    next.textContent = result.nextStep;
    receipt.textContent = JSON.stringify(result,null,2);
  } catch (error) {
    document.body.dataset.state = "DENY";
    status.textContent = "INVALID INPUT";
    summary.textContent = "The example is rejected.";
    next.textContent = String(error.message).slice(0,100);
    receipt.textContent = "";
  }
}
presets.forEach(b=>b.addEventListener("click",()=>activate(b.dataset.scenario)));
document.getElementById("run").addEventListener("click",evaluate);
for(const input of [agent,action,claim])input.addEventListener("change",()=>{
  for (const b of presets) b.setAttribute("aria-pressed","false");
  evaluate();
});
const requested = new URLSearchParams(location.search).get("scenario");
activate(Object.prototype.hasOwnProperty.call(scenarios,requested) ? requested : "safe");
