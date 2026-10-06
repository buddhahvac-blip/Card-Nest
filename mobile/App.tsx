import React,{useEffect,useMemo,useState} from 'react';
import {ActivityIndicator,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View} from 'react-native';
import {api,CatalogResponse} from './src/api';

type Tab='Home'|'Season One'|'My Nest'|'Battles'|'Dungeon';
const tabs:Tab[]=['Home','Season One','My Nest','Battles','Dungeon'];

export default function App(){
 const [tab,setTab]=useState<Tab>('Home');
 const [catalog,setCatalog]=useState<CatalogResponse|null>(null);
 const [error,setError]=useState<string|null>(null);

 useEffect(()=>{
  api.catalog().then(setCatalog).catch(e=>setError(e instanceof Error?e.message:'Unable to load NestRune'));
 },[]);

 const illustrated=useMemo(()=>catalog?.cards.filter(card=>card.art).length??0,[catalog]);

 return <SafeAreaView style={styles.safe}>
  <View style={styles.shell}>
   <View style={styles.header}>
    <Text style={styles.brand}>NESTRUNE</Text>
    <Text style={styles.tagline}>A World Worth Collecting</Text>
   </View>

   <ScrollView contentContainerStyle={styles.content}>
    {tab==='Home'&&<View>
     <Text style={styles.eyebrow}>SEASON ONE · THE FIRST FLIGHT</Text>
     <Text style={styles.title}>Your Nest travels with you.</Text>
     <Text style={styles.copy}>The mobile app is being built as another doorway into the same NestRune world — one account, one collection, one battle and Dungeon progression.</Text>
     {!catalog&&!error?<ActivityIndicator/>:null}
     {error?<Text style={styles.error}>{error}</Text>:null}
     {catalog?<View style={styles.statRow}>
      <Stat value={String(catalog.plannedTotal)} label="Season slots"/>
      <Stat value={String(illustrated)} label="Art online"/>
      <Stat value={catalog.paymentsEnabled?'Open':'Beta'} label="Commerce"/>
     </View>:null}
    </View>}

    {tab==='Season One'&&<Panel title="Season One" body={catalog?String(catalog.cards.length)+' canonical guardians are available from the same live catalog used by the website.':'Loading the live Season One catalog…'}/>}
    {tab==='My Nest'&&<Panel title="My Nest" body="Account sync is the next mobile milestone. The app will use the same server-owned collection and entitlement records as the website — never a separate mobile inventory."/>}
    {tab==='Battles'&&<Panel title="Nest Battles" body="Native battle presentation will share the website’s battle rules while adding mobile-first controls, haptics, sound, and animation."/>}
    {tab==='Dungeon'&&<Panel title="Rune Dungeon" body="Dungeon floors, Rune Energy, reward claims, and progress will remain server-authoritative so progress follows the collector across web, iPhone, and Android."/>}
   </ScrollView>

   <View style={styles.nav}>
    {tabs.map(item=><Pressable accessibilityRole="button" key={item} onPress={()=>setTab(item)} style={[styles.navButton,tab===item&&styles.navActive]}>
     <Text style={[styles.navText,tab===item&&styles.navTextActive]}>{item}</Text>
    </Pressable>)}
   </View>
  </View>
 </SafeAreaView>
}

function Stat({value,label}:{value:string;label:string}){
 return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>
}

function Panel({title,body}:{title:string;body:string}){
 return <View style={styles.panel}><Text style={styles.eyebrow}>NESTRUNE MOBILE</Text><Text style={styles.title}>{title}</Text><Text style={styles.copy}>{body}</Text></View>
}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#041313'},
 shell:{flex:1,backgroundColor:'#071c1b'},
 header:{paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#21483e'},
 brand:{fontSize:23,fontWeight:'900',letterSpacing:2,color:'#f2cf73'},
 tagline:{marginTop:3,fontSize:11,letterSpacing:1.2,color:'#9bc7b8'},
 content:{padding:22,paddingBottom:40},
 eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:'#ddb95f',marginBottom:10},
 title:{fontSize:34,lineHeight:39,fontWeight:'900',color:'#f7f2dc',marginBottom:14},
 copy:{fontSize:16,lineHeight:24,color:'#bdd3ca'},
 error:{padding:14,borderWidth:1,borderColor:'#7a413c',borderRadius:12,color:'#ffb8ac',marginTop:18},
 statRow:{flexDirection:'row',gap:10,marginTop:24},
 stat:{flex:1,padding:14,borderWidth:1,borderColor:'#315b4e',borderRadius:14,backgroundColor:'#0c2925'},
 statValue:{fontSize:22,fontWeight:'900',color:'#f2cf73'},
 statLabel:{fontSize:11,color:'#9bc7b8',marginTop:5},
 panel:{paddingTop:12},
 nav:{flexDirection:'row',padding:8,borderTopWidth:1,borderTopColor:'#21483e',backgroundColor:'#061716'},
 navButton:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',paddingHorizontal:3,borderRadius:10},
 navActive:{backgroundColor:'#153b32'},
 navText:{fontSize:10,fontWeight:'700',color:'#87a99d',textAlign:'center'},
 navTextActive:{color:'#f2cf73'}
});
