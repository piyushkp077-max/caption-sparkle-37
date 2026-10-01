import { Camera, Copy, Hash, Loader2, RefreshCw, RotateCcw, Share2, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shuffled, videoCaptions, type AiCaption } from "@/lib/video-captions";
import { getVisitorId } from "@/lib/visitor";

const languages = ["Hinglish", "Hindi", "English"] as const;
type Media = { kind: "photo"; src: string } | { kind: "video"; src: string; frames: Promise<string[]> } | null;

function drawScaled(source: CanvasImageSource, w: number, h: number, max = 640) {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.75);
}

function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { resolve(drawScaled(img, img.width, img.height)); URL.revokeObjectURL(img.src); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Grabs 3 small frames without decoding the whole file — works for any length or format the browser can play.
async function videoFrames(url: string): Promise<string[]> {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "metadata"; v.src = url;
  await new Promise<void>((res, rej) => { v.onloadedmetadata = () => res(); v.onerror = () => rej(new Error("video")); });
  const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 1;
  const frames: string[] = [];
  for (const t of [0.15, 0.5, 0.85]) {
    await new Promise<void>((res) => { v.onseeked = () => res(); v.currentTime = Math.min(d - 0.05, d * t); });
    frames.push(drawScaled(v, v.videoWidth, v.videoHeight, 512));
  }
  v.removeAttribute("src"); v.load();
  return frames;
}

export function PhotoCaption({ onCopy, onWhatsApp }: { onCopy: (text: string, message: string) => void; onWhatsApp: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [media, setMedia] = useState<Media>(null);
  const [language, setLanguage] = useState<(typeof languages)[number]>("Hinglish");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [captions, setCaptions] = useState<AiCaption[]>([]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = () => {
    abortRef.current?.abort();
    if (media?.kind === "video") URL.revokeObjectURL(media.src);
    setMedia(null); setCaptions([]); setNote(""); setMood(""); setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fallback = () => { setCaptions((c) => (c.length ? c : shuffled(videoCaptions))); setNote("AI is busy right now — showing trending picks. Tap Generate Again to retry."); };

  const generate = async () => {
    if (loading || !media) return;
    abortRef.current?.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setNote(""); setLoading(true); setCaptions([]); setMood("");
    try {
      const images = media.kind === "video" ? await media.frames : [media.src];
      const res = await fetch("/api/caption", { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images, kind: media.kind, language, visitorId: getVisitorId() }) });
      if (!res.ok || !res.body) return fallback();
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const o = JSON.parse(line);
          if (o.error) return fallback();
          if (o.mood) setMood(o.mood);
          else if (o.text) { got++; setCaptions((c) => [...c, o]); }
        }
      }
      if (!got) fallback();
    } catch (e) {
      if (!ctrl.signal.aborted) fallback();
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    reset();
    if (file.type.startsWith("video/")) {
      const src = URL.createObjectURL(file);
      const frames = videoFrames(src); frames.catch(() => {}); // start extracting in the background right away
      setMedia({ kind: "video", src, frames });
    } else setMedia({ kind: "photo", src: await resize(file) });
  };

  return <section className="rise mx-auto max-w-2xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Photo & Video to Caption</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-medium"><Sparkles className="size-6 text-primary" /> AI Captions</h1>
      </div>
      {media && <Button size="sm" variant="outline" className="rounded-full" onClick={reset}><RotateCcw /> Reset</Button>}
    </div>
    <p className="mt-1 text-sm text-muted-foreground">Upload photos or videos of any length, as often as you like — captions appear live as the AI writes them.</p>

    <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-glass-border bg-glass text-center shadow-glass backdrop-blur-xl">
      {media?.kind === "photo" ? <img src={media.src} alt="Your uploaded photo" className="size-full object-cover" />
        : media?.kind === "video" ? <video src={media.src} className="size-full object-cover" muted autoPlay loop playsInline />
        : <><Camera className="size-9 text-primary" /><span className="mt-2 text-sm font-semibold">Tap to upload a photo or video</span><span className="text-xs text-muted-foreground">JPG, PNG, HEIC, MP4, MOV — any length</span></>}
    </button>

    <div className="mt-4 grid grid-cols-3 gap-2">{languages.map((item) => <Button key={item} size="sm" variant={language === item ? "ink" : "outline"} onClick={() => setLanguage(item)}>{item}</Button>)}</div>
    <Button variant="ink" className="mt-3 h-12 w-full rounded-xl" disabled={!media || loading} onClick={generate}>
      {loading ? <><Loader2 className="animate-spin" /> {captions.length ? `Writing captions… ${captions.length}` : media?.kind === "video" ? "Analysing your video…" : "Analysing your photo…"}</> : captions.length ? <><RefreshCw /> Generate Again</> : <><Sparkles /> Generate Captions</>}
    </Button>
    {media && <Button variant="outline" className="mt-2 h-12 w-full rounded-xl" onClick={reset}><Upload /> Upload New Media</Button>}
    {mood && <p className="mt-3 text-center text-sm">Detected mood: <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{mood}</span></p>}
    {note && <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{note}</p>}

    <div className="mt-5 space-y-4">
      {captions.map((c, i) => <article key={c.text + i} className="rise rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl">
        <p className={cn("text-lg font-medium leading-snug", /[\u0900-\u097F]/.test(c.text) ? "font-hindi" : "font-display")}>“{c.text}”</p>
        {c.translation && <p className="mt-1 text-sm text-muted-foreground">{c.translation}</p>}
        <p className="mt-3 text-xs leading-relaxed text-primary">{c.hashtags.join(" ")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button size="sm" variant="glass" className="rounded-full" onClick={() => onCopy(c.text, "Caption copied")}><Copy /> Copy</Button>
          <Button size="sm" variant="glass" className="rounded-full" onClick={() => onCopy(c.hashtags.join(" "), "Hashtags copied")}><Hash /> Tags</Button>
          <Button size="sm" variant="ink" className="rounded-full" onClick={() => onWhatsApp(`${c.text}\n\n${c.hashtags.join(" ")}`)}><Share2 /> WhatsApp</Button>
        </div>
      </article>)}
    </div>
    {captions.length > 0 && !loading && <Button variant="ink" className="mt-5 h-12 w-full rounded-xl" onClick={reset}><Upload /> Upload Another Photo/Video</Button>}
  </section>;
}
