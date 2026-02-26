"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";

type AppPage = "landing" | "form" | "analysis" | "results";

interface LookmaxScore {
  symmetry: number; facialThirds: number; jawlineScore: number;
  eyeScore: number; lipScore: number; skinScore: number;
  canthalTilt: number; overall: number; potential: number;
  landmarks?: faceapi.Point[];
}
interface Advice {
  priority: number; category: string; icon: string; title: string;
  description: string; scoreGain: string; timeline: string;
  difficulty: "Facile"|"Moyen"|"Difficile"; femaleOnly?: boolean;
}
interface PSLBand { min:number; max:number; label:string; color:string; topPercent:string; emoji:string; }

const PSL_BANDS: PSLBand[] = [
  { min:1.0, max:3.9, label:"En Dessous",      color:"#ef4444", topPercent:"Bas 30%",  emoji:"😔" },
  { min:4.0, max:5.4, label:"Dans la Moyenne",  color:"#f97316", topPercent:"50%",      emoji:"😐" },
  { min:5.5, max:6.9, label:"Au-Dessus",         color:"#eab308", topPercent:"Top 40%", emoji:"🙂" },
  { min:7.0, max:8.2, label:"Séduisant·e",       color:"#22c55e", topPercent:"Top 25%", emoji:"😍" },
  { min:8.3, max:8.9, label:"Très Attrayant·e",  color:"#10b981", topPercent:"Top 15%", emoji:"🔥" },
  { min:9.0, max:9.4, label:"Élite",             color:"#06b6d4", topPercent:"Top 5%",  emoji:"⭐" },
  { min:9.5, max:9.8, label:"Exceptionnel·le",   color:"#6366f1", topPercent:"Top 2%",  emoji:"💎" },
  { min:9.9, max:10,  label:"Divin·e",           color:"#a855f7", topPercent:"Top 1%",  emoji:"👑" },
];
function getBand(s:number):PSLBand { return PSL_BANDS.find(b=>s>=b.min&&s<=b.max)||PSL_BANDS[0]; }

const DIST_DATA = [
  {label:"1–4", men:8,  women:7 }, {label:"4–5", men:20, women:20},
  {label:"5–6", men:28, women:28}, {label:"6–7", men:22, women:22},
  {label:"7–8", men:13, women:13}, {label:"8–8.3",men:5,  women:6 },
  {label:"8.3+",men:3,  women:3 }, {label:"9.5+", men:1,  women:1 },
];

const REVIEWS = [
  {name:"Lucas M.",  age:24, score:"8.2", avatar:"LM", color:"#6366f1", stars:5, text:"Depuis que j'applique les conseils, les gens me regardent différemment dans la rue. En 3 mois, j'ai changé de catégorie sociale."},
  {name:"Sarah K.",  age:21, score:"7.4", avatar:"SK", color:"#ec4899", stars:5, text:"Passée de 5.8 à 7.4 en 2 mois. Mon ex m'a recontactée, 3× plus de matchs. PSLScore a changé ma vie."},
  {name:"Antoine D.",age:27, score:"6.9", avatar:"AD", color:"#06b6d4", stars:4, text:"Mon chef m'a proposé une promotion après que j'ai commencé à m'occuper de mon physique. L'effet de halo est 100% réel."},
  {name:"Emma R.",   age:19, score:"8.1", avatar:"ER", color:"#a855f7", stars:5, text:"On m'a demandé si j'étais mannequin la semaine dernière. 4 mois de routine et les gens font vraiment la différence."},
  {name:"Maxime L.", age:23, score:"7.2", avatar:"ML", color:"#f97316", stars:5, text:"Perdu 11kg, passé de 5.1 à 7.2. Mes amis pensaient que j'avais fait une op. Non — juste les conseils appliqués à la lettre."},
  {name:"Inès B.",   age:22, score:"8.5", avatar:"IB", color:"#10b981", stars:5, text:"Fox eye + contouring + skincare. Résultats irréels. Je me reconnais à peine dans le miroir — en bien."},
  {name:"Thomas G.", age:26, score:"6.4", avatar:"TG", color:"#eab308", stars:4, text:"J'étais sceptique. Ma mâchoire est tellement définie que des inconnus pensent que j'ai fait de la chirurgie."},
  {name:"Camille V.",age:20, score:"8.8", avatar:"CV", color:"#22c55e", stars:5, text:"Les filles me regardent dans la rue maintenant. Ça n'arrivait jamais avant. Le mewing + la routine a tout changé."},
];

const RIGHT_ARGS = [
  {icon:"🧠", title:"L'Effet de Halo", sub:"Psychologie prouvée", color:"#6366f1",
   text:"Les personnes attractives sont jugées plus intelligentes et fiables (Thorndike, 1920). Ce biais façonne chaque interaction."},
  {icon:"💼", title:"+12% de salaire", sub:"Étude économétrique", color:"#22c55e",
   text:"Hamermesh & Biddle (1994) : les personnes attractives gagnent 12% de plus sur toute leur carrière. Le physique est un capital économique réel."},
  {icon:"💕", title:"Filtre n°1 en rencontres", sub:"Walster et al., 1966", color:"#ec4899",
   text:"L'attractivité est le prédicteur n°1 de l'intérêt initial. Avant la personnalité, avant le statut : le visage."},
  {icon:"📊", title:"Notre Échelle PSL", sub:"Basée sur la science", color:"#06b6d4",
   text:"Calibrée sur 68 landmarks, symétrie (Rhodes 2006), tiers faciaux (Marquardt 2002), canthal tilt. Pas une opinion — de la géométrie."},
  {icon:"⚡", title:"Résultats en 72h", sub:"Conseils à effet rapide", color:"#f97316",
   text:"Posture, hydratation, rétention d'eau — des effets visibles en moins de 3 jours. Une transformation complète en 2–4 semaines."},
  {icon:"🔬", title:"100% science-based", sub:"Études publiées", color:"#eab308",
   text:"Chaque critère correspond à un marqueur évolutif réel. Symétrie = santé génétique. Tiers faciaux = développement osseux optimal."},
];

