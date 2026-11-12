import test from "node:test";
import assert from "node:assert/strict";
import { auditAction, validateRegistry, SAMPLE_REGISTRY, FIXTURE_TIME } from "../src/policy.mjs";
const run = (agentId,action,extra={}) => auditAction({registry:SAMPLE_REGISTRY,agentId,action,...extra});
test("valid low-risk public read is only simulated",()=>{
 const r=run("reader-demo","READ_PUBLIC");
 assert.equal(r.status,"SIMULATION_PASS");
 assert.equal(r.realExecutionAllowed,false); assert.equal(r.realIdentityVerified,false);
 assert.equal(r.financialAuthority,false); assert.deepEqual(r.reasonCodes,[]);
});
test("registered scope does not let read-only agent write",()=>{
 const r=run("reader-demo","WRITE_RECORD");
 assert.equal(r.status,"DENY"); assert.ok(r.reasonCodes.includes("SCOPE_NOT_GRANTED"));
});
test("caller full-access claims cannot elevate scope",()=>{
 const r=run("reader-demo","WRITE_RECORD",{claimedFullAccess:true});
 assert.equal(r.status,"DENY"); assert.ok(r.reasonCodes.includes("SCOPE_NOT_GRANTED"));
 assert.equal(r.checks.at(-1).status,"IGNORED");
});
test("an active scoped publisher is routed to review, never execution",()=>{
 const r=run("publisher-demo","PUBLISH_DRAFT");
 assert.equal(r.status,"REVIEW_REQUIRED");
 assert.ok(r.reasonCodes.includes("HUMAN_REVIEW_REQUIRED"));
 assert.equal(r.realExecutionAllowed,false);
});
test("financial transfer remains prohibited regardless of caller claims",()=>{
 const r=run("publisher-demo","TRANSFER_FUNDS",{claimedFullAccess:true});
 assert.equal(r.status,"DENY"); assert.ok(r.reasonCodes.includes("ACTION_OUT_OF_SCOPE"));
});
test("revocation overrides a matching scope",()=>assert.equal(run("revoked-demo","READ_PUBLIC").status,"DENY"));
test("expiry overrides a matching scope",()=>assert.equal(run("expired-demo","READ_PUBLIC").status,"DENY"));
test("missing enrollment denies",()=>assert.ok(run("missing-demo","READ_PUBLIC").reasonCodes.includes("NOT_REGISTERED")));
test("exact expiry boundary denies",()=>{
 const registry=[{...SAMPLE_REGISTRY[0],expiresAt:FIXTURE_TIME}];
 assert.equal(auditAction({registry,agentId:"reader-demo",action:"READ_PUBLIC"}).status,"DENY");
});
test("invalid action fails closed",()=>assert.throws(()=>run("reader-demo","EXECUTE_ARBITRARY"),/UNKNOWN_ACTION/));
test("invalid timestamp rejected, including impossible calendar date",()=>assert.throws(()=>run("reader-demo","READ_PUBLIC",{asOf:"2030-02-31T12:00:00Z"}),/INVALID_FIXTURE_TIME/));
test("duplicate IDs rejected",()=>assert.throws(()=>validateRegistry([SAMPLE_REGISTRY[0],SAMPLE_REGISTRY[0]]),/DUPLICATE_AGENT_ID/));
test("unknown registry scope rejected",()=>assert.throws(()=>validateRegistry([{...SAMPLE_REGISTRY[0],scopes:["root.*"]}]),/INVALID_REGISTRY_AGENT/));
test("malformed registry member rejected",()=>assert.throws(()=>validateRegistry([{id:"hello",status:"ACTIVE"}]),/INVALID_REGISTRY_AGENT/));
test("array and boolean inputs cannot spoof claims",()=>assert.throws(()=>run("reader-demo","READ_PUBLIC",{claimedFullAccess:[]}),/INVALID_CLAIM/));
test("untrusted prototype and duplicate scope rejected",()=>{
 assert.throws(()=>validateRegistry([{...SAMPLE_REGISTRY[0],scopes:["public.read","public.read"]}]),/INVALID_REGISTRY_AGENT/);
 const inherited = Object.assign(Object.create({ injected: true }), SAMPLE_REGISTRY[0]);
 assert.throws(()=>validateRegistry([inherited]),/INVALID_REGISTRY_AGENT/);
});
