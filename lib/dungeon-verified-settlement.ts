import {RequestError} from './http';

export type VerifiedDungeonAttempt={
 userId:string; floor:number; outcome:'active'|'won'|'lost'|'abandoned';
 completedAt:Date|null; expiresAt:Date;
 engineVersion:string|null; combatState:unknown;
 combatVerifiedAt:Date|null; turnIndex:number;
};

/** Authorization precondition; only call with a row locked and loaded by the server. */
export function assertVerifiedDungeonVictory(row:VerifiedDungeonAttempt, userId:string, floor:number, now=new Date()):void{
 if(row.userId!==userId||row.floor!==floor)throw new RequestError('Dungeon attempt does not belong to this floor and player.',403);
 if(!row.engineVersion||!row.combatState||row.turnIndex<1||!row.combatVerifiedAt)
  throw new RequestError('Dungeon victory has not been verified by the server.',409);
 if(row.outcome!=='won'||!row.completedAt)throw new RequestError('Dungeon attempt has no verified win.',409);
 if(row.completedAt>row.expiresAt||row.combatVerifiedAt>row.expiresAt||row.combatVerifiedAt>now)
  throw new RequestError('Dungeon victory verification was outside its valid time window.',409);
}
