import {auditSeason} from '../lib/quality-control';
const report=auditSeason();
console.log(JSON.stringify({summary:report.summary,assetHashes:report.assetHashes,incidents:report.incidents.map(x=>x.id),sample:report.issues.slice(0,18)},null,2));
// Review-only legacy art is reported, while any live/eligible art or core identity failure blocks the build.
const structural=new Set(['DUPLICATE_ID_OR_NUMBER','CANONICAL_COUNT','DUPLICATE_ASSET','MISSING_ASSET','PACK_ASSET','PREMATURE_RELEASE']);
if(report.issues.some(i=>i.severity==='CRITICAL'&&structural.has(i.code)||i.severity==='HIGH'&&i.code==='MISSING_ASSET'))process.exitCode=1;
