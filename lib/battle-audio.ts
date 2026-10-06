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
let musicBus:GainNode|null=null;
let sfxBus:GainNode|null=null;
let compressor:DynamicsCompressorNode|null=null;
let musicTimer:ReturnType<typeof setTimeout>|null=null;
let musicPlaying=false;
let musicGeneration=0;
let nextMusicStart=0;

const MUSIC_LEVEL=.18;
const MUSIC_DUCK=.045;
const SFX_LEVEL=.92;
const MASTER_LEVEL=.86;
const BPM=122;
const BEAT=60/BPM;
const BAR=BEAT*4;
const BLOCK_BARS=4;

const themeRoots:Record<string,number>={
 Ember:220,
 Tide:174.61,
 Bloom:196,
 Volt:329.63,
 Mystic:261.63,
 Shadow:146.83,
};

function ensureGraph(ctx:AudioContext){
 if(masterBus&&musicBus&&sfxBus&&compressor)return;
 masterBus=ctx.createGain();
 musicBus=ctx.createGain();
 sfxBus=ctx.createGain();
 compressor=ctx.createDynamicsCompressor();

 masterBus.gain.value=MASTER_LEVEL;
 musicBus.gain.value=.0001;
 sfxBus.gain.value=SFX_LEVEL;

 compressor.threshold.value=-16;
 compressor.knee.value=16;
 compressor.ratio.value=8;
 compressor.attack.value=.003;
 compressor.release.value=.2;

 musicBus.connect(compressor);
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

function kick(ctx:AudioContext,start:number,gain=.12){
 if(!musicBus)return;
 tone(ctx,musicBus,start,.18,125,46,gain,'sine');
 tone(ctx,musicBus,start,.045,1800,260,.018,'triangle');
}

function snare(ctx:AudioContext,start:number,gain=.055){
 if(!musicBus)return;
 noiseBurst(ctx,musicBus,start,.12,gain,2200,'highpass');
 tone(ctx,musicBus,start,.1,190,120,.024,'triangle');
}

function hat(ctx:AudioContext,start:number,gain=.012){
 if(!musicBus)return;
 noiseBurst(ctx,musicBus,start,.045,gain,6200,'highpass');
}

function musicTone(ctx:AudioContext,start:number,duration:number,freq:number,gain=.025,type:OscillatorType='triangle',detune=0){
 if(!musicBus)return;
 tone(ctx,musicBus,start,duration,freq,freq,gain,type,detune);
}

function chordFrequencies(root:number,minor:boolean){
 const third=minor?Math.pow(2,3/12):Math.pow(2,4/12);
 return [root,root*third,root*Math.pow(2,7/12)];
}

function scheduleMusicBlock(ctx:AudioContext,start:number){
 const progression=[
  {root:146.83,minor:true},  // Dm
  {root:116.54,minor:false}, // Bb
  {root:174.61,minor:false}, // F
  {root:130.81,minor:false}, // C
 ];

 for(let bar=0;bar<BLOCK_BARS;bar++){
  const barStart=start+bar*BAR;
  const chord=chordFrequencies(progression[bar].root,progression[bar].minor);

  // Warm cinematic pad.
  chord.forEach((freq,index)=>{
   musicTone(ctx,barStart,BAR*.96,freq,index===0?.017:.012,index===0?'triangle':'sine',index===1?-5:5);
  });

  // Four-on-the-floor battle percussion with accented backbeat.
  kick(ctx,barStart,.10);
  kick(ctx,barStart+BEAT*2,.105);
  kick(ctx,barStart+BEAT*2.75,.06);
  snare(ctx,barStart+BEAT,.048);
  snare(ctx,barStart+BEAT*3,.055);
  for(let step=0;step<8;step++)hat(ctx,barStart+step*(BEAT/2),step%2===0?.011:.008);

  // Low marching bass.
  for(let beat=0;beat<4;beat++){
   const bass=progression[bar].root/2;
   musicTone(ctx,barStart+beat*BEAT,BEAT*.62,bass,beat===0?.044:.034,'square');
   musicTone(ctx,barStart+beat*BEAT,BEAT*.58,bass*2,.012,'triangle');
  }

  // Fast fantasy arpeggio.
  const arp=[0,1,2,1,0,2,1,2];
  for(let step=0;step<8;step++){
   const note=chord[arp[step]]*2;
   musicTone(ctx,barStart+step*(BEAT/2),(BEAT/2)*.68,note,.018,step%2?'triangle':'sine');
  }

  // A short heroic top line in the second half of the loop.
  if(bar>=2){
   const melody=bar===2?[2,4,5,4]:[2,0,4,2];
   const scale=[146.83,164.81,174.61,196,220,233.08];
   melody.forEach((degree,index)=>{
    musicTone(ctx,barStart+index*BEAT,BEAT*.7,scale[degree]*2,.022,'triangle');
   });
  }
 }
}

function scheduleNextMusicBlock(generation:number){
 const ctx=audioContext();
 if(!ctx||!musicPlaying||generation!==musicGeneration)return;
 const now=ctx.currentTime;
 if(nextMusicStart<now+.15)nextMusicStart=now+.15;
 scheduleMusicBlock(ctx,nextMusicStart);
 nextMusicStart+=BAR*BLOCK_BARS;
 const wait=Math.max(250,(nextMusicStart-ctx.currentTime-.35)*1000);
 musicTimer=setTimeout(()=>scheduleNextMusicBlock(generation),wait);
}

function duckMusic(ctx:AudioContext){
 if(!musicBus||!musicPlaying)return;
 const now=ctx.currentTime;
 musicBus.gain.cancelScheduledValues(now);
 musicBus.gain.setValueAtTime(Math.max(.0001,musicBus.gain.value),now);
 musicBus.gain.exponentialRampToValueAtTime(MUSIC_DUCK,now+.025);
 musicBus.gain.exponentialRampToValueAtTime(MUSIC_LEVEL,now+.48);
}

function elementalAccent(ctx:AudioContext,start:number,theme:string,intensity=1){
 if(!sfxBus)return;
 const root=themeRoots[theme]||220;
 if(theme==='Volt'){
  tone(ctx,sfxBus,start,.16,root*5,root*1.1,.11*intensity,'square');
  noiseBurst(ctx,sfxBus,start+.04,.09,.12*intensity,5200,'highpass');
 }else if(theme==='Ember'){
  noiseSweep(ctx,sfxBus,start,.28,.13*intensity,4200,380);
  tone(ctx,sfxBus,start+.04,.24,root*2.2,root*.65,.085*intensity,'sawtooth');
 }else if(theme==='Tide'){
  tone(ctx,sfxBus,start,.34,root*.7,root*2.2,.1*intensity,'sine');
  noiseSweep(ctx,sfxBus,start+.02,.3,.075*intensity,500,2300);
 }else if(theme==='Bloom'){
  tone(ctx,sfxBus,start,.28,root,root*2.5,.085*intensity,'triangle');
  tone(ctx,sfxBus,start+.07,.32,root*1.5,root*3,.06*intensity,'sine');
 }else if(theme==='Mystic'){
  tone(ctx,sfxBus,start,.32,root*2,root*4,.095*intensity,'sine');
  tone(ctx,sfxBus,start+.06,.38,root*2.98,root*1.5,.06*intensity,'triangle');
 }else{
  tone(ctx,sfxBus,start,.34,root*.72,root*.34,.12*intensity,'sawtooth');
  noiseBurst(ctx,sfxBus,start+.04,.24,.08*intensity,500,'lowpass');
 }
}

function heavyImpact(ctx:AudioContext,start:number,intensity=1){
 if(!sfxBus)return;
 tone(ctx,sfxBus,start,.34,105,38,.2*intensity,'sine');
 tone(ctx,sfxBus,start,.16,220,70,.11*intensity,'triangle');
 noiseBurst(ctx,sfxBus,start,.16,.16*intensity,1250,'bandpass');
 noiseBurst(ctx,sfxBus,start+.025,.07,.1*intensity,5600,'highpass');
}

function abilityBlast(ctx:AudioContext,start:number,theme:string,special=false){
 if(!sfxBus)return;
 const power=special?1.32:1;
 noiseSweep(ctx,sfxBus,start,.22,.14*power,420,4800);
 tone(ctx,sfxBus,start,.26,70,145,.16*power,'sine');
 elementalAccent(ctx,start+.08,theme,power);
 heavyImpact(ctx,start+.22,power);
 if(special){
  tone(ctx,sfxBus,start+.02,.5,52,34,.19,'sine');
  noiseSweep(ctx,sfxBus,start+.16,.38,.13,5200,260);
 }
}

export function unlockBattleAudio(){
 const ctx=audioContext();
 if(ctx?.state==='suspended')void ctx.resume();
}

export function startBattleMusic(enabled=true){
 if(!enabled)return;
 const ctx=audioContext();if(!ctx||!musicBus)return;
 musicPlaying=true;
 musicGeneration+=1;
 if(musicTimer){clearTimeout(musicTimer);musicTimer=null}
 const now=ctx.currentTime;
 musicBus.gain.cancelScheduledValues(now);
 musicBus.gain.setValueAtTime(Math.max(.0001,musicBus.gain.value),now);
 musicBus.gain.exponentialRampToValueAtTime(MUSIC_LEVEL,now+.35);
 nextMusicStart=now+.06;
 scheduleNextMusicBlock(musicGeneration);
}

export function stopBattleMusic(fadeSeconds=.35){
 const ctx=context;
 musicPlaying=false;
 musicGeneration+=1;
 if(musicTimer){clearTimeout(musicTimer);musicTimer=null}
 if(!ctx||!musicBus)return;
 const now=ctx.currentTime;
 musicBus.gain.cancelScheduledValues(now);
 musicBus.gain.setValueAtTime(Math.max(.0001,musicBus.gain.value),now);
 musicBus.gain.exponentialRampToValueAtTime(.0001,now+Math.max(.05,fadeSeconds));
}

export function playBattleSound(effect:BattleSoundEffect,enabled=true){
 if(!enabled)return;
 const ctx=audioContext();if(!ctx||!sfxBus)return;
 const now=ctx.currentTime+.01;
 const root=themeRoots[effect.theme]||220;
 duckMusic(ctx);

 if(effect.variant==='special'){
  abilityBlast(ctx,now,effect.theme,true);
  tone(ctx,sfxBus,now,.42,root*.6,root*2.5,.14,'sawtooth');
  tone(ctx,sfxBus,now+.08,.38,root,root*3,.11,'triangle');
  if(effect.kind==='heal'){
   tone(ctx,sfxBus,now+.18,.46,root,root*3.2,.11,'sine');
  }else if(effect.kind==='shield'){
   tone(ctx,sfxBus,now+.18,.42,root*.72,root*.72,.12,'square');
  }else if(effect.kind==='speed'){
   tone(ctx,sfxBus,now+.16,.34,root,root*4,.1,'sawtooth');
  }else if(effect.kind==='debuff'){
   tone(ctx,sfxBus,now+.18,.42,root*.8,root*.3,.12,'square');
  }
  if(effect.knockout)tone(ctx,sfxBus,now+.38,.65,92,34,.18,'sawtooth');
  return;
 }

 if(effect.variant==='ability'){
  abilityBlast(ctx,now,effect.theme,false);
  if(effect.kind==='heal'){
   tone(ctx,sfxBus,now+.1,.38,root,root*2.8,.095,'sine');
  }else if(effect.kind==='shield'){
   tone(ctx,sfxBus,now+.08,.3,root*.72,root*.72,.105,'square');
  }else if(effect.kind==='speed'){
   tone(ctx,sfxBus,now+.08,.26,root,root*3.4,.09,'sawtooth');
  }else if(effect.kind==='debuff'){
   tone(ctx,sfxBus,now+.08,.32,root*.8,root*.38,.105,'square');
  }
  if(effect.knockout)tone(ctx,sfxBus,now+.34,.55,86,34,.16,'sawtooth');
  return;
 }

 if(effect.kind==='swap'){
  noiseSweep(ctx,sfxBus,now,.22,.07,500,2600);
  tone(ctx,sfxBus,now,.2,root*.7,root*1.6,.075,'triangle');
  return;
 }

 if(effect.kind==='heal'){
  tone(ctx,sfxBus,now,.36,root*.8,root*2.4,.085,'sine');
  tone(ctx,sfxBus,now+.08,.42,root,root*3,.055,'triangle');
  return;
 }

 if(effect.kind==='shield'){
  heavyImpact(ctx,now,.55);
  tone(ctx,sfxBus,now,.26,root*.7,root*.7,.085,'square');
  return;
 }

 if(effect.kind==='speed'){
  noiseSweep(ctx,sfxBus,now,.18,.075,800,4800);
  tone(ctx,sfxBus,now,.22,root,root*3,.08,'sawtooth');
  return;
 }

 if(effect.kind==='debuff'){
  tone(ctx,sfxBus,now,.34,root*.8,root*.3,.1,'square');
  noiseBurst(ctx,sfxBus,now+.05,.18,.065,700,'lowpass');
  return;
 }

 // Quick Strike: short whoosh + hard contact hit.
 noiseSweep(ctx,sfxBus,now,.14,.11,700,3800);
 heavyImpact(ctx,now+.11,.78);
 if(effect.knockout)tone(ctx,sfxBus,now+.18,.5,82,32,.15,'sawtooth');
}
