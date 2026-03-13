"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Download, Clock, Check,
  ChevronDown, ChevronUp, Home, Dumbbell,
  RefreshCw, Target, BookOpen, Layers, Package,
  Thermometer, Wind, Star, AlertCircle
} from "lucide-react";

// ═══════════════════════════════════════════════════════
// TYPES & DATA (inlined from programs.ts)
// ═══════════════════════════════════════════════════════

interface ProgressionStep {
  label: string;
  emoji: string;
  hold?: string;
  active?: boolean;
}

interface Exercise {
  title: string;
  sets: string;
  reps: string;
  rest: string;
  cues: string[];
  proTip: string;
  progression?: ProgressionStep[];
  intensity: string;
}

interface Phase {
  name: string;
  tag: string;
  duration: string;
  icon: string;
  description: string;
  exercises: Exercise[];
}

interface WarmupExercise {
  name: string;
  duration: string;
  notes: string;
}

interface CooldownExercise {
  name: string;
  duration: string;
  notes: string;
}

interface Program {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  level: string;
  levelColor: string;
  category: "skill" | "hybrid" | "hypertrophy" | "bundle";
  categoryGroup: "STRENGTH & SKILLS" | "HYBRID" | "HYPERTROPHY" | "BUNDLE";
  price: string;
  originalPrice?: string;
  icon: string;
  glowColor: string;
  badge?: string;
  dualTrack?: boolean;
  trackLabels?: [string, string];
  goals: string[];
  mindset: string;
  weekStructure: string;
  warmup: WarmupExercise[];
  phases: Phase[];
  gymPhases?: Phase[];
  cooldown: CooldownExercise[];
  benefits: string[];
  bundlePrograms?: Program[];
  stripeUrl?: string;
}

// ─── SHARED DATA ──────────────────────────────────────────────────────────────

const sharedWarmup: WarmupExercise[] = [
  { name: "Wrist Circles & Flexor Stretch", duration: "2 min", notes: "Both directions, 10 reps each way. Critical for planche longevity." },
  { name: "Shoulder CARs (Controlled Articular Rotations)", duration: "90s each side", notes: "Slow, full-range motion. Feel every degree of the joint." },
  { name: "Dead Hang + Scapular Pulls", duration: "3×20s", notes: "Engage lats, then actively depress and retract scapulas." },
  { name: "Pike Compression Hold", duration: "3×15s", notes: "Seated, push legs down with straight arms. Activate hip flexors." },
  { name: "Planche Lean Warm-up (30% effort)", duration: "3×5s", notes: "Just activate the pattern — do NOT push hard here." },
];

const sharedCooldown: CooldownExercise[] = [
  { name: "Wrist Extensor Stretch", duration: "2 min", notes: "Knuckles on floor, gently lean back. Hold 30s, release, repeat." },
  { name: "Doorframe Chest Opener", duration: "90s", notes: "Arms at 90°. Gently press chest forward. Breathe into the stretch." },
  { name: "Child's Pose with Lat Stretch", duration: "2 min", notes: "Walk hands to each side. Full spinal decompression." },
  { name: "Supine Shoulder External Rotation", duration: "2 min each", notes: "Lying down, arm at 90°. Slowly lower forearm toward floor." },
  { name: "Diaphragmatic Breathing", duration: "3 min", notes: "4s inhale, 4s hold, 6s exhale. Activates parasympathetic recovery." },
];

const leverCooldown: CooldownExercise[] = [
  { name: "Thoracic Spine Foam Roll", duration: "3 min", notes: "Roll from T1 to T12 slowly. Pause on tender spots for 20s." },
  { name: "Lat Hang Stretch", duration: "2×30s", notes: "Hang from bar, slightly tuck one shoulder to feel the lat decompressing." },
  { name: "Bicep & Forearm Wall Stretch", duration: "90s each", notes: "Palm on wall, fingers pointing down. Gently turn away." },
  { name: "Prone Back Extension (Cobra)", duration: "2 min", notes: "Elbows under shoulders. Let the spine passively extend. No forcing." },
  { name: "Deep Breathing + Mental Debrief", duration: "3 min", notes: "Visualize your best rep. Reinforce the motor pattern while calm." },
];

// ─── PLANCHE FOUNDATION ───────────────────────────────────────────────────────

const plancheFoundation: Program = {
  id: "planche-foundation",
  title: "Planche Foundation",
  subtitle: "From Zero to Tuck Planche",
  tagline: "The first 8 weeks that will define your calisthenics career.",
  level: "Beginner",
  levelColor: "#22c55e",
  category: "skill",
  categoryGroup: "STRENGTH & SKILLS",
  price: "27",
  icon: "🤸",
  glowColor: "rgba(34,197,94,0.12)",
  goals: [
    "Develop bulletproof scapular depression & protraction",
    "Build shoulder blade control from scratch",
    "Achieve a clean 5-second tuck planche hold",
    "Lay the structural foundation for advanced planche variants",
  ],
  mindset: "The planche is not built in a session — it is carved over months. In these first 8 weeks, your only job is to own every rep, own every second, and build connective tissue strength that will protect you for years. Ego has no place here. Perfect technique over everything.",
  weekStructure: "3 sessions/week (Mon · Wed · Fri). Each session: 60–75 min. Rest days are training days for your nervous system — sleep, eat, recover.",
  warmup: [
    { name: "Wrist Circles & Flexion/Extension", duration: "2 min", notes: "30 reps each direction. This is non-negotiable. Wrists take the most stress." },
    { name: "Scapular Elevation & Depression", duration: "3×12", notes: "Hanging from bar. Feel the full range — do not shortcut." },
    { name: "Hollow Body Hold", duration: "3×20s", notes: "Lower back pressed to floor. This is the planche body position." },
    { name: "Straight-Arm Plank", duration: "3×20s", notes: "Push floor away aggressively. Protract those scapulas." },
    { name: "Cat-Cow with Protraction Focus", duration: "90s", notes: "On all fours. On 'round', maximize the upper back push." },
  ],
  phases: [
    {
      name: "Phase 1 — Structural Foundation",
      tag: "Weeks 1–3",
      duration: "3 weeks",
      icon: "🏗️",
      description: "Build the connective tissue and neuromuscular patterns. Do not rush. These weeks are the difference between long-term progress and injury.",
      exercises: [
        {
          title: "Scapular Push-Ups",
          sets: "4",
          reps: "12 reps",
          rest: "60s",
          intensity: "Controlled",
          cues: [
            "Start in straight-arm plank",
            "Let chest drop by pinching scapulas (don't bend elbows)",
            "Push floor away to 'round' and protract scapulas",
            "Top position: feel your upper back pushing to the ceiling",
          ],
          proTip: "Record from the side. You should see your upper back rising noticeably in the protracted position. If not, you're not protracting enough.",
          progression: [
            { label: "Knees", emoji: "🦵", active: false },
            { label: "Standard", emoji: "📐", active: true },
            { label: "Elevated Feet", emoji: "⬆️", active: false },
            { label: "Weighted", emoji: "🏋️", active: false },
          ],
        },
        {
          title: "Planche Lean (Rings or Parallettes)",
          sets: "5",
          reps: "5×3s hold",
          rest: "90s",
          intensity: "Technical",
          cues: [
            "Shoulders must be anterior to wrists — this is mandatory",
            "Posterior pelvic tilt (tuck your tailbone)",
            "Arms stay locked at 0° — any bend means less lean",
            "Gaze: floor 10 inches in front",
          ],
          proTip: "The lean angle is everything. Use a mirror or camera. Your shoulders should be 10–15cm in front of your hands by Week 3.",
          progression: [
            { label: "Slight Lean", emoji: "📏", active: true },
            { label: "45° Lean", emoji: "📐", active: false },
            { label: "Full Lean", emoji: "⚡", active: false },
          ],
        },
        {
          title: "Pseudo Planche Push-Ups",
          sets: "4",
          reps: "8 reps",
          rest: "90s",
          intensity: "Moderate",
          cues: [
            "Hands turned out 45° or more",
            "Weight forward over hands — shoulders above wrists",
            "Lower chest to floor slowly (3-second negative)",
            "Push back up while maintaining forward lean",
          ],
          proTip: "The further you rotate hands and lean forward, the harder this becomes. Start conservative. Quality reps only.",
        },
      ],
    },
    {
      name: "Phase 2 — Tuck Compression",
      tag: "Weeks 4–6",
      duration: "3 weeks",
      icon: "🔧",
      description: "Now we introduce the actual tuck position. Hip flexor strength and compression are the limiting factors for most athletes at this stage.",
      exercises: [
        {
          title: "Tuck L-Sit Progression",
          sets: "5",
          reps: "5×4s hold",
          rest: "90s",
          intensity: "Max Effort",
          cues: [
            "On parallettes or floor (parallel bars preferred)",
            "Pull knees as close to chest as possible",
            "Push down hard — think 'anti-gravity'",
            "Keep arms straight and locked — no bending",
          ],
          proTip: "This is 80% hip flexor strength. If you struggle, add 3 sets of 12 lying leg raises to your accessory work daily.",
          progression: [
            { label: "Foot-Assisted", emoji: "👣", active: false },
            { label: "Tuck L-Sit", emoji: "🧘", active: true },
            { label: "Half-Lay", emoji: "📐", active: false },
            { label: "L-Sit", emoji: "🎯", active: false },
          ],
        },
        {
          title: "Tuck Planche Hold",
          sets: "6",
          reps: "6×3–5s",
          rest: "2 min",
          intensity: "Maximum",
          cues: [
            "From tuck L-sit, lean forward until feet lift",
            "Hips parallel to floor — do not let them sag",
            "Maximize scapular protraction throughout",
            "Every second counts — this is CNS-intensive",
          ],
          proTip: "Film every session from the side. You want hips level with shoulders. The moment hips drop, the hold ends — don't count dropped reps.",
          progression: [
            { label: "Assisted", emoji: "🤝", active: false },
            { label: "Tuck Planche", emoji: "🤸", active: true },
            { label: "Adv. Tuck", emoji: "⚡", active: false },
            { label: "Straddle", emoji: "🌟", active: false },
          ],
        },
        {
          title: "Tuck Planche Push-Ups",
          sets: "4",
          reps: "4×2–3 reps",
          rest: "2 min",
          intensity: "High",
          cues: [
            "Start in tuck planche hold",
            "Lower body 5cm while maintaining lean and tuck",
            "Press back to start — every rep is a victory",
            "Zero tolerance for hip sag",
          ],
          proTip: "Even 1 clean rep is better than 5 ugly ones. This exercise builds the specific strength no other movement can replicate.",
        },
      ],
    },
    {
      name: "Phase 3 — Integration & Testing",
      tag: "Weeks 7–8",
      duration: "2 weeks",
      icon: "🚀",
      description: "Peak your strength and test your tuck planche max hold. This week is about expression of what you've built, not adding new stimulus.",
      exercises: [
        {
          title: "Max Tuck Planche Hold Test",
          sets: "3",
          reps: "Max hold (target: 5+ sec)",
          rest: "3 min",
          intensity: "Max Effort",
          cues: [
            "Full warm-up completed",
            "Film every attempt",
            "Rest fully between attempts — this is a strength test",
            "Celebrate progress: even 3s is elite for 8 weeks",
          ],
          proTip: "Comparing Week 1 to Week 8 is the most motivating thing you'll ever see. Save both videos side by side.",
        },
        {
          title: "Planche Lean Endurance",
          sets: "5",
          reps: "5×8s",
          rest: "90s",
          intensity: "High Volume",
          cues: [
            "Max lean angle you can maintain",
            "Focus on holding the protraction throughout",
            "Breathe — don't hold your breath",
          ],
          proTip: "Building endurance in the lean builds the tendon and joint resilience that protects you as you progress to harder variants.",
        },
      ],
    },
  ],
  cooldown: sharedCooldown,
  benefits: [
    "5-second tuck planche hold by Week 8",
    "Bulletproof wrist & shoulder preparation",
    "Correct motor patterns for all future planche work",
  ],
  stripeUrl: "https://buy.stripe.com/5kQeVf0Ix3Yd0EPgZT3ZK06",
};

