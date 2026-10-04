import type {PoolClient} from 'pg';
import {database} from './postgres';
import {RequestError} from './http';

export const RELEASE_CONTROL_ID='season-1-pre-epic';

export type ReleaseSupply={
  commonPullCap:number;
  awarded:number;
  remaining:number;
  enabled:boolean;
  epicReleaseAt:string|null;
  capActive:boolean;
};

const awardedSql=`
 SELECT count(*)::int AS count
 FROM copies cp
 JOIN openings o ON o.id=cp.opening_id
 JOIN cards c ON c.id=cp.card
 WHERE c.season_id=$1
   AND c.rarity='common'
   AND o.drop_version LIKE 'preview-%'
`;

export async function releaseSupply(client?:Pick<PoolClient,'query'>):Promise<ReleaseSupply>{
 const q=client||database();
 const {rows:[control]}=await q.query('SELECT common_pull_cap,epic_release_at,enabled FROM release_controls WHERE id=$1',[RELEASE_CONTROL_ID]);
 const awarded=(await q.query(awardedSql,['season-1'])).rows[0]?.count||0;
 const cap=Number(control?.common_pull_cap??1600);
 const epic=control?.epic_release_at?new Date(control.epic_release_at).toISOString():null;
 const capActive=Boolean(control?.enabled??true)&&(!epic||Date.now()<new Date(epic).getTime());
 return {commonPullCap:cap,awarded,remaining:Math.max(0,cap-awarded),enabled:Boolean(control?.enabled??true),epicReleaseAt:epic,capActive};
}

export async function enforcePreviewCommonSupply(c:PoolClient,seasonId:string,incomingCards:string[]){
 if(!incomingCards.length)return;
 const {rows:[control]}=await c.query('SELECT common_pull_cap,epic_release_at,enabled FROM release_controls WHERE id=$1 FOR UPDATE',[RELEASE_CONTROL_ID]);
 if(!control||!control.enabled)return;
 if(control.epic_release_at&&Date.now()>=new Date(control.epic_release_at).getTime())return;
 const common=(await c.query("SELECT count(*)::int AS count FROM cards WHERE id=ANY($1::text[]) AND season_id=$2 AND rarity='common'",[incomingCards,seasonId])).rows[0]?.count||0;
 if(!common)return;
 const awarded=(await c.query(awardedSql,[seasonId])).rows[0]?.count||0;
 if(awarded+common>Number(control.common_pull_cap))throw new RequestError('The Founding Common beta supply has been fully claimed.',409);
}
