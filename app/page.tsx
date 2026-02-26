"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// On déclare la variable faceapi ici pour qu'elle soit accessible partout
let faceapi: any;

type AppPage = "landing" | "form" | "analysis" | "results";

interface LookmaxScore {
  symmetry: number; facialThirds: number; jawlineScore: number;
  eyeScore: number; lipScore: number; skinScore: number;
  canthalTilt: number; overall: number; potential: number;
  landmarks?: any[];
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
  {icon:"🧠", title:"L'Effet de Halo", sub:"Psychologie prouvée", color:"#6366f1", text:"Les personnes attractives sont jugées plus intelligentes et fiables (Thorndike, 1920)."},
  {icon:"💼", title:"+12% de salaire", sub:"Étude économétrique", color:"#22c55e", text:"Les personnes attractives gagnent 12% de plus sur toute leur carrière."},
  {icon:"💕", title:"Rencontres", sub:"Filtre n°1", color:"#ec4899", text:"L'attractivité est le prédicteur n°1 de l'intérêt initial."},
  {icon:"📊", title:"Échelle PSL", sub:"Basée sur la science", color:"#06b6d4", text:"Calibrée sur 68 landmarks biométriques."},
];

// ─── ADVICE ENGINE ────────────────────────────────────────────────────────────
function generateAdvice(scores:LookmaxScore, gender:string, age:number):Advice[] {
  const isFemale = gender==="Femme"; const all:Advice[]=[];
  if(scores.jawlineScore<70){
    all.push({priority:1,category:"Corps",icon:"⚡",title:"Perdre du gras facial", description:"Le visage perd ses graisses en premier lors d'un déficit.", scoreGain:"+0.8 à +2.0 pts",timeline:"4–8 semaines",difficulty:"Difficile"});
    all.push({priority:1,category:"Hydratation",icon:"💧",title:"Éliminer la rétention d'eau", description:"Réduire le sodium et boire 2.5L d'eau par jour.", scoreGain:"+0.3 à +0.8 pt",timeline:"72h",difficulty:"Facile"});
  }
  all.push({priority:1,category:"Posture",icon:"🦴",title:"Corriger la posture", description:"La forward head posture détruit la mâchoire.", scoreGain:"+0.5 à +1.2 pts",timeline:"Immédiat",difficulty:"Facile"});
  return all.sort((a,b)=>a.priority-b.priority);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function dist(a:any,b:any){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);}
function clamp(v:number,min=0,max=100){return Math.min(max,Math.max(min,v));}
function toScore(ratio:number,ideal:number,tol:number){return clamp(100-(Math.abs(ratio-ideal)/tol)*100);}

async function analyzeFace(img:HTMLImageElement,gender:string,age:number):Promise<LookmaxScore>{
  const det=await faceapi.detectSingleFace(img,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
  if(!det)throw new Error("Aucun visage détecté.");
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
function LandmarkOverlay({imageUrl,landmarks,progress}:{imageUrl:string;landmarks:any[]|null;progress:number}){
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
      ctx.fillStyle="rgba(165,180,252,1)";
      pts.forEach((pt:any)=>{const r=Math.max(1.5,img.width/260);ctx.beginPath();ctx.arc(pt.x,pt.y,r,0,Math.PI*2);ctx.fill();});
    };
  },[imageUrl,landmarks,progress]);
  return <canvas ref={canvasRef} className="w-full h-full object-cover absolute inset-0"/>;
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function PSLGauge({score,potential}:{score:number;potential:number}){
  const band=getBand(score);
  const angle=((score-1.0)/9.0)*180-90;
  return(
    <svg viewBox="0 0 240 145" className="w-full max-w-[300px] mx-auto">
      <path d="M 30 115 A 90 90 0 0 1 210 115" fill="none" stroke="#ffffff05" strokeWidth="16" strokeLinecap="round"/>
      <g transform={`rotate(${angle},120,115)`}><line x1="120" y1="115" x2="120" y2="24" stroke="white" strokeWidth="3.5" strokeLinecap="round"/></g>
      <circle cx="120" cy="115" r="9" fill="white"/>
      <text x="120" y="97" textAnchor="middle" fill="white" fontSize="34" fontWeight="900">{score.toFixed(1)}</text>
      <text x="120" y="112" textAnchor="middle" fill={band.color} fontSize="8.5" fontWeight="700">{band.label.toUpperCase()}</text>
    </svg>
  );
}

