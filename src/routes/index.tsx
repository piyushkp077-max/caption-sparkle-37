import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  Flame,
  Hash,
  Heart,
  Home,
  Instagram,
  Moon,
  Palette,
  Pause,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import kpLogoAsset from "@/assets/kp-logo.png.asset.json";
const kpLogo = kpLogoAsset.url;
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Quote = {
  id: number;
  text: string;
  translation: string;
  category: string;
  views: string;
  gradient: string;
};

const categories = ["All", "Attitude", "Instagram Reels", "Romantic", "Motivation", "Sad", "Life", "Friends", "Single/Breakup"];

const quotes: Quote[] = [
  { id: 1, text: "Main apni khud ki story likhta hoon, tum bas page turn karo.", translation: "I write my own story, you just turn the page.", category: "Instagram Reels", views: "2.4M", gradient: "quote-gradient-one" },
  { id: 2, text: "मेरा अंदाज़ ही मेरी पहचान है, इसे बदलने की कोशिश मत करना।", translation: "My attitude is my identity—don't try to change it.", category: "Attitude", views: "1.8M", gradient: "quote-gradient-three" },
  { id: 3, text: "Koshish aaj karo, kal ke liye bahane mat chhodna.", translation: "Make the effort today; don't save excuses for tomorrow.", category: "Motivation", views: "890K", gradient: "quote-gradient-two" },
  { id: 4, text: "तुम पास हो तो हर लम्हा थोड़ा और खूबसूरत लगता है।", translation: "Every moment feels more beautiful when you're near.", category: "Romantic", views: "765K", gradient: "quote-gradient-one" },
  { id: 5, text: "कुछ दोस्त परिवार नहीं होते, फिर भी परिवार से कम नहीं होते।", translation: "Some friends aren't family, yet they mean no less than family.", category: "Friends", views: "612K", gradient: "quote-gradient-four" },
  { id: 6, text: "Silence hurts most when you expected a conversation.", translation: "खामोशी सबसे ज़्यादा तब चुभती है जब बात की उम्मीद हो।", category: "Sad", views: "540K", gradient: "quote-gradient-five" },
  { id: 7, text: "ज़िंदगी छोटी नहीं, हम जीना देर से शुरू करते हैं।", translation: "Life isn't short; we simply start living too late.", category: "Life", views: "498K", gradient: "quote-gradient-two" },
  { id: 8, text: "Single, peaceful, and no longer explaining my worth.", translation: "अकेला हूँ, सुकून में हूँ, और अब अपनी कीमत नहीं समझाता।", category: "Single/Breakup", views: "455K", gradient: "quote-gradient-three" },
];

type HashtagGroup = { name: string; tagline: string; gradient: string; tags: string[] };

const hashtagGroups: HashtagGroup[] = [
  { name: "Viral & Trending", tagline: "For posts that need maximum reach right now", gradient: "quote-gradient-one", tags: ["#viral", "#trending", "#explore", "#explorepage", "#fyp", "#foryou", "#foryoupage", "#instagood", "#instadaily", "#viralpost", "#trendingnow", "#reelsinstagram", "#reelitfeelit", "#instareels", "#love", "#photooftheday"] },
  { name: "Attitude", tagline: "Bold captions deserve bold tags", gradient: "quote-gradient-three", tags: ["#attitude", "#attitudestatus", "#badshah", "#king", "#boss", "#bosslife", "#swag", "#desi", "#royal", "#selfmade", "#nofilter", "#darrnahi", "#attitudequotes", "#single", "#style", "#confidence"] },
  { name: "Love & Romantic", tagline: "Couple posts, crushes and soft moments", gradient: "quote-gradient-five", tags: ["#love", "#lovestory", "#romantic", "#couplegoals", "#couples", "#pyar", "#mohabbat", "#ishq", "#dil", "#truelove", "#lovequotes", "#forever", "#soulmate", "#romance", "#together", "#heartbeat"] },
  { name: "Motivation", tagline: "Hustle, grind and never-give-up energy", gradient: "quote-gradient-two", tags: ["#motivation", "#motivationalquotes", "#hustle", "#grind", "#success", "#nevergiveup", "#dreambig", "#focus", "#hardwork", "#inspiration", "#mindset", "#goals", "#selfbelief", "#positivity", "#discipline", "#winner"] },
  { name: "Sad & Alone", tagline: "For the quiet, heavy days", gradient: "quote-gradient-four", tags: ["#sad", "#sadquotes", "#alone", "#broken", "#heartbroken", "#pain", "#tears", "#lonely", "#missyou", "#sadshayari", "#feelings", "#hurt", "#depressed", "#goodbye", "#silent", "#lost"] },
  { name: "Reels/Shorts Special", tagline: "Built for Reels, Shorts and quick viral hits", gradient: "quote-gradient-one", tags: ["#reels", "#reelsinstagram", "#reelsvideo", "#reelitfeelit", "#reelsindia", "#shorts", "#youtubeshorts", "#reelkarofeelkaro", "#viralreels", "#trendingreels", "#reelsofinstagram", "#reelsdaily", "#explorepage", "#viralvideo", "#instavideo", "#contentcreator"] },
  { name: "Life Reality", tagline: "Real talk about zindagi and truth", gradient: "quote-gradient-two", tags: ["#life", "#zindagi", "#reality", "#truth", "#lifequotes", "#factsoflife", "#deep", "#thoughts", "#lifelessons", "#realtalk", "#waqt", "#kismat", "#lifeislife", "#wisdom", "#experience", "#sach"] },
  { name: "Friendship", tagline: "Dosti, yaari and squad love", gradient: "quote-gradient-four", tags: ["#friends", "#friendship", "#dosti", "#yaari", "#bff", "#bestfriends", "#squad", "#friendshipgoals", "#yaar", "#dost", "#friendsforever", "#brotherhood", "#masti", "#gang", "#memories", "#foreverfriends"] },
];

