import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=resolve(fileURLToPath(new URL("../dist/pages/",import.meta.url)));
const files=new Map([
 ["/","index.html"],["/index.html","index.html"],
 ["/app.mjs","app.mjs"],["/src/policy.mjs","src/policy.mjs"]
]);
const server=createServer((req,res)=>{
 const path=new URL(req.url,"http://127.0.0.1").pathname;
 const file=files.get(path);
 if(!file){res.writeHead(404).end();return;}
 const type=file.endsWith(".mjs")?"text/javascript; charset=utf-8":"text/html; charset=utf-8";
 try{res.writeHead(200,{"Content-Type":type,"Cache-Control":"no-store"}).end(readFileSync(resolve(root,file)));}
 catch{res.writeHead(500).end();}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const port=server.address().port;
async function browser(scenario,expected){
 const url="http://127.0.0.1:"+port+"/?scenario="+scenario;
 const args=["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--no-first-run","--no-default-browser-check","--virtual-time-budget=2500","--dump-dom",url];
 const output=await new Promise((ok,fail)=>{
   const child=spawn(process.env.CHROME_BIN||"google-chrome",args,{stdio:["ignore","pipe","pipe"]});
   let out="",err="";
   const stop=setTimeout(()=>{child.kill("SIGKILL");fail(Error("CHROME_TIMEOUT:"+scenario));},25000);
   child.stdout.on("data",part=>{out+=part.toString();if(out.length>250000){child.kill("SIGKILL");}});
   child.stderr.on("data",part=>{err+=part.toString();if(err.length>20000)err=err.slice(-20000);});
   child.on("error",e=>{clearTimeout(stop);fail(e);});
   child.on("close",code=>{clearTimeout(stop);code===0?ok(out):fail(Error("CHROME_EXIT_"+code+":"+err.slice(-450)));});
 });
 if(!output.includes('data-state="'+expected+'"'))throw Error("BROWSER_STATE_MISMATCH:"+scenario+":"+expected);
 if(!output.includes("Permission gates, explained"))throw Error("BROWSER_HTML_MISSING");
 console.log("BROWSER_PASS "+scenario+" => "+expected);
}
try{
 await browser("safe","SIMULATION_PASS");
 await browser("escalation","DENY");
 await browser("review","REVIEW_REQUIRED");
 await browser("revoked","DENY");
 await browser("transfer","DENY");
} finally {server.close();}
