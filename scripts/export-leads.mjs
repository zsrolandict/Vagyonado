import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const db=new DatabaseSync(process.env.LEADS_DB_PATH||'.local/leads.sqlite',{readOnly:true});
const rows=db.prepare('SELECT id, created_at, payload, policy_version FROM leads WHERE created_at >= ? ORDER BY created_at').all(new Date(Date.now()-30*86400000).toISOString());
const output=resolve(process.argv[2]||'.local/teszt-megkeresesek.json');
writeFileSync(output,JSON.stringify(rows.map(r=>({...r,payload:JSON.parse(r.payload)})),null,2),{mode:0o600});db.close();
console.log(`Export mentve: ${output} (${rows.length} tesztmegkeresés).`);
