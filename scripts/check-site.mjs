import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const app=readFileSync(new URL("../app.mjs",import.meta.url),"utf8");
test("source site has a strict offline CSP and no external assets",()=>{
 assert.match(html,/connect-src 'none'/);
 assert.match(html,/script-src 'self'/);
 assert.match(html,/src="\.\/app\.mjs"/);
 assert.doesNotMatch(html,/<iframe|<img|<script[^>]*https?:/i);
 assert.doesNotMatch(app,/\bfetch\s*\(|XMLHttpRequest|localStorage|innerHTML|\beval\s*\(/);
});
test("UX has distinct scenario controls and safe receipt surface",()=>{
 for(const name of ["safe","escalation","review","revoked","transfer"]){
   assert.match(html,new RegExp('data-scenario="'+name+'"'));
   assert.match(app,new RegExp(name+':\\s*\\{'));
 }
 assert.match(html,/role="status"/);
 assert.match(html,/prefers-reduced-motion/);
 assert.match(html,/id="receipt"/);
 assert.match(app,/\.textContent/);
});
test("no real authority is advertised",()=>{
 assert.match(html,/not authorization/i);
 assert.match(html,/No customer data, credentials/i);
 assert.doesNotMatch(html,/WCAG certified|real agent identity verified/i);
});