const plancheElite: Program = {
  id: "planche-elite",
  title: "Planche Elite",
  subtitle: "From Straddle to Full Planche",
  tagline: "The advanced protocol that separates athletes from artists.",
  level: "Intermediate / Advanced",
  levelColor: "#f97316",
  category: "skill",
  categoryGroup: "STRENGTH & SKILLS",
  price: "39",
  icon: "⚡",
  glowColor: "rgba(249,115,22,0.15)",
  goals: [
    "Achieve a clean 3-second straddle planche hold",
    "Build the strength base for full planche attempts",
    "Master the advanced tuck → straddle transition",
    "Develop ring planche stability for elite carryover",
  ],
  mindset: "You are no longer a beginner. This is where true separation happens. The athletes who reach this stage and fail are those who let ego push volume before quality. Your job is to be precise, patient, and relentless. The full planche is not a trick — it's a year or more of perfect training distilled into one moment.",
  weekStructure: "4 sessions/week (Mon · Tue · Thu · Fri). Tue/Fri are accessory & volume days. Mon/Thu are max effort skill days.",
  warmup: sharedWarmup,
  phases: [
    {
      name: "Phase 1 — Advanced Tuck Mastery",
      tag: "Weeks 1–3",
      duration: "3 weeks",
      icon: "🔩",
      description: "The advanced tuck (hips extended, legs parallel) is the true gateway to straddle. Own it for 8+ seconds before moving on.",
      exercises: [
        {
          title: "Advanced Tuck Planche Hold",
          sets: "6",
          reps: "6×6–8s",
          rest: "2.5 min",
          intensity: "Maximum",
          cues: [
            "Hips fully extended — thighs parallel to floor",
            "Knees tucked but hips 180° open",
            "Lean is aggressive — wrists are heavily loaded",
            "Squeeze glutes to maintain hip position",
          ],
          proTip: "The difference between tuck and advanced tuck is about 2–3× the difficulty. Do not rush. Film from the side every session to measure hip extension.",
          progression: [
            { label: "Tuck", emoji: "🤸", active: false },
            { label: "Adv. Tuck", emoji: "⚡", active: true },
            { label: "Straddle", emoji: "🌟", active: false },
            { label: "Full", emoji: "👑", active: false },
          ],
        },
        {
          title: "Straddle Planche Negatives",
          sets: "5",
          reps: "5×4s negative",
          rest: "3 min",
          intensity: "High Eccentric",
          cues: [
            "Start in straddle planche (use bands or partner if needed)",
            "Lower hips down over 4 full seconds",
            "Fight gravity every millimeter",
            "Use bands to assist the concentric only",
          ],
          proTip: "Eccentric strength is your fastest path to concentric planche. The negative builds 3× more specific strength than the hold.",
        },
      ],
    },
    {
      name: "Phase 2 — Straddle Development",
      tag: "Weeks 4–7",
      duration: "4 weeks",
      icon: "🌟",
      description: "The straddle planche is 60-70% of the full planche in terms of difficulty. Own it before even attempting full.",
      exercises: [
        {
          title: "Straddle Planche Hold",
          sets: "5",
          reps: "5×3–5s",
          rest: "3 min",
          intensity: "Maximum",
          cues: [
            "Legs spread to maximum width — the wider, the easier",
            "Point toes. Squeeze entire lower body",
            "Shoulder blades in maximum protraction",
            "Breathe shallow — don't let the exhale collapse your position",
          ],
          proTip: "Using parallettes vs floor changes the difficulty significantly. Start on parallettes (more wrist clearance). Graduate to floor.",
          progression: [
            { label: "Wide Straddle", emoji: "↔️", active: true },
            { label: "Mid Straddle", emoji: "📐", active: false },
            { label: "Narrow Straddle", emoji: "⚡", active: false },
            { label: "Full Planche", emoji: "👑", active: false },
          ],
        },
        {
          title: "Straddle Planche Push-Ups",
          sets: "4",
          reps: "4×2–4 reps",
          rest: "3 min",
          intensity: "Elite",
          cues: [
            "One of the hardest exercises in calisthenics",
            "Maintain straddle throughout the movement",
            "Lower only 3–5cm — range of motion is minimal at this level",
            "Even 1 rep is meaningful progress",
          ],
          proTip: "Most athletes at this level manage 1–2 partial reps. That is perfectly normal. Do not compare your training to highlight reels.",
        },
      ],
    },
    {
      name: "Phase 3 — Full Planche Approach",
      tag: "Weeks 8–10",
      duration: "3 weeks",
      icon: "👑",
      description: "First true full planche attempts. Use band assistance to feel the position. Your goal is 1 unassisted second.",
      exercises: [
        {
          title: "Banded Full Planche Hold",
          sets: "5",
          reps: "5×5s",
          rest: "3 min",
          intensity: "Maximum",
          cues: [
            "Band around hips provides just enough assistance",
            "Legs together and fully extended — perfect alignment",
            "This is a full-body isometric contraction",
            "Record every attempt. Progress is measured in millimeters.",
          ],
          proTip: "Reduce band thickness every 2 weeks as you get stronger. The goal is 3 bands → 2 bands → 1 band → free.",
          progression: [
            { label: "3 Bands", emoji: "🟢", active: true },
            { label: "2 Bands", emoji: "🟡", active: false },
            { label: "1 Band", emoji: "🟠", active: false },
            { label: "Free", emoji: "👑", active: false },
          ],
        },
      ],
    },
  ],
  cooldown: sharedCooldown,
  benefits: [
    "Straddle planche in 10 weeks",
    "Ring planche stability",
    "Full planche approach within 6 months",
  ],
  stripeUrl: "https://buy.stripe.com/eVq9AVdvjamB73dcJD3ZK07",
};

const frontLeverMastery: Program = {
  id: "front-lever",
  title: "Front Lever Mastery",
  subtitle: "Complete Guide to Full Front Lever",
  tagline: "Build the posterior chain of a gymnast.",
  level: "All Levels",
  levelColor: "#3b82f6",
  category: "skill",
  categoryGroup: "STRENGTH & SKILLS",
  price: "29",
  icon: "🎯",
  glowColor: "rgba(59,130,246,0.15)",
  goals: [
    "Achieve a clean 5-second full front lever hold",
    "Build elite-level lat and posterior chain strength",
    "Master the tuck → straddle → full progression",
    "Develop pulling strength applicable to muscle-ups and rows",
  ],
  mindset: "The front lever is the ultimate test of pulling strength and body tension. Unlike the planche, it is achievable for most dedicated athletes within 3–6 months. The key is total body tension — it is not a lat exercise, it's a full-body isometric. Every muscle from your feet to your hands must be engaged simultaneously.",
  weekStructure: "3 sessions/week (Mon · Wed · Sat). Can be combined with pull day in any program. Front lever work always comes FIRST in the session when fresh.",
  warmup: [
    { name: "Band Pull-Aparts", duration: "3×20", notes: "Light band. Targets rear delts and external rotators. Critical for lever shoulder health." },
    { name: "Scapular Pull-Ups", duration: "3×10", notes: "Dead hang. Without bending arms, depress and retract scapulas. Pause 1s at top." },
    { name: "Hollow Body Hold", duration: "3×25s", notes: "This IS the front lever body position. Master it here first." },
    { name: "German Hang (gentle)", duration: "2×20s", notes: "Only if experienced. Opens the shoulder joint for lever positions." },
    { name: "Inverted Hang", duration: "3×15s", notes: "Pull up and hold horizontal. Feel the lat engagement." },
  ],
  phases: [
    {
      name: "Phase 1 — Tuck Front Lever",
      tag: "Weeks 1–4",
      duration: "4 weeks",
      icon: "🌱",
      description: "The foundation. If you cannot hold a tuck front lever for 10 seconds, nothing else matters yet.",
      exercises: [
        {
          title: "Tuck Front Lever Hold",
          sets: "6",
          reps: "6×8–10s",
          rest: "90s",
          intensity: "High",
          cues: [
            "Knees to chest, back perfectly flat — no rounding",
            "Arms straight — the moment you bend, it's not a lever",
            "Depress AND retract scapulas simultaneously",
            "Hips at bar height — not below",
          ],
          proTip: "Back flatness is the single most important cue. A rounded back is a compensated lever, not a real one. Film from the side.",
          progression: [
            { label: "Tuck", emoji: "🧘", active: true },
            { label: "Adv. Tuck", emoji: "📐", active: false },
            { label: "Straddle", emoji: "↔️", active: false },
            { label: "Full Lever", emoji: "🎯", active: false },
          ],
        },
        {
          title: "Front Lever Rows (Tuck)",
          sets: "4",
          reps: "6 reps",
          rest: "2 min",
          intensity: "Strength",
          cues: [
            "Start in tuck front lever hang",
            "Pull bar to chest — maintain tuck throughout",
            "Slow negative (3 seconds down)",
            "This is the most strength-building exercise in this program",
          ],
          proTip: "If you can do 5+ clean reps, you are ready to progress the lever position. These rows are a stronger signal of readiness than hold time alone.",
        },
      ],
    },
    {
      name: "Phase 2 — Advanced Tuck & Straddle",
      tag: "Weeks 5–8",
      duration: "4 weeks",
      icon: "⬆️",
      description: "Extending the hips changes the lever mechanics dramatically. Take the time you need here — most athletes spend 4–6 weeks.",
      exercises: [
        {
          title: "Advanced Tuck Front Lever",
          sets: "5",
          reps: "5×6–8s",
          rest: "2 min",
          intensity: "High",
          cues: [
            "Hips extended to 180° — thighs parallel to floor",
            "Knees still bent but body nearly horizontal",
            "Core engaged like a plank — not just the lats",
            "Posterior pelvic tilt to prevent hip drop",
          ],
          proTip: "Every 2 weeks, try straightening one leg while the other stays tucked (uneven lever). This bridges the gap to straddle effectively.",
          progression: [
            { label: "Tuck", emoji: "🧘", active: false },
            { label: "Adv. Tuck", emoji: "📐", active: true },
            { label: "1-Leg", emoji: "🦵", active: false },
            { label: "Straddle", emoji: "↔️", active: false },
          ],
        },
        {
          title: "Straddle Front Lever Hold",
          sets: "5",
          reps: "5×4–6s",
          rest: "2.5 min",
          intensity: "Maximum",
          cues: [
            "Wide leg split — wider is significantly easier",
            "Squeeze glutes and point toes",
            "Fight the pull of gravity with your entire posterior chain",
            "Eyes looking at ceiling — helps maintain horizontal position",
          ],
          proTip: "The straddle front lever is approximately 75% of the difficulty of the full lever. Own 8+ seconds here before attempting full.",
        },
      ],
    },
    {
      name: "Phase 3 — Full Front Lever",
      tag: "Weeks 9–12",
      duration: "4 weeks",
      icon: "🎯",
      description: "The summit. Most athletes will achieve their first 1–3 second full front lever in this phase. Approach it with respect.",
      exercises: [
        {
          title: "Full Front Lever Hold",
          sets: "5",
          reps: "5×1–3s (build to 5s)",
          rest: "3 min",
          intensity: "Maximum",
          cues: [
            "Legs together, toes pointed, body rigid",
            "Think: 'steel rod from head to toe'",
            "Active shoulder depression is still required — don't disengage",
            "The hold lives and dies by your lats and core working as one",
          ],
          proTip: "Your first full front lever will likely be a surprise — one rep where everything clicks. Have your camera ready. That moment is worth documenting.",
          progression: [
            { label: "Straddle", emoji: "↔️", active: false },
            { label: "1–2s", emoji: "⏱️", active: true },
            { label: "3–5s", emoji: "🎯", active: false },
            { label: "5s+", emoji: "👑", active: false },
          ],
        },
        {
          title: "Full Front Lever Rows",
          sets: "4",
          reps: "3–5 reps",
          rest: "3 min",
          intensity: "Elite",
          cues: [
            "The single hardest pulling movement in bodyweight training",
            "Maintain perfect body alignment through full range",
            "Even 1 rep is a milestone. Record it.",
          ],
          proTip: "Elite-level athletes do full front lever rows for 3–5 reps. If you can do this, you are in the top 0.1% of strength athletes worldwide.",
        },
      ],
    },
  ],
  cooldown: leverCooldown,
  benefits: [
    "Full front lever in 12 weeks",
    "Elite posterior chain conditioning",
    "Pulling strength for muscle-ups and advanced rows",
  ],
  stripeUrl: "https://buy.stripe.com/8x2dRbaj7fGV0EP6lf3ZK08",
};

