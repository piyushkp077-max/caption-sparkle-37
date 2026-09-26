import { Copy, Type } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mapper = (ch: string) => string;

const offset = (upper: number, lower: number, digit?: number, exceptions: Record<string, string> = {}): Mapper => (ch) => {
  if (exceptions[ch]) return exceptions[ch]!;
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(upper + code - 65);
  if (code >= 97 && code <= 122) return String.fromCodePoint(lower + code - 97);
  if (digit !== undefined && code >= 48 && code <= 57) return String.fromCodePoint(digit + code - 48);
  return ch;
};

const smallCapsMap = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ";
const styles: { name: string; map: (text: string) => string }[] = ([
  { name: "Bold", map: offset(0x1d400, 0x1d41a, 0x1d7ce) },
  { name: "Italic", map: offset(0x1d434, 0x1d44e, undefined, { h: "ℎ" }) },
  { name: "Bold Italic", map: offset(0x1d468, 0x1d482) },
  { name: "Script", map: offset(0x1d4d0, 0x1d4ea) },
  { name: "Gothic", map: offset(0x1d56c, 0x1d586) },
  { name: "Double Struck", map: offset(0x1d538, 0x1d552, 0x1d7d8, { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" }) },
  { name: "Sans Bold", map: offset(0x1d5d4, 0x1d5ee, 0x1d7ec) },
  { name: "Sans Italic", map: offset(0x1d608, 0x1d622) },
  { name: "Monospace", map: offset(0x1d670, 0x1d68a, 0x1d7f6) },
  { name: "Bubble", map: offset(0x24b6, 0x24d0) },
  { name: "Wide", map: offset(0xff21, 0xff41, 0xff10) },
  { name: "Small Caps", map: (ch: string) => { const i = ch.toLowerCase().charCodeAt(0) - 97; return i >= 0 && i < 26 ? smallCapsMap[i]! : ch; } },
  { name: "Strike", map: (ch: string) => (ch === " " ? ch : `${ch}\u0336`) },
  { name: "Underline", map: (ch: string) => (ch === " " ? ch : `${ch}\u0332`) },
] as { name: string; map: Mapper }[]).map((style) => ({ name: style.name, map: (text: string) => Array.from(text).map(style.map).join("") }));

const decorations = [(t: string) => t, (t: string) => `✦ ${t} ✦`, (t: string) => `꧁ ${t} ꧂`, (t: string) => `★彡 ${t} 彡★`, (t: string) => `•°¯\`•• ${t} ••´¯°•`, (t: string) => `▄︻デ ${t} ══━一`];

const bioCategories: { name: string; bios: string[] }[] = [
  { name: "Attitude", bios: ["👑 Born to stand out, not fit in\n🔥 Attitude? Mera style hai\n📍 Apni duniya ka Badshah", "😎 Simple ladka, royal soch\n💯 Loyal to few, savage to all\n🚫 No fake friends allowed", "⚡ Main trend nahi, main brand hoon\n🦁 Silent but deadly\n🎯 Goals > Girls"] },
  { name: "Aesthetic", bios: ["🌙 soft soul, wild heart\n☕ chai & chaos\n📸 capturing little moments", "✨ living my own fairytale\n🌸 kindness is my aesthetic\n🎧 lost in lofi", "🤍 less perfection, more authenticity\n🌿 slow mornings\n📖 chapter 22 loading…"] },
  { name: "Girls", bios: ["💅 Queen of my own kingdom\n🌷 Sweet but not sugar-free\n👑 Papa's princess", "🦋 Cute but psycho, but cute\n💖 Smile — it confuses people\n📍 Desi girl, global vibe", "🌸 Main apni favourite hoon\n✨ Glitter in my veins\n🎀 Drama-free zone"] },
  { name: "Boys", bios: ["🏍️ Bike lover | Gym freak\n🔥 Mummy ka ladla\n🎂 Wish me on 12 Jan", "💪 Hustle in silence\n🎮 Gamer by night\n🦅 Single & ready to mingle… with success", "🖤 Rules? Main banata hoon\n📍 India 🇮🇳\n👑 Born to rule"] },
  { name: "Creator", bios: ["🎬 Content Creator | Reels\n📩 DM for collabs\n👇 New video out now", "📸 Visual storyteller\n🚀 Helping you grow on Insta\n🔗 Links below", "✍️ Shayari • Quotes • Vibes\n💬 Daily captions for you\n🔔 Turn on post notifications"] },
];

export function FontStudio({ onCopy }: { onCopy: (text: string, message: string) => void }) {
  const [input, setInput] = useState("KP Captions");
  const [deco, setDeco] = useState(0);
  const [bioCat, setBioCat] = useState(0);
  const source = input.trim() || "Your Name";
  const decorate = decorations[deco]!;

  return (
    <section className="rise mx-auto max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Stand out on Instagram</p>
      <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-medium"><Type className="size-5 text-primary" />Bio & Fancy Fonts</h1>

      <div className="mt-4 rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl">
        <label className="block"><span className="text-xs font-semibold text-muted-foreground">Type your name or text</span>
          <input value={input} maxLength={60} onChange={(event) => setInput(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background/70 p-3 text-sm outline-none ring-primary transition focus:ring-2" placeholder="Type here…" aria-label="Text for fancy fonts" />
        </label>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {decorations.map((item, index) => <Button key={index} variant={deco === index ? "ink" : "glass"} size="pill" className="shrink-0" onClick={() => setDeco(index)}>{index === 0 ? "Plain" : item("Aa")}</Button>)}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {styles.map((style) => {
          const result = decorate(style.map(source));
          return (
            <div key={style.name} className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass px-3 py-2.5 shadow-glass backdrop-blur-xl">
              <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{style.name}</p><p className="truncate text-lg">{result}</p></div>
              <Button variant="glassIcon" size="dock" aria-label={`Copy ${style.name}`} onClick={() => onCopy(result, `${style.name} font copied`)}><Copy /></Button>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-xl font-medium">Instagram Bio Ideas</h2>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {bioCategories.map((item, index) => <Button key={item.name} variant={bioCat === index ? "ink" : "glass"} size="pill" className="shrink-0" onClick={() => setBioCat(index)}>{item.name}</Button>)}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {bioCategories[bioCat]!.bios.map((bio, index) => (
          <article key={bio} className={cn("rise rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl")} style={{ animationDelay: `${index * 60}ms` }}>
            <p className="whitespace-pre-line text-sm leading-relaxed">{bio}</p>
            <Button variant="ink" size="sm" className="mt-3 w-full rounded-xl" onClick={() => onCopy(bio, "Bio copied — paste it in Instagram")}><Copy /> Copy Bio</Button>
          </article>
        ))}
      </div>
    </section>
  );
}
