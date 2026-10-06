import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,chmodSync,readFileSync,statSync} from 'node:fs';
import {dirname,resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const companyTypes=['Bt.','Kft.','Zrt. / Nyrt.','Egyéb'];
const revenues=['100 millió Ft alatt','100–500 millió Ft','500 millió–2 milliárd Ft','2–5 milliárd Ft','5 milliárd Ft felett'];
export function validateContact(data){
  if(!data||typeof data!=='object'||Array.isArray(data))return 'Érvénytelen űrlapadatok.';
  const str=(key,min,max)=>typeof data[key]==='string'&&data[key].trim().length>=min&&data[key].length<=max;
  if(!str('firstName',1,80)||!str('lastName',1,80))return 'Adja meg a vezeték- és keresztnevét.';
  if(!str('email',3,254)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))return 'Adjon meg érvényes e-mail-címet.';
  if(data.phone&&(!str('phone',6,30)||!/^\+?[0-9 ()/\-]+$/.test(data.phone)))return 'Ellenőrizze a telefonszámot.';
  if(typeof data.business!=='boolean')return 'Válassza ki a megkeresés típusát.';
  if(data.business&&(!str('company',1,150)||!companyTypes.includes(data.companyType)||!revenues.includes(data.revenue)))return 'Töltse ki a céges adatokat és válasszon árbevételi sávot.';
  if(!str('message',10,2500))return 'Az üzenet legalább 10, legfeljebb 2 500 karakter legyen.';
  if(data.consent!==true)return 'A tesztadatok kezeléséhez hozzájárulás szükséges.';
  if(data.website)return 'A beküldés nem fogadható el.';
  return null;
}
export function createApp({dbPath='.local/leads.sqlite',distPath='dist',apiOnly=false}={}){
  const path=resolve(dbPath),dist=resolve(distPath);
  if(path===dist||path.startsWith(dist+sep)||path.startsWith(resolve('public')+sep))throw new Error('Az adatbázis nem kerülhet nyilvános könyvtárba.');
  mkdirSync(dirname(path),{recursive:true,mode:0o700});
  const db=new DatabaseSync(path);
  db.exec('CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL, policy_version TEXT NOT NULL)');
  chmodSync(path,0o600);
  const prune=()=>db.prepare('DELETE FROM leads WHERE created_at < ?').run(new Date(Date.now()-30*86400000).toISOString());
  prune();const timer=setInterval(prune,3600000);timer.unref();
  const rate=new Map();
  const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"};
  const json=(res,status,data)=>{res.writeHead(status,{...security,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  const server=createServer(async(req,res)=>{
    try{
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(pathname==='/api/health'&&req.method==='GET')return json(res,200,{status:'ok',formMode:'demo'});
      if(pathname==='/api/contact'){
        if(req.method!=='POST')return json(res,405,{error:'Csak POST kérés fogadható.'});
        if(req.headers.origin){let origin;try{origin=new URL(req.headers.origin);}catch{return json(res,403,{error:'Érvénytelen eredet.'});}if(origin.host!==req.headers.host)return json(res,403,{error:'Eltérő eredetű kérés nem fogadható.'});}
        if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'JSON űrlapadat szükséges.'});
        let body='',size=0;for await(const part of req){size+=part.length;if(size>16384)return json(res,413,{error:'Túl nagy űrlap.'});body+=part.toString();}
        let data;try{data=JSON.parse(body);}catch{return json(res,400,{error:'Érvénytelen űrlapadatok.'});}
        const error=validateContact(data);if(error)return json(res,400,{error});
        const now=Date.now();for(const [ip,r] of rate)if(now-r.start>900000)rate.delete(ip);
        const key=req.socket.remoteAddress;const recent=rate.get(key)||{start:now,count:0};if(recent.count>=5)return json(res,429,{error:'Túl sok megkeresés érkezett. Próbálja újra 15 perc múlva.'});recent.count++;rate.set(key,recent);
        const id=randomUUID();const payload={firstName:data.firstName.trim(),lastName:data.lastName.trim(),email:data.email.trim(),phone:data.phone?.trim()||'',business:data.business,company:data.business?data.company.trim():'',companyType:data.business?data.companyType:'',revenue:data.business?data.revenue:'',message:data.message.trim(),consent:true};
        db.prepare('INSERT INTO leads (id,created_at,payload,policy_version) VALUES (?,?,?,?)').run(id,new Date().toISOString(),JSON.stringify(payload),'demo-v1');
        return json(res,201,{reference:id,mode:'demo'});
      }
      if(pathname.startsWith('/api/')||apiOnly)return json(res,404,{error:'Nem található.'});
      if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Nem engedélyezett metódus.'});
      let decoded;try{decoded=decodeURIComponent(pathname);}catch{return json(res,400,{error:'Érvénytelen útvonal.'});}
      if(decoded.split('/').some(p=>p.startsWith('.')||p==='..')||decoded.includes('\\'))return json(res,404,{error:'Nem található.'});
      let file=resolve(dist,'.'+decoded);if(file!==dist&&!file.startsWith(dist+sep))return json(res,404,{error:'Nem található.'});
      try{if(!statSync(file).isFile())throw new Error();}catch{if(extname(pathname)||!(pathname==='/'||/^\/cikkek\/[a-z0-9-]+\/?$/.test(pathname)))return json(res,404,{error:'Nem található.'});file=resolve(dist,'index.html');}
      const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.txt':'text/plain; charset=utf-8'};
      const buffer=readFileSync(file);res.writeHead(200,{...security,'Content-Type':mime[extname(file)]||'application/octet-stream','Content-Length':buffer.length,'Cache-Control':file.includes(`${sep}assets${sep}`)?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:buffer);
    }catch{if(!res.headersSent)json(res,500,{error:'A rögzítés átmenetileg nem sikerült. Próbálja újra később.'});else res.end();}
  });
  server.on('close',()=>{clearInterval(timer);db.close();});return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=createApp({dbPath:process.env.LEADS_DB_PATH||'.local/leads.sqlite',apiOnly:process.env.API_ONLY==='1'});
  server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Vagyonadó kiszolgáló elindult (port: ${Number(process.env.PORT)||3000}, űrlap: bemutató).`));
  process.on('SIGTERM',()=>server.close());process.on('SIGINT',()=>server.close());
}
