import { Download, Instagram, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadCanvas, renderStoryCanvas, shareCanvas, storyBackgrounds, storyGradientStyle } from "@/lib/story-canvas";

const fonts = ["Fraunces", "Manrope", "Tiro Devanagari Hindi"];

export function StoryMaker({ text, translation, id, onClose, notify }: { text: string; translation: string; id: number; onClose: () => void; notify: (message: string) => void }) {
  const isHindi = /[\u0900-\u097F]/.test(text);
  const [bg, setBg] = useState(id % storyBackgrounds.length);
  const [font, setFont] = useState(isHindi ? "Tiro Devanagari Hindi" : "Fraunces");
  const [showSub, setShowSub] = useState(true);
  const colors = storyBackgrounds[bg]!.colors;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const build = () => renderStoryCanvas(text, colors, font, showSub ? translation : "");
  const filename = `kp-story-${id}.png`;
  const share = async (where: string) => {
    const shared = await shareCanvas(build(), filename, text);
    notify(shared ? `Choose ${where} in the share menu` : "Image saved — upload it to your Story/Status");
  };

  return (
    <div className="fixed inset-0 z-[1000000] flex items-end justify-center bg-foreground/50 backdrop-blur-sm sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="Story graphic maker">
      <div className="rise max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-4 shadow-elevated sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">1-Click Story Maker</p><h2 className="font-display text-xl font-medium">Create Image</h2></div>
          <Button variant="glassIcon" size="icon" className="rounded-full" aria-label="Close" onClick={onClose}><X /></Button>
        </div>
        <div className="mx-auto mt-3 flex aspect-[9/16] w-full max-w-[230px] flex-col items-center justify-center rounded-2xl p-5 text-center text-story-foreground shadow-elevated" style={storyGradientStyle(colors)}>
          <p className={cn("text-lg font-semibold leading-snug", font === "Tiro Devanagari Hindi" ? "font-hindi" : font === "Manrope" ? "font-body" : "font-display")}>“{text}”</p>
          {showSub && <p className="mt-2 text-[11px] opacity-80">{translation}</p>}
          <p className="mt-auto text-[7px] font-semibold uppercase tracking-[0.12em] opacity-75">KP's Captions, Quotes & Hashtags</p>
        </div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Background</p>
        <div className="no-scrollbar mt-2 flex gap-2.5 overflow-x-auto pb-1">
          {storyBackgrounds.map((item, index) => <button key={item.name} title={item.name} aria-label={`${item.name} background`} onClick={() => setBg(index)} className={cn("size-9 shrink-0 rounded-full border-2 ring-offset-2 ring-offset-background transition", bg === index ? "border-foreground ring-2 ring-primary" : "border-background")} style={storyGradientStyle(item.colors)} />)}
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">Font</p>
        <div className="mt-2 grid grid-cols-3 gap-2">{fonts.map((item) => <Button key={item} variant={font === item ? "ink" : "outline"} size="sm" className={cn("min-w-0 px-2", item === "Tiro Devanagari Hindi" && "font-hindi")} onClick={() => setFont(item)}>{item === "Tiro Devanagari Hindi" ? "हिंदी" : item}</Button>)}</div>
        <label className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground"><input type="checkbox" checked={showSub} onChange={(event) => setShowSub(event.target.checked)} className="accent-primary" /> Show translation line</label>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="ink" className="rounded-xl" onClick={() => share("Instagram")}><Instagram /> Insta Story</Button>
          <Button variant="ink" className="rounded-xl" onClick={() => share("WhatsApp")}><Share2 /> WA Status</Button>
          <Button variant="outline" className="col-span-2 rounded-xl" onClick={() => { downloadCanvas(build(), filename); notify("Story image downloaded"); }}><Download /> Download Image</Button>
        </div>
      </div>
    </div>
  );
}
