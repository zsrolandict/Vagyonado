import {spawn} from 'node:child_process';
const children=[spawn(process.execPath,['server.mjs'],{stdio:'inherit',env:{...process.env,PORT:'3001',API_ONLY:'1'}}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0'],{stdio:'inherit'})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;}
for(const child of children){child.on('error',()=>stop(1));child.on('exit',code=>stop(code??1));}
process.on('SIGTERM',()=>stop());process.on('SIGINT',()=>stop());