function ScoreBar({label,value,color="#06b6d4"}:{label:string;value:number;color?:string}){
  return(
    <div className="space-y-1.5">
      <div className="flex justify-between"><span className="text-[11px] font-bold text-white/40 uppercase">{label}</span><span className="text-[11px] font-black" style={{color}}>{value}/100</span></div>
      <div className="h-[3px] bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${value}%`,background:color}}/></div>
    </div>
  );
}

const CSS=`@keyframes scanline{0%{top:-4px}100%{top:calc(100% + 4px)}} .scanline{position:absolute;left:0;right:0;height:2px;background:white;animation:scanline 1.8s ease-in-out infinite;}`;

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
  const [progress,setProgress]=useState(0);
  const [results,setResults]=useState<LookmaxScore|null>(null);
  const [interimLandmarks,setInterimLandmarks]=useState<any[]|null>(null);
  const [error,setError]=useState<string|null>(null);

  // CHARGEMENT DYNAMIQUE DES MODÈLES
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded || loadingModels) return;
      setLoadingModels(true);
      try {
        faceapi = await import("@vladmandic/face-api");
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) { console.error(err); } finally { setLoadingModels(false); }
    };
    loadModels();
  }, [modelsLoaded, loadingModels]);

  const handleImage=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file)return;
    const url=URL.createObjectURL(file); setImageUrl(url);
    const img=new Image(); img.src=url; img.onload=()=>setImageEl(img);
  };

  const runAnalysis=useCallback(async()=>{
    if(!imageEl||!modelsLoaded||!gender||!age)return;
    setAnalyzing(true); setProgress(0);
    try {
      const score=await analyzeFace(imageEl,gender,age);
      setResults(score); setPage("results");
    } catch(err:any){setError(err.message);} finally{setAnalyzing(false);}
  },[imageEl,modelsLoaded,gender,age]);

  if(page==="landing") return <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center"><h1 className="text-6xl font-black mb-8">PSL Score</h1><button onClick={()=>setPage("form")} className="px-8 py-4 bg-white text-black font-bold rounded-full">Analyser mon visage</button></main>;

  if(page==="form") return <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
    <div className="space-y-6 w-full max-w-sm">
      <h2 className="text-4xl font-bold">Profil</h2>
      <div className="grid grid-cols-2 gap-4">
        {["Femme","Homme"].map(g=><button key={g} onClick={()=>setGender(g)} className={`p-4 rounded-xl border ${gender===g?"bg-white text-black":"border-white/20"}`}>{g}</button>)}
      </div>
      <input type="number" placeholder="Âge" onChange={e=>setAge(parseInt(e.target.value))} className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-center text-xl"/>
      <button onClick={()=>setPage("analysis")} className="w-full p-4 bg-white text-black font-bold rounded-xl">Continuer</button>
    </div>
  </main>;

  if(page==="analysis") return <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
    <style>{CSS}</style>
    <div className="w-full max-w-sm text-center">
      <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 mb-8">
        {imageUrl && <img src={imageUrl} className="w-full h-full object-cover"/>}
        {analyzing && <div className="scanline"/>}
        {!imageUrl && <label className="absolute inset-0 flex items-center justify-center cursor-pointer"><span>Choisir une photo</span><input type="file" className="hidden" onChange={handleImage}/></label>}
      </div>
      <button onClick={runAnalysis} className="w-full p-4 bg-white text-black font-bold rounded-xl">Lancer l'analyse</button>
    </div>
  </main>;

  if(page==="results" && results) return <main className="min-h-screen bg-black text-white p-8">
    <div className="max-w-sm mx-auto space-y-8">
      <PSLGauge score={results.overall} potential={results.potential}/>
      <div className="space-y-4">
        <ScoreBar label="Symétrie" value={results.symmetry}/>
        <ScoreBar label="Jawline" value={results.jawlineScore}/>
        <ScoreBar label="Yeux" value={results.eyeScore}/>
      </div>
      <button onClick={()=>setPage("landing")} className="w-full p-4 border border-white/20 rounded-xl">Recommencer</button>
    </div>
  </main>;

  return null;
}
