import { Camera, Copy, Hash, Loader2, RefreshCw, RotateCcw, Share2, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { shuffled, videoCaptions, type AiCaption } from "@/lib/video-captions";
import { getVisitorId } from "@/lib/visitor";
import { globalCategories, type CaptionLanguage } from "@/lib/caption-settings";

type Media = { kind: "photo"; src: string } | { kind: "video"; src: string; frames: Promise<string[]> } | null;

function drawScaled(source: CanvasImageSource, w: number, h: number, max = 640) {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
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

export function PhotoCaption({ onCopy, onWhatsApp, language, category, mode = "media" }: { onCopy: (text: string, message: string) => void; onWhatsApp: (text: string) => void; language: CaptionLanguage; category: string; mode?: "media" | "prompt" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [media, setMedia] = useState<Media>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [captions, setCaptions] = useState<AiCaption[]>([]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = () => {
    abortRef.current?.abort();
    if (media?.kind === "video") URL.revokeObjectURL(media.src);
    setMedia(null); setPrompt(""); setCaptions([]); setNote(""); setMood(""); setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fallback = () => { setCaptions((c) => (c.length ? c : shuffled(videoCaptions))); setNote("AI is busy right now — showing trending picks. Tap Generate Again to retry."); };

  const generate = async () => {
    if (loading || (mode === "media" ? !media : !prompt.trim())) return;
    abortRef.current?.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setNote(""); setLoading(true); setCaptions([]); setMood("");
    try {
      const images = mode === "prompt" ? [] : media?.kind === "video" ? await media.frames : media ? [media.src] : [];
      if (ctrl.signal.aborted) return;
      const res = await fetch("/api/caption", { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images, kind: mode === "prompt" ? "prompt" : media?.kind, prompt, category: globalCategories.find((item) => item === category), language, visitorId: getVisitorId() }) });
      if (!res.ok || !res.body) { const error = await res.json().catch(() => null); setNote(error?.error || "Couldn't generate captions. Please try again."); return; }
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
          if (o.error) { setNote(o.error); return; }
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
        <p className="text-xs font-semibold uppercase text-primary">{mode === "prompt" ? "Your next caption" : "Photo & Video to Caption"}</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-medium"><Sparkles className="size-6 text-primary" />{mode === "prompt" ? "Generate Captions" : "Media AI Captions"}</h1>
      </div>
      {(media || prompt || captions.length > 0 || loading) && <Button size="sm" variant="outline" className="rounded-full" onClick={reset}><RotateCcw /> Reset</Button>}
    </div>
    {mode === "media" && <p className="mt-1 text-sm text-muted-foreground">Photos & videos · {language}</p>}
    {mode === "prompt" && <label className="mt-4 block"><span className="text-xs font-semibold text-muted-foreground">Your prompt</span><textarea aria-label="Caption prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} rows={3} placeholder="A quiet sunset by the sea, feeling grateful…" className="mt-2 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>}

    <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    {mode === "media" && <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="mt-5 flex h-auto aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-glass-border bg-glass p-0 text-center shadow-glass backdrop-blur-xl">
      {media?.kind === "photo" ? <img src={media.src} alt="Your uploaded photo" className="size-full object-cover" />
        : media?.kind === "video" ? <video src={media.src} className="size-full object-cover" muted autoPlay loop playsInline />
        : <><Camera className="size-9 text-primary" /><span className="mt-2 text-sm font-semibold">Tap to upload a photo or video</span><span className="text-xs text-muted-foreground">JPG, PNG, HEIC, MP4, MOV — any length</span></>}
    </Button>}

    <Button variant="ink" className="mt-3 h-12 w-full rounded-xl" disabled={(mode === "prompt" ? !prompt.trim() : !media) || loading} onClick={generate}>
      {loading ? <><Loader2 className="animate-spin" /> {captions.length ? `Writing captions… ${captions.length}` : mode === "prompt" ? "Writing captions…" : media?.kind === "video" ? "Analysing your video…" : "Analysing your photo…"}</> : captions.length ? <><RefreshCw /> Generate Again</> : <><Sparkles /> Generate Captions</>}
    </Button>
    {media && <Button variant="outline" className="mt-2 h-12 w-full rounded-xl" onClick={reset}><Upload /> Upload New Media</Button>}
    {mood && <p className="mt-3 text-center text-sm">Detected mood: <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{mood}</span></p>}
    {note && <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{note}</p>}

    <div className="mt-5 space-y-4">
      {captions.map((c, i) => <article key={c.text + i} className="rise rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl">
        <p dir="auto" className={cn("break-words text-lg font-medium leading-snug", /[\u0900-\u097F]/.test(c.text) ? "font-hindi" : "font-display")}>“{c.text}”</p>
        {c.translation && <p className="mt-1 text-sm text-muted-foreground">{c.translation}</p>}
        <p className="mt-3 text-xs leading-relaxed text-primary">{c.hashtags.join(" ")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button size="sm" variant="glass" className="rounded-full" onClick={() => onCopy(c.text, "Caption copied")}><Copy /> Copy</Button>
          <Button size="sm" variant="glass" className="rounded-full" onClick={() => onCopy(c.hashtags.join(" "), "Hashtags copied")}><Hash /> Tags</Button>
          <Button size="sm" variant="ink" className="rounded-full" onClick={() => onWhatsApp(`${c.text}\n\n${c.hashtags.join(" ")}`)}><Share2 /> WhatsApp</Button>
        </div>
      </article>)}
    </div>
    {captions.length > 0 && !loading && <Button variant="ink" className="mt-5 h-12 w-full rounded-xl" onClick={reset}>{mode === "prompt" ? <RotateCcw /> : <Upload />}{mode === "prompt" ? "New Prompt" : "Upload Another Photo/Video"}</Button>}
  </section>;
}
