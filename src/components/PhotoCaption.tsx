import { Camera, Copy, Hash, Loader2, RefreshCw, Share2, Sparkles, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captionFromPhoto, type AiCaption } from "@/lib/caption-ai.functions";
import { shuffled, videoCaptions } from "@/lib/video-captions";

const languages = ["Hinglish", "Hindi", "English"] as const;

function drawScaled(source: CanvasImageSource, w: number, h: number) {
  const scale = Math.min(1, 768 / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { resolve(drawScaled(img, img.width, img.height)); URL.revokeObjectURL(img.src); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function videoFrames(url: string): Promise<string[]> {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
  await new Promise<void>((res, rej) => { v.onloadeddata = () => res(); v.onerror = () => rej(new Error("video")); });
  const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 1;
  const frames: string[] = [];
  for (const t of [0.15, 0.45, 0.8]) {
    await new Promise<void>((res) => { v.onseeked = () => res(); v.currentTime = Math.min(d - 0.05, d * t); });
    frames.push(drawScaled(v, v.videoWidth, v.videoHeight));
  }
  return frames;
}

export function PhotoCaption({ onCopy, onWhatsApp }: { onCopy: (text: string, message: string) => void; onWhatsApp: (text: string) => void }) {
  const run = useServerFn(captionFromPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [language, setLanguage] = useState<(typeof languages)[number]>("Hinglish");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [captions, setCaptions] = useState<AiCaption[]>([]);

  const reset = () => {
    if (video) URL.revokeObjectURL(video);
    setImage(""); setVideo(""); setCaptions([]); setNote(""); setMood(""); setLoading(false);
  };

  const fallback = () => { setCaptions(shuffled(videoCaptions)); setMood(""); setNote("AI is busy right now — here are trending picks. Tap Generate Again to retry."); };

  const generate = async () => {
    if (loading || (!image && !video)) return;
    setNote(""); setLoading(true); setCaptions([]); setMood("");
    try {
      const images = video ? await videoFrames(video) : [image];
      const result = await run({ data: { images, kind: video ? "video" : "photo", language } });
      if ("error" in result) fallback();
      else { setCaptions(result.captions); setMood(result.mood); }
    } catch { fallback(); }
    finally { setLoading(false); }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    reset();
    if (file.type.startsWith("video/")) setVideo(URL.createObjectURL(file));
    else setImage(await resize(file));
  };

  const hasMedia = Boolean(image || video);

  return <section className="rise mx-auto max-w-2xl">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Photo & Video to Caption</p>
    <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-medium"><Sparkles className="size-6 text-primary" /> AI Captions</h1>
    <p className="mt-1 text-sm text-muted-foreground">Upload photos or videos as many times as you like — unlimited, mood-matched captions & hashtags.</p>

    <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-glass-border bg-glass text-center shadow-glass backdrop-blur-xl">
      {image ? <img src={image} alt="Your uploaded photo" className="size-full object-cover" />
        : video ? <video src={video} className="size-full object-cover" muted autoPlay loop playsInline />
        : <><Camera className="size-9 text-primary" /><span className="mt-2 text-sm font-semibold">Tap to upload a photo or video</span><span className="text-xs text-muted-foreground">JPG, PNG, MP4, MOV</span></>}
    </button>

    <div className="mt-4 grid grid-cols-3 gap-2">{languages.map((item) => <Button key={item} size="sm" variant={language === item ? "ink" : "outline"} onClick={() => setLanguage(item)}>{item}</Button>)}</div>
    <Button variant="ink" className="mt-3 h-12 w-full rounded-xl" disabled={!hasMedia || loading} onClick={generate}>
      {loading ? <><Loader2 className="animate-spin" /> {video ? "Analysing your video…" : "Analysing your photo…"}</> : captions.length ? <><RefreshCw /> Generate Again</> : <><Sparkles /> Generate Captions</>}
    </Button>
    {hasMedia && <Button variant="outline" className="mt-2 h-12 w-full rounded-xl" onClick={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Upload /> Upload New Media</Button>}
    {mood && <p className="mt-3 text-center text-sm">Detected mood: <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{mood}</span></p>}
    {note && <p className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{note}</p>}

    <div className="mt-5 space-y-4">
      {captions.map((c, i) => <article key={c.text + i} className="rise rounded-2xl border border-glass-border bg-glass p-4 shadow-glass backdrop-blur-xl" style={{ animationDelay: `${i * 60}ms` }}>
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
    {captions.length > 0 && <Button variant="ink" className="mt-5 h-12 w-full rounded-xl" onClick={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Upload /> Upload Another Photo/Video</Button>}
  </section>;
}
