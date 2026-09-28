import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
loadEnvConfig(process.cwd());
const pool=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED});
await migrate(drizzle(pool),{migrationsFolder:'drizzle'});
await pool.end();console.log('Migration applied. Existing public schema preserved.');
