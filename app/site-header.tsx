'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import styles from './site-header.module.css';
const navigation=[
 {href:'/',label:'Home'},
 {href:'/play',label:'Nest Battles'},
 {href:'/rune-dungeon',label:'Rune Dungeon'},
 {href:'/season-one',label:'Season One'},
 {href:'/#Discover',label:'Discover'},
 {href:'/pokemon-collectibles',label:'Pokémon'},
 {href:'/one-piece-collectibles',label:'One Piece'},
 {href:'/#My%20Nest',label:'My Nest'},
 {href:'/about',label:'About'}
] as const;
export default function SiteHeader(){
 const pathname=usePathname();
 const [hash,setHash]=useState('');
 useEffect(()=>{
  const sync=()=>{try{setHash(decodeURIComponent(window.location.hash.slice(1)))}catch{setHash('')}};
  sync();window.addEventListener('hashchange',sync);
  return()=>window.removeEventListener('hashchange',sync);
 },[pathname]);
 return <header className={styles.header}>
  <div className={styles.inner}>
   <a href="/" className={styles.logo} aria-label="NestRune home">
    <span className={styles.mark} aria-hidden="true">✧</span>
    <span className={styles.wordmark}>NestRune<small>A WORLD WORTH COLLECTING</small></span>
   </a>
   <nav className={styles.nav} aria-label="Main site navigation">
    {navigation.map(link=>{
     const hashSection=link.href.startsWith('/#')?decodeURIComponent(link.href.slice(2)):null;
     const active=hashSection?pathname==='/'&&hash===hashSection:link.href==='/'?pathname==='/'&&(!hash||hash==='Explore'):pathname===link.href||pathname.startsWith(link.href+'/');
     const className=[styles.navLink,active?styles.active:'',link.href==='/rune-dungeon'?styles.dungeon:''].filter(Boolean).join(' ');
     if(link.href==='/'||link.href.startsWith('/#'))return <a key={link.href} href={link.href} aria-current={active?'page':undefined} className={className}>{link.label}</a>;
     return <Link key={link.href} href={link.href} aria-current={active?'page':undefined} className={className}>{link.label}</Link>;
    })}
   </nav>
  </div>
 </header>;
}
