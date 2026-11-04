import {RequestError} from './http';
import {DUNGEON_ENGINE_VERSION,type ServerCombatState} from './dungeon-server-engine';

export type VerifiedDungeonAttempt={
 userId:string; floor:number; outcome:'active'|'won'|'lost'|'abandoned';
 completedAt:Date|null; expiresAt:Date;
 engineVersion:string|null; combatState:unknown;
 combatVerifiedAt:Date|null; turnIndex:number;
};

/**
 * Defense in depth for future server-authoritative settlement.
 * Only call with a row locked by the server. This is not a substitute for
 * server-run turns, a transactional one-time award, or account/roster checks.
 */
export function assertVerifiedDungeonVictory(row:VerifiedDungeonAttempt,userId:string,floor:number,now=new Date()):void{
 if(row.userId!==userId||row.floor!==floor)throw new RequestError('Dungeon attempt does not belong to this floor and player.',403);
 if(row.engineVersion!==DUNGEON_ENGINE_VERSION||!row.combatVerifiedAt||!row.completedAt)
  throw new RequestError('Dungeon victory has not been verified by the server.',409);
 if(row.outcome!=='won')throw new RequestError('Dungeon attempt has no verified win.',409);
 if(!(row.expiresAt instanceof Date)||!Number.isFinite(row.expiresAt.getTime())||
    !Number.isFinite(row.completedAt.getTime())||!Number.isFinite(row.combatVerifiedAt.getTime())||
    row.completedAt>row.expiresAt||row.combatVerifiedAt>row.expiresAt||
    row.completedAt>now||row.combatVerifiedAt>now||row.completedAt<row.combatVerifiedAt)
  throw new RequestError('Dungeon victory verification was outside its valid time window.',409);

 const state=row.combatState as Partial<ServerCombatState>|null;
 if(!state||typeof state!=='object'||state.engineVersion!==DUNGEON_ENGINE_VERSION||
    state.floor!==floor||state.result!=='won'||!Number.isInteger(row.turnIndex)||
    row.turnIndex<1||row.turnIndex>200||state.turn!==row.turnIndex||
    !Array.isArray(state.player)||state.player.length!==3||
    !Array.isArray(state.enemy)||state.enemy.length!==3||
    !state.enemy.every(f=>f&&typeof f.hp==='number'&&Number.isFinite(f.hp)&&f.hp<=0)||
    !state.player.some(f=>f&&typeof f.hp==='number'&&Number.isFinite(f.hp)&&f.hp>0))
  throw new RequestError('Stored Dungeon combat does not prove a verified victory.',409);
}