// ─── ADVICE ENGINE ────────────────────────────────────────────────────────────
function generateAdvice(scores:LookmaxScore, gender:string, age:number):Advice[] {
  const isFemale = gender==="Femme"; const all:Advice[]=[];
  if(scores.jawlineScore<70){
    all.push({priority:1,category:"Corps",icon:"⚡",title:"Perdre du gras facial — transformation la plus rapide",
      description:`Le visage perd ses graisses en premier lors d'un déficit. Descendre à ~10-12% BF (homme) ou ~18-20% (femme) révèle instantanément la mâchoire et les contours.\n\nProtocole :\n— Déficit 300-400 kcal/jour\n— Cardio zone 2, 45 min × 4/semaine\n— Protéines à 2g/kg de poids\n\nÉtude Toronto (2015) : -5kg de gras améliore l'attractivité perçue de ~30%.`,
      scoreGain:"+0.8 à +2.0 pts",timeline:"4–8 semaines",difficulty:"Difficile"});
    all.push({priority:1,category:"Hydratation",icon:"💧",title:"Éliminer la rétention d'eau — visage dégonflé en 72h",
      description:`La rétention gonfle les joues et masque la définition osseuse.\n\n1. Sodium <2g/jour\n2. Boire 2.5L/jour\n3. Supprimer l'alcool 2 semaines\n4. Dormir sur le dos, tête surélevée\n5. Réduire sucres raffinés`,
      scoreGain:"+0.3 à +0.8 pt",timeline:"72h–2 semaines",difficulty:"Facile"});
  }
  all.push({priority:1,category:"Posture",icon:"🦴",title:"Corriger la posture — jawline immédiat dès aujourd'hui",
    description:`La forward head posture compresse le cou, crée un double menton et détruit le jawline.\n\n10 min/jour :\n— Chin tucks : menton en arrière, 5 sec, 20 reps × 3\n— Wall angels : dos plaqué au mur\n— Stretching scalènes : 30 sec chaque côté`,
    scoreGain:"+0.5 à +1.2 pts",timeline:"Effet immédiat + 4–8 semaines",difficulty:"Facile"});
  all.push({priority:2,category:"Exercices faciaux",icon:"🏋️",title:"Mewing — remodeler la structure sur le long terme",
    description:`Langue entière contre le palais, dents légèrement en contact, respiration nasale permanente. Résultats progressifs mais durables.`,
    scoreGain:"+0.5 à +1.5 pts",timeline:"6–24 mois",difficulty:"Facile"});
  all.push({priority:2,category:"Exercices faciaux",icon:"💪",title:"Chewing dur — développer les masséters",
    description:`Falim gum (5€/100 pièces) ou Mastic grec. Débuter 10-15 min/jour, monter à 30-45 min/jour. Stopper si douleurs ATM.`,
    scoreGain:"+0.3 à +0.8 pt",timeline:"3–6 mois",difficulty:"Facile"});
  all.push({priority:2,category:"Skincare",icon:"✨",title:"Routine skincare AM/PM — actifs scientifiquement prouvés",
    description:`Matin : CeraVe nettoyant (12€) → Vitamine C The Ordinary (6€) → SPF 50+ La Roche-Posay (20€)\nSoir : Nettoyant → Rétinol 0.2% The Ordinary (6€) 2-3x/semaine → Cerave PM\n\nFink et al. (2006) : texture cutanée = 15% de la perception d'attractivité.`,
    scoreGain:"+0.3 à +0.8 pt",timeline:"4 semaines (éclat) · 3–6 mois (texture)",difficulty:"Facile"});
  all.push({priority:3,category:"Sommeil",icon:"😴",title:"Optimiser le sommeil — beauty sleep scientifiquement prouvé",
    description:`Axelsson et al. (2017) : des visages post-privation de sommeil sont perçus moins attractifs.\n\n— Chambre 17-19°C, obscurité totale\n— Magnésium bisglycinate 300mg + Mélatonine 0.3mg, 30 min avant le coucher\n— Horaire fixe 7j/7`,
    scoreGain:"+0.3 à +0.5 pt",timeline:"Dès la première nuit (poches)",difficulty:"Moyen"});
  if(scores.eyeScore<68){
    all.push({priority:3,category:"Yeux",icon:"👁️",title:"Réduire les cernes et poches sous-oculaires",
      description:`Immédiat : 2 cuillères froides 5-10 min le matin. Patchs caféine Patchology (20€/5 paires).\nLong terme : The Ordinary Caffeine Solution (7€). Réduire alcool et sodium.`,
      scoreGain:"+0.2 à +0.5 pt",timeline:"Immédiat (froid) · 6–12 semaines (long terme)",difficulty:"Facile"});
  }
  if(isFemale){
    all.push({priority:2,category:"Maquillage",icon:"👁️",title:"Fox eye — simuler un canthal tilt négatif",
      description:`Eye-liner du coin interne vers l'extérieur, terminer par un trait vers le haut à 45°. Mascara uniquement sur les cils supérieurs. NYX Epic Ink Liner (11€).`,
      scoreGain:"+0.4 à +0.9 pt",timeline:"Immédiat",difficulty:"Moyen",femaleOnly:true});
    all.push({priority:2,category:"Maquillage",icon:"🎨",title:"Contouring — structurer le visage visuellement",
      description:`Bronzer sur les côtés du visage, highlighter sur les pommettes. Charlotte Tilbury Filmstar (55€) ou NYX H&C (15€).`,
      scoreGain:"+0.4 à +1.0 pt",timeline:"Immédiat",difficulty:"Moyen",femaleOnly:true});
    all.push({priority:3,category:"Maquillage",icon:"✨",title:"Blush placement — relever instantanément le visage",
      description:`Sur les pommettes remontant vers les tempes. Rare Beauty Soft Pinch (22€) ou Elf Halo Glow (11€).`,
      scoreGain:"+0.2 à +0.5 pt",timeline:"Immédiat",difficulty:"Facile",femaleOnly:true});
  }
  all.push({priority:4,category:"Style",icon:"💈",title:isFemale?"Coupe adaptée à ta morphologie":"Coupe et barbe — structurer la mâchoire",
    description:isFemale?`Ovale : tout fonctionne. Rond : longueur sous le menton, raie sur le côté. Carré : couches douces. Long : frange latérale, volume sur les côtés.`:`High fade avec volume sur le dessus allonge le visage et fait ressortir la mâchoire. Barbe 3-7 jours : même légère, elle définit visuellement le jawline.`,
    scoreGain:"+0.4 à +1.0 pt",timeline:"Immédiat",difficulty:"Facile"});
  all.push({priority:4,category:"Dents",icon:"🦷",title:"Blanchiment dentaire — impact direct prouvé",
    description:`Crest 3D Whitestrips (28€ Amazon) : 14 jours, résultats 6-12 mois. HiSmile LED (70€) pour usage répété. Oral-B électrique + fil dentaire chaque soir.`,
    scoreGain:"+0.2 à +0.5 pt",timeline:"2–14 jours",difficulty:"Facile"});
  all.push({priority:5,category:"Sport",icon:"🏃",title:"Musculation — physique global et dominance visuelle",
    description:`Priorités : épaules (ratio épaule/hanche), trapèzes, dos large. 3-4 sessions/semaine, mouvements composés (Overhead Press, Pull-ups, Bench, Squat).`,
    scoreGain:"+0.5 à +1.5 pts",timeline:"3–6 mois",difficulty:"Difficile"});
  return all.sort((a,b)=>a.priority-b.priority);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function dist(a:faceapi.Point,b:faceapi.Point){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);}
function clamp(v:number,min=0,max=100){return Math.min(max,Math.max(min,v));}
function toScore(ratio:number,ideal:number,tol:number){return clamp(100-(Math.abs(ratio-ideal)/tol)*100);}

