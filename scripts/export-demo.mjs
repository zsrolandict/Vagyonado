import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,basename,extname} from 'node:path';
const dist=resolve('dist');
let html=readFileSync(resolve(dist,'index.html'),'utf8');
const scriptPath=html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)?.[1];
const stylePath=html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if(!scriptPath||!stylePath)throw new Error('Előbb futtassa az npm run build parancsot.');
let javascript=readFileSync(resolve(dist,'.'+scriptPath),'utf8');
// Keep photographs available when this single file is opened without a server.
javascript=javascript.replace(/(["'])(\/images\/[^"']+)\1/g,(_whole,_quote,path)=>{
 const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[extname(path)];
 if(!mime)throw new Error(`Ismeretlen képformátum: ${path}`);
 return JSON.stringify(`data:${mime};base64,${readFileSync(resolve(dist,'.'+path)).toString('base64')}`);
});
javascript=javascript.replace(/<\/script/gi,'<\\/script');
let css=readFileSync(resolve(dist,'.'+stylePath),'utf8');
css=css.replace(/url\((?:["'])?([^)'"\s]+)(?:["'])?\)/g,(whole,path)=>{
 if(!path.startsWith('/assets/'))return whole;
 const mime=path.endsWith('.woff2')?'font/woff2':'font/woff';
 return `url(data:${mime};base64,${readFileSync(resolve(dist,'.'+path)).toString('base64')})`;
});
const sources={};
for(const file of readdirSync(resolve(dist,'forrasok'))){
 const mime=extname(file)==='.pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 sources['/forrasok/'+file]={mime,filename:file,base64:readFileSync(resolve(dist,'forrasok',file)).toString('base64')};
}
const support=`
const embeddedSources=${JSON.stringify(sources)};
// Local files cannot use the server's route URLs. Component state still controls navigation.
if(location.protocol==='file:'){
 history.pushState=function(){};history.replaceState=function(){};
}
const nativeFetch=window.fetch.bind(window);
window.fetch=function(input,options){
 if(typeof input==='string'&&input.startsWith('/api/'))return Promise.resolve(new Response(JSON.stringify({error:'Az önálló HTML-bemutató nem küld űrlapot. Valós kapcsolatfelvételhez keresse fel az ICT Európa honlapját.'}),{status:503,headers:{'Content-Type':'application/json'}}));
 return nativeFetch(input,options);
};
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a');if(!link)return;
 const source=embeddedSources[link.getAttribute('href')];if(!source)return;
 event.preventDefault();
 const bytes=Uint8Array.from(atob(source.base64),c=>c.charCodeAt(0));
 const url=URL.createObjectURL(new Blob([bytes],{type:source.mime}));
 const download=document.createElement('a');download.href=url;download.download=source.filename;download.click();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
},true);
`;
html=html.replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/,()=>`<script>${support.replace(/<\/script/gi,'<\\/script')}</script><script type="module">${javascript}</script>`);
html=html.replace(/<link[^>]+href="[^"]+\.css"[^>]*>/,()=>`<style>${css}</style>`);
html=html.replace(/href="\/favicon\.svg(?:\?[^\"]*)?"/,'href="data:image/svg+xml;base64,'+readFileSync(resolve(dist,'favicon.svg')).toString('base64')+'"');
html=html.replace('<div id="root"></div>','<div style="background:#e7f7fb;color:#1d3657;padding:8px 20px;text-align:center;font:11px Arial,sans-serif">Önálló bemutató · A kalkulátor és a cikkek működnek, az űrlap nem küld megkeresést.</div><div id="root"></div>');
const output=resolve(process.argv[2]||'/workspace/Vagyonado-bemutato.html');
writeFileSync(output,html);console.log(`Megnyitható HTML-bemutató: ${output} (${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MB).`);
