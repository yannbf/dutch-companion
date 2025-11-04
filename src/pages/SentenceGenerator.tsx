import { useState, ReactNode, useCallback } from "react";
import { Shuffle, Plus, User, Clock, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const pronouns = [
  "u",
  "ik",
  "jij/je",
  "hij/ze/het",
  "wij/we",
  "jullie",
  "ze(pl.)",
];

const tenses = [
  "presens",
  "imperfectum",
  "perfectum",
  "inversie",
  "verb kicker",
  "presens + modaal",
  "futurum",
];

const regularVerbs = [
  "(zich) herinneren",
  "bellen",
  "bestellen",
  "geloven",
  "groeien",
  "herhalen",
  "horen",
  "koken",
  "leren",
  "leven",
  "luisteren",
  "maken",
  "missen",
  "oefenen",
  "pinnen",
  "praten",
  "proberen",
  "proeven",
  "reizen",
  "spelen",
  "stoppen",
  "studeren",
  "veranderen",
  "verhuizen",
  "vertellen",
  "wachten",
  "wandelen",
  "werken",
  "werken",
  "willen",
  "wonen",
];

const irregularVerbs = [
  "slapen",
  "houden",
  "kunnen",
  "begrijpen",
  "lopen",
  "zitten",
  "lachen",
  "vergeten",
  "lezen",
  "zullen",
  "kiezen",
  "vallen",
  "schrijven",
  "beginnen",
  "doen",
  "weten",
  "zoeken",
  "snijden",
  "ruiken",
  "zeggen",
  "krijgen",
  "ontvangen",
  "komen",
  "vinden",
  "moeten",
  "vragen",
  "zien",
  "liggen",
  "staan",
  "helpen",
  "kopen",
  "zijn",
  "denken",
  "geven",
  "drinken",
  "hebben",
  "kijken",
  "eten",
  "brengen",
  "gaan",
  "worden",
  "zwemmen",
  "mogen",
];

const separableVerbs = [
  "nadenken",
  "inleveren",
  "voorbereiden",
  "ophalen",
  "uitnodigen",
  "meenemen",
  "kennismaken",
  "samenwonen",
  "afspreken",
  "afwassen",
  "opstaan",
  "afrekenen",
  "thuiskomen",
  "schoonmaken",
  "uitdoen",
  "oplossen",
  "aandoen",
  "goedkeuren",
  "uitleggen",
  "tegenkomen",
];

// Generic WheelButton component for different categories
interface WheelButtonProps {
  icon: ReactNode;
  label: string;
  value: string | null;
  animate: boolean;
  onClick: () => void;
  valueColorClass?: string;
  labelColorClass?: string;
  ariaLabel: string;
  buttonBaseColorClass?: string;
  buttonActiveColorClass?: string;
  hoverClass?: string;
}
const WheelButton = ({
  icon,
  label,
  value,
  animate,
  onClick,
  labelColorClass = "",
  ariaLabel,
  buttonBaseColorClass = "bg-muted/50 text-foreground/70",
  buttonActiveColorClass,
  hoverClass,
}: WheelButtonProps) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-[11px] uppercase tracking-wide font-semibold ${labelColorClass}`}>{label}</span>
    </div>
    <button
      className={
        `w-full max-w-[22rem] rounded-full text-[30px] uppercase font-bold bg-transparent border-none text-white transition-colors focus:outline-none cursor-pointer
        ${animate ? "animate-pulse" : ""}
        ${value ? `${buttonActiveColorClass ?? ""} text-white ${hoverClass ?? ""}` : buttonBaseColorClass}
        `
      }
      style={{ border: "none", background: "transparent" }} // border-none & bg-transparent are for fallback if base classes override them
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {value || "—"}
    </button>
  </div>
);

// Specialized for verb, which needs category-based classes and label
interface VerbWheelButtonProps {
  verb: { value: string | null; category: "regular" | "irregular" | "separable" | null };
  animate: boolean;
  onClick: () => void;
}
const VerbWheelButton = ({ verb, animate, onClick }: VerbWheelButtonProps) => {
  let iconColor = "text-muted-foreground";
  let labelColor = "text-foreground/70";
  let buttonActiveColor = "";
  let hoverClass = "";
  let labelText = "Verba";

  switch (verb.category) {
    case "regular":
      iconColor = "text-emerald-600";
      labelColor = "text-emerald-600";
      buttonActiveColor = "bg-emerald-100 border border-emerald-300";
      hoverClass = "hover:bg-emerald-200/60";
      labelText = "Regelmatige Verba";
      break;
    case "irregular":
      iconColor = "text-amber-600";
      labelColor = "text-amber-600";
      buttonActiveColor = "bg-amber-100 border border-amber-300";
      hoverClass = "hover:bg-amber-200/60";
      labelText = "Onregelmatige Verba";
      break;
    case "separable":
      iconColor = "text-rose-600";
      labelColor = "text-rose-600";
      buttonActiveColor = "bg-rose-100 border border-rose-300";
      hoverClass = "hover:bg-rose-200/60";
      labelText = "Separable Verba";
      break;
  }

  return (
    <WheelButton
      icon={<Sparkles className={`w-4 h-4 ${iconColor}`} />}
      label={labelText}
      value={verb.value}
      animate={animate}
      onClick={onClick}
      valueColorClass=""
      labelColorClass={labelColor}
      ariaLabel="Verbum opnieuw"
      buttonBaseColorClass="bg-muted/50 text-foreground/70"
      buttonActiveColorClass={buttonActiveColor}
      hoverClass={hoverClass}
    />
  );
};


const getRandomItem = (items: string[], current?: string | null) => {
  if (typeof current === "undefined" || current === null) {
    if (items.length === 0) return undefined;
    return items[Math.floor(Math.random() * items.length)];
  }
  const filtered = items.filter((item) => item !== current);
  const candidates = filtered.length > 0 ? filtered : items;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const SentenceGenerator = () => {
  const [pronoun, setPronoun] = useState<string | null>(null);
  const [tense, setTense] = useState<string | null>(null);
  const [verb, setVerb] = useState<{ value: string | null; category: "regular" | "irregular" | "separable" | null }>({ value: null, category: null });
  const [anim, setAnim] = useState<{ p: boolean; t: boolean; v: boolean }>({ p: false, t: false, v: false });
  const [spinningAll, setSpinningAll] = useState(false);

  const rollPronoun = useCallback(() => {
    setAnim((a) => ({ ...a, p: true }));
    setTimeout(() => setAnim((a) => ({ ...a, p: false })), 220);
    setPronoun(getRandomItem(pronouns, pronoun));
  }, [pronoun]);

  const rollTense = useCallback(() => {
    setAnim((a) => ({ ...a, t: true }));
    setTimeout(() => setAnim((a) => ({ ...a, t: false })), 220);
    setTense(getRandomItem(tenses, tense));
  }, [tense]);

  const rollVerb = useCallback(() => {
    const pick = Math.floor(Math.random() * 3);
    const categories = ["regular", "irregular", "separable"] as const;
    const category = categories[pick];
    const pool = category === "regular" ? regularVerbs : category === "irregular" ? irregularVerbs : separableVerbs;
    setAnim((a) => ({ ...a, v: true }));
    setTimeout(() => setAnim((a) => ({ ...a, v: false })), 220);
    setVerb({ value: getRandomItem(pool, verb.value), category });
  }, [verb.value]);

  const rollAll = useCallback(() => {
    rollPronoun();
    rollTense();
    rollVerb();
    if (spinningAll) return;
    setSpinningAll(true);
    window.setTimeout(() => setSpinningAll(false), 1000);
  }, [spinningAll, rollPronoun, rollTense, rollVerb]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title="Sentence Generator"
      />
      
      <div className="max-w-2xl mx-auto space-y-6 pt-20 px-4">
        <style>{`
          @keyframes wheel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @-webkit-keyframes wheel-spin { from { -webkit-transform: rotate(0deg); } to { -webkit-transform: rotate(360deg); } }
        `}</style>
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground text-sm">
            Combine and generate a sentence by spinning the wheel for each part: pronoun, time and verb.
          </p>
          <p className="text-muted-foreground text-sm">
            Voorbeeld: (pronomen) ik + (tijd) imperfectum + (separabel verbum) afwassen = "Ik waste elke dag af." of "Ik waste elke dag af maar toen kocht ik een afwasmachine."
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-2xl border bg-card shadow-sm p-5 sm:p-6 space-y-5">
            <WheelButton
              icon={<User className="w-4 h-4 text-blue-600" />}
              label="Pronomen"
              value={pronoun}
              animate={anim.p}
              onClick={rollPronoun}
              valueColorClass=""
              labelColorClass="text-blue-600"
              ariaLabel="Pronomen opnieuw"
              buttonActiveColorClass="bg-blue-100 border border-blue-300"
              hoverClass="hover:bg-blue-200/60"
            />
            <WheelButton
              icon={<Clock className="w-4 h-4 text-purple-400" />}
              label="Tijd"
              value={tense}
              animate={anim.t}
              onClick={rollTense}
              valueColorClass=""
              labelColorClass="text-purple-400"
              ariaLabel="Tijd opnieuw"
              buttonActiveColorClass="bg-purple-100 border border-purple-300"
              hoverClass="hover:bg-purple-200/60"
            />
            <VerbWheelButton verb={verb} animate={anim.v} onClick={rollVerb} />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-center">
          <button
            onClick={rollAll}
            aria-label="Genereer alles"
            className={`relative inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded-full`}
          >
            <span
              className="block rounded-full"
              style={{
                width: 96,
                height: 96,
                background:
                  "conic-gradient(from 0deg, rgba(59,130,246,0.9), rgba(147,51,234,0.9), rgba(16,185,129,0.9), rgba(245,158,11,0.9), rgba(244,63,94,0.9), rgba(59,130,246,0.9))",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                willChange: "transform",
                transform: "translateZ(0)",
                animation: spinningAll ? "wheel-spin 1s linear 1" : undefined,
                WebkitAnimation: spinningAll ? "wheel-spin 1s linear 1" : undefined,
              }}
            />
            <span
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-card border border-border shadow-sm flex items-center justify-center"
            >
              <Shuffle className="w-6 h-6 text-foreground" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentenceGenerator;