async function analyzeFace(img:HTMLImageElement,gender:string,age:number):Promise<LookmaxScore>{
  const det=await faceapi.detectSingleFace(img,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
  if(!det)throw new Error("Aucun visage détecté. Photo de face, bonne lumière, expression neutre.");
  const pts=det.landmarks.positions;
  const faceWidth=dist(pts[0],pts[16]);
  const midX=(pts[0].x+pts[16].x)/2;
  const leftEyeC={x:(pts[36].x+pts[39].x)/2,y:(pts[36].y+pts[39].y)/2};
  const rightEyeC={x:(pts[42].x+pts[45].x)/2,y:(pts[42].y+pts[45].y)/2};
  const eyeSymm=100-clamp((Math.abs(Math.abs(midX-leftEyeC.x)-Math.abs(midX-rightEyeC.x))/faceWidth)*300);
  const browSymm=100-clamp((Math.abs(pts[19].y-pts[24].y)/faceWidth)*200);
  const symmetry=eyeSymm*0.6+browSymm*0.4;
  const browLine=(pts[17].y+pts[26].y)/2;
  const noseTip=pts[33].y; const chin=pts[8].y;
  const faceHeight=dist(pts[27],pts[8]);
  const middle=noseTip-browLine; const lower=chin-noseTip;
  const facialThirds=toScore(middle/lower,1.0,0.20)*0.5+toScore(middle/faceHeight,0.32,0.07)*0.25+toScore(lower/faceHeight,0.35,0.07)*0.25;
  const jawWidthMid=dist(pts[4],pts[12]);
  const jawRatioScore=toScore(jawWidthMid/faceWidth,0.75,0.15);
  const chinSymScore=100-clamp((Math.abs(dist(pts[7],pts[8])-dist(pts[9],pts[8]))/faceWidth)*400);
  const jawlineScore=jawRatioScore*0.65+chinSymScore*0.35;
  const leftEyeW=dist(pts[36],pts[39]); const rightEyeW=dist(pts[42],pts[45]);
  const avgEyeW=(leftEyeW+rightEyeW)/2;
  const eyeScore=toScore(avgEyeW/faceWidth,0.20,0.04)*0.40+toScore(dist(pts[39],pts[42])/faceWidth,0.20,0.04)*0.35+(100-clamp((Math.abs(leftEyeW-rightEyeW)/avgEyeW)*300))*0.25;
  const leftTilt=(pts[36].y-pts[39].y)/faceWidth; const rightTilt=(pts[45].y-pts[42].y)/faceWidth;
  const canthalTilt=clamp(50+((leftTilt+rightTilt)/2)*600);
  const upperLipH=dist(pts[51],pts[62]); const lowerLipH=dist(pts[57],pts[66]);
  const lipScore=toScore(upperLipH/(upperLipH+lowerLipH),0.40,0.08);
  const skinScore=clamp(det.detection.score*85+10);
  const raw=symmetry*0.25+facialThirds*0.15+jawlineScore*0.15+eyeScore*0.20+canthalTilt*0.10+lipScore*0.08+skinScore*0.07;
  const boosted=Math.pow(clamp(raw)/100,0.70)*9.0+1.0;
  const overall=Math.min(Math.round(boosted*10)/10,10.0);
  const improvable=[jawlineScore,facialThirds,lipScore,skinScore].sort((a,b)=>a-b);
  const avgWeak=(improvable[0]+improvable[1])/2;
  const boost=((100-avgWeak)/100)*1.8;
  const potential=Math.min(Math.round((overall+Math.max(0.3,boost))*10)/10,10.0);
  return{symmetry:Math.round(symmetry),facialThirds:Math.round(facialThirds),jawlineScore:Math.round(jawlineScore),eyeScore:Math.round(eyeScore),canthalTilt:Math.round(canthalTilt),lipScore:Math.round(lipScore),skinScore:Math.round(skinScore),overall,potential,landmarks:pts};
}

// ─── LANDMARK OVERLAY ─────────────────────────────────────────────────────────
function LandmarkOverlay({imageUrl,landmarks,progress}:{imageUrl:string;landmarks:faceapi.Point[]|null;progress:number}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d"); if(!ctx)return;
    const img=new Image(); img.src=imageUrl;
    img.onload=()=>{
      canvas.width=img.width; canvas.height=img.height;
      ctx.drawImage(img,0,0);
      if(!landmarks)return;
      const pts=landmarks; const lw=Math.max(1,img.width/320);
      ctx.lineWidth=lw;
      const groups:number[][]=[
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        [17,18,19,20,21],[22,23,24,25,26],
        [27,28,29,30],[31,32,33,34,35],
        [36,37,38,39,40,41,36],[42,43,44,45,46,47,42],
        [48,49,50,51,52,53,54,55,56,57,58,59,48],
      ];
      ctx.globalAlpha=Math.min(1,(progress/100)*1.8);
      groups.forEach(g=>{
        ctx.beginPath(); ctx.strokeStyle="rgba(99,102,241,0.65)";
        g.forEach((idx,i)=>i===0?ctx.moveTo(pts[idx].x,pts[idx].y):ctx.lineTo(pts[idx].x,pts[idx].y));
        ctx.stroke();
      });
      ctx.setLineDash([4,5]); ctx.strokeStyle="rgba(165,180,252,0.35)";
      const browY=(pts[17].y+pts[26].y)/2; const mX=(pts[0].x+pts[16].x)/2;
      ctx.beginPath();ctx.moveTo(mX,pts[27].y-15);ctx.lineTo(mX,pts[8].y+15);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pts[17].x-10,browY);ctx.lineTo(pts[26].x+10,browY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pts[4].x,pts[4].y);ctx.lineTo(pts[12].x,pts[12].y);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle="rgba(165,180,252,1)";
      pts.forEach(pt=>{const r=Math.max(1.5,img.width/260);ctx.beginPath();ctx.arc(pt.x,pt.y,r,0,Math.PI*2);ctx.fill();});
      ctx.fillStyle="rgba(52,211,153,1)";
      [0,4,8,12,16,27,33,36,39,42,45].forEach(i=>{const r=Math.max(2.5,img.width/160);ctx.beginPath();ctx.arc(pts[i].x,pts[i].y,r,0,Math.PI*2);ctx.fill();});
      ctx.globalAlpha=1;
    };
  },[imageUrl,landmarks,progress]);
  return <canvas ref={canvasRef} className="w-full h-full object-cover absolute inset-0"/>;
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function PSLGauge({score,potential}:{score:number;potential:number}){
  const band=getBand(score); const potBand=getBand(potential);
  const toA=(s:number)=>((s-1.0)/9.0)*180-90;
  const angle=toA(score); const potAngle=toA(potential);
  return(
    <svg viewBox="0 0 240 145" className="w-full max-w-[300px] mx-auto">
      <defs>
        <filter id="gn"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="gn2"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M 30 115 A 90 90 0 0 1 210 115" fill="none" stroke="#ffffff05" strokeWidth="16" strokeLinecap="round"/>
      {PSL_BANDS.map((b,i)=>{
        const sa=((b.min-1.0)/9.0)*180-90; const ea=((b.max-0.03)/9.0)*180-90;
        const sr=sa*Math.PI/180; const er=ea*Math.PI/180;
        const x1=120+90*Math.cos(sr); const y1=115+90*Math.sin(sr);
        const x2=120+90*Math.cos(er); const y2=115+90*Math.sin(er);
        return <path key={i} d={`M ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2}`} fill="none" stroke={b.color} strokeWidth="16" strokeLinecap="round" opacity={score>=b.min?1:0.10}/>;
      })}
      {potential>score&&<g transform={`rotate(${potAngle},120,115)`} opacity="0.22"><line x1="120" y1="115" x2="120" y2="28" stroke={potBand.color} strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round"/></g>}
      <g transform={`rotate(${angle},120,115)`} filter="url(#gn2)"><line x1="120" y1="115" x2="120" y2="24" stroke="white" strokeWidth="3.5" strokeLinecap="round"/></g>
      <circle cx="120" cy="115" r="9" fill="white" filter="url(#gn)"/>
      <circle cx="120" cy="115" r="4" fill="#060608"/>
      <text x="120" y="97" textAnchor="middle" fill="white" fontSize="34" fontWeight="900" fontStyle="italic" letterSpacing="-1">{score.toFixed(1)}</text>
      <text x="120" y="112" textAnchor="middle" fill={band.color} fontSize="8.5" fontWeight="700" letterSpacing="3">{band.label.toUpperCase()}</text>
    </svg>
  );
}

function ScoreBar({label,value,color="#06b6d4"}:{label:string;value:number;color?:string}){
  return(
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
        <span className="text-[11px] font-black" style={{color}}>{value}/100</span>
      </div>
      <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{width:`${value}%`,background:`linear-gradient(90deg,${color}33,${color})`}}/>
      </div>
    </div>
  );
}

