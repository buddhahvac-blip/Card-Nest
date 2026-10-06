'use client';

export type BattleSoundEffect={
 kind:'attack'|'heal'|'shield'|'speed'|'debuff'|'swap';
 theme:string;
 variant?:'strike'|'ability'|'special';
 knockout?:boolean;
};

type WebkitWindow=Window&typeof globalThis&{webkitAudioContext?:typeof AudioContext};

let context:AudioContext|null=null;
let masterBus:GainNode|null=null;
let sfxBus:GainNode|null=null;
let compressor:DynamicsCompressorNode|null=null;
let battleTrack:HTMLAudioElement|null=null;
let battleTrackTarget=.30;
let duckTimer:ReturnType<typeof setTimeout>|null=null;
let fadeTimer:ReturnType<typeof setInterval>|null=null;

// CC0 battle music:
// "Hope (Orchestral battle music)" by MintoDog, OpenGameArt.
// Source page: https://opengameart.org/content/hopeorchestral-battle-music
const BATTLE_MUSIC_OGG='https://opengameart.org/sites/default/files/hope_orchestral_battle_music_bpm165_0.ogg';
const BATTLE_MUSIC_FLAC='https://opengameart.org/sites/default/files/hope_orchestral_battle_music_bpm165.flac';

const SFX_LEVEL=1.0;
const MASTER_LEVEL=.9;

const themeRoots:Record<string,number>={
 Ember:220,
 Tide:174.61,
 Bloom:196,
 Volt:329.63,
 Mystic:261.63,
 Shadow:146.83,
};

function ensureGraph(ctx:AudioContext){
 if(masterBus&&sfxBus&&compressor)return;
 masterBus=ctx.createGain();
 sfxBus=ctx.createGain();
 compressor=ctx.createDynamicsCompressor();

 masterBus.gain.value=MASTER_LEVEL;
 sfxBus.gain.value=SFX_LEVEL;

 compressor.threshold.value=-18;
 compressor.knee.value=14;
 compressor.ratio.value=9;
 compressor.attack.value=.002;
 compressor.release.value=.18;

 sfxBus.connect(compressor);
 compressor.connect(masterBus);
 masterBus.connect(ctx.destination);
}

function audioContext(){
 if(typeof window==='undefined')return null;
 const Ctor=window.AudioContext||(window as WebkitWindow).webkitAudioContext;
 if(!Ctor)return null;
 if(!context)context=new Ctor();
 ensureGraph(context);
 if(context.state==='suspended')void context.resume();
 return context;
}

function ensureBattleTrack(){
 if(typeof document==='undefined')return null;
 if(battleTrack)return battleTrack;
 const audio=document.createElement('audio');
 audio.loop=true;
 audio.preload='auto';
 audio.volume=battleTrackTarget;
 audio.crossOrigin='anonymous';
 const ogg=document.createElement('source');
 ogg.src=BATTLE_MUSIC_OGG;
 ogg.type='audio/ogg';
 const flac=document.createElement('source');
 flac.src=BATTLE_MUSIC_FLAC;
 flac.type='audio/flac';
 audio.append(ogg,flac);
 battleTrack=audio;
 return audio;
}

function tone(
 ctx:AudioContext,
 bus:AudioNode,
 start:number,
 duration:number,
 frequency:number,
 endFrequency=frequency,
 gain=.08,
 type:OscillatorType='sine',
 detune=0
){
 const osc=ctx.createOscillator();
 const amp=ctx.createGain();
 osc.type=type;
 osc.detune.value=detune;
 osc.frequency.setValueAtTime(Math.max(35,frequency),start);
 osc.frequency.exponentialRampToValueAtTime(Math.max(35,endFrequency),start+duration);
 amp.gain.setValueAtTime(.0001,start);
 amp.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.008);
 amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(amp).connect(bus);
 osc.start(start);
 osc.stop(start+duration+.03);
}

function noiseBurst(
 ctx:AudioContext,
 bus:AudioNode,
 start:number,
 duration:number,
 gain:number,
 frequency=1800,
 mode:BiquadFilterType='bandpass'
){
 const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
 const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
 const data=buffer.getChannelData(0);
 for(let i=0;i<length;i++){
  const envelope=1-i/length;
  data[i]=(Math.random()*2-1)*envelope;
 }
 const source=ctx.createBufferSource();
 const filter=ctx.createBiquadFilter();
 const amp=ctx.createGain();
 source.buffer=buffer;
 filter.type=mode;
 filter.frequency.setValueAtTime(frequency,start);
 filter.Q.value=mode==='bandpass'?1.5:.7;
 amp.gain.setValueAtTime(Math.max(.0002,gain),start);
 amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(filter).connect(amp).connect(bus);
 source.start(start);
}

