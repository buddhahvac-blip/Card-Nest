import type {Metadata} from 'next';
import JoinBeta from './join-beta';

export const metadata:Metadata={
 title:'Join the Founding Flight Beta',
 description:'Join the free NestRune Founding Flight beta and help test collecting, Nest Battles, and Rune Dungeon.'
};

export default function JoinPage(){return <JoinBeta/>}
