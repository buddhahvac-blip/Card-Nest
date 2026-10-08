import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
const {auditGameIntegrity}=await import('../lib/game-integrity');
const result=await auditGameIntegrity();
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exitCode=1;