function noiseSweep(
 ctx:AudioContext,
 bus:AudioNode,
 start:number,
 duration:number,
 gain:number,
 from:number,
 to:number
){
 const length=Math.max(1,Math.floor(ctx.sampleRate*duration));
 const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
 const data=buffer.getChannelData(0);
 for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
 const source=ctx.createBufferSource();
 const filter=ctx.createBiquadFilter();
 const amp=ctx.createGain();
 source.buffer=buffer;
 filter.type='bandpass';
 filter.Q.value=1.1;
 filter.frequency.setValueAtTime(from,start);
 filter.frequency.exponentialRampToValueAtTime(Math.max(80,to),start+duration);
 amp.gain.setValueAtTime(.0001,start);
 amp.gain.exponentialRampToValueAtTime(gain,start+.025);
 amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(filter).connect(amp).connect(bus);
 source.start(start);
}

function duckMusic(){
 const track=battleTrack;
 if(!track||track.paused)return;
 if(duckTimer){clearTimeout(duckTimer);duckTimer=null}
 track.volume=.095;
 duckTimer=setTimeout(()=>{if(battleTrack&&!battleTrack.paused)battleTrack.volume=battleTrackTarget},520);
}

function elementalAccent(ctx:AudioContext,start:number,theme:string,intensity=1){
 if(!sfxBus)return;
 const root=themeRoots[theme]||220;
 if(theme==='Volt'){
  tone(ctx,sfxBus,start,.16,root*5,root*1.1,.12*intensity,'square');
  noiseBurst(ctx,sfxBus,start+.04,.09,.13*intensity,5200,'highpass');
 }else if(theme==='Ember'){
  noiseSweep(ctx,sfxBus,start,.28,.14*intensity,4200,380);
  tone(ctx,sfxBus,start+.04,.24,root*2.2,root*.65,.095*intensity,'sawtooth');
 }else if(theme==='Tide'){
  tone(ctx,sfxBus,start,.34,root*.7,root*2.2,.11*intensity,'sine');
  noiseSweep(ctx,sfxBus,start+.02,.3,.082*intensity,500,2300);
 }else if(theme==='Bloom'){
  tone(ctx,sfxBus,start,.28,root,root*2.5,.095*intensity,'triangle');
  tone(ctx,sfxBus,start+.07,.32,root*1.5,root*3,.068*intensity,'sine');
 }else if(theme==='Mystic'){
  tone(ctx,sfxBus,start,.32,root*2,root*4,.105*intensity,'sine');
  tone(ctx,sfxBus,start+.06,.38,root*2.98,root*1.5,.07*intensity,'triangle');
 }else{
  tone(ctx,sfxBus,start,.34,root*.72,root*.34,.13*intensity,'sawtooth');
  noiseBurst(ctx,sfxBus,start+.04,.24,.09*intensity,500,'lowpass');
 }
}

function heavyImpact(ctx:AudioContext,start:number,intensity=1){
 if(!sfxBus)return;
 tone(ctx,sfxBus,start,.34,105,38,.22*intensity,'sine');
 tone(ctx,sfxBus,start,.16,220,70,.12*intensity,'triangle');
 noiseBurst(ctx,sfxBus,start,.16,.18*intensity,1250,'bandpass');
 noiseBurst(ctx,sfxBus,start+.025,.07,.11*intensity,5600,'highpass');
}

function abilityBlast(ctx:AudioContext,start:number,theme:string,special=false){
 if(!sfxBus)return;
 const power=special?1.38:1.08;
 noiseSweep(ctx,sfxBus,start,.22,.15*power,420,4800);
 tone(ctx,sfxBus,start,.26,70,145,.18*power,'sine');
 elementalAccent(ctx,start+.08,theme,power);
 heavyImpact(ctx,start+.22,power);
 if(special){
  tone(ctx,sfxBus,start+.02,.5,52,34,.21,'sine');
  noiseSweep(ctx,sfxBus,start+.16,.38,.14,5200,260);
 }
}

export function unlockBattleAudio(){
 const ctx=audioContext();
 ensureBattleTrack();
 if(ctx?.state==='suspended')void ctx.resume();
}

export function startBattleMusic(enabled=true){
 if(!enabled)return;
 const track=ensureBattleTrack();
 if(!track)return;
 if(fadeTimer){clearInterval(fadeTimer);fadeTimer=null}
 battleTrackTarget=.30;
 track.volume=battleTrackTarget;
 if(track.ended)track.currentTime=0;
 void track.play().catch(()=>{});
}

