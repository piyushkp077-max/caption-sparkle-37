import { Camera, Copy, Hash, Loader2, RefreshCw, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captionFromPhoto, type AiCaption } from "@/lib/caption-ai.functions";
import { shuffled, videoCaptions } from "@/lib/video-captions";

const languages = ["Hinglish", "Hindi", "English"] as const;

function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function PhotoCaption({ onCopy, onWhatsApp }: { onCopy: (text: string, message: string) => void; onWhatsApp: (text: string) => void }) {
  const run = useServerFn(captionFromPhoto);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [language, setLanguage] = useState<(typeof languages)[number]>("Hinglish");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [captions, setCaptions] = useState<AiCaption[]>([]);

  const generate = async () => {
    if (loading) return;
    setNote("");
    if (video) { setCaptions(shuffled(videoCaptions)); return; }
    if (!image) return;
    setLoading(true); setCaptions([]);
    try {
      const result = await run({ data: { image, language } });
      if ("error" in result) { setCaptions(shuffled(videoCaptions).slice(0, 4)); setNote("Showing our trending picks for now."); }
      else setCaptions(result.captions);
    } catch { setCaptions(shuffled(videoCaptions).slice(0, 4)); setNote("Showing our trending picks for now."); }
    finally { setLoading(false); }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setCaptions([]); setNote("");
    if (file.type.startsWith("video/")) {
      if (video) URL.revokeObjectURL(video);
      setImage(""); setVideo(URL.createObjectURL(file));
      setCaptions(shuffled(videoCaptions));
    } else {
      if (video) URL.revokeObjectURL(video);
      setVideo(""); setImage(await resize(file));
    }
  };

  const hasMedia = Boolean(image || video);

  return <section className="rise mx-auto max-w-2xl">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Photo & Video to Caption</p>
    <h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-medium"><Sparkles className="size-6 text-primary" /> AI Captions</h1>
    <p className="mt-1 text-sm text-muted-foreground">Upload a photo or video as many times as you like — unlimited captions & hashtags, free.</p>

    <label className="mt-5 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-glass-border bg-glass text-center shadow-glass backdrop-blur-xl">
      {image ? <img src={image} alt="Your uploaded photo" className="size-full object-cover" />
        : video ? <video src={video} className="size-full object-cover" muted autoPlay loop playsInline />
        : <><Camera className="size-9 text-primary" /><span className="mt-2 text-sm font-semibold">Tap to upload a photo or video</span><span className="text-xs text-muted-foreground">JPG, PNG, MP4, MOV</span></>}
      <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    </label>

    {!video && <div className="mt-4 grid grid-cols-3 gap-2">{languages.map((item) => <Button key={item} size="sm" variant={language === item ? "ink" : "outline"} onClick={() => setLanguage(item)}>{item}</Button>)}</div>}
    <Button variant="ink" className="mt-3 h-12 w-full rounded-xl" disabled={!hasMedia || loading} onClick={generate}>
      {loading ? <><Loader2 className="animate-spin" /> Reading your photo…</> : captions.length ? <><RefreshCw /> Generate Again</> : <><Sparkles /> {video ? "Generate 8 Video Captions" : "Generate Captions"}</>}
    </Button>
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
  </section>;
}