const hybridAthlete: Program = {
  id: "hybrid-athlete",
  title: "Hybrid Athlete",
  subtitle: "Bodyweight Skills + Weighted Lifts",
  tagline: "The physique of a gymnast. The strength of a powerlifter.",
  level: "Intermediate",
  levelColor: "#a855f7",
  category: "hybrid",
  categoryGroup: "HYBRID",
  price: "47",
  icon: "💪",
  glowColor: "rgba(168,85,247,0.15)",
  badge: "BEST-SELLER",
  dualTrack: true,
  trackLabels: ["Home Routine", "Gym Routine"],
  goals: [
    "Fuse calisthenics skill work with barbell/dumbbell hypertrophy",
    "Build the 'athlete physique' — functional AND aesthetic",
    "Progress planche or front lever alongside strength gains",
    "4 structured training days with intelligent periodization",
  ],
  mindset: "The hybrid athlete doesn't choose between skill and strength — they pursue both. This requires more intelligent programming because the two systems can conflict. Skill work comes first, always. Fatigue is the enemy of skill acquisition. Treat your nervous system like the high-performance engine it is.",
  weekStructure: "4 sessions/week. Day 1 (Upper Skill + Push Strength) · Day 2 (Lower Power + Plyo) · Day 3 (Upper Pull + Lever Work) · Day 4 (Full Body Accessory + Hypertrophy Finish).",
  warmup: [
    { name: "Dynamic Wrist Protocol", duration: "3 min", notes: "Circles, push stretches, extension holds. Full protocol for barbell + skill combined load." },
    { name: "Shoulder Band Circuit", duration: "3×15 each", notes: "Pull-aparts, face pulls, Y-T-W. Primes the rotator cuff for heavy pressing." },
    { name: "Hollow Body + Arch Hold Alternating", duration: "4×20s each", notes: "Programs the core for both lever and barbell bracing patterns." },
    { name: "Planche/Lever 30% Activation", duration: "3×4s", notes: "Just activate the pattern. Not a working set — neural priming only." },
    { name: "Hip Flexor + Hamstring Flow", duration: "4 min", notes: "Lunge matrix into RDL stretch. Prepares for deadlift/squat carryover." },
  ],
  phases: [
    {
      name: "Block 1 — Skill Priority",
      tag: "Weeks 1–4",
      duration: "4 weeks",
      icon: "🎯",
      description: "Skills first, strength second. Your CNS is freshest at the start. Never reverse this order.",
      exercises: [
        {
          title: "Planche / Front Lever Skill Work",
          sets: "6",
          reps: "6×5s (max quality)",
          rest: "2.5 min",
          intensity: "Maximum Skill",
          cues: [
            "Choose your skill: Planche OR Lever — not both in same session",
            "Every rep must be your best — not just completed",
            "If quality drops, stop the set immediately",
            "Log every session: position held, seconds, quality rating /10",
          ],
          proTip: "Film every skill session from the side. Compare Week 1 to Week 4. The visual feedback is more valuable than any coach cue.",
        },
        {
          title: "Weighted Pull-Ups",
          sets: "5",
          reps: "5 reps @ 70–80% 1RM",
          rest: "2.5 min",
          intensity: "Strength",
          cues: [
            "Add weight via belt, vest, or dumbbell between legs",
            "Full hang to chin over bar — no kipping",
            "3-second descent every rep",
            "Scapular engagement throughout — do not disengage at bottom",
          ],
          proTip: "Weighted pull-up strength directly transfers to front lever. If you increase your weighted pull-up max by 20%, your lever will improve measurably.",
        },
        {
          title: "Overhead Press (Barbell or DB)",
          sets: "4",
          reps: "6 reps @ 75% 1RM",
          rest: "2 min",
          intensity: "Strength",
          cues: [
            "Bar starts at collar bone, press in straight vertical line",
            "Brace core like a planche lean — same tension",
            "Lock out at top with shoulder blades squeezed",
            "Controlled descent — 2 seconds down",
          ],
          proTip: "The overhead press builds the anterior deltoid strength required for planche lean. These exercises are not separate — they reinforce each other.",
        },
      ],
    },
    {
      name: "Block 2 — Hybrid Power",
      tag: "Weeks 5–8",
      duration: "4 weeks",
      icon: "⚡",
      description: "Increase intensity across both skill and strength work simultaneously. This is where the hybrid athlete starts to emerge.",
      exercises: [
        {
          title: "Muscle-Up to Dip Combination",
          sets: "5",
          reps: "3–5 reps (quality)",
          rest: "3 min",
          intensity: "Power",
          cues: [
            "Explosive pull → transition → controlled dip",
            "This is a power-skill movement — rest fully",
            "On rings: more skill transfer, harder stabilization",
            "On bar: more power output, easier stabilization",
          ],
          proTip: "Muscle-ups on rings are arguably the most impressive bodyweight movement for an observer. If you don't have them yet, this program will get you there.",
        },
        {
          title: "Deadlift (Romanian variation)",
          sets: "4",
          reps: "5 reps @ 80% 1RM",
          rest: "2.5 min",
          intensity: "Heavy",
          cues: [
            "Hip hinge — push hips back first",
            "Bar stays in contact with legs throughout",
            "Neutral spine maintained — any rounding = stop",
            "Squeeze glutes at lockout — don't hyperextend",
          ],
          proTip: "The RDL builds posterior chain strength that directly translates to front lever holding power. This is not optional — it is synergistic.",
        },
      ],
    },
  ],
  gymPhases: [
    {
      name: "Gym Track — Block 1 (Strength Foundation)",
      tag: "Weeks 1–4",
      duration: "4 weeks",
      icon: "🏋️",
      description: "Full equipment available. Prioritize compound movements loaded progressively. Skills still come first.",
      exercises: [
        {
          title: "Barbell Bench Press",
          sets: "5",
          reps: "5 reps @ 75% 1RM",
          rest: "3 min",
          intensity: "Heavy",
          cues: [
            "Arch + retract scapulas — create a stable platform",
            "Bar touches sternum — not high chest",
            "Drive feet into floor throughout",
            "2-second pause at bottom optional for max chest activation",
          ],
          proTip: "The bench press and planche lean work the same anterior deltoid angle. Your planche lean will improve as your bench press increases.",
        },
        {
          title: "Weighted Ring Dips",
          sets: "4",
          reps: "6 reps",
          rest: "2.5 min",
          intensity: "Strength",
          cues: [
            "Rings turned out 30° at bottom",
            "Full range — chest between hands at bottom",
            "Control the rings — do not let them splay",
            "Lean forward slightly to engage chest more",
          ],
          proTip: "Ring dips are 3× harder than bar dips due to stabilization demand. The shoulder stability you build here directly transfers to all skills.",
        },
        {
          title: "Cable Face Pull",
          sets: "4",
          reps: "15 reps",
          rest: "60s",
          intensity: "Accessory",
          cues: [
            "High pulley attachment at face height",
            "Pull to ear level — not face level",
            "External rotate at the top: thumbs point behind you",
            "This is shoulder armor — never skip it",
          ],
          proTip: "Every pushing-dominant calisthenics program needs pulling accessory work. Face pulls prevent the internal rotation imbalance that leads to shoulder impingement.",
        },
      ],
    },
    {
      name: "Gym Track — Block 2 (Hypertrophy Finish)",
      tag: "Weeks 5–8",
      duration: "4 weeks",
      icon: "💥",
      description: "Higher volume, shorter rest. The strength base from Block 1 now gets converted into visible muscle.",
      exercises: [
        {
          title: "Incline DB Press",
          sets: "4",
          reps: "10–12 reps",
          rest: "90s",
          intensity: "Hypertrophy",
          cues: [
            "30° incline — not 45° (reduces shoulder stress)",
            "Squeeze chest at top — elbows slightly in",
            "Full stretch at bottom with 2-second pause",
            "This hits the upper chest region critical for aesthetics",
          ],
          proTip: "Upper chest development is what creates the 'shelf' look. Combined with planche work, this builds the complete chest aesthetic.",
        },
        {
          title: "Lat Pulldown (V-Bar)",
          sets: "4",
          reps: "10–12 reps",
          rest: "90s",
          intensity: "Hypertrophy",
          cues: [
            "Pull to chest — elbows to sides, not behind",
            "Slight lean back (15°) to align with lat fiber direction",
            "Full extension at top — feel the lat stretch",
            "This is direct lever carryover in a controlled setting",
          ],
          proTip: "The V-bar creates a pulling angle very similar to front lever mechanics. Use this as supplementary lever work when your skill work volume is lower.",
        },
      ],
    },
  ],
  cooldown: [
    { name: "Hip Flexor Couch Stretch", duration: "2 min each", notes: "Essential after lower body gym work. Back foot on wall, front foot forward. Hold and breathe." },
    { name: "Thoracic Extension over Foam Roller", duration: "3 min", notes: "Roll from mid to upper back. Pause at each segment. Decompresses spine after heavy loading." },
    { name: "Shoulder Sleeper Stretch", duration: "90s each", notes: "Lying on side. Gently press forearm toward floor. Targets posterior capsule tightness." },
    ...sharedCooldown.slice(4),
  ],
  benefits: [
    "Skill + Hypertrophy fusion in 8 weeks",
    "Complete athlete physique",
    "Progressive overload across both tracks",
  ],
  stripeUrl: "https://buy.stripe.com/28EaEZ2QFdyN2MX4d73ZK09",
};

