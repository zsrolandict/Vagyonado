import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createApp,validateContact} from '../server.mjs';
const sample={firstName:'Teszt',lastName:'Minta',email:'teszt@example.com',phone:'',business:false,message:'Tesztelni szeretném az űrlap működését.',consent:true,website:''};
test('név, email, üzenet, hozzájárulás és céges mezők szerveroldali ellenőrzése',()=>{assert.equal(validateContact(sample),null);for(const change of [{email:'hibás'},{consent:false},{firstName:''},{message:'rövid'},{website:'robot'},{business:true}])assert.ok(validateContact({...sample,...change}));assert.equal(validateContact({...sample,business:true,company:'Teszt Kft.',companyType:'Kft.',revenue:'100 millió Ft alatt'}),null);});
test('valós HTTP rögzítés, privát tárolás, eredetvédelem és korlátozás',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'vagyonado-api-'));const path=join(dir,'leads.sqlite');const server=createApp({dbPath:path,apiOnly:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const post=(data,origin)=>fetch(base+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',...(origin?{Origin:origin}:{})},body:JSON.stringify(data)});
  assert.equal((await fetch(base+'/api/health')).status,200);assert.equal((await fetch(base+'/api/contact')).status,405);
  assert.equal((await post({...sample,consent:false})).status,400);assert.equal((await post(sample,'https://evil.example')).status,403);
  const response=await post(sample,base);assert.equal(response.status,201);const body=await response.json();assert.match(body.reference,/^[a-f0-9-]{36}$/);assert.equal(body.mode,'demo');
  const db=new DatabaseSync(path,{readOnly:true});const row=db.prepare('SELECT * FROM leads WHERE id=?').get(body.reference);assert.equal(JSON.parse(row.payload).email,'teszt@example.com');assert.equal(row.policy_version,'demo-v1');db.close();assert.equal(statSync(path).mode&0o777,0o600);
  for(let i=0;i<4;i++)assert.equal((await post(sample)).status,201);assert.equal((await post(sample)).status,429);assert.equal((await fetch(base+'/api/leads')).status,404);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
test('lejárt tesztadatok törlése újraindításkor',async()=>{const dir=mkdtempSync(join(tmpdir(),'vagyonado-prune-'));const path=join(dir,'leads.sqlite');const server=createApp({dbPath:path});const db=new DatabaseSync(path);db.prepare('INSERT INTO leads VALUES (?,?,?,?)').run('old','2000-01-01T00:00:00.000Z','{}','demo-v1');db.close();server.emit('close');const next=createApp({dbPath:path});const read=new DatabaseSync(path,{readOnly:true});assert.equal(read.prepare('SELECT COUNT(*) AS n FROM leads').get().n,0);read.close();next.emit('close');rmSync(dir,{recursive:true,force:true});});