export function stopBattleMusic(fadeSeconds=.35){
 const track=battleTrack;
 if(!track)return;
 if(duckTimer){clearTimeout(duckTimer);duckTimer=null}
 if(fadeTimer){clearInterval(fadeTimer);fadeTimer=null}
 if(fadeSeconds<=.05){track.pause();track.volume=battleTrackTarget;return}
 const steps=8;
 const interval=Math.max(20,(fadeSeconds*1000)/steps);
 const startVolume=track.volume;
 let step=0;
 fadeTimer=setInterval(()=>{
  step+=1;
  if(!battleTrack){if(fadeTimer)clearInterval(fadeTimer);fadeTimer=null;return}
  battleTrack.volume=Math.max(0,startVolume*(1-step/steps));
  if(step>=steps){
   battleTrack.pause();
   battleTrack.volume=battleTrackTarget;
   if(fadeTimer)clearInterval(fadeTimer);
   fadeTimer=null;
  }
 },interval);
}

export function playBattleSound(effect:BattleSoundEffect,enabled=true){
 if(!enabled)return;
 const ctx=audioContext();if(!ctx||!sfxBus)return;
 const now=ctx.currentTime+.01;
 const root=themeRoots[effect.theme]||220;
 duckMusic();

 if(effect.variant==='special'){
  abilityBlast(ctx,now,effect.theme,true);
  tone(ctx,sfxBus,now,.42,root*.6,root*2.5,.16,'sawtooth');
  tone(ctx,sfxBus,now+.08,.38,root,root*3,.13,'triangle');
  if(effect.kind==='heal'){
   tone(ctx,sfxBus,now+.18,.46,root,root*3.2,.13,'sine');
  }else if(effect.kind==='shield'){
   tone(ctx,sfxBus,now+.18,.42,root*.72,root*.72,.14,'square');
  }else if(effect.kind==='speed'){
   tone(ctx,sfxBus,now+.16,.34,root,root*4,.12,'sawtooth');
  }else if(effect.kind==='debuff'){
   tone(ctx,sfxBus,now+.18,.42,root*.8,root*.3,.14,'square');
  }
  if(effect.knockout)tone(ctx,sfxBus,now+.38,.65,92,34,.2,'sawtooth');
  return;
 }

 if(effect.variant==='ability'){
  abilityBlast(ctx,now,effect.theme,false);
  if(effect.kind==='heal'){
   tone(ctx,sfxBus,now+.1,.38,root,root*2.8,.11,'sine');
  }else if(effect.kind==='shield'){
   tone(ctx,sfxBus,now+.08,.3,root*.72,root*.72,.12,'square');
  }else if(effect.kind==='speed'){
   tone(ctx,sfxBus,now+.08,.26,root,root*3.4,.105,'sawtooth');
  }else if(effect.kind==='debuff'){
   tone(ctx,sfxBus,now+.08,.32,root*.8,root*.38,.12,'square');
  }
  if(effect.knockout)tone(ctx,sfxBus,now+.34,.55,86,34,.18,'sawtooth');
  return;
 }

 if(effect.kind==='swap'){
  noiseSweep(ctx,sfxBus,now,.22,.08,500,2600);
  tone(ctx,sfxBus,now,.2,root*.7,root*1.6,.085,'triangle');
  return;
 }

 if(effect.kind==='heal'){
  tone(ctx,sfxBus,now,.36,root*.8,root*2.4,.095,'sine');
  tone(ctx,sfxBus,now+.08,.42,root,root*3,.065,'triangle');
  return;
 }

 if(effect.kind==='shield'){
  heavyImpact(ctx,now,.62);
  tone(ctx,sfxBus,now,.26,root*.7,root*.7,.095,'square');
  return;
 }

 if(effect.kind==='speed'){
  noiseSweep(ctx,sfxBus,now,.18,.085,800,4800);
  tone(ctx,sfxBus,now,.22,root,root*3,.09,'sawtooth');
  return;
 }

 if(effect.kind==='debuff'){
  tone(ctx,sfxBus,now,.34,root*.8,root*.3,.115,'square');
  noiseBurst(ctx,sfxBus,now+.05,.18,.075,700,'lowpass');
  return;
 }

 noiseSweep(ctx,sfxBus,now,.14,.12,700,3800);
 heavyImpact(ctx,now+.11,.86);
 if(effect.knockout)tone(ctx,sfxBus,now+.18,.5,82,32,.17,'sawtooth');
}