const fullHypertrophy: Program = {
  id: "hypertrophy",
  title: "Full Hypertrophy",
  subtitle: "Aesthetic-Focused Muscle Building",
  tagline: "12 weeks to your most aesthetic physique.",
  level: "Beginner / Intermediate",
  levelColor: "#ec4899",
  category: "hypertrophy",
  categoryGroup: "HYPERTROPHY",
  price: "47",
  icon: "🔥",
  glowColor: "rgba(236,72,153,0.15)",
  dualTrack: true,
  trackLabels: ["No-Equipment", "Full Gym Access"],
  goals: [
    "Maximize muscle size through evidence-based hypertrophy principles",
    "Build an aesthetic physique with balanced proportions",
    "Progressive overload across 12 structured weeks",
    "Full access to both bodyweight and barbell/cable hypertrophy methods",
  ],
  mindset: "Hypertrophy is science. Mechanical tension × metabolic stress × muscle damage — that is the formula. This program removes the guesswork and replaces it with precision. Every set, every rep range, every rest period is chosen for a specific physiological reason. Your only job is to execute consistently and eat to grow.",
  weekStructure: "4 sessions/week. Push (Mon) · Pull (Tue) · Legs (Thu) · Upper Full (Sat). Each session 60–80 min. Progressive overload: add 1 rep or 2.5kg every session where possible.",
  warmup: [
    { name: "Full Body Joint Mobility Flow", duration: "5 min", notes: "Neck, shoulders, hips, knees, ankles. Every joint through full pain-free range." },
    { name: "Activation Circuit", duration: "2 rounds", notes: "10 band pull-aparts + 10 glute bridges + 10 bodyweight squats. Primes all major groups." },
    { name: "First Working Set at 50% Weight", duration: "1 set", notes: "Always do a warm-up set before your first working set. Non-negotiable." },
  ],
  phases: [
    {
      name: "Phase 1 — Foundation Volume",
      tag: "Weeks 1–4",
      duration: "4 weeks",
      icon: "📦",
      description: "Establish movement patterns and baseline volume. Do not test your maximum — build work capacity.",
      exercises: [
        {
          title: "Pike Push-Ups (No-Equipment)",
          sets: "4",
          reps: "10–12 reps",
          rest: "90s",
          intensity: "Moderate",
          cues: [
            "Hips high — inverted V position",
            "Lower until head touches floor",
            "The steeper your pike, the more deltoid activation",
            "Slow negative (3 seconds) for maximum time under tension",
          ],
          proTip: "Pike push-ups done with a 3-second negative and 1-second pause at bottom are as effective as overhead pressing for deltoid hypertrophy.",
          progression: [
            { label: "Standard Pike", emoji: "▽", active: true },
            { label: "Feet Elevated", emoji: "⬆️", active: false },
            { label: "Pseudo-Handstand", emoji: "🤸", active: false },
          ],
        },
        {
          title: "Archer Push-Ups",
          sets: "4",
          reps: "8 reps each side",
          rest: "90s",
          intensity: "Moderate-High",
          cues: [
            "One arm extended fully to the side — no bend",
            "Lower toward the bent arm (90° at elbow)",
            "The extended arm provides counterbalance only",
            "This is a unilateral chest exercise — feel the stretch deeply",
          ],
          proTip: "Archer push-ups provide similar pectoral stretch to a cable fly or dumbbell press. The unilateral loading increases difficulty by ~40% vs regular push-ups.",
        },
        {
          title: "Australian Pull-Ups (Bodyweight Row)",
          sets: "4",
          reps: "12–15 reps",
          rest: "90s",
          intensity: "Moderate",
          cues: [
            "Table, barbell in rack, or rings at hip height",
            "Body straight as a plank throughout",
            "Pull chest to bar — elbows at 45° from body",
            "Slow negative builds the most mass here",
          ],
          proTip: "Elevate feet to make harder. Add a backpack with books to make harder. The progression path is almost unlimited with this movement.",
        },
      ],
    },
    {
      name: "Phase 2 — Intensity Ramp",
      tag: "Weeks 5–8",
      duration: "4 weeks",
      icon: "📈",
      description: "Increase load, add intensification techniques (rest-pause, drop sets). This is where visible changes happen.",
      exercises: [
        {
          title: "One-Arm Push-Up Progression",
          sets: "5",
          reps: "5–8 each side",
          rest: "2 min",
          intensity: "High",
          cues: [
            "Feet wide for balance, hand centered under chest",
            "Descend slowly — do not let hip rotate",
            "Use a low surface (sofa height) to make accessible",
            "Full lockout at top, full depth at bottom",
          ],
          proTip: "The one-arm push-up is a strength test, not just a chest exercise. The core anti-rotation demand makes this a full-body movement.",
        },
      ],
    },
    {
      name: "Phase 3 — Peak & Deload",
      tag: "Weeks 9–12",
      duration: "4 weeks",
      icon: "🏆",
      description: "Peak volume week (Week 9–10), then structured deload (Week 11), then test week (Week 12).",
      exercises: [
        {
          title: "Pseudo Planche Push-Ups (Max Reps)",
          sets: "3",
          reps: "Max clean reps",
          rest: "3 min",
          intensity: "Max Effort",
          cues: [
            "This test measures your upper body strength/endurance total",
            "Hands turned out, lean forward as far as your strength allows",
            "Record this number to compare to Week 1",
          ],
          proTip: "Compare your Week 1 max to Week 12. A 50–100% improvement in reps is normal with this program. This is your proof of progress.",
        },
      ],
    },
  ],
  gymPhases: [
    {
      name: "Gym Track — Push Day",
      tag: "Day 1 (Monday)",
      duration: "60–75 min",
      icon: "💥",
      description: "Chest, anterior delts, triceps. Compound movement first, isolation last.",
      exercises: [
        {
          title: "Flat Barbell Bench Press",
          sets: "4",
          reps: "8 reps @ 75% 1RM",
          rest: "2 min",
          intensity: "Strength-Hypertrophy",
          cues: [
            "Arch and retract — create maximum stability",
            "Bar path slightly diagonal to lower sternum",
            "Pause 1 second at chest — kills the bounce, maximizes tension",
            "Explosive press up while maintaining control",
          ],
          proTip: "The 1-second pause at the bottom eliminates elastic energy and forces the pec to actually contract from a dead stop. This is the secret to chest development.",
        },
        {
          title: "Cable Lateral Raise",
          sets: "4",
          reps: "15–20 reps",
          rest: "60s",
          intensity: "Isolation",
          cues: [
            "Single-arm cable, start with cable crossing in front of body",
            "Raise until arm parallel to floor — no higher",
            "Lead with the elbow — not the hand",
            "Cable maintains tension throughout vs dumbbells (which drop off at bottom)",
          ],
          proTip: "Cable laterals are 2–3× more effective than dumbbell laterals for medial delt hypertrophy due to constant tension. This is the most important isolation exercise for shoulder width.",
        },
        {
          title: "Tricep Rope Pushdown",
          sets: "3",
          reps: "15 reps",
          rest: "60s",
          intensity: "Isolation",
          cues: [
            "Split the rope at the bottom — externally rotate",
            "Elbows stay pinned to sides throughout",
            "Full extension at bottom — squeeze tricep hard",
            "2-second contraction at bottom",
          ],
          proTip: "The lateral head of the tricep creates the 'horseshoe' appearance. Rope pushdowns are its most targeted exercise. Never skip the split-and-rotate at the bottom.",
        },
      ],
    },
    {
      name: "Gym Track — Pull Day",
      tag: "Day 2 (Tuesday)",
      duration: "60–75 min",
      icon: "🔁",
      description: "Lats, rhomboids, rear delts, biceps. The aesthetic back that makes every other muscle look better.",
      exercises: [
        {
          title: "Wide-Grip Lat Pulldown",
          sets: "4",
          reps: "10–12 reps",
          rest: "90s",
          intensity: "Hypertrophy",
          cues: [
            "Slight lean back (15–20°) before pulling",
            "Pull to upper chest — not chin",
            "Full stretch at top — let shoulder blades rise",
            "This full range is non-negotiable for lat length",
          ],
          proTip: "The full stretch at the top (letting scapulas elevate) is what builds lat length and that dramatic V-taper. Most people cut this short — don't.",
        },
        {
          title: "Seated Cable Row (Neutral Grip)",
          sets: "4",
          reps: "12 reps",
          rest: "90s",
          intensity: "Hypertrophy",
          cues: [
            "Pull to lower sternum — not belly button",
            "Lead with the elbows pulling behind you",
            "Squeeze rhomboids at the top — pause 1s",
            "Control the return — 3-second negative",
          ],
          proTip: "Back thickness is built by heavy compound rows. Width is built by pulldowns. You need both for the complete aesthetic back.",
        },
        {
          title: "EZ-Bar Curl (Slow Negative)",
          sets: "3",
          reps: "10 reps (4-second negative)",
          rest: "90s",
          intensity: "Hypertrophy",
          cues: [
            "Elbows stay at sides — no swinging",
            "Curl to nose level for maximum bicep peak",
            "4-second controlled descent — maximize eccentric",
            "Supinate at the top for peak contraction",
          ],
          proTip: "The 4-second negative (eccentric) is the primary driver of bicep hypertrophy. Researchers consistently find eccentric-focused protocols produce 25–40% more growth.",
        },
      ],
    },
  ],
  cooldown: [
    { name: "Pec Doorframe Stretch", duration: "90s each side", notes: "Arm at 90° on doorframe, gently rotate away. Holds post-pressing are critical for anterior shoulder health." },
    { name: "Lying Glute Figure-4 Stretch", duration: "2 min each", notes: "After leg day. Cross ankle over opposite knee. Pull the knee toward chest." },
    { name: "Cat-Cow Spinal Flow", duration: "2 min", notes: "10 reps slow, then hold the round position for 30s. Decompresses lumbar spine after squatting/deadlifting." },
    { name: "Standing Quad Stretch", duration: "60s each", notes: "Hold ankle behind you. Keep knees together. This also stretches hip flexors if you add forward lean." },
    { name: "Final Breathing Protocol", duration: "3 min", notes: "Box breathing: 4s in, 4s hold, 4s out, 4s hold. Activates rest-and-digest for optimal recovery." },
  ],
  benefits: [
    "Aesthetic physique in 12 weeks",
    "Progressive overload with both tracks",
    "Scientific hypertrophy protocol",
  ],
  stripeUrl: "https://buy.stripe.com/aFa00l0IxeCRcnx3933ZK0a",
};

const ultimateBundle: Program = {
  id: "bundle",
  title: "Ultimate Gravity Bundle",
  subtitle: "Access to ALL 5 Programs",
  tagline: "The complete calisthenics & physique library — one price, lifetime access.",
  level: "All Levels",
  levelColor: "#FF4500",
  category: "bundle",
  categoryGroup: "BUNDLE",
  price: "97",
  originalPrice: "189",
  icon: "👑",
  glowColor: "rgba(255,69,0,0.2)",
  badge: "BEST VALUE",
  goals: [
    "Complete access to all 5 programs",
    "Planche Foundation + Planche Elite + Front Lever Mastery",
    "Hybrid Athlete (Home & Gym tracks)",
    "Full Hypertrophy (No-Equipment & Full Gym tracks)",
  ],
  mindset: "The bundle athlete has no ceiling. Every program in this library is designed to complement the others. Build your planche while growing your physique. Develop your front lever while building hybrid strength. The programs are interconnected — the whole is greater than the sum of its parts.",
  weekStructure: "Self-directed. Choose your primary focus program and use others as supplementary. Recommended: Start with Foundation if new to planche. Start with Hypertrophy if physique is primary goal.",
  warmup: sharedWarmup,
  phases: plancheFoundation.phases,
  cooldown: sharedCooldown,
  benefits: [
    "All 5 programs — lifetime access",
    "Save $92 vs individual purchase",
    "Future program updates included",
  ],
  stripeUrl: "https://buy.stripe.com/aFa8wR3UJeCRcnx10V3ZK0b",
};

const allPrograms: Program[] = [
  plancheFoundation,
  plancheElite,
  frontLeverMastery,
  hybridAthlete,
  fullHypertrophy,
  ultimateBundle,
];

ultimateBundle.bundlePrograms = [
  plancheFoundation,
  plancheElite,
  frontLeverMastery,
  hybridAthlete,
  fullHypertrophy,
];

const PROGRAMS = allPrograms;
const strengthSkillsGroup = [plancheFoundation, plancheElite, frontLeverMastery];
const hybridGroup = [hybridAthlete];
const hypertrophyGroup = [fullHypertrophy];

// ═══════════════════════════════════════════════════════
// TESTIMONIALS DATA
// ═══════════════════════════════════════════════════════

const testimonials = [
  {
    name: "Marcus T.",
    handle: "@marcus_cali",
    program: "Planche Foundation",
    avatar: "MT",
    avatarColor: "#22c55e",
    rating: 5,
    weeks: "8 weeks in",
    result: "Hit my first clean tuck planche hold this morning. 6 seconds. I've been trying on my own for 4 months with zero progress. The warm-up protocol alone changed everything — my wrists stopped hurting after week 2.",
  },
  {
    name: "Jordan K.",
    handle: "@jk_strength",
    program: "Hybrid Athlete",
    avatar: "JK",
    avatarColor: "#a855f7",
    rating: 5,
    weeks: "12 weeks in",
    result: "I was skeptical about combining barbell and calisthenics. Gained 4kg of muscle while actually improving my advanced tuck hold. The dual-track format is genius — gym days and home days both programmed.",
  },
  {
    name: "Alex R.",
    handle: "@alex_levers",
    program: "Front Lever Mastery",
    avatar: "AR",
    avatarColor: "#3b82f6",
    rating: 5,
    weeks: "10 weeks in",
    result: "Week 10 and I held my first straddle front lever for 5 seconds. The progression from tuck to advanced tuck to straddle is perfectly structured. No guesswork. Every session tells you exactly what to do.",
  },
  {
    name: "Sam W.",
    handle: "@sw_aesthetics",
    program: "Full Hypertrophy",
    avatar: "SW",
    avatarColor: "#ec4899",
    rating: 5,
    weeks: "12 weeks in",
    result: "No gym? No problem. The bodyweight track alone gave me more muscle than a year of random gym sessions. The progressive overload is real — I went from 8 archer push-ups to 15 clean reps each side.",
  },
  {
    name: "Tom B.",
    handle: "@tombfit_cali",
    program: "Planche Elite",
    avatar: "TB",
    avatarColor: "#f97316",
    rating: 5,
    weeks: "7 weeks in",
    result: "Went from a shaky advanced tuck to a stable 4-second straddle hold. The eccentric negatives are brutal but they work. My strength jumped faster in 7 weeks than in the previous 6 months of self-programming.",
  },
  {
    name: "Lena M.",
    handle: "@lena.moves",
    program: "Ultimate Bundle",
    avatar: "LM",
    avatarColor: "#FF4500",
    rating: 5,
    weeks: "16 weeks in",
    result: "Got the bundle and I'm alternating between Hypertrophy and Front Lever. The programs complement each other perfectly. Best $97 I've ever spent on fitness — this replaced a $80/month PT I was paying for.",
  },
];

// ═══════════════════════════════════════════════════════
// FAQ DATA
// ═══════════════════════════════════════════════════════

const faqs = [
  {
    q: "What format are the programs? PDF, video, app?",
    a: "Programs are delivered as a structured digital manual (PDF + web access). Every exercise includes written cues, progression paths, and pro tips. No app subscription needed — lifetime access means you own it forever.",
  },
  {
    q: "I have zero experience with calisthenics. Where do I start?",
    a: "Start with Planche Foundation. It's designed from absolute zero — the first 3 weeks build the connective tissue and scapular control you need before attempting any skill. If physique is your main goal with no skill focus, start with Full Hypertrophy instead.",
  },
  {
    q: "Do I need a gym or special equipment?",
    a: "For skill programs (Planche, Front Lever), you need parallettes or a pull-up bar — both under $50. For Hybrid Athlete and Full Hypertrophy, there are dual tracks: one fully bodyweight (floor only), one for gym access. You pick what fits your setup.",
  },
  {
    q: "How long until I see real results?",
    a: "Most athletes notice strength changes within 2–3 weeks and visible skill progression by Week 4–6. The programs are designed for measurable results at every phase — you'll be testing and recording holds so you can see the exact progress over time.",
  },
  {
    q: "What if the program is too hard or too easy?",
    a: "Every exercise includes a progression path (easier and harder variants). If the main exercise is too hard, the previous progression step is listed. If too easy, the next step is there. The program adapts to where you actually are — not where you think you should be.",
  },
  {
    q: "Is there any support if I have questions?",
    a: "Yes — you get direct access via email. Questions about form, programming adjustments, or exercise substitutions are answered personally. This isn't an automated bot response system.",
  },
  {
    q: "Can I run multiple programs at the same time?",
    a: "Generally no — one primary program at a time. The exception is the Hybrid Athlete, which is specifically designed to combine skill and strength work. The Bundle includes guidance on how to sequence programs intelligently over a 6–12 month period.",
  },
  {
    q: "What's the refund policy?",
    a: "If you complete the first 2 weeks of the program and aren't seeing any progress or finding value, reach out within 30 days for a full refund. The program works if you work it — that's the only condition.",
  },
];

// ═══════════════════════════════════════════════════════
// COUNTDOWN TIMER HOOK
// ═══════════════════════════════════════════════════════

