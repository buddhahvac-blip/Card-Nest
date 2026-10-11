import {RequestError} from './http';

/**
 * Fail closed until the dungeon server independently computes a terminal win.
 * A browser-submitted "clear", elapsed time, or client-side HP value is never
 * evidence of victory. Do not remove this gate without authoritative settlement.
 */
export function rejectUnverifiedDungeonClear():never {
 throw new RequestError('Dungeon reward settlement is temporarily unavailable until server-verified victories are enabled.',503);
}