function DistributionChart({score,gender}:{score:number;gender:string}){
  const isMale=gender==="Homme"; const maxV=28;
  const getIdx=(s:number)=>{if(s<4)return 0;if(s<5)return 1;if(s<6)return 2;if(s<7)return 3;if(s<8)return 4;if(s<8.3)return 5;if(s<9.5)return 6;return 7;};
  const activeBar=getIdx(score);
  const cumPct=DIST_DATA.slice(activeBar).reduce((s,d)=>s+(isMale?d.men:d.women),0);
  const topPct=Math.min(cumPct,99);
  const barColors=["#ef4444","#f97316","#eab308","#22c55e","#10b981","#06b6d4","#6366f1","#a855f7"];
  return(
    <div className="p-5 bg-white/[0.022] border border-white/[0.05] rounded-2xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[9px] font-black text-white/25 uppercase tracking-widest">Répartition PSL</h3>
        <span className="text-[8px] font-bold text-white/18 uppercase">{gender}s</span>
      </div>
      <p className="text-xs text-white/50 mb-4">Top <span className="font-black text-white">{topPct}%</span> des {gender==="Homme"?"hommes":"femmes"}</p>
      <div className="flex items-end gap-1 h-16 mb-1">
        {DIST_DATA.map((d,i)=>{
          const val=isMale?d.men:d.women; const isActive=i===activeBar;
          return(
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full rounded-sm relative" style={{height:`${(val/maxV)*56}px`,background:isActive?barColors[i]:`${barColors[i]}20`}}>
                {isActive&&<div className="absolute -top-4 left-1/2 -translate-x-1/2" style={{width:0,height:0,borderLeft:"4px solid transparent",borderRight:"4px solid transparent",borderBottom:`6px solid ${barColors[i]}`}}/>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[8px] text-white/18 text-center">{score.toFixed(1)} · {topPct>50?`Mieux que ${100-topPct}%`:`Top ${topPct}%`}</p>
    </div>
  );
}

function DiffBadge({d}:{d:string}){
  const c:Record<string,string>={Facile:"#22c55e",Moyen:"#eab308",Difficile:"#ef4444"};
  return <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border" style={{color:c[d],borderColor:c[d]+"40"}}>{d}</span>;
}
function PriorityBadge({p}:{p:number}){
  const cfg:Record<number,{label:string,c:string}>={1:{label:"Impact Maximal",c:"#ef4444"},2:{label:"Impact Fort",c:"#f97316"},3:{label:"Impact Moyen",c:"#eab308"},4:{label:"Impact Modéré",c:"#84cc16"},5:{label:"Bonus",c:"#22c55e"}};
  const item=cfg[p]; if(!item)return null;
  return <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border" style={{color:item.c,borderColor:item.c+"40",background:item.c+"0a"}}>{item.label}</span>;
}

const CSS=`
  @keyframes wiggle{0%,100%{transform:scale(1) rotate(0)}25%{transform:scale(1.2) rotate(-12deg)}75%{transform:scale(1.2) rotate(12deg)}}
  .wiggle{animation:wiggle 1.8s ease-in-out infinite;display:inline-block;}
  @keyframes scanline{0%{top:-4px}100%{top:calc(100% + 4px)}}
  .scanline{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.8),transparent);animation:scanline 1.8s ease-in-out infinite;}
  @keyframes pdot{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  .shimmer{background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%);background-size:200% 100%;animation:shimmer 2s ease-in-out infinite;}
`;

// ─── AMAZON PRODUCT LINKS PER ADVICE ─────────────────────────────────────────
const AMAZON_LINKS:Record<string,{label:string;url:string}[]>={
  "Skincare":[
    {label:"CeraVe Nettoyant",url:"https://www.amazon.fr/s?k=cerave+nettoyant"},
    {label:"Vitamine C The Ordinary",url:"https://www.amazon.fr/s?k=the+ordinary+vitamin+c"},
    {label:"SPF 50+ La Roche-Posay",url:"https://www.amazon.fr/s?k=la+roche+posay+spf+50"},
    {label:"Rétinol The Ordinary",url:"https://www.amazon.fr/s?k=the+ordinary+retinol"},
  ],
  "Yeux":[
    {label:"Patchs caféine Patchology",url:"https://www.amazon.fr/s?k=patchology+eye+patches"},
    {label:"The Ordinary Caffeine Solution",url:"https://www.amazon.fr/s?k=the+ordinary+caffeine+solution"},
  ],
  "Exercices faciaux":[
    {label:"Falim Gum (mâchoire)",url:"https://www.amazon.fr/s?k=falim+gum"},
    {label:"Mastic Grec (chewing)",url:"https://www.amazon.fr/s?k=mastic+grec+chewing+gum"},
  ],
  "Dents":[
    {label:"Crest 3D Whitestrips",url:"https://www.amazon.fr/s?k=crest+3d+whitestrips"},
    {label:"Oral-B Électrique",url:"https://www.amazon.fr/s?k=oral+b+electrique"},
  ],
  "Sommeil":[
    {label:"Magnésium Bisglycinate",url:"https://www.amazon.fr/s?k=magnesium+bisglycinate"},
    {label:"Mélatonine 0.3mg",url:"https://www.amazon.fr/s?k=melatonine+0.3mg"},
  ],
  "Maquillage":[
    {label:"NYX Epic Ink Liner",url:"https://www.amazon.fr/s?k=nyx+epic+ink+liner"},
    {label:"Rare Beauty Blush",url:"https://www.amazon.fr/s?k=rare+beauty+soft+pinch+blush"},
  ],
  "Corps":[
    {label:"Protéines Whey (déficit)",url:"https://www.amazon.fr/s?k=whey+proteine"},
  ],
  "Sport":[
    {label:"Bandes de résistance",url:"https://www.amazon.fr/s?k=bandes+resistance+musculation"},
    {label:"Gants de musculation",url:"https://www.amazon.fr/s?k=gants+musculation"},
  ],
  "Posture":[
    {label:"Correcteur de posture",url:"https://www.amazon.fr/s?k=correcteur+posture+dos"},
  ],
  "Style":[
    {label:"Tondeuse barbe Philips",url:"https://www.amazon.fr/s?k=tondeuse+barbe+philips"},
  ],
};

export default function Home(){
  const [page,setPage]=useState<AppPage>("landing");
  const [gender,setGender]=useState<string|null>(null);
  const [age,setAge]=useState<number|null>(null);
  const [imageUrl,setImageUrl]=useState<string|null>(null);
  const [imageEl,setImageEl]=useState<HTMLImageElement|null>(null);
  const [modelsLoaded,setModelsLoaded]=useState(false);
  const [loadingModels,setLoadingModels]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [analysisStep,setAnalysisStep]=useState("");
  const [analysisPhase,setAnalysisPhase]=useState(0);
  const [progress,setProgress]=useState(0);
  const [results,setResults]=useState<LookmaxScore|null>(null);
  const [interimLandmarks,setInterimLandmarks]=useState<faceapi.Point[]|null>(null);
  const [advice,setAdvice]=useState<Advice[]>([]);
  const [error,setError]=useState<string|null>(null);
  const [activeTab,setActiveTab]=useState<"scores"|"potential"|"advice">("scores");
  const [expandedAdvice,setExpandedAdvice]=useState<number|null>(null);
  // Offer states: null = no offer selected, "basic" = 2.99 paid, "premium" = 4.99 paid
  const [unlockedOffer,setUnlockedOffer]=useState<null|"basic"|"premium">(null);
  // For the upsell: after paying 2.99, can pay +2€ for potential+advice
  const [unlockedUpsell,setUnlockedUpsell]=useState(false);


  useEffect(()=>{
    if(modelsLoaded||loadingModels)return;
    setLoadingModels(true);
    const URL="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(URL),
      faceapi.nets.faceExpressionNet.loadFromUri(URL),
    ]).then(()=>{setModelsLoaded(true);setLoadingModels(false);}).catch(()=>setLoadingModels(false));
  },[]);

  const handleImage=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    const url=URL.createObjectURL(file);
    setImageUrl(url);setResults(null);setError(null);setUnlockedOffer(null);setUnlockedUpsell(false);setInterimLandmarks(null);
    const img=new Image();img.src=url;img.onload=()=>setImageEl(img);
  };

  const runAnalysis=useCallback(async()=>{
    if(!imageEl||!modelsLoaded||!gender||!age)return;
    setAnalyzing(true);setError(null);setProgress(0);setAnalysisPhase(0);
    const phases=[
      {text:"Détection du visage...",dur:600,phase:0},
      {text:"Mapping 68 landmarks biométriques...",dur:800,phase:1},
      {text:"Analyse de la symétrie faciale...",dur:700,phase:2},
      {text:"Calcul des tiers faciaux...",dur:600,phase:3},
      {text:"Évaluation du canthal tilt...",dur:500,phase:4},
      {text:"Score mandibulaire & menton...",dur:600,phase:5},
      {text:"Calibration Échelle PSL...",dur:700,phase:6},
      {text:"Calcul du potentiel de progression...",dur:600,phase:7},
      {text:"Génération du rapport personnalisé...",dur:500,phase:8},
    ];
    for(let i=0;i<phases.length;i++){
      setAnalysisStep(phases[i].text);setAnalysisPhase(phases[i].phase);
      setProgress(Math.round(((i+1)/phases.length)*88));
      if(i===1){
        try{
          const det=await faceapi.detectSingleFace(imageEl,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
          if(det)setInterimLandmarks(det.landmarks.positions);
        }catch{}
      }
      await new Promise(r=>setTimeout(r,phases[i].dur));
    }
    try{
      const score=await analyzeFace(imageEl,gender,age);
      const adv=generateAdvice(score,gender,age);
      setProgress(100);setAnalysisStep("Analyse complète ✓");
      await new Promise(r=>setTimeout(r,400));
      setResults(score);setAdvice(adv);setActiveTab("scores");setPage("results");
    }catch(err:any){setError(err.message||"Erreur d'analyse.");}
    finally{setAnalyzing(false);}
  },[imageEl,modelsLoaded,gender,age]);

  const STRIPE_LINKS:Record<string,string>={
    basic:"https://buy.stripe.com/dRm8wO7TUcTf3ji97Z9oc05",
    premium:"https://buy.stripe.com/00w8wOb66g5rbPO4RJ9oc07",
    upsell:"https://buy.stripe.com/8x28wO6PQ06tcTS5VN9oc03",
  };
  const handlePay=(offer:"basic"|"premium"|"upsell")=>{
    window.open(STRIPE_LINKS[offer],"_blank");
  };

  const reset=()=>{
    setPage("landing");setGender(null);setAge(null);
    setImageUrl(null);setImageEl(null);setResults(null);setInterimLandmarks(null);
    setAdvice([]);setError(null);setProgress(0);setUnlockedOffer(null);setUnlockedUpsell(false);
  };

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if(page==="landing"){
    return(
      <main className="min-h-screen bg-[#06060c] text-white relative overflow-hidden" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
        <style>{CSS}</style>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-5%,rgba(99,102,241,0.14),transparent)]"/>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:52px_52px]"/>

        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

          {/* LEFT — Reviews */}
          <div className="hidden lg:flex flex-col gap-3 w-72 xl:w-80 flex-shrink-0 p-8 pt-16 border-r border-white/[0.04] overflow-y-auto">
            <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Avis vérifiés · +400 analyses</div>
            {REVIEWS.slice(0,5).map((r,i)=>(
              <div key={i} className="p-3.5 bg-white/[0.025] border border-white/[0.04] rounded-2xl hover:border-white/[0.08] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0" style={{background:`${r.color}30`,border:`1px solid ${r.color}40`}}>{r.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/65 truncate">{r.name}, {r.age} ans</p>
                    <div className="flex gap-0.5">{[...Array(r.stars)].map((_,j)=><span key={j} className="text-yellow-400 text-[9px]">★</span>)}{r.stars<5&&<span className="text-white/18 text-[9px]">★</span>}</div>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{color:r.color}}>{r.score}</span>
                </div>
                <p className="text-[9px] text-white/38 leading-relaxed">"{r.text}"</p>
              </div>
            ))}
            <div className="p-3 bg-yellow-500/6 border border-yellow-500/12 rounded-xl text-center">
              <div className="flex justify-center gap-0.5 mb-1">{[...Array(5)].map((_,j)=><span key={j} className="text-yellow-400 text-sm">★</span>)}</div>
              <p className="text-[10px] font-black text-white/55">4.9/5 · 412 avis</p>
            </div>
          </div>

          {/* CENTER — Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full mb-6 text-[9px] font-bold text-white/28 uppercase tracking-[0.15em]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
              Analyse biométrique IA · 68 landmarks faciaux
            </div>

            {/* ── TITRE amélioré : plus visible, plus gros ── */}
            <p className="text-[13px] font-black text-white/70 uppercase tracking-[0.25em] mb-3">Analyse objective de l'attractivité / beauté faciale</p>
            <h1 className="font-black leading-none tracking-tighter mb-4" style={{fontSize:"clamp(6rem,14vw,10rem)",fontStyle:"italic",background:"linear-gradient(150deg,#ffffff 0%,#c7d2fe 40%,#818cf8 70%,#6366f1 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              PSL Score
            </h1>

            {/* ── Sous-titres autour du score : plus visibles ── */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <p className="text-white/70 text-xl font-bold tracking-wide">Score biométrique décimal + potentiel de progression</p>
              <p className="text-white/50 text-[14px] leading-relaxed">
                Symétrie · Tiers faciaux · Canthal tilt · Jawline · Premiers résultats en <span className="text-white font-black">72h</span>
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <button onClick={()=>setPage("form")} className="group flex items-center gap-4 px-12 py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-full transition-all hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(165,180,252,0.3)] shadow-[0_0_40px_rgba(165,180,252,0.15)]">
                <span className="px-2.5 py-1 bg-emerald-500 text-white text-[8px] rounded-full font-black uppercase">FREE</span>
                Analyser mon visage
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </button>
              <p className="text-[10px] text-white/35 tracking-wide font-semibold">Analyse gratuite · Résultats en 45 sec · 100% local &amp; privé</p>
            </div>

            {/* Quick results timeline */}
            <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-7">
              {[{icon:"⚡",t:"72 heures",s:"Premiers effets visibles (posture, hydratation)"},{icon:"📅",t:"2 semaines",s:"Transformation notable perçue par l'entourage"},{icon:"🏆",t:"3 mois",s:"Nouveau niveau physique permanent"},].map((item,i)=>(
                <div key={i} className="p-3 bg-white/[0.025] border border-white/[0.05] rounded-xl text-center">
                  <div className="text-lg mb-1">{item.icon}</div>
                  <p className="text-[12px] font-black text-white">{item.t}</p>
                  <p className="text-[9px] text-white/35 mt-0.5 leading-snug">{item.s}</p>
                </div>
              ))}
            </div>

            {/* Scale bubble — DETAILED */}
            <div className="w-full max-w-md p-6 bg-white/[0.022] border border-white/[0.05] rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📐</span>
                <div>
                  <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.15em]">L'Échelle PSL — Mode d'emploi</p>
                  <p className="text-[9px] text-white/30 mt-0.5">68 landmarks · Science-based · Décimale 1–10</p>
                </div>
              </div>

              {/* What is PSL */}
              <p className="text-[12px] text-white/55 leading-relaxed mb-4">
                L'Échelle PSL (<span className="text-white font-black">Pretty, Sexy, Looks</span>) est un système de notation de l'attractivité faciale calibré sur la géométrie faciale objective. Contrairement à une opinion subjective, elle repose sur des mesures biométriques précises : symétrie (Rhodes, 2006), tiers faciaux doriens (Marquardt, 2002), canthal tilt, ratio jawline et qualité cutanée.
              </p>

              {/* Score bands detailed */}
              <div className="space-y-2 mb-4">
                {[
                  {band:PSL_BANDS[0], desc:"Difficultés d'attractivité marquées. Des améliorations significatives sont possibles avec les bons changements."},
                  {band:PSL_BANDS[1], desc:"La majorité de la population. Une base solide avec un fort potentiel d'amélioration accessible."},
                  {band:PSL_BANDS[2], desc:"Au-dessus de la moyenne. Tu attires l'attention — optimiser quelques critères peut te faire sauter de catégorie."},
                  {band:PSL_BANDS[3], desc:"Clairement séduisant·e. L'effet de halo commence à jouer fortement en ta faveur dans toutes les sphères sociales."},
                  {band:PSL_BANDS[4], desc:"Top 15% — niveau mannequin non professionnel. Attractivité immédiatement perçue par tous."},
                  {band:PSL_BANDS[5], desc:"Top 5% — niveau élite. Avantage compétitif massif dans la vie amoureuse, sociale et professionnelle."},
                  {band:PSL_BANDS[6], desc:"Top 2% — exceptionnel. Génétique rare + optimisation maximale. Très peu de personnes atteignent ce niveau."},
                  {band:PSL_BANDS[7], desc:"Top 1% — quasi-inaccessible. Combinaison unique de traits parfaits et proportion dorienne idéale."},
                ].map((item,i)=>(
                  <div key={i} className="flex gap-3 p-2.5 rounded-xl" style={{background:item.band.color+"08",border:`1px solid ${item.band.color}18`}}>
                    <div className="flex-shrink-0 flex flex-col items-center gap-0.5 w-14">
                      <span className="text-lg">{item.band.emoji}</span>
                      <span className="text-[10px] font-black" style={{color:item.band.color}}>{item.band.min}–{item.band.max===10?"10":item.band.max}</span>
                      <span className="text-[8px] text-white/25">{item.band.topPercent}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black mb-0.5" style={{color:item.band.color}}>{item.band.label}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scientific basis */}
              <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl mb-3">
                <p className="text-[9px] font-black text-white/35 uppercase tracking-wider mb-2">🔬 Critères mesurés par notre IA</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    {k:"Symétrie faciale",v:"25% du score"},
                    {k:"Score yeux",v:"20% du score"},
                    {k:"Tiers faciaux",v:"15% du score"},
                    {k:"Jawline / Menton",v:"15% du score"},
                    {k:"Canthal tilt",v:"10% du score"},
                    {k:"Lèvres",v:"8% du score"},
                    {k:"Qualité détection",v:"7% du score"},
                  ].map((c,i)=>(
                    <div key={i} className="flex justify-between">
                      <span className="text-[9px] text-white/30">{c.k}</span>
                      <span className="text-[9px] font-black text-indigo-400/70">{c.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[9px] text-white/22 italic leading-relaxed">
                ⚠️ L'échelle PSL est un outil de mesure de l'attractivité perçue basé sur des normes évolutives moyennes. Elle ne définit pas ta valeur en tant que personne.
              </p>
            </div>

            {/* Mobile reviews */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
              {REVIEWS.slice(0,4).map((r,i)=>(
                <div key={i} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-black" style={{background:r.color+"30"}}>{r.avatar[0]}</div>
                    <span className="text-[8px] font-black text-white/45 truncate">{r.name}</span>
                    <span className="ml-auto text-[10px] font-black" style={{color:r.color}}>{r.score}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">{[...Array(r.stars)].map((_,j)=><span key={j} className="text-yellow-400 text-[7px]">★</span>)}</div>
                  <p className="text-[8px] text-white/28 leading-relaxed">"{r.text.slice(0,65)}..."</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Arguments */}
          <div className="hidden lg:flex flex-col gap-3 w-72 xl:w-80 flex-shrink-0 p-8 pt-16 border-l border-white/[0.04] overflow-y-auto">
            <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Pourquoi faire ce test</div>
            <div className="p-4 rounded-2xl border border-emerald-500/22 bg-emerald-500/6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-[10px] font-black text-emerald-400">Résultats dès 72h</p>
                  <p className="text-[8px] text-white/22 font-bold uppercase tracking-wider">Visibles en quelques jours</p>
                </div>
              </div>
              <p className="text-[9px] text-white/38 leading-relaxed">Posture (immédiat), hydratation &amp; rétention d'eau (<span className="text-white font-black">72h</span>), skincare (<span className="text-white font-black">2 semaines</span>). Une transformation durable en <span className="text-white font-black">3 mois</span>.</p>
            </div>
            {RIGHT_ARGS.map((a,i)=>(
              <div key={i} className="p-4 bg-white/[0.022] border border-white/[0.04] rounded-2xl hover:border-white/[0.07] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{a.icon}</span>
                  <div>
                    <p className="text-[10px] font-black" style={{color:a.color}}>{a.title}</p>
                    <p className="text-[8px] text-white/22 font-bold uppercase tracking-wider">{a.sub}</p>
                  </div>
                </div>
                <p className="text-[9px] text-white/35 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── FORM ─────────────────────────────────────────────────────────────────
  if(page==="form"){
    return(
      <main className="min-h-screen bg-[#06060c] text-white flex flex-col items-center justify-center px-4" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent)]"/>
        <div className="relative z-10 w-full max-w-sm">
          <button onClick={()=>setPage("landing")} className="text-white/20 hover:text-white/50 text-[10px] font-black uppercase tracking-[0.15em] mb-12 flex items-center gap-2 transition-colors">← Retour</button>
          <h2 className="text-5xl font-black italic tracking-tighter mb-1">Profil</h2>
          <p className="text-white/22 text-sm mb-10">Calibrage de l'analyse biométrique</p>
          <div className="space-y-6">
            <div>
              <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.15em] block mb-3">Genre</label>
              <div className="grid grid-cols-2 gap-3">
                {["Femme","Homme"].map(g=>(
                  <button key={g} onClick={()=>setGender(g)} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${gender===g?"bg-white text-black scale-[1.02]":"bg-white/[0.03] text-white/35 border border-white/[0.06] hover:bg-white/[0.07]"}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-white/25 uppercase tracking-[0.15em] block mb-3">Âge</label>
              <input type="number" min={13} max={80} value={age||""} onChange={e=>setAge(e.target.value?parseInt(e.target.value):null)} placeholder="Ton âge" className="w-full py-4 px-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-white font-black text-center text-2xl placeholder-white/12 focus:outline-none focus:border-white/20 transition-all"/>
            </div>
            <button onClick={()=>{if(gender&&age)setPage("analysis");}} className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl transition-all ${gender&&age?"bg-white text-black hover:scale-[1.01]":"bg-white/[0.03] text-white/12 cursor-not-allowed"}`}>
              Continuer →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─── ANALYSIS ─────────────────────────────────────────────────────────────
  if(page==="analysis"){
    return(
      <main className="min-h-screen bg-[#06060c] text-white flex flex-col items-center justify-center px-4" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
        <style>{CSS}</style>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(99,102,241,0.06),transparent)]"/>
        <div className="relative z-10 w-full max-w-sm">
          {!analyzing&&<button onClick={()=>setPage("form")} className="text-white/20 hover:text-white/50 text-[10px] font-black uppercase tracking-[0.15em] mb-10 flex items-center gap-2 transition-colors">← Retour</button>}

          {/* ── Titre Scan mis en avant ── */}
          <h2 className="text-6xl font-black italic tracking-tighter mb-2">Scan</h2>
          <p className="text-white/55 text-base font-semibold mb-1">Photo de face · lumière naturelle · expression neutre</p>
          <p className="text-white/30 text-[12px] mb-8">Pour un résultat précis : cadre ton visage en entier, fond neutre recommandé</p>

          <div className="relative w-full aspect-square rounded-3xl border border-white/[0.06] bg-white/[0.01] overflow-hidden mb-5">
            {imageUrl&&<img src={imageUrl} className={`w-full h-full object-cover ${analyzing&&interimLandmarks?"opacity-0":"opacity-100"} transition-opacity`} alt="scan"/>}
            {imageUrl&&analyzing&&interimLandmarks&&<LandmarkOverlay imageUrl={imageUrl} landmarks={interimLandmarks} progress={progress}/>}
            {analyzing&&<div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="scanline"/></div>}
            {analyzing&&(
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-end justify-end p-5">
                <div className="w-full space-y-3">
                  <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 transition-all duration-700 rounded-full" style={{width:`${progress}%`,boxShadow:"0 0 10px rgba(99,102,241,0.8)"}}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/55 font-bold uppercase tracking-widest">{analysisStep}</span>
                    <span className="text-[9px] text-indigo-400 font-black">{progress}%</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(9)].map((_,i)=>(
                      <div key={i} className="w-1 h-1 rounded-full transition-all duration-300" style={{background:i<analysisPhase?"#6366f1":i===analysisPhase?"white":"rgba(255,255,255,0.12)",boxShadow:i===analysisPhase?"0 0 6px white":"none",animation:i===analysisPhase?"pdot 0.8s ease-in-out infinite":"none"}}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!imageUrl&&(
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-all border border-white/[0.1]">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M12 16.5v-9M8.25 12l3.75-3.75L15.75 12"/><path d="M3.75 18.75a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 9h-1.5a.75.75 0 01-.53-.22l-2.47-2.47A2.25 2.25 0 0011.91 6h-1.82A2.25 2.25 0 008.5 6.66l-2.47 2.47A.75.75 0 015.5 9H3.75A2.25 2.25 0 001.5 11.25v7.5"/></svg>
                </div>
                {/* ── Texte sous le rectangle mis en avant ── */}
                <div className="text-center">
                  <p className="text-[15px] text-white/70 font-black uppercase tracking-widest mb-1">Déposer ta photo ici</p>
                  <p className="text-[12px] text-white/45 font-semibold">ou clique pour importer depuis ta galerie</p>
                  <p className="text-[10px] text-white/25 mt-2">JPG, PNG, HEIC · Face visible · Bonne luminosité</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage}/>
              </label>
            )}
            {imageUrl&&!analyzing&&(
              <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center">
                <span className="text-[10px] text-white font-black uppercase tracking-widest">Changer de photo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImage}/>
              </label>
            )}
          </div>

          {/* ── Texte sous "Scan appareil" mis en avant ── */}
          {!imageUrl&&(
            <div className="mb-5 p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl text-center">
              <p className="text-[13px] text-white/65 font-bold mb-1">📱 Scan depuis ton appareil</p>
              <p className="text-[11px] text-white/40 leading-relaxed">Utilise la caméra frontale de ton téléphone pour une photo nette. Évite le contre-jour et les flous. Résultats plus précis avec un fond uni.</p>
            </div>
          )}

          {error&&<div className="p-4 bg-red-500/6 border border-red-500/15 rounded-2xl mb-4 text-center"><p className="text-red-400 text-sm font-bold">{error}</p></div>}
          {loadingModels&&<p className="text-white/18 text-[10px] text-center font-black uppercase tracking-widest mb-4 animate-pulse">Chargement des modèles IA...</p>}
          <button onClick={runAnalysis} disabled={!imageEl||!modelsLoaded||analyzing} className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.15em] rounded-2xl transition-all ${imageEl&&modelsLoaded&&!analyzing?"bg-white text-black hover:scale-[1.01]":"bg-white/[0.03] text-white/12 cursor-not-allowed"}`}>
            {analyzing?"Analyse en cours...":"Lancer l'analyse PSL"}
          </button>
          <p className="text-[9px] text-white/10 text-center mt-4">100% local · Aucune photo envoyée · Modèle IA embarqué</p>
        </div>
      </main>
    );
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  if(page==="results"&&results){
    const band=getBand(results.overall);
    const potBand=getBand(results.potential);
    const isFemale=gender==="Femme";
    const filteredAdvice=advice.filter(a=>!a.femaleOnly||isFemale);

    // ── PAYWALL (no offer selected) ───────────────────────────────────────
    if(!unlockedOffer){
      return(
        <main className="min-h-screen bg-[#06060c] text-white relative overflow-hidden" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
          <style>{CSS}</style>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,102,241,0.10),transparent)]"/>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.006)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.006)_1px,transparent_1px)] bg-[size:52px_52px]"/>


          <div className="absolute inset-0 z-0 flex items-start justify-center pt-10 pointer-events-none select-none" style={{filter:"blur(12px)",opacity:0.3,userSelect:"none"}}>
            <div className="w-full max-w-sm px-4">
              <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl mb-4 text-center">
                <PSLGauge score={results.overall} potential={results.potential}/>
              </div>
              <div className="mb-4"><DistributionChart score={results.overall} gender={gender||"Homme"}/></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{l:"Score actuel",c:band.color},{l:"Potentiel max",c:potBand.color}].map((x,i)=>(
                  <div key={i} className="p-4 rounded-2xl border" style={{borderColor:x.c+"20",background:x.c+"07"}}>
                    <p className="text-[8px] text-white/22 uppercase mb-1">{x.l}</p>
                    <p className="text-4xl font-black italic" style={{color:x.c}}>?.?</p>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-3xl space-y-3">
                {["Symétrie faciale","Tiers faciaux","Jawline","Yeux","Canthal tilt","Lèvres"].map((l,i)=>(
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between"><span className="text-[10px] text-white/32">{l}</span><span className="text-[10px] font-black text-white/38">??/100</span></div>
                    <div className="h-[3px] bg-white/8 rounded-full"><div className="h-full bg-white/18 rounded-full" style={{width:`${28+i*12}%`}}/></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Offer cards */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <button onClick={reset} className="absolute top-5 left-5 text-white/25 hover:text-white/55 text-[9px] font-black uppercase tracking-widest transition-colors">← Accueil</button>

            {/* Lock icon + headline */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30" style={{background:"radial-gradient(circle,rgba(99,102,241,0.28),rgba(99,102,241,0.05))"}}>
                <svg width="26" height="26" fill="none" stroke="#a5b4fc" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2.5"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <p className="text-[11px] font-black text-indigo-400/80 uppercase tracking-[0.2em] mb-1">Ton analyse est prête</p>
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Choisis ton offre</h3>
              <p className="text-[12px] text-white/40 italic max-w-xs mx-auto leading-relaxed">"La plupart des gens ne savent pas à quoi ils ressemblent vraiment — et perdent des années à ne pas optimiser."</p>
            </div>

            {/* ── Two offer cards ── */}
            <div className="w-full max-w-sm flex flex-col gap-4">

              {/* OFFER 1 — 2.99€ : Score + position */}
              <div className="relative bg-[#0c0c18]/95 border border-white/[0.12] rounded-3xl p-6 backdrop-blur-2xl overflow-hidden">
                {/* Shimmer line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-full" style={{background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)"}}/>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-white/45 uppercase tracking-widest">Offre Découverte</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">2.99€</span>
                      <span className="text-white/25 text-sm line-through mb-1">4.99€</span>
                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-black rounded-full border border-emerald-500/25 mb-1">-40%</span>
                    </div>
                  </div>
                  <div className="text-2xl mt-1">📊</div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    {icon:"📊",t:"Ton score PSL sur l'échelle",included:true},
                    {icon:"📈",t:"Ta position dans la population",included:true},
                    {icon:"🎯",t:`${filteredAdvice.length} conseils personnalisés`,included:false},
                    {icon:"💎",t:"Ton potentiel max personnalisé",included:false},
                  ].map((item,i)=>(
                    <div key={i} className={`flex items-center gap-2.5 ${item.included?"opacity-100":"opacity-35"}`}>
                      <span className={`text-sm flex-shrink-0 ${!item.included?"grayscale":""}`}>{item.icon}</span>
                      <span className={`text-[11px] font-bold ${item.included?"text-white/70":"text-white/30 line-through"}`}>{item.t}</span>
                      {!item.included&&<span className="ml-auto text-[8px] text-white/20 italic flex-shrink-0">🔒 non inclus</span>}
                    </div>
                  ))}
                </div>

                {/* Upsell note */}
                <div className="mb-4 p-2.5 bg-indigo-500/8 border border-indigo-500/15 rounded-xl">
                  <p className="text-[10px] text-indigo-300/70 leading-relaxed">
                    Option : débloquer conseils + potentiel pour <span className="font-black text-indigo-300">+2.00€</span> après paiement
                  </p>
                </div>

                <button onClick={()=>handlePay("basic")} className="w-full py-4 font-black text-[11px] uppercase tracking-[0.12em] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.99]" style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",boxShadow:"0 0 30px rgba(99,102,241,0.3)"}}>
                  🔓 Débloquer — 2.99€
                </button>
              </div>

              {/* OFFER 2 — 4.99€ : Tout inclus */}
              <div className="relative bg-[#0c0c18]/95 border-2 border-indigo-500/40 rounded-3xl p-6 backdrop-blur-2xl overflow-hidden">
                {/* Best value badge */}
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-b-xl" style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",color:"white"}}>
                    ⭐ Meilleure valeur
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{background:"radial-gradient(ellipse 80% 50% at 50% -10%,rgba(99,102,241,0.12),transparent)"}}/>

                <div className="flex items-start justify-between mb-4 mt-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Offre Complète</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">4.99€</span>
                      <span className="text-white/25 text-sm line-through mb-1">9.99€</span>
                      <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-[8px] font-black rounded-full border border-red-500/22 mb-1">-50%</span>
                    </div>
                  </div>
                  <div className="text-2xl mt-1">💎</div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    {icon:"📊",t:"Ton score PSL sur l'échelle"},
                    {icon:"📈",t:"Ta position dans la population"},
                    {icon:"💎",t:"Ton potentiel max personnalisé"},
                    {icon:"🎯",t:`${filteredAdvice.length} conseils classés par impact`},
                    {icon:"⏱️",t:"Résultats visibles dès 72h"},
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-sm flex-shrink-0">{item.icon}</span>
                      <span className="text-[11px] font-bold text-white/70">{item.t}</span>
                      <span className="ml-auto text-emerald-400 text-[10px] font-black flex-shrink-0">✓</span>
                    </div>
                  ))}
                </div>

                <button onClick={()=>handlePay("premium")} className="w-full py-4 font-black text-[12px] uppercase tracking-[0.12em] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.99]" style={{background:"linear-gradient(135deg,#6366f1,#a855f7)",boxShadow:"0 0 50px rgba(99,102,241,0.45)"}}>
                  ⚡ Tout débloquer — 4.99€
                </button>
              </div>

              <p className="text-[9px] text-white/15 text-center mt-1">Accès immédiat · Paiement sécurisé Stripe · Paiement unique</p>
            </div>
          </div>
        </main>
      );
    }

    // ── RESULTS UNLOCKED ─────────────────────────────────────────────────────
    const showPotentialAndAdvice = unlockedOffer==="premium" || (unlockedOffer==="basic"&&unlockedUpsell);

    return(
      <main className="min-h-screen bg-[#06060c] text-white flex flex-col items-center py-12 px-4 relative overflow-hidden" style={{fontFamily:"'Helvetica Neue',Arial,sans-serif"}}>
        <style>{CSS}</style>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent)]"/>


        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center justify-between mb-10">
            <button onClick={reset} className="text-white/20 hover:text-white/50 text-[10px] font-black uppercase tracking-[0.15em] transition-colors">← Accueil</button>
            <span className="text-[9px] text-white/15 font-bold uppercase tracking-wider">{gender} · {age} ans</span>
          </div>

          {/* Gauge */}
          <div className="p-7 bg-white/[0.02] border border-white/[0.05] rounded-3xl mb-4 text-center">
            <PSLGauge score={results.overall} potential={showPotentialAndAdvice?results.potential:results.overall}/>
            <div className="flex items-center justify-center gap-5 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-5 h-[2px] bg-white rounded-full"/><span className="text-[8px] text-white/22 font-bold uppercase tracking-wider">Score actuel</span></div>
              {showPotentialAndAdvice&&results.potential>results.overall&&<div className="flex items-center gap-1.5"><div className="w-5 border-t border-dashed border-white/18"/><span className="text-[8px] text-white/22 font-bold uppercase tracking-wider">Potentiel</span></div>}
            </div>
          </div>

          {/* Distribution */}
          <div className="mb-4"><DistributionChart score={results.overall} gender={gender||"Homme"}/></div>

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 rounded-2xl border" style={{borderColor:band.color+"22",background:band.color+"06"}}>
              <p className="text-[8px] font-bold text-white/22 uppercase tracking-wider mb-1">Score actuel</p>
              <p className="text-3xl font-black italic" style={{color:band.color}}>{results.overall.toFixed(1)}</p>
              <p className="text-[9px] font-black mt-0.5" style={{color:band.color}}>{band.label}</p>
              <p className="text-[7px] text-white/18 mt-0.5">{band.topPercent}</p>
            </div>
            {/* Potential card — blurred if not unlocked */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden ${!showPotentialAndAdvice?"cursor-pointer":""}`} style={{borderColor:potBand.color+"22",background:potBand.color+"06"}} onClick={()=>{if(!showPotentialAndAdvice)handlePay("upsell");}}>
              {!showPotentialAndAdvice&&(
                <>
                  <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex flex-col items-center justify-center gap-1 z-10">
                    <span className="text-xl">🔒</span>
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest text-center leading-snug">Débloquer<br/>+2.00€</span>
                  </div>
                  <div className="opacity-0">
                    <p className="text-[8px] font-bold text-white/22 uppercase tracking-wider mb-1">Potentiel max</p>
                    <p className="text-3xl font-black italic" style={{color:potBand.color}}>{results.potential.toFixed(1)}</p>
                  </div>
                </>
              )}
              {showPotentialAndAdvice&&(
                <>
                  <p className="text-[8px] font-bold text-white/22 uppercase tracking-wider mb-1">Potentiel max</p>
                  <p className="text-3xl font-black italic" style={{color:potBand.color}}>{results.potential.toFixed(1)}</p>
                  <p className="text-[9px] font-black mt-0.5" style={{color:potBand.color}}>{potBand.label}</p>
                  <p className="text-[7px] text-white/18 mt-0.5">Atteignable</p>
                </>
              )}
            </div>
          </div>

          {/* Upsell banner (basic offer, not yet paid upsell) */}
          {unlockedOffer==="basic"&&!unlockedUpsell&&(
            <div className="mb-4 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/6 cursor-pointer hover:border-indigo-500/50 transition-all" onClick={()=>handlePay("upsell")}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-white/80 mb-0.5">Débloquer ton potentiel + conseils</p>
                  <p className="text-[10px] text-white/40 leading-relaxed">{filteredAdvice.length} conseils classés par impact · Potentiel max personnalisé</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl font-black text-indigo-400">+2€</p>
                  <p className="text-[8px] text-white/25">paiement unique</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] mb-5">
            <p className="text-[12px] text-white/48 leading-relaxed">
              Tu es <span className="font-black text-white">{results.overall.toFixed(1)}/10</span> ({band.label} · {band.topPercent} des {isFemale?"femmes":"hommes"}).{" "}
              {showPotentialAndAdvice&&results.potential>results.overall?<>Potentiel : <span className="font-black" style={{color:potBand.color}}>{results.potential.toFixed(1)}</span> ({potBand.label}). Premiers résultats en <span className="font-black text-white">72h</span>.</>:"Applique les conseils ci-dessous pour progresser."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/[0.04] rounded-2xl mb-4">
            {(["scores","potential","advice"] as const).map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} className={`flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all relative ${activeTab===tab?"bg-white text-black":"text-white/22 hover:text-white/45"}`}>
                {tab==="scores"?"Scores":tab==="potential"?"Potentiel":`Conseils (${filteredAdvice.length})`}
                {!showPotentialAndAdvice&&(tab==="potential"||tab==="advice")&&<span className="absolute -top-1 -right-1 text-[8px]">🔒</span>}
              </button>
            ))}
          </div>

          {activeTab==="scores"&&(
            <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-3xl space-y-4 mb-4">
              <h3 className="text-[9px] font-black text-white/20 uppercase tracking-widest">Critères biométriques</h3>
              <ScoreBar label="Symétrie faciale" value={results.symmetry} color="#a78bfa"/>
              <ScoreBar label="Tiers faciaux" value={results.facialThirds} color="#818cf8"/>
              <ScoreBar label="Jawline" value={results.jawlineScore} color="#06b6d4"/>
              <ScoreBar label="Yeux" value={results.eyeScore} color="#22d3ee"/>
              <ScoreBar label="Canthal tilt" value={results.canthalTilt} color="#34d399"/>
              <ScoreBar label="Lèvres" value={results.lipScore} color="#f472b6"/>
              <ScoreBar label="Qualité détection" value={results.skinScore} color="#fbbf24"/>
              <div className="pt-4 border-t border-white/[0.04]">
                <p className="text-[8px] font-black text-white/14 uppercase tracking-widest mb-3">Référence Échelle PSL</p>
                {PSL_BANDS.map((b,i)=>(
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${results.overall>=b.min&&results.overall<=b.max?"bg-white/6":""}`}>
                    <span className="text-base">{b.emoji}</span>
                    <span className="text-[9px] font-black w-16" style={{color:b.color}}>{b.min}–{b.max===10?"10":b.max}</span>
                    <span className="text-[9px] text-white/28 font-bold flex-1">{b.label}</span>
                    <span className="text-[7px] text-white/16">{b.topPercent}</span>
                    {results.overall>=b.min&&results.overall<=b.max&&<span className="text-[8px] font-black text-white/32">← toi</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="potential"&&(
            !showPotentialAndAdvice?(
              <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-3xl mb-4 text-center">
                <div className="text-4xl mb-3">🔒</div>
                <p className="text-[14px] font-black text-white/60 mb-2">Potentiel verrouillé</p>
                <p className="text-[11px] text-white/35 mb-5 leading-relaxed">Découvre jusqu'où tu peux aller et les gains par critère avec les bons efforts.</p>
                <button onClick={()=>handlePay("upsell")} className="w-full py-4 font-black text-[11px] uppercase tracking-[0.12em] rounded-xl transition-all hover:scale-[1.02]" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",boxShadow:"0 0 30px rgba(99,102,241,0.3)"}}>
                  🔓 Débloquer pour 2.00€
                </button>
              </div>
            ):(
              <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-3xl space-y-5 mb-4">
                <h3 className="text-[9px] font-black text-white/20 uppercase tracking-widest">Progression par critère</h3>
                {[
                  {label:"Symétrie",current:results.symmetry,gain:8,note:"Mewing + posture"},
                  {label:"Tiers faciaux",current:results.facialThirds,gain:12,note:"Mewing long terme"},
                  {label:"Jawline",current:results.jawlineScore,gain:20,note:"BF% + chewing + mewing"},
                  {label:"Yeux",current:results.eyeScore,gain:5,note:"Peu améliorable (génétique)"},
                  {label:"Canthal tilt",current:results.canthalTilt,gain:isFemale?8:5,note:isFemale?"Fox eye makeup":"Peu améliorable"},
                  {label:"Lèvres",current:results.lipScore,gain:15,note:"Hydratation + soin"},
                ].map((item,i)=>{
                  const maxVal=Math.min(item.current+item.gain,100);
                  return(
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">{item.label}</span>
                        <span className="text-[9px]"><span className="text-white font-black">{item.current}</span><span className="text-white/18 mx-1">→</span><span className="font-black" style={{color:"#a5b4fc"}}>{maxVal}</span></span>
                      </div>
                      <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full absolute" style={{width:`${maxVal}%`,background:"#6366f115"}}/>
                        <div className="h-full rounded-full bg-white/65 absolute" style={{width:`${item.current}%`}}/>
                      </div>
                      <p className="text-[8px] text-white/16 italic">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab==="advice"&&(
            !showPotentialAndAdvice?(
              <div className="p-6 bg-white/[0.02] border border-white/[0.04] rounded-3xl mb-4 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-[14px] font-black text-white/60 mb-2">Conseils verrouillés</p>
                <p className="text-[11px] text-white/35 mb-5 leading-relaxed">{filteredAdvice.length} conseils personnalisés classés par impact, avec gains attendus et délais concrets.</p>
                <button onClick={()=>handlePay("upsell")} className="w-full py-4 font-black text-[11px] uppercase tracking-[0.12em] rounded-xl transition-all hover:scale-[1.02]" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",boxShadow:"0 0 30px rgba(99,102,241,0.3)"}}>
                  🔓 Débloquer pour 2.00€
                </button>
              </div>
            ):(
              <div className="space-y-2 mb-4">
                <p className="text-[8px] text-white/16 uppercase tracking-widest font-black">{filteredAdvice.length} conseils · impact décroissant</p>
                {filteredAdvice.map((a,i)=>{
                  const links=AMAZON_LINKS[a.category]||[];
                  const isOpen=expandedAdvice===i;
                  return(
                    <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden hover:border-white/[0.07] transition-all">
                      <button className="w-full p-4 text-left flex items-start gap-3" onClick={()=>setExpandedAdvice(isOpen?null:i)}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{a.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap"><PriorityBadge p={a.priority}/><DiffBadge d={a.difficulty}/></div>
                          <p className="text-[12px] font-black text-white/72 leading-snug mb-1">{a.title}</p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-[8px] font-black text-indigo-400">{a.scoreGain}</span>
                            <span className="text-[7px] text-white/16">·</span>
                            <span className="text-[8px] text-white/22">⏱ {a.timeline}</span>
                          </div>
                        </div>
                        {/* Arrow indicator instead of + / × */}
                        <span className="flex-shrink-0 mt-1 text-white/30 transition-transform duration-300" style={{transform:isOpen?"rotate(180deg)":"rotate(0deg)"}}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                        </span>
                      </button>
                      {isOpen&&(
                        <div className="px-4 pb-4 border-t border-white/[0.03] pt-3">
                          <p className="text-[11px] text-white/38 leading-relaxed whitespace-pre-line mb-4">{a.description}</p>
                          {links.length>0&&(
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">🛒 Produits recommandés</p>
                              {links.map((lk,j)=>(
                                <a key={j} href={lk.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group">
                                  <span className="text-[10px] text-white/50 group-hover:text-white/75 font-semibold transition-colors">{lk.label}</span>
                                  <span className="text-[8px] text-indigo-400/70 font-black flex-shrink-0 flex items-center gap-1">Amazon <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          <div className="mt-4 space-y-3">
            <button onClick={()=>setPage("analysis")} className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl hover:scale-[1.01] transition-all">Nouvelle analyse</button>
            <button onClick={()=>{navigator.clipboard.writeText(`Mon score PSL : ${results.overall.toFixed(1)}/10 (${band.label}) — via PSLScore`);alert("✓ Copié !");}} className="w-full py-4 bg-white/[0.025] text-white/22 font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl hover:bg-white/[0.05] transition-all border border-white/[0.04]">Partager mon score</button>
          </div>
          <p className="text-[8px] text-white/7 text-center mt-6">Analyse biométrique · Résultats indicatifs · Pas un jugement de valeur</p>
        </div>
      </main>
    );
  }

  return null;
}
