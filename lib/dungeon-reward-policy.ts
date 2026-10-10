/**
 * Guard used by the future authoritative Dungeon reward path.
 * verifiedAt MUST be written only by the server combat engine, never by a
 * client-submitted clear request, log, HP snapshot, or elapsed-time check.
 */
export type DungeonAttemptProof = {
 userId:string;
 floor:number;
 completedAt:Date|null;
 expiresAt:Date;
 outcome:'active'|'won'|'lost';
 verifiedAt:Date|null;
};
export function canAwardVerifiedDungeonClear(
 attempt:DungeonAttemptProof | null,
 request:{userId:string;floor:number},
 now:Date
):boolean {
 if(!attempt||attempt.userId!==request.userId||attempt.floor!==request.floor)return false;
 if(attempt.outcome!=='won'||!attempt.verifiedAt||!attempt.completedAt)return false;
 if(attempt.expiresAt.getTime()<=now.getTime())return false;
 if(attempt.verifiedAt.getTime()>now.getTime()||attempt.completedAt.getTime()>now.getTime())return false;
 if(attempt.verifiedAt.getTime()>attempt.completedAt.getTime())return false;
 return true;
}
