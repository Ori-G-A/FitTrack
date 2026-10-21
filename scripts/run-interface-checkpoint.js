import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {verifyTrace} from './sdd-trace.js';
import {contractIds} from './sdd-contract.js';

// E4/E5 incorporan solo los CHANGE ya implementados. La suite roja congelada
// conserva su configuración; E6 añade los siete casos al descubrimiento normal.
const phases={
 e4:{grep:'teclado y foco',tests:2,ids:['FR-021','US4-AS1']},
 e5:{grep:'teclado y foco|campo',tests:5,ids:['FR-021','US4-AS1','FR-022','US4-AS2']},
 e5b:{tests:7,ids:['FR-021','US4-AS1','FR-022','US4-AS2','FR-024','US1-AS9']},
};
const stage=process.argv[2],phase=phases[stage];
if(!phase||process.argv.length!==3)throw Error('Elegir e4, e5 o e5b');
const require=createRequire(import.meta.url),prefix=`test-results/interface-${stage}`;
mkdirSync('test-results',{recursive:true});
writeFileSync(`${prefix}-checkpoint.json`,JSON.stringify({passed:false,stage}));
const pkg=JSON.parse(readFileSync('package.json','utf8'));
if(process.version!==`v${pkg.devEngines.runtime.version}`)throw Error('Usar el runtime declarado mediante pnpm');
function run(args,file){
 const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:20*1024*1024});
 writeFileSync(file,(result.stdout||'')+(file.endsWith('.log')?result.stderr||'':''));
 if(result.error||result.status!==0){process.stderr.write(result.stderr||'');throw result.error||Error(`Checkpoint ${stage}: fallo ${result.status}; consultar ${file}`);}
 return result.stdout;
}
const tap=run(['--test','--test-isolation=none','--test-reporter=tap'],`${prefix}-node.tap`);
for(const name of ['fail','skipped','cancelled'])if(!new RegExp(`^# ${name} 0$`,'m').test(tap))throw Error('Suite Node incompleta: '+name);
const browser=JSON.parse(run([require.resolve('@playwright/test/cli'),'test','--reporter=json'],`${prefix}-browser.json`));
const changeArgs=[require.resolve('@playwright/test/cli'),'test','--config=playwright.interface-change.config.js','--reporter=json'];
if(phase.grep)changeArgs.push('--grep',phase.grep);
const change=JSON.parse(run(changeArgs,`${prefix}-change.json`));
const results=[...tap.matchAll(/^(ok|not ok) \d+ - (.+)$/gm)].map(m=>({name:m[2].replace(/ # (SKIP|TODO).*$/,''),status:/ # (SKIP|TODO)/.test(m[2])?'skipped':m[1]==='ok'?'passed':'failed'}));
function collect(suites){for(const suite of suites){for(const spec of suite.specs||[])for(const test of spec.tests)results.push({name:spec.title,status:test.results.length===1?test.results[0].status:'retried'});collect(suite.suites||[]);}}
for(const report of [browser,change]){if(report.errors.length||report.stats.skipped||report.stats.flaky||report.stats.unexpected)throw Error('Resultados de navegador incompletos');collect(report.suites);}
if(browser.stats.expected!==20||change.stats.expected!==phase.tests)throw Error('Descubrimiento inesperado de navegador');
const manifest=JSON.parse(readFileSync('specs/006-interfaz/traceability.json','utf8'));
for(const row of manifest.requirements)if(phase.ids.includes(row.id)){row.status='complete';row.tests=[...row.plannedTests];}
const trace=verifyTrace(manifest,contractIds(readFileSync('specs/006-interfaz/spec.md','utf8')),results,{complete:stage==='e5b'});
if(trace.errors.length)throw Error(trace.errors.join('\n'));
const build=run(['node_modules/vite/bin/vite.js','build'],`${prefix}-build.log`);
const files=spawnSync('git',['ls-files','src'],{encoding:'utf8'});if(files.status!==0)throw Error('No se pudo inventariar src');
const hash=createHash('sha256');for(const file of files.stdout.trim().split(/\r?\n/))hash.update(file).update(readFileSync(file));
const report={passed:true,stage,generatedAt:new Date().toISOString(),node:process.version,sourceHash:hash.digest('hex'),nodeTests:Number(tap.match(/^# tests (\d+)/m)?.[1]),nodePassed:Number(tap.match(/^# pass (\d+)/m)?.[1]),browser:browser.stats,change:change.stats,results,...trace,build:{passed:true,output:build.split(/\r?\n/).filter(l=>/index-|LineChart-|built in/.test(l))}};
manifest.note=`Checkpoint ${stage} completo: ${trace.counts.complete} IDs completos y ${trace.counts.pending} pendientes; E6 conserva las puertas de cierre y RLS.`;
writeFileSync('specs/006-interfaz/traceability.json',JSON.stringify(manifest,null,2)+'\n');
writeFileSync(`${prefix}-checkpoint.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({stage,sourceHash:report.sourceHash,nodeTests:report.nodeTests,browser:browser.stats.expected,change:change.stats.expected,trace:trace.counts,build:true}));
