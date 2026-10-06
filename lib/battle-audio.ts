'use client';

export type BattleSoundEffect={
 kind:'attack'|'heal'|'shield'|'speed'|'debuff'|'swap';
 theme:string;
 variant?:'strike'|'ability'|'special';
 knockout?:boolean;
};

type WebkitWindow=Window&typeof globalThis&{webkitAudioContext?:typeof AudioContext};
let context:AudioContext|null=null;

function audioContext(){
 if(typeof window==='undefined')return null;
 const Ctor=window.AudioContext||(window as WebkitWindow).webkitAudioContext;
 if(!Ctor)return null;
 if(!context)context=new Ctor();
 if(context.state==='suspended')void context.resume();
 return context;
}

const roots:Record<string,number>={
 Ember:220,
 Tide:174.61,
 Bloom:196,
 Volt:329.63,
 Mystic:261.63,
 Shadow:146.83,
};

function tone(ctx:AudioContext,start:number,duration:number,frequency:number,endFrequency=frequency,gain=.045,type:OscillatorType='sine'){
 const osc=ctx.createOscillator();
 const amp=ctx.createGain();
 osc.type=type;
 osc.frequency.setValueAtTime(Math.max(40,frequency),start);
 osc.frequency.exponentialRampToValueAtTime(Math.max(40,endFrequency),start+duration);
 amp.gain.setValueAtTime(.0001,start);
 amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.012);
 amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(amp).connect(ctx.destination);
 osc.start(start);osc.stop(start+duration+.02);
}

function noise(ctx:AudioContext,start:number,duration=.1,gain=.028){
 const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
 const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
 const data=buffer.getChannelData(0);
 for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
 const source=ctx.createBufferSource();
 const amp=ctx.createGain();
 source.buffer=buffer;
 amp.gain.setValueAtTime(gain,start);
 amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(amp).connect(ctx.destination);
 source.start(start);
}

export function unlockBattleAudio(){
 const ctx=audioContext();
 if(ctx?.state==='suspended')void ctx.resume();
}

export function playBattleSound(effect:BattleSoundEffect,enabled=true){
 if(!enabled)return;
 const ctx=audioContext();if(!ctx)return;
 const now=ctx.currentTime+.01;
 const root=roots[effect.theme]||220;

 if(effect.variant==='special'){
  tone(ctx,now,.32,root*.55,root*1.15,.046,'triangle');
  tone(ctx,now+.07,.3,root,root*2,.04,'sine');
  tone(ctx,now+.14,.28,root*1.5,root*2.6,.032,'sawtooth');
  if(effect.kind==='attack'){
   noise(ctx,now+.3,.13,.036);
   tone(ctx,now+.31,.24,root*.7,root*.42,.052,'square');
  }else if(effect.kind==='heal'){
   tone(ctx,now+.28,.38,root*1.2,root*2.4,.034,'sine');
  }else if(effect.kind==='shield'){
   tone(ctx,now+.28,.34,root*.8,root*.8,.038,'triangle');
  }else if(effect.kind==='speed'){
   tone(ctx,now+.25,.2,root*1.4,root*2.8,.03,'sawtooth');
  }else if(effect.kind==='debuff'){
   tone(ctx,now+.25,.32,root*.8,root*.35,.04,'square');
  }
  if(effect.knockout)tone(ctx,now+.43,.42,root*.55,70,.05,'sawtooth');
  return;
 }

 if(effect.kind==='swap'){
  tone(ctx,now,.12,root*.75,root,0.025,'sine');
  tone(ctx,now+.09,.18,root,root*1.5,0.032,'triangle');
  return;
 }
 if(effect.kind==='heal'){
  tone(ctx,now,.28,root*.8,root*1.4,.034,'sine');
  tone(ctx,now+.08,.32,root,root*2,.026,'sine');
  return;
 }
 if(effect.kind==='shield'){
  tone(ctx,now,.16,root*.75,root*.75,.032,'triangle');
  tone(ctx,now+.06,.28,root*1.5,root*1.5,.025,'sine');
  return;
 }
 if(effect.kind==='speed'){
  tone(ctx,now,.13,root,root*1.8,.026,'sawtooth');
  tone(ctx,now+.05,.16,root*1.5,root*2.4,.018,'triangle');
  return;
 }
 if(effect.kind==='debuff'){
  tone(ctx,now,.28,root*.8,root*.45,.035,'square');
  return;
 }

 if(effect.kind==='attack'&&effect.variant==='ability'){
  tone(ctx,now,.2,root*.8,root*1.45,.03,'triangle');
  tone(ctx,now+.12,.22,root*1.25,root*.9,.035,'sine');
  noise(ctx,now+.22,.08,.022);
  if(effect.knockout)tone(ctx,now+.28,.36,root*.55,70,.045,'sawtooth');
  return;
 }

 if(effect.kind==='attack'){
  noise(ctx,now,.075,.026);
  tone(ctx,now,.15,root*.8,root*.5,.038,'triangle');
  if(effect.knockout)tone(ctx,now+.12,.4,root*.5,65,.045,'sawtooth');
 }
}