function useCountdown() {
  const getTargetTime = () => {
    const stored = localStorage.getItem("gl_bundle_deadline");
    if (stored) return parseInt(stored);
    const deadline = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem("gl_bundle_deadline", deadline.toString());
    return deadline;
  };

  const [timeLeft, setTimeLeft] = useState({ h: 47, m: 59, s: 59 });

  useEffect(() => {
    const target = getTargetTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

// ═══════════════════════════════════════════════════════
// DASHBOARD (inlined)
// ═══════════════════════════════════════════════════════

function SectionBar({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="section-divider">
      <div className="dot" />
      <div className="line" />
      <span className="t-display print-h2" style={{ fontSize: 26, flexShrink: 0 }}>{title}</span>
      {tag && <span className="t-label" style={{ color: "var(--text-faint)", fontSize: 10, flexShrink: 0 }}>{tag}</span>}
      <div className="line" />
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div style={{ width: 22, height: 22, border: `1.5px solid ${checked ? "var(--orange)" : "var(--border-bright)"}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: checked ? "var(--orange)" : "transparent", transition: "all 0.2s", flexShrink: 0 }}>
      {checked && <Check size={12} color="white" />}
    </div>
  );
}

function ProgressionRail({ steps }: { steps: { label: string; emoji: string; hold?: string; active?: boolean }[] }) {
  return (
    <div className="progression-rail" style={{ display: "flex", alignItems: "flex-end", gap: 0, padding: "8px 0 4px", overflowX: "auto" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 0, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: step.active ? "var(--orange)" : "var(--text-faint)", letterSpacing: 1, textTransform: "uppercase", textAlign: "center", maxWidth: 64, lineHeight: 1.3 }}>
              {step.hold && <div style={{ color: step.active ? "var(--orange)" : "var(--text-faint)", marginBottom: 2 }}>{step.hold}</div>}
              {step.label}
            </div>
            <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `2px solid ${step.active ? "var(--orange)" : "var(--border-bright)"}`, background: step.active ? "var(--orange-dim)" : "var(--bg-card)", boxShadow: step.active ? "0 0 18px rgba(255,69,0,0.3)" : "none", transition: "all 0.2s" }}>
              {step.emoji}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 28, height: 2, background: step.active ? "var(--orange)" : "var(--border)", marginBottom: 26, flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ExerciseCard({ ex, index }: { ex: Exercise; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="surface-2 print-avoid-break ex-card-print" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--orange-dim)", border: "1px solid var(--orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="t-label" style={{ color: "var(--orange)", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="t-display" style={{ fontSize: 17, color: "var(--text)" }}>{ex.title}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
            {[{ label: "Sets", val: ex.sets }, { label: "Reps", val: ex.reps }, { label: "Rest", val: ex.rest }].map(({ label, val }) => (
              <span key={label} className="t-body" style={{ fontSize: 12, color: "var(--text-faint)" }}>
                <span style={{ color: "var(--orange)" }}>{val}</span> {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="badge" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-faint)", border: "1px solid var(--border)", fontSize: 9 }}>{ex.intensity}</span>
          {open ? <ChevronUp size={14} style={{ color: "var(--text-faint)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-faint)" }} />}
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          {ex.progression && ex.progression.length > 0 && (
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 10 }}>PROGRESSION PATH</div>
              <ProgressionRail steps={ex.progression} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 10 }}>TECHNICAL CUES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ex.cues.map((cue, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 2, background: "var(--orange-dim)", border: "1px solid var(--orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span className="t-label" style={{ color: "var(--orange)", fontSize: 9 }}>{i + 1}</span>
                  </div>
                  <p className="t-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{cue}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,69,0,0.04)", borderLeft: "3px solid var(--orange)", borderRadius: "0 4px 4px 0", padding: "12px 14px" }}>
            <div className="t-label" style={{ color: "var(--orange)", fontSize: 9, marginBottom: 6 }}>💡 PRO TIP</div>
            <p className="t-body print-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, fontStyle: "italic" }}>{ex.proTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ phase, index }: { phase: Phase; index: number }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="surface print-break-before print-avoid-break" style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 24 }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", background: "linear-gradient(90deg, rgba(255,69,0,0.08) 0%, transparent 100%)", borderBottom: collapsed ? "none" : "1px solid var(--border)", textAlign: "left" }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>{phase.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="t-display print-h3" style={{ fontSize: 20, color: "var(--text)" }}>{phase.name}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", fontSize: 9 }}>{phase.tag}</span>
              <span className="t-label" style={{ color: "var(--text-faint)", fontSize: 9 }}>{phase.duration} · {phase.exercises.length} exercises</span>
            </div>
          </div>
          {collapsed ? <ChevronDown size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} /> : <ChevronUp size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />}
        </div>
      </button>
      {!collapsed && (
        <div style={{ padding: "20px 24px" }}>
          <p className="t-body print-body" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 20 }}>{phase.description}</p>
          <div className="ex-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {phase.exercises.map((ex, i) => <ExerciseCard key={i} ex={ex} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function WarmupCooldown({ items, title, icon, tag }: { items: { name: string; duration: string; notes: string }[]; title: string; icon: React.ReactNode; tag: string }) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  return (
    <div style={{ marginBottom: 40 }}>
      <SectionBar title={title} tag={tag} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} className="surface check-row" onClick={() => setCheckedMap(prev => ({ ...prev, [i]: !prev[i] }))}
            style={{ borderRadius: 6, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", opacity: checkedMap[i] ? 0.4 : 1, border: `1px solid ${checkedMap[i] ? "var(--orange-border)" : "var(--border)"}`, transition: "all 0.2s" }}>
            <div style={{ marginTop: 2 }}><Checkbox checked={!!checkedMap[i]} /></div>
            <div style={{ flex: 1 }}>
              <div className="t-display" style={{ fontSize: 15, textDecoration: checkedMap[i] ? "line-through" : "none", color: "var(--text)" }}>{item.name}</div>
              <p className="t-body" style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.45, marginTop: 3 }}>{item.notes}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <Clock size={11} style={{ color: "var(--orange)" }} />
              <span className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, whiteSpace: "nowrap" }}>{item.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintCover({ program }: { program: Program }) {
  return (
    <div className="print-cover" style={{ display: "none", pageBreakAfter: "always" }}>
      <div className="print-cover-accent" />
      <div className="t-label" style={{ color: "var(--orange)", fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>GRAVITYLAB — ELITE TRAINING MANUAL</div>
      <h1 className="print-title t-serif" style={{ fontSize: 52, lineHeight: 1.05, marginBottom: 16 }}>{program.title}</h1>
      <p className="t-serif" style={{ fontSize: 20, color: "#555", marginBottom: 48, fontStyle: "italic" }}>{program.tagline}</p>
      <div style={{ borderTop: "1px solid #ddd", paddingTop: 20 }}>
        <p className="t-body print-body" style={{ fontSize: 12, color: "#888" }}>© 2025 GravityLab · Lifetime Access · gravitylab.com</p>
      </div>
    </div>
  );
}

function BundleDashboard({ program, onBack }: { program: Program; onBack: () => void }) {
  const bundleProgs = program.bundlePrograms ?? [];
  const [activeProg, setActiveProg] = useState<Program>(bundleProgs[0]);
  const [activeTrack, setActiveTrack] = useState<0 | 1>(0);
  const phases: Phase[] = activeProg.dualTrack && activeTrack === 1 ? (activeProg.gymPhases ?? activeProg.phases) : activeProg.phases;

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <PrintCover program={program} />
      <div className="no-print" style={{ background: "rgba(10,10,10,0.94)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }} className="dash-head">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn-ghost" onClick={onBack}><ArrowLeft size={13} /> Programs</button>
            <div style={{ borderLeft: "1px solid var(--border-bright)", paddingLeft: 16 }}>
              <div className="t-display" style={{ fontSize: 19, lineHeight: 1 }}>👑 Ultimate Gravity Bundle</div>
              <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginTop: 3 }}>ALL 5 PROGRAMS — LIFETIME ACCESS</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {program.stripeUrl && (
              <a href={program.stripeUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 12, background: "linear-gradient(135deg,var(--orange),#ff8c00)" }}>
                  Get Bundle — ${program.price}
                </button>
              </a>
            )}
            <button className="btn-ghost" style={{ padding: "10px 20px", fontSize: 12 }} onClick={() => window.print()}>
              <Download size={12} /> Download Manual
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,69,0,0.03))", border: "1px solid var(--orange-border)", borderRadius: 12, padding: "32px 36px", marginBottom: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, fontSize: 120, opacity: 0.06, pointerEvents: "none" }}>👑</div>
          <div className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 14 }}>BUNDLE — ALL 5 PROGRAMS</div>
          <h2 className="t-display" style={{ fontSize: "clamp(26px,4vw,44px)", marginBottom: 10 }}>Your Complete Training Library</h2>
          <p className="t-body" style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 640, lineHeight: 1.65, marginBottom: 20 }}>{program.mindset}</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {program.benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={12} style={{ color: "var(--orange)" }} />
                <span className="t-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, letterSpacing: 2, marginBottom: 12 }}>SELECT PROGRAM</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {bundleProgs.map(p => (
              <button key={p.id} onClick={() => { setActiveProg(p); setActiveTrack(0); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 6, border: `1px solid ${activeProg.id === p.id ? "var(--orange)" : "var(--border)"}`, background: activeProg.id === p.id ? "var(--orange-dim)" : "var(--bg-card)", color: activeProg.id === p.id ? "var(--orange)" : "var(--text-dim)", cursor: "pointer", transition: "all .2s", fontFamily: "var(--fd)", fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div>{p.title}</div>
                  <div style={{ fontSize: 9, fontFamily: "var(--fb)", fontWeight: 300, color: activeProg.id === p.id ? "var(--orange)" : "var(--text-faint)", marginTop: 1 }}>{p.level}</div>
                </div>
                {activeProg.id === p.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", marginLeft: 4 }} />}
              </button>
            ))}
          </div>
        </div>

        <div className="surface" style={{ padding: "18px 22px", borderRadius: 8, marginBottom: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", borderLeft: `3px solid ${activeProg.levelColor}` }}>
          <div style={{ fontSize: 32 }}>{activeProg.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="t-display" style={{ fontSize: 20 }}>{activeProg.title} <span style={{ fontSize: 12, fontFamily: "var(--fb)", color: activeProg.levelColor }}>— {activeProg.level}</span></div>
            <p className="t-body" style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{activeProg.tagline}</p>
          </div>
          {activeProg.dualTrack && activeProg.trackLabels && (
            <div className="track-toggle">
              {activeProg.trackLabels.map((label, idx) => (
                <button key={label} className={`track-btn ${activeTrack === idx ? "active" : ""}`} onClick={() => setActiveTrack(idx as 0 | 1)}>
                  {idx === 0 ? <Home size={12} /> : <Dumbbell size={12} />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 40, flexWrap: "wrap" }}>
          <div className="surface" style={{ flex: 2, minWidth: 260, padding: "20px", borderRadius: 8 }}>
            <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 12 }}><Target size={10} style={{ display: "inline", marginRight: 5, color: "var(--orange)" }} />PROGRAM GOALS</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {activeProg.goals.map((g, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Check size={11} style={{ color: "var(--orange)", marginTop: 3, flexShrink: 0 }} />
                  <span className="t-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>{g}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface" style={{ flex: 1, minWidth: 220, padding: "20px", borderRadius: 8 }}>
            <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 8 }}><Layers size={10} style={{ display: "inline", marginRight: 5, color: "var(--orange)" }} />STRUCTURE</div>
            <p className="t-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{activeProg.weekStructure}</p>
          </div>
        </div>

        <WarmupCooldown items={activeProg.warmup} title="WARM-UP & MOBILITY" icon={<Thermometer size={16} />} tag={`${activeProg.warmup.length} exercises · ~15 min`} />
        <section style={{ marginBottom: 52 }}>
          <SectionBar title="CORE PROGRAM" tag={`${phases.length} phases · ${phases.reduce((acc, p) => acc + p.exercises.length, 0)} exercises`} />
          {phases.map((phase, i) => <PhaseBlock key={`${activeProg.id}-${i}`} phase={phase} index={i} />)}
        </section>
        <WarmupCooldown items={activeProg.cooldown} title="COOL DOWN & RECOVERY" icon={<Wind size={16} />} tag={`${activeProg.cooldown.length} exercises · ~12 min`} />

        <div className="no-print" style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <button className="btn-ghost" onClick={onBack}><ArrowLeft size={13} /> Back to Programs</button>
          <button className="btn-primary" onClick={() => window.print()}><Download size={13} /> Download Full Manual</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ program, onBack }: { program: Program; onBack: () => void }) {
  const [activeTrack, setActiveTrack] = useState<0 | 1>(0);
  const [progressWeek] = useState(3);
  const totalWeeks = 8;
  const phases: Phase[] = program.dualTrack && activeTrack === 1 ? (program.gymPhases ?? program.phases) : program.phases;

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <PrintCover program={program} />
      <div className="no-print" style={{ background: "rgba(10,10,10,0.94)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }} className="dash-head">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn-ghost" onClick={onBack}><ArrowLeft size={13} /> Programs</button>
            <div style={{ borderLeft: "1px solid var(--border-bright)", paddingLeft: 16 }}>
              <div className="t-display" style={{ fontSize: 19, lineHeight: 1 }}>{program.title}</div>
              <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginTop: 3 }}>{program.subtitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {program.dualTrack && program.trackLabels && (
              <div className="track-toggle">
                {program.trackLabels.map((label, idx) => (
                  <button key={label} className={`track-btn ${activeTrack === idx ? "active" : ""}`} onClick={() => setActiveTrack(idx as 0 | 1)}>
                    {idx === 0 ? <Home size={12} /> : <Dumbbell size={12} />}
                    {label}
                  </button>
                ))}
              </div>
            )}
            {program.stripeUrl && (
              <a href={program.stripeUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 12 }}>Get Access — ${program.price}</button>
              </a>
            )}
            <button className="btn-ghost" style={{ padding: "10px 20px", fontSize: 12 }} onClick={() => window.print()}>
              <Download size={12} /> Download Manual
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <section style={{ marginBottom: 56 }} className="print-break-before">
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
            <div style={{ flex: 2, minWidth: 260 }}>
              <div className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 16 }}>
                <BookOpen size={10} /> INTRODUCTION
              </div>
              <h1 className="t-display print-title" style={{ fontSize: "clamp(36px,5vw,56px)", lineHeight: 0.95, marginBottom: 12 }}>{program.title}</h1>
              <p className="t-serif" style={{ fontSize: 19, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 20, fontStyle: "italic" }}>{program.tagline}</p>
              <p className="t-body print-body" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 580 }}>{program.mindset}</p>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="surface" style={{ padding: "20px", borderRadius: 8, marginBottom: 16 }}>
                <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 12 }}>
                  <Target size={10} style={{ display: "inline", marginRight: 5, color: "var(--orange)" }} />PROGRAM GOALS
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {program.goals.map((g, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Check size={11} style={{ color: "var(--orange)", marginTop: 3, flexShrink: 0 }} />
                      <span className="t-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface" style={{ padding: "16px 20px", borderRadius: 8 }}>
                <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 8 }}>
                  <Layers size={10} style={{ display: "inline", marginRight: 5, color: "var(--orange)" }} />STRUCTURE
                </div>
                <p className="t-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{program.weekStructure}</p>
              </div>
            </div>
          </div>
          <div className="no-print glass" style={{ padding: "18px 22px", borderRadius: 8, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 8 }}>YOUR PROGRESS</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(progressWeek / totalWeeks) * 100}%` }} /></div>
            </div>
            <div className="t-display" style={{ fontSize: 28, color: "var(--orange)" }}>{Math.round((progressWeek / totalWeeks) * 100)}%</div>
            <div className="t-body" style={{ fontSize: 13, color: "var(--text-faint)" }}>Week {progressWeek} / {totalWeeks}</div>
          </div>
        </section>

        {program.dualTrack && program.trackLabels && (
          <div className="no-print" style={{ background: "linear-gradient(135deg, rgba(255,69,0,0.07), rgba(255,69,0,0.03))", border: "1px solid var(--orange-border)", borderRadius: 8, padding: "18px 22px", marginBottom: 40, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <RefreshCw size={18} style={{ color: "var(--orange)", flexShrink: 0 }} />
            <div>
              <div className="t-display" style={{ fontSize: 16, marginBottom: 3 }}>Dual-Track Program Active</div>
              <p className="t-body" style={{ fontSize: 13, color: "var(--text-dim)" }}>Currently viewing: <strong style={{ color: "var(--orange)" }}>{program.trackLabels[activeTrack]}</strong> — Switch between tracks using the toggle above.</p>
            </div>
          </div>
        )}

        <WarmupCooldown items={program.warmup} title="WARM-UP & MOBILITY" icon={<Thermometer size={16} />} tag={`${program.warmup.length} exercises · ~15 min`} />
        <section style={{ marginBottom: 52 }}>
          <SectionBar title="CORE PROGRAM" tag={`${phases.length} phases · ${phases.reduce((acc, p) => acc + p.exercises.length, 0)} exercises`} />
          {phases.map((phase, i) => <PhaseBlock key={i} phase={phase} index={i} />)}
        </section>
        <WarmupCooldown items={program.cooldown} title="COOL DOWN & RECOVERY" icon={<Wind size={16} />} tag={`${program.cooldown.length} exercises · ~12 min`} />

        <div className="no-print" style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <button className="btn-ghost" onClick={onBack}><ArrowLeft size={13} /> Back to Programs</button>
          <button className="btn-primary" onClick={() => window.print()}><Download size={13} /> Download Full Manual</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PROGRAM CARD
// ═══════════════════════════════════════════════════════

function ProgramCard({ program: p, onOpen }: { program: Program; onOpen: (p: Program) => void }) {
  return (
    <div className="surface card-lift" style={{ borderRadius: 8, padding: "24px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }} onClick={() => p.stripeUrl ? window.open(p.stripeUrl, "_blank") : onOpen(p)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top left, ${p.glowColor}, transparent 60%)`, pointerEvents: "none", borderRadius: 8 }} />
      {p.badge && (
        <div style={{ position: "absolute", top: 12, right: -26, background: p.category === "bundle" ? "linear-gradient(135deg,var(--orange),#ff8c00)" : "var(--orange)", color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: 2, fontFamily: "var(--fb)", padding: "4px 32px", transform: "rotate(35deg)", transformOrigin: "center", whiteSpace: "nowrap", zIndex: 2 }}>{p.badge}</div>
      )}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>{p.icon}</div>
        <span className="badge" style={{ background: `${p.levelColor}18`, color: p.levelColor, border: `1px solid ${p.levelColor}30`, marginBottom: 10, alignSelf: "flex-start" }}>{p.level}</span>
        <h3 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 21, textTransform: "uppercase", marginBottom: 3, lineHeight: 1.05, color: "var(--text)" }}>{p.title}</h3>
        <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.4 }}>{p.subtitle}</p>
        {p.dualTrack && p.trackLabels && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--orange-dim)", border: "1px solid var(--orange-border)", borderRadius: 3, padding: "4px 10px", marginBottom: 12, alignSelf: "flex-start" }}>
            <RefreshCw size={10} style={{ color: "var(--orange)" }} />
            <span style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "var(--orange)", letterSpacing: 1.5, textTransform: "uppercase" }}>2 Tracks:</span>
            <span style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-dim)" }}>{p.trackLabels[0]}</span>
            <span style={{ color: "var(--text-faint)" }}>|</span>
            <span style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-dim)" }}>{p.trackLabels[1]}</span>
          </div>
        )}
        {p.category === "bundle" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,69,0,.07)", border: "1px solid var(--orange-border)", borderRadius: 3, padding: "4px 10px", marginBottom: 12, alignSelf: "flex-start" }}>
            <Package size={10} style={{ color: "var(--orange)" }} />
            <span style={{ fontFamily: "var(--fb)", fontSize: 9, fontWeight: 700, color: "var(--orange)", letterSpacing: 1.5, textTransform: "uppercase" }}>All 5 Programs Included</span>
          </div>
        )}
        <ul style={{ listStyle: "none", marginBottom: 18, display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
          {p.benefits.map((b) => (
            <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Check size={11} style={{ color: "var(--orange)", marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(255,255,255,.62)", lineHeight: 1.4 }}>{b}</span>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)", marginTop: "auto" }}>
          <div>
            <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 36, color: p.category === "bundle" ? "var(--orange)" : "var(--text)", lineHeight: 1 }}>${p.price}</span>
            {p.originalPrice && <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-faint)", marginLeft: 7, textDecoration: "line-through" }}>${p.originalPrice}</span>}
            <div style={{ fontFamily: "var(--fb)", fontSize: 10, color: "var(--text-faint)", marginTop: 1 }}>lifetime access</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            {p.stripeUrl ? (
              <a href={p.stripeUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <button className="btn-primary" style={{ padding: "9px 17px", fontSize: 12 }}>Get Access →</button>
              </a>
            ) : (
              <button className="btn-primary" style={{ padding: "9px 17px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); onOpen(p); }}>Get Access →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// ═══════════════════════════════════════════════════════

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const cols = [
    [testimonials[0], testimonials[3]],
    [testimonials[1], testimonials[4]],
    [testimonials[2], testimonials[5]],
  ];

  return (
    <section style={{ padding: "90px 22px", position: "relative", zIndex: 1, borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="badge" style={{ background: "rgba(255,255,255,.04)", color: "var(--text-dim)", border: "1px solid var(--border-bright)", marginBottom: 14 }}>RESULTS</div>
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(28px,4vw,52px)", textTransform: "uppercase", marginBottom: 12 }}>
            Real athletes.<br /><span style={{ WebkitTextStroke: "2px var(--orange)", WebkitTextFillColor: "transparent" }}>Real results.</span>
          </h2>
          <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto" }}>
            No cherry-picked before/afters. Just honest feedback from people who followed the programs.
          </p>
        </div>

        {/* Desktop 3-col grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="testimonial-grid">
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {col.map((t, ti) => (
                <div key={ti} className="surface" style={{ borderRadius: 10, padding: "22px", border: "1px solid var(--border)", transition: "border-color .2s", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--orange-border)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  {/* Stars */}
                  <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                    {Array(t.rating).fill(0).map((_, i) => <Star key={i} size={12} fill="var(--orange)" stroke="none" />)}
                  </div>
                  {/* Quote */}
                  <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: 16, fontStyle: "italic" }}>"{t.result}"</p>
                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${t.avatarColor}22`, border: `1.5px solid ${t.avatarColor}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fd)", fontSize: 11, fontWeight: 900, color: t.avatarColor, flexShrink: 0 }}>{t.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--fd)", fontSize: 13, color: "var(--text)", fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)" }}>{t.handle}</div>
                    </div>
                    <span className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", fontSize: 8 }}>{t.program}</span>
                  </div>
                  <div style={{ marginTop: 10, fontFamily: "var(--fb)", fontSize: 10, color: "var(--text-faint)" }}>⏱ {t.weeks}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════
// FAQ SECTION
// ═══════════════════════════════════════════════════════

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ padding: "90px 22px", position: "relative", zIndex: 1, borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="badge" style={{ background: "rgba(255,255,255,.04)", color: "var(--text-dim)", border: "1px solid var(--border-bright)", marginBottom: 14 }}>FAQ</div>
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(28px,4vw,52px)", textTransform: "uppercase" }}>
            Every question.<br />Answered honestly.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {faqs.map((faq, i) => (
            <div key={i} className="surface" style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${open === i ? "var(--orange-border)" : "var(--border)"}`, transition: "border-color .2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left" }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 16, color: open === i ? "var(--orange)" : "var(--text)", transition: "color .2s", lineHeight: 1.3 }}>{faq.q}</span>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${open === i ? "var(--orange)" : "var(--border-bright)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", background: open === i ? "var(--orange-dim)" : "transparent" }}>
                  {open === i ? <ChevronUp size={12} style={{ color: "var(--orange)" }} /> : <ChevronDown size={12} style={{ color: "var(--text-faint)" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 16 }} />
                  <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still unsure CTA */}
        <div style={{ marginTop: 40, textAlign: "center", padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <AlertCircle size={20} style={{ color: "var(--orange)", marginBottom: 10 }} />
          <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--text-dim)", marginBottom: 16 }}>Still not sure which program is right for you?</p>
          <a href="mailto:contact@gravitylab.com">
            <button className="btn-secondary">Ask directly →</button>
          </a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════
// BUNDLE COUNTDOWN + PRICE BREAKDOWN
// ═══════════════════════════════════════════════════════

function BundleSection({ onOpen }: { onOpen: (p: Program) => void }) {
  const { h, m, s } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const priceItems = [
    { label: "Planche Foundation", price: 27 },
    { label: "Planche Elite", price: 39 },
    { label: "Front Lever Mastery", price: 29 },
    { label: "Hybrid Athlete", price: 47 },
    { label: "Full Hypertrophy", price: 47 },
  ];
  const total = priceItems.reduce((a, b) => a + b.price, 0);

  return (
    <section style={{ padding: "90px 22px", position: "relative", zIndex: 1, background: "rgba(255,69,0,0.02)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="pg2">
          {/* Left — value breakdown */}
          <div>
            <div className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 18 }}>BUNDLE — BEST VALUE</div>
            <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(32px,4vw,52px)", textTransform: "uppercase", lineHeight: .9, marginBottom: 28 }}>
              Everything.<br /><span style={{ WebkitTextStroke: "2px var(--orange)", WebkitTextFillColor: "transparent" }}>One price.</span>
            </h2>
            {/* Price breakdown */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
              {priceItems.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-dim)" }}>
                    <Check size={11} style={{ color: "var(--orange)", marginRight: 8, display: "inline" }} />
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 15, color: "var(--text-faint)", textDecoration: "line-through" }}>${item.price}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "rgba(255,69,0,0.06)", borderTop: "2px solid var(--orange-border)" }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 14, color: "var(--text)", letterSpacing: 1, textTransform: "uppercase" }}>If bought separately</span>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 20, color: "var(--text-faint)", textDecoration: "line-through" }}>${total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "linear-gradient(90deg,rgba(255,69,0,0.12),rgba(255,69,0,0.04))" }}>
                <div>
                  <div style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 14, color: "var(--orange)", letterSpacing: 1, textTransform: "uppercase" }}>Bundle Price</div>
                  <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>You save ${total - 97}</div>
                </div>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 32, color: "var(--orange)" }}>$97</span>
              </div>
            </div>
          </div>

          {/* Right — countdown + CTA */}
          <div>
            {/* Countdown */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--orange-border)", borderRadius: 10, padding: "24px", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--orange)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>⏰ Launch price expires in</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
                {[{ label: "HRS", val: pad(h) }, { label: "MIN", val: pad(m) }, { label: "SEC", val: pad(s) }].map((unit, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ background: "rgba(255,69,0,0.1)", border: "1px solid var(--orange-border)", borderRadius: 6, padding: "10px 14px", minWidth: 58 }}>
                      <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 36, color: "var(--orange)", lineHeight: 1 }}>{unit.val}</span>
                    </div>
                    <span style={{ fontFamily: "var(--fb)", fontSize: 9, letterSpacing: 2, color: "var(--text-faint)" }}>{unit.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "var(--fb)", fontSize: 12, color: "var(--text-faint)", lineHeight: 1.55 }}>
                After the timer runs out, the bundle returns to full price.
              </p>
            </div>

            {/* CTA */}
            <a href={ultimateBundle.stripeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
              <button className="btn-primary pulse-glow" style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: 15, letterSpacing: 2 }}>
                Get the Bundle — $97
              </button>
            </a>
            <div style={{ display: "flex", gap: 16, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
              {["Lifetime access", "30-day guarantee", "Instant delivery"].map((t, i) => (
                <span key={i} style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Check size={10} style={{ color: "var(--orange)" }} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════
// CATEGORY SECTION
// ═══════════════════════════════════════════════════════

function CatSection({ label, sublabel, progs, onOpen }: { label: string; sublabel: string; progs: Program[]; onOpen: (p: Program) => void }) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, background: "var(--orange)", borderRadius: 2, flexShrink: 0 }} />
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(26px,3.5vw,40px)", textTransform: "uppercase", color: "var(--text)" }}>{label}</h2>
        </div>
        <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-faint)", marginLeft: 18 }}>{sublabel}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(progs.length, 3)}, 1fr)`, gap: 18 }} className="pg3">
        {progs.map(p => <ProgramCard key={p.id} program={p} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// QUIZ SECTION (with urgency result page)
// ═══════════════════════════════════════════════════════

function QuizSection({ onOpen }: { onOpen: (p: Program) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Program | null>(null);
  const [quizTimer, setQuizTimer] = useState(900); // 15 min countdown on result
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    if (!timerStarted || quizTimer <= 0) return;
    const id = setInterval(() => setQuizTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerStarted, quizTimer]);

  const questions = [
    {
      q: "What is your current physical level?",
      opts: [
        "Beginner — just starting out with training",
        "Intermediate — a few months of consistent training",
        "Advanced — training for over a year",
        "Expert — I already have some skills (tuck planche, tuck front lever...)",
      ],
    },
    {
      q: "What is your main goal?",
      opts: [
        "Learn calisthenics skills (planche, front lever...)",
        "Build an aesthetic, muscular physique",
        "Both — skills AND physique",
        "Everything — the complete package",
      ],
    },
    {
      q: "What equipment do you have access to?",
      opts: [
        "Nothing — just the floor and my bodyweight",
        "Pull-up bar + parallettes",
        "Full gym access",
        "Everything — home setup AND gym",
      ],
    },
  ];

  const getRecommendation = (ans: number[]): Program => {
    const [level, goal, equip] = ans;
    if (goal === 3 || equip === 3) return ultimateBundle;
    if (goal === 0) {
      if (level <= 1) return plancheFoundation;
      if (level === 2) return frontLeverMastery;
      return plancheElite;
    }
    if (goal === 1) return fullHypertrophy;
    if (goal === 2) return hybridAthlete;
    return plancheFoundation;
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      const rec = getRecommendation(newAnswers);
      setResult(rec);
      setTimerStarted(true);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); setQuizTimer(900); setTimerStarted(false); };

  const pad = (n: number) => String(n).padStart(2, "0");
  const timerMin = Math.floor(quizTimer / 60);
  const timerSec = quizTimer % 60;
  const timerExpired = quizTimer <= 0;

  return (
    <section style={{ padding: "80px 22px", position: "relative", zIndex: 1, background: "rgba(255,69,0,0.02)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="badge" style={{ background: "rgba(255,255,255,.04)", color: "var(--text-dim)", border: "1px solid var(--border-bright)", marginBottom: 14 }}>🎯 FIND YOUR PROGRAM</div>
          <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(28px,4vw,50px)", textTransform: "uppercase" }}>Which program<br />is right for you?</h2>
          <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--text-dim)", marginTop: 12 }}>Answer 3 questions — we'll guide you to the right starting point.</p>
        </div>

        {result ? (
          <div>
            {/* Urgency timer banner */}
            {!timerExpired ? (
              <div style={{ background: "rgba(255,69,0,0.1)", border: "1px solid var(--orange-border)", borderRadius: 6, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-dim)" }}>
                  🔥 <strong style={{ color: "var(--text)" }}>Personal offer active</strong> — discounted price reserved for <strong style={{ color: "var(--orange)" }}>{pad(timerMin)}:{pad(timerSec)}</strong>
                </span>
                <span className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", fontSize: 9 }}>LIMITED</span>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 18px", marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-faint)" }}>Offer expired — standard pricing applies.</span>
              </div>
            )}

            <div style={{ marginBottom: 8, fontFamily: "var(--fd)", fontSize: 13, letterSpacing: 2, color: "var(--text-faint)", textTransform: "uppercase", textAlign: "center" }}>Your perfect match</div>
            <div className="surface" style={{ borderRadius: 12, padding: "32px", border: `2px solid ${result.levelColor}40`, background: `${result.glowColor}`, marginBottom: 24, textAlign: "left", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.07 }}>{result.icon}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 40 }}>{result.icon}</span>
                <div>
                  <div className="t-display" style={{ fontSize: 26 }}>{result.title}</div>
                  <div style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-dim)", marginTop: 3 }}>{result.subtitle}</div>
                </div>
                <span className="badge" style={{ marginLeft: "auto", background: `${result.levelColor}20`, color: result.levelColor, border: `1px solid ${result.levelColor}40`, fontSize: 10 }}>{result.level}</span>
              </div>
              <p style={{ fontFamily: "var(--fb)", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.65, marginBottom: 20 }}>{result.tagline}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {result.goals.slice(0, 3).map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Check size={11} style={{ color: "var(--orange)", marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{g}</span>
                  </div>
                ))}
              </div>

              {/* Price + urgency */}
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 38, color: "var(--orange)" }}>${result.price}</span>
                  {result.originalPrice && <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-faint)", marginLeft: 8, textDecoration: "line-through" }}>${result.originalPrice}</span>}
                  <div style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>one-time · lifetime access</div>
                </div>
                {!timerExpired && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 22, color: "var(--orange)", fontVariantNumeric: "tabular-nums" }}>{pad(timerMin)}:{pad(timerSec)}</div>
                    <div style={{ fontFamily: "var(--fb)", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>OFFER EXPIRES</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {result.stripeUrl ? (
                  <a href={result.stripeUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      Get Access — ${result.price} →
                    </button>
                  </a>
                ) : (
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => onOpen(result)}>
                    View Program — ${result.price}
                  </button>
                )}
                <button className="btn-ghost" onClick={reset}>← Retake</button>
              </div>
            </div>

            {/* Also consider */}
            {result.category !== "bundle" && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--text-faint)", marginBottom: 12 }}>Want everything for the best value?</p>
                <a href={ultimateBundle.stripeUrl} target="_blank" rel="noopener noreferrer">
                  <button className="btn-secondary">👑 Get the Bundle — $97 (save $92)</button>
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i < step ? "var(--orange)" : i === step ? "var(--orange)" : "var(--border)", transition: "all .3s" }} />
              ))}
            </div>
            <div className="surface" style={{ borderRadius: 12, padding: "32px 28px", border: "1px solid var(--border-bright)" }}>
              <div className="t-label" style={{ color: "var(--text-faint)", fontSize: 9, marginBottom: 10 }}>Question {step + 1} / {questions.length}</div>
              <h3 className="t-display" style={{ fontSize: "clamp(18px,3vw,26px)", marginBottom: 28, lineHeight: 1.2 }}>{questions[step].q}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {questions[step].opts.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    style={{ padding: "14px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-dim)", cursor: "pointer", fontFamily: "var(--fb)", fontSize: 14, textAlign: "left", transition: "all .2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--orange)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)"; }}>
                    <span style={{ color: "var(--orange)", fontFamily: "var(--fd)", marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {step > 0 && (
              <button className="btn-ghost" style={{ marginTop: 14, fontSize: 12 }} onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}>
                ← Back
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@300;400;500;600&display=swap');
:root {
  --orange:#FF4500;--orange-dim:rgba(255,69,0,.1);--orange-border:rgba(255,69,0,.28);
  --bg:#0A0A0A;--bg-card:#111;--bg-card2:#141414;
  --border:rgba(255,255,255,.07);--border-bright:rgba(255,255,255,.14);
  --text:#FFF;--text-dim:rgba(255,255,255,.5);--text-faint:rgba(255,255,255,.25);
  --fd:'Barlow Condensed',Impact,sans-serif;--fb:'Barlow',sans-serif;--fs:'Cormorant Garamond',Georgia,serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--fb);overflow-x:hidden;-webkit-font-smoothing:antialiased}
.noise{position:fixed;inset:0;opacity:.02;pointer-events:none;z-index:500;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px}
.grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(255,255,255,.016) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016) 1px,transparent 1px);background-size:64px 64px}
.glass{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid var(--border);border-radius:6px}
.surface{background:var(--bg-card);border:1px solid var(--border);border-radius:6px}
.surface-2{background:var(--bg-card2);border:1px solid var(--border);border-radius:6px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;border-radius:2px;font-family:var(--fb);white-space:nowrap}
.btn-primary{background:var(--orange);color:#fff;border:none;padding:12px 26px;font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:2px;display:inline-flex;align-items:center;gap:8px}
.btn-primary:hover{background:#ff6030;transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,69,0,.4)}
.btn-secondary{background:transparent;color:var(--orange);border:1px solid var(--orange-border);padding:11px 22px;font-family:var(--fd);font-weight:700;font-size:13px;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:2px;display:inline-flex;align-items:center;gap:7px}
.btn-secondary:hover{background:var(--orange-dim)}
.btn-ghost{background:transparent;color:var(--text-dim);border:1px solid var(--border-bright);padding:9px 16px;font-family:var(--fd);font-weight:600;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:2px;display:inline-flex;align-items:center;gap:7px}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,.28)}
.card-lift{transition:transform .3s cubic-bezier(.4,0,.2,1),border-color .3s,box-shadow .3s;cursor:pointer}
.card-lift:hover{transform:translateY(-5px);border-color:var(--orange-border)!important;box-shadow:0 20px 56px rgba(255,69,0,.14)}
.progress-bar{height:3px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--orange),#ff8c00);transition:width .8s cubic-bezier(.4,0,.2,1)}
.track-toggle{display:flex;background:rgba(255,255,255,.04);border:1px solid var(--border-bright);border-radius:4px;overflow:hidden}
.track-btn{padding:9px 18px;font-family:var(--fd);font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;border:none;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap}
.track-btn.active{background:var(--orange);color:#fff}
.track-btn:not(.active){background:transparent;color:var(--text-dim)}
.track-btn:not(.active):hover{background:rgba(255,255,255,.05);color:var(--text)}
.check-row{transition:background .18s,border-color .18s;cursor:pointer}
.check-row:hover{background:rgba(255,69,0,.04)!important}
.data-table{width:100%;border-collapse:collapse;font-family:var(--fb);font-size:13px}
.data-table th{padding:11px 16px;text-align:left;font-size:10px;letter-spacing:2px;color:var(--text-faint);text-transform:uppercase;font-weight:600;border-bottom:1px solid var(--border);background:rgba(255,255,255,.02)}
.data-table td{padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.04);color:rgba(255,255,255,.7);vertical-align:top}
.data-table tr:last-child td{border-bottom:none}
.data-table tr:hover td{background:rgba(255,69,0,.03)}
.section-line{display:flex;align-items:center;gap:16px;margin-bottom:28px}
.section-line .ln{flex:1;height:1px;background:var(--border)}
.section-line .dot{width:5px;height:5px;background:var(--orange);border-radius:50%;flex-shrink:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes flicker{0%,100%{opacity:1}91%{opacity:1}92%{opacity:.7}93%{opacity:1}97%{opacity:1}98%{opacity:.82}99%{opacity:1}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(255,69,0,.3)}50%{box-shadow:0 0 44px rgba(255,69,0,.6)}}
.fade-up{animation:fadeUp .5s ease both}
.flicker{animation:flicker 5s ease-in-out infinite}
.pulse-glow{animation:pulseGlow 2.6s ease-in-out infinite}
.t-display{font-family:var(--fd);font-weight:900;text-transform:uppercase;letter-spacing:-.02em}
.t-label{font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase}
.t-body{font-family:var(--fb);font-weight:400;line-height:1.65}
.t-serif{font-family:var(--fs)}
.section-divider{display:flex;align-items:center;gap:16px;margin-bottom:28px}
.section-divider .line{flex:1;height:1px;background:var(--border)}
.section-divider .dot{width:5px;height:5px;background:var(--orange);border-radius:50%;flex-shrink:0}
@media(max-width:768px){
  .pg3{grid-template-columns:1fr!important}
  .pg2{grid-template-columns:1fr!important}
  .ex-grid{grid-template-columns:1fr!important}
  .dash-head{flex-direction:column!important;align-items:flex-start!important;gap:14px!important}
  .hero-title{font-size:clamp(60px,17vw,110px)!important}
  .track-btn{padding:8px 12px!important;font-size:11px!important}
  .testimonial-grid{grid-template-columns:1fr!important}
}
@media print{
  .no-print,.noise,.grid-bg,nav,footer,.track-toggle,
  .btn-primary,.btn-secondary,.btn-ghost,.progress-bar{display:none!important}
  *{background:#fff!important;color:#111!important;box-shadow:none!important;animation:none!important;border-color:#ddd!important}
  html,body{font-size:11pt;line-height:1.55;font-family:Georgia,serif}
  @page{size:A4;margin:22mm 20mm}
  .print-cover{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:230mm!important;page-break-after:always!important}
  .print-h1{font-family:'Cormorant Garamond',Georgia,serif!important;font-size:40pt!important;font-weight:700!important}
  .print-h2{font-family:'Cormorant Garamond',Georgia,serif!important;font-size:20pt!important;border-bottom:2px solid #FF4500!important;padding-bottom:5px!important;margin-bottom:14pt!important}
}
`;

export default function App() {
  const [page, setPage] = useState<"landing" | "dash">("landing");
  const [active, setActive] = useState<Program | null>(null);
  const [justPaid, setJustPaid] = useState(false);

  // ── Read ?program= param on load (after Stripe redirect) ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const programId = params.get("program");
    const paid = params.get("paid");

    if (programId) {
      const found = PROGRAMS.find(p => p.id === programId);
      if (found) {
        setActive(found);
        setPage("dash");
        if (paid === "true") setJustPaid(true);
        // Clean URL without reload
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const openProg = (p: Program) => {
    setActive(p);
    setPage("dash");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (page === "dash" && active) {
    return (
      <>
        <style>{CSS}</style>

        {/* ── Post-payment welcome banner ── */}
        {justPaid && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            padding: "14px 24px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>🎉</span>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 15, color: "#fff", letterSpacing: 1 }}>
                  Payment confirmed — welcome to {active.title}!
                </div>
                <div style={{ fontFamily: "var(--fb)", fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                  Your full program is unlocked below. Bookmark this page for future access.
                </div>
              </div>
            </div>
            <button onClick={() => setJustPaid(false)}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--fd)", fontSize: 11, letterSpacing: 1 }}>
              ✕ Close
            </button>
          </div>
        )}

        {active.category === "bundle"
          ? <BundleDashboard program={active} onBack={() => { setPage("landing"); setJustPaid(false); window.scrollTo({ top: 0 }); }} />
          : <Dashboard program={active} onBack={() => { setPage("landing"); setJustPaid(false); window.scrollTo({ top: 0 }); }} />
        }
      </>
    );
  }

  const skillProgs = PROGRAMS.filter(p => p.category === "skill");
  const hybridProgs = PROGRAMS.filter(p => p.category === "hybrid");
  const hypertrophyProgs = PROGRAMS.filter(p => p.category === "hypertrophy");
  const bundleProg = PROGRAMS.find(p => p.category === "bundle")!;

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <style>{CSS}</style>
      <div className="noise" /><div className="grid-bg" />

      <nav className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "15px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", background: "rgba(10,10,10,.92)", backdropFilter: "blur(24px)" }}>
        <div style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 19, letterSpacing: 4, color: "var(--orange)" }}>GRAVITY<span style={{ color: "var(--text)" }}>LAB</span></div>
        <div style={{ display: "flex", gap: 22 }}>
          {["Programs", "Method", "Guide"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: "var(--fd)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>{l}</a>
          ))}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "130px 22px 70px", position: "relative", zIndex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 750, height: 750, background: "radial-gradient(circle,rgba(255,69,0,.08),transparent 60%)", pointerEvents: "none" }} />
        <div className="badge" style={{ background: "rgba(255,69,0,.1)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 28, letterSpacing: 3, fontSize: 10 }}>⚡ Elite Calisthenics Programs — Premium Digital Coaching</div>
        <h1 className="flicker hero-title" style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(68px,13vw,148px)", lineHeight: .87, letterSpacing: "-.02em", textTransform: "uppercase", marginBottom: 28 }}>
          DOMINATE<br /><span style={{ WebkitTextStroke: "2px var(--orange)", WebkitTextFillColor: "transparent" }}>GRAVITY</span>
        </h1>
        <p style={{ fontFamily: "var(--fb)", fontWeight: 300, fontSize: 17, color: "var(--text-dim)", maxWidth: 500, marginBottom: 48, lineHeight: 1.65 }}>Science-backed programs engineered to build elite skills and serious muscle. Planche. Front Lever. Hybrid. Aesthetics.</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#programs"><button className="btn-primary pulse-glow" style={{ fontSize: 15, padding: "15px 42px", letterSpacing: 3 }}>View Programs <ChevronDown size={13} /></button></a>
          <a href="#guide"><button className="btn-secondary">Selection Guide</button></a>
        </div>
      </section>

      {/* ── MANIFESTO ─────────────────────────────────────────── */}
      <section id="method" style={{ padding: "90px 22px", position: "relative", zIndex: 1, borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="pg2">
            <div>
              <div className="badge" style={{ background: "rgba(255,69,0,.08)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 22, letterSpacing: 2, fontSize: 9 }}>⚠️ THE HARD TRUTH</div>
              <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(32px,4.5vw,58px)", textTransform: "uppercase", lineHeight: .92, marginBottom: 28 }}>
                TikTok won't<br /><span style={{ WebkitTextStroke: "2px var(--orange)", WebkitTextFillColor: "transparent" }}>build your</span><br />body.
              </h2>
              <p style={{ fontFamily: "var(--fb)", fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 20 }}>
                You spend hours scrolling physiques on TikTok. You watch "30 push-up challenge" videos. You try random exercises without understanding why, in what order, or how long to rest.
              </p>
              <p style={{ fontFamily: "var(--fb)", fontSize: 15, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 32 }}>
                <strong style={{ color: "var(--text)" }}>The result:</strong> you get injured, you plateau, you quit. That's not a lack of willpower — it's a lack of method.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["❌", "Copying an exercise without knowing its prerequisites"],
                  ["❌", "Training 7 days a week without understanding recovery"],
                  ["❌", "Skipping warm-ups — the fastest route to injury"],
                  ["❌", "Skipping intermediate progressions and jumping ahead"],
                  ["❌", "Ignoring rest times between sets"],
                ].map(([icon, text], i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                    <span style={{ fontFamily: "var(--fb)", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: "linear-gradient(135deg, rgba(255,69,0,0.06), rgba(255,69,0,0.02))", border: "1px solid var(--orange-border)", borderRadius: 12, padding: "32px 30px" }}>
                <div style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: 13, letterSpacing: 3, color: "var(--orange)", marginBottom: 20, textTransform: "uppercase" }}>✅ What you actually need</div>
                {[
                  { icon: "🗓️", title: "A structured multi-week plan", desc: "Every session is designed to prepare the next. No improvisation, no guesswork." },
                  { icon: "🔥", title: "A mandatory specific warm-up", desc: "Joints, tendons, nervous system — properly prepare your body before every effort." },
                  { icon: "⏱️", title: "Precise rest times between sets", desc: "Too short = accumulated fatigue. Too long = lost adaptation. Every second matters." },
                  { icon: "📈", title: "Progressive intermediate exercises", desc: "A full planche doesn't appear from nowhere. There are 6 progressions before it. Each one matters." },
                  { icon: "🛑", title: "Knowing when NOT to train", desc: "Rest days are adaptation days. Remove rest, you remove gains. Simple as that." },
                  { icon: "🧠", title: "Understanding the why, not just the what", desc: "Every exercise has biomechanical logic. Understand it and you multiply your results." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < 5 ? 20 : 0, paddingBottom: i < 5 ? 20 : 0, borderBottom: i < 5 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0, width: 32, textAlign: "center" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{item.title}</div>
                      <p style={{ fontFamily: "var(--fb)", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUIZ ──────────────────────────────────────────────── */}
      <QuizSection onOpen={openProg} />

      {/* ── PROGRAMS ──────────────────────────────────────────── */}
      <section id="programs" style={{ padding: "60px 22px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="badge" style={{ background: "var(--orange-dim)", color: "var(--orange)", border: "1px solid var(--orange-border)", marginBottom: 14 }}>PROGRAMS</div>
            <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(34px,5vw,66px)", textTransform: "uppercase" }}>CHOOSE YOUR PATH</h2>
          </div>
          <CatSection label="STRENGTH & SKILLS" sublabel="Master gravity — Planche & Front Lever from beginner to elite" progs={skillProgs} onOpen={openProg} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 64 }} className="pg2">
            <CatSection label="HYBRID" sublabel="Skill + Strength — two tracks" progs={hybridProgs} onOpen={openProg} />
            <CatSection label="HYPERTROPHY" sublabel="Aesthetic physique focus" progs={hypertrophyProgs} onOpen={openProg} />
          </div>
        </div>
      </section>

      {/* ── BUNDLE SECTION WITH COUNTDOWN ─────────────────────── */}
      <BundleSection onOpen={openProg} />

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── SELECTION GUIDE ───────────────────────────────────── */}
      <section id="guide" style={{ padding: "70px 22px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="badge" style={{ background: "rgba(255,255,255,.04)", color: "var(--text-dim)", border: "1px solid var(--border-bright)", marginBottom: 14 }}>SELECTION GUIDE</div>
            <h2 style={{ fontFamily: "var(--fd)", fontWeight: 900, fontSize: "clamp(28px,4.5vw,56px)", textTransform: "uppercase" }}>WHICH PROGRAM IS FOR YOU?</h2>
          </div>
          <div className="surface" style={{ borderRadius: 8, overflowX: "auto" }}>
            <table className="data-table">
              <thead><tr>{["Program", "Category", "Level", "Prerequisite", "Dual Track", "Price", ""].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {PROGRAMS.map(p => (
                  <tr key={p.id} style={{ cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,69,0,.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => p.stripeUrl ? window.open(p.stripeUrl, "_blank") : openProg(p)}>
                    <td style={{ fontWeight: 700, color: "var(--text)" }}>{p.title}</td>
                    <td><span className="badge" style={{ background: "rgba(255,255,255,.04)", color: "var(--text-dim)", border: "1px solid var(--border)", fontSize: 9 }}>{p.categoryGroup}</span></td>
                    <td><span className="badge" style={{ background: `${p.levelColor}15`, color: p.levelColor, border: `1px solid ${p.levelColor}28` }}>{p.level}</span></td>
                    <td style={{ fontSize: 12 }}>{(p as any).prereq ?? "—"}</td>
                    <td style={{ textAlign: "center" }}>{p.dualTrack ? <span style={{ color: "var(--orange)", fontWeight: 700 }}>✓</span> : <span style={{ color: "var(--text-faint)" }}>—</span>}</td>
                    <td>
                      <span style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 900, color: p.category === "bundle" ? "var(--orange)" : "var(--text)" }}>${p.price}</span>
                      {p.originalPrice && <span style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)", marginLeft: 6, textDecoration: "line-through" }}>${p.originalPrice}</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {p.stripeUrl && (
                        <a href={p.stripeUrl} target="_blank" rel="noopener noreferrer">
                          <button className="btn-primary" style={{ padding: "6px 14px", fontSize: 10, whiteSpace: "nowrap" }}>Buy Now</button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="no-print" style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--fb)", fontSize: 11, color: "var(--text-faint)", letterSpacing: 1 }}>© 2025 GRAVITYLAB — All rights reserved</p>
      </footer>
    </div>
  );
}