const creatorBackgrounds = [
  { name: "Aurora", colors: ["#6366f1", "#ec4899"], className: "quote-gradient-one" },
  { name: "Ocean", colors: ["#0ea5e9", "#4f46e5"], className: "quote-gradient-two" },
  { name: "Meadow", colors: ["#10b981", "#0ea5e9"], className: "quote-gradient-four" },
  { name: "Sunset", colors: ["#f43f5e", "#a855f7"], className: "quote-gradient-three" },
];

const getCreatorBackground = (index: number) => creatorBackgrounds[index] ?? creatorBackgrounds[0];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KP's Captions, Quotes & Hashtags" },
      { name: "description", content: "Copy, share, save, listen to, and create beautiful trending Hindi and English quote cards — plus viral hashtag bundles." },
      { property: "og:title", content: "KP's Captions, Quotes & Hashtags" },
      { property: "og:description", content: "Discover viral captions and create downloadable Instagram story quote cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotelyApp,
});

function QuotelyApp() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [tab, setTab] = useState<"home" | "saved" | "create" | "hashtags">("home");
  const [toast, setToast] = useState("");
  const [speakingId, setSpeakingId] = useState<number | "daily" | null>(null);
  const [creatorText, setCreatorText] = useState("अपनी कहानी खुद लिखो — दुनिया को बस पढ़ने दो।");
  const [creatorFont, setCreatorFont] = useState("Fraunces");
  const [creatorBg, setCreatorBg] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("quotely-theme");
    const savedFavorites = window.localStorage.getItem("quotely-favorites");
    if (savedTheme === "dark") setTheme("dark");
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch { setFavorites([]); }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("quotely-theme", theme);
  }, [theme]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const visibleQuotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const categoryMatch = category === "All" || quote.category === category;
      const searchMatch = !normalized || `${quote.text} ${quote.translation} ${quote.category}`.toLowerCase().includes(normalized);
      const favoriteMatch = tab !== "saved" || favorites.includes(quote.id);
      return categoryMatch && searchMatch && favoriteMatch;
    });
  }, [category, favorites, query, tab]);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    notify("Copied clean text");
  };

  const copyAllHashtags = async (group: HashtagGroup) => {
    await navigator.clipboard.writeText(group.tags.join(" "));
    notify(`Copied all ${group.tags.length} hashtags`);
  };

  const visibleHashtagGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return hashtagGroups;
    return hashtagGroups.filter((group) => `${group.name} ${group.tags.join(" ")}`.toLowerCase().includes(normalized));
  }, [query]);

  const toggleFavorite = (id: number) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("quotely-favorites", JSON.stringify(next));
      notify(current.includes(id) ? "Removed from saved" : "Saved to favorites");
      return next;
    });
  };

  const listen = (id: number | "daily", text: string) => {
    if (!("speechSynthesis" in window)) return notify("Listening is not supported here");
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const downloadStory = (text: string, colors: string[], filename = "kp-story.png", font = "Fraunces") => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");
    if (!context) return;
    const gradient = context.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, colors[0] ?? "#6366f1");
    gradient.addColorStop(1, colors[1] ?? "#ec4899");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255,255,255,.12)";
    context.beginPath(); context.arc(910, 250, 300, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(120, 1750, 370, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `600 76px ${font}, serif`;
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    words.forEach((word) => {
      const test = `${line}${word} `;
      if (context.measureText(test).width > 850 && line) { lines.push(line.trim()); line = `${word} `; } else line = test;
    });
    if (line) lines.push(line.trim());
    const lineHeight = 102;
    const startY = 930 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((item, index) => context.fillText(item, 540, startY + index * lineHeight));
    context.globalAlpha = 0.78;
    context.font = "500 29px Manrope, sans-serif";
    context.fillText("KP'S CAPTIONS, QUOTES & HASHTAGS", 540, 1770);
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
    notify("Story image downloaded");
  };

  const share = async (quote: Quote, channel: "whatsapp" | "instagram") => {
    if (channel === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(quote.text)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (navigator.share) {
      try { await navigator.share({ text: quote.text, title: "KP's Captions, Quotes & Hashtags" }); } catch { return; }
    } else {
      await copyText(quote.text);
      notify("Caption copied — paste it in Instagram");
    }
  };

  const setActiveTab = (next: "home" | "saved" | "create" | "hashtags") => {
    setTab(next);
    if (next === "home") setCategory("All");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ambient-page min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
      <header className="sticky top-0 z-30 border-b border-glass-border bg-glass backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 pb-3 pt-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <button className="flex min-w-0 items-center gap-2 text-left" onClick={() => setActiveTab("home")} aria-label="Go home">
              <img src={kpLogo} alt="KP logo" width={720} height={697} className="size-11 shrink-0 rounded-xl object-contain drop-shadow-lg" />
              <span className="min-w-0 leading-none"><span className="block truncate font-display text-[13.5px] font-medium leading-tight">KP's Captions, Quotes & Hashtags</span><span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Caption Studio</span></span>
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="glassIcon" size="icon" className="rounded-full" aria-label="Saved favorites" onClick={() => setActiveTab("saved")}><Heart className={cn(favorites.length > 0 && "fill-primary text-primary")} /></Button>
              <Button variant="ink" size="icon" className="rounded-full" aria-label="Toggle color theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon /> : <Sun />}</Button>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-2.5 shadow-glass backdrop-blur-xl">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" placeholder="Search captions, mood, keyword…" aria-label="Search quotes" />
          </label>
          {(tab === "home" || tab === "saved") && <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {categories.map((item) => <Button key={item} variant={category === item ? "ink" : "glass"} size="pill" className="shrink-0" onClick={() => setCategory(item)}>{item}</Button>)}
          </div>}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        {tab === "hashtags" ? (
          <Hashtags groups={visibleHashtagGroups} onCopyAll={copyAllHashtags} />
        ) : tab === "create" ? (
          <Creator text={creatorText} setText={setCreatorText} font={creatorFont} setFont={setCreatorFont} background={creatorBg} setBackground={setCreatorBg} onDownload={() => downloadStory(creatorText, getCreatorBackground(creatorBg)?.colors ?? [], "my-kp-story.png", creatorFont)} />
        ) : (
          <>
            {tab === "home" && <section className="rise relative overflow-hidden rounded-2xl quote-gradient-one p-5 text-story-foreground shadow-elevated">
              <div className="relative">
                <div className="flex items-center gap-2"><span className="rounded-full bg-story-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">Quote of the day</span><span className="text-[11px] opacity-75">Today</span></div>
                <p className="mt-4 max-w-2xl font-hindi text-[24px] font-medium leading-tight">“पहले खुद को पसंद करो, बाकी सब बाद में।”</p>
                <p className="mt-1 text-sm opacity-80">Love yourself first, the rest follows.</p>
                <div className="mt-4 flex gap-2"><Button size="pill" className="bg-background text-foreground hover:bg-background/90" onClick={() => copyText("पहले खुद को पसंद करो, बाकी सब बाद में।")}><Copy /> Copy</Button><Button variant="story" size="pill" onClick={() => listen("daily", "पहले खुद को पसंद करो, बाकी सब बाद में।")}>{speakingId === "daily" ? <Pause /> : <Play />} Listen</Button></div>
              </div>
            </section>}

            <section className={cn(tab === "home" ? "mt-6" : "mt-1")}>
              <div className="flex items-end justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{tab === "saved" ? "Your collection" : "Fresh picks"}</p><h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-medium">{tab === "saved" ? <Heart className="size-5 fill-primary text-primary" /> : <Flame className="size-5 fill-primary text-primary" />}{tab === "saved" ? "Saved Favorites" : "Trending Now"}</h1></div>
                {tab === "home" && <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">Live <span className="size-1.5 rounded-full bg-primary" /></span>}
              </div>
              {visibleQuotes.length ? <div className="mt-4 grid gap-6 md:grid-cols-2">
                {visibleQuotes.map((quote, index) => <QuoteCard key={quote.id} quote={quote} favorite={favorites.includes(quote.id)} speaking={speakingId === quote.id} delay={Math.min(index, 3)} onCopy={() => copyText(quote.text)} onFavorite={() => toggleFavorite(quote.id)} onListen={() => listen(quote.id, quote.text)} onDownload={() => downloadStory(quote.text, getCreatorBackground(quote.id % creatorBackgrounds.length)?.colors ?? [], `kp-quote-${quote.id}.png`)} onShare={(channel) => share(quote, channel)} />)}
              </div> : <div className="mt-12 text-center"><Sparkles className="mx-auto size-8 text-primary" /><h2 className="mt-3 font-display text-xl">No captions found</h2><p className="mt-1 text-sm text-muted-foreground">Try another keyword or category.</p></div>}
            </section>
          </>
        )}
      </main>

      {tab !== "create" && <Button variant="ink" className="fixed bottom-23 right-4 z-40 h-12 rounded-full px-4 shadow-elevated md:right-[max(1rem,calc((100vw-64rem)/2))]" onClick={() => setActiveTab("create")}><Plus /> Create</Button>}
      <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4" aria-label="Main navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 rounded-2xl border border-glass-border bg-glass px-2 py-2 shadow-elevated backdrop-blur-xl">
          <TabButton active={tab === "home"} label="Home" icon={<Home />} onClick={() => setActiveTab("home")} />
          <TabButton active={tab === "hashtags"} label="Hashtags" icon={<Hash />} onClick={() => setActiveTab("hashtags")} />
          <TabButton active={tab === "saved"} label="Saved" icon={<Heart />} onClick={() => setActiveTab("saved")} />
          <TabButton active={tab === "create"} label="Create" icon={<WandSparkles />} onClick={() => setActiveTab("create")} />
        </div>
      </nav>
      {toast && <div role="status" className="toast-in fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-background shadow-elevated"><Check className="size-3.5" />{toast}</div>}
    </div>
  );
}

function Hashtags({ groups, onCopyAll }: { groups: HashtagGroup[]; onCopyAll: (group: HashtagGroup) => void }) {
  return (
    <section className="rise">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Boost your reach</p><h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-medium"><Hash className="size-5 text-primary" />Trending Hashtags</h1></div>
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">Live <span className="size-1.5 rounded-full bg-primary" /></span>
      </div>
      {groups.length ? <div className="mt-4 grid gap-5 md:grid-cols-2">
        {groups.map((group, index) => (
          <article key={group.name} className="rise overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-glass backdrop-blur-xl" style={{ animationDelay: `${Math.min(index, 3) * 70}ms` }}>
            <div className={cn("flex items-center justify-between gap-3 px-4 py-3 text-story-foreground", group.gradient)}>
              <div className="min-w-0"><h2 className="truncate font-display text-lg font-medium">{group.name}</h2><p className="truncate text-[11px] opacity-80">{group.tagline}</p></div>
              <span className="shrink-0 rounded-full bg-story-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">{group.tags.length} tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-4">
              {group.tags.map((tag) => <span key={tag} className="rounded-full border border-glass-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">{tag}</span>)}
            </div>
            <div className="px-4 pb-4">
              <Button variant="ink" className="w-full rounded-xl" onClick={() => onCopyAll(group)}><Copy /> Copy All Hashtags</Button>
            </div>
          </article>
        ))}
      </div> : <div className="mt-12 text-center"><Sparkles className="mx-auto size-8 text-primary" /><h2 className="mt-3 font-display text-xl">No hashtags found</h2><p className="mt-1 text-sm text-muted-foreground">Try another keyword.</p></div>}
    </section>
  );
}

function QuoteCard({ quote, favorite, speaking, delay, onCopy, onFavorite, onListen, onDownload, onShare }: { quote: Quote; favorite: boolean; speaking: boolean; delay: number; onCopy: () => void; onFavorite: () => void; onListen: () => void; onDownload: () => void; onShare: (channel: "whatsapp" | "instagram") => void }) {
  return <article className="rise" style={{ animationDelay: `${delay * 70}ms` }}>
    <div className={cn("relative min-h-52 overflow-hidden rounded-2xl p-5 text-story-foreground shadow-elevated", quote.gradient)}>
      <div className="relative flex h-full min-h-42 flex-col justify-between"><div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80"><span>{quote.category}</span><span>{quote.views} views</span></div><div><p className={cn("mt-5 text-[24px] font-medium leading-tight", /[\u0900-\u097F]/.test(quote.text) ? "font-hindi" : "font-display")}>“{quote.text}”</p><p className={cn("mt-2 text-sm opacity-80", /[\u0900-\u097F]/.test(quote.translation) && "font-hindi")}>{quote.translation}</p></div></div>
    </div>
    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_repeat(5,2.25rem)] gap-1.5">
      <Button variant="glass" size="sm" className="min-w-0 rounded-full px-2" onClick={onCopy}><Copy /> <span className="hidden min-[350px]:inline">Copy</span></Button>
      <Button variant="glassIcon" size="dock" aria-label="Share on WhatsApp" title="WhatsApp" onClick={() => onShare("whatsapp")}><Share2 /></Button>
      <Button variant="glassIcon" size="dock" aria-label="Share on Instagram" title="Instagram" onClick={() => onShare("instagram")}><Instagram /></Button>
      <Button variant="glassIcon" size="dock" aria-label="Download quote image" title="Download image" onClick={onDownload}><Download /></Button>
      <Button variant="glassIcon" size="dock" aria-label={favorite ? "Remove from favorites" : "Save to favorites"} title="Favorite" onClick={onFavorite}><Heart className={cn(favorite && "fill-primary text-primary")} /></Button>
      <Button variant="glassIcon" size="dock" aria-label={speaking ? "Stop listening" : "Listen to quote"} title="Listen" onClick={onListen}>{speaking ? <Pause /> : <Play />}</Button>
    </div>
  </article>;
}

function Creator({ text, setText, font, setFont, background, setBackground, onDownload }: { text: string; setText: (value: string) => void; font: string; setFont: (value: string) => void; background: number; setBackground: (value: number) => void; onDownload: () => void }) {
  return <section className="rise mx-auto max-w-2xl">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your words, your style</p><h1 className="mt-1 font-display text-3xl font-medium">Quote Creator</h1>
    <div className={cn("mt-5 flex aspect-[9/12] max-h-[480px] items-center justify-center rounded-2xl p-8 text-center text-story-foreground shadow-elevated", getCreatorBackground(background)?.className)}><p className={cn("max-w-md text-[clamp(1.5rem,7vw,2.5rem)] font-semibold leading-tight", font === "Tiro Devanagari Hindi" ? "font-hindi" : font === "Manrope" ? "font-body" : "font-display")}>“{text || "Your quote will appear here."}”</p></div>
    <div className="mt-5 space-y-5 rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl">
      <label className="block"><span className="text-xs font-semibold text-muted-foreground">Your caption</span><textarea value={text} maxLength={180} onChange={(event) => setText(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-xl border border-input bg-background/70 p-3 text-sm outline-none ring-primary transition focus:ring-2" placeholder="Write something unforgettable…" /><span className="mt-1 block text-right text-[10px] text-muted-foreground">{text.length}/180</span></label>
      <div><span className="text-xs font-semibold text-muted-foreground">Font</span><div className="mt-2 grid grid-cols-3 gap-2">{["Fraunces", "Manrope", "Tiro Devanagari Hindi"].map((item) => <Button key={item} variant={font === item ? "ink" : "outline"} size="sm" className={cn("min-w-0 px-2", item === "Tiro Devanagari Hindi" && "font-hindi")} onClick={() => setFont(item)}>{item === "Tiro Devanagari Hindi" ? "हिंदी" : item}</Button>)}</div></div>
      <div><span className="text-xs font-semibold text-muted-foreground">Background</span><div className="mt-2 flex gap-3">{creatorBackgrounds.map((item, index) => <button key={item.name} aria-label={`${item.name} background`} title={item.name} onClick={() => setBackground(index)} className={cn("size-9 rounded-full border-2 ring-offset-2 ring-offset-background transition", item.className, background === index ? "border-foreground ring-2 ring-primary" : "border-background")} />)}</div></div>
      <Button variant="ink" size="lg" className="w-full rounded-xl" disabled={!text.trim()} onClick={onDownload}><Download /> Download Story Image</Button>
    </div>
  </section>;
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return <Button variant="ghost" className={cn("h-12 flex-col gap-0.5 rounded-xl text-[10px]", active ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground")} onClick={onClick}>{icon}{label}</Button>;
}