import { writeFileSync } from 'node:fs';
import { articles } from '../src/articles';
const article=articles[0];
writeFileSync('/tmp/vagyonado-vfinal.json',JSON.stringify(article));
let md='# '+article.title+'\n\nICT Európa · Szakmai szerkesztőség\n\n'+article.intro+'\n';
for(const s of article.sections){md+='\n## '+s.title+'\n\n'+s.paragraphs.join('\n\n')+'\n';if(s.formula)md+='\n```text\n'+s.formula+'\n```\n';if(s.table)md+='\n| '+s.table.head.join(' | ')+' |\n| '+s.table.head.map(()=>'---').join(' | ')+' |\n'+s.table.rows.map(r=>'| '+r.join(' | ')+' |').join('\n')+'\n';}
writeFileSync('docs/vagyonado-cikk-vfinal.md',md);
