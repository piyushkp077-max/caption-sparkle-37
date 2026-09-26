export type StoryBackground = { name: string; colors: [string, string] };

export const storyBackgrounds: StoryBackground[] = [
  { name: "Aurora", colors: ["#6366f1", "#ec4899"] },
  { name: "Ocean", colors: ["#0ea5e9", "#4f46e5"] },
  { name: "Meadow", colors: ["#10b981", "#0ea5e9"] },
  { name: "Sunset", colors: ["#f43f5e", "#a855f7"] },
  { name: "Ember", colors: ["#f97316", "#dc2626"] },
  { name: "Midnight", colors: ["#0f172a", "#334155"] },
  { name: "Peach", colors: ["#fb923c", "#f472b6"] },
  { name: "Forest", colors: ["#14532d", "#65a30d"] },
  { name: "Royal", colors: ["#1e3a8a", "#7c3aed"] },
  { name: "Gold", colors: ["#a16207", "#facc15"] },
];

export const storyGradientStyle = (colors: string[]) => ({ backgroundImage: `linear-gradient(150deg, ${colors[0]}, ${colors[1]})` });

export function renderStoryCanvas(text: string, colors: string[], font = "Fraunces", subtitle = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) return canvas;
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
  const wrap = (value: string, max: number) => {
    const lines: string[] = [];
    let line = "";
    value.split(" ").forEach((word) => {
      const test = `${line}${word} `;
      if (context.measureText(test).width > max && line) { lines.push(line.trim()); line = `${word} `; } else line = test;
    });
    if (line) lines.push(line.trim());
    return lines;
  };
  context.font = `600 76px "${font}", serif`;
  const lines = wrap(`“${text}”`, 850);
  const lineHeight = 102;
  const startY = 900 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((item, index) => context.fillText(item, 540, startY + index * lineHeight));
  if (subtitle) {
    context.globalAlpha = 0.82;
    context.font = `500 40px Manrope, sans-serif`;
    const sub = wrap(subtitle, 820);
    const subStart = startY + lines.length * lineHeight + 40;
    sub.forEach((item, index) => context.fillText(item, 540, subStart + index * 56));
  }
  context.globalAlpha = 0.78;
  context.font = "500 29px Manrope, sans-serif";
  context.fillText("KP'S CAPTIONS, QUOTES & HASHTAGS", 540, 1770);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** Returns true when shared via the native share sheet, false when it fell back to download. */
export async function shareCanvas(canvas: HTMLCanvasElement, filename: string, text: string) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return true; } catch { return true; }
    }
  }
  downloadCanvas(canvas, filename);
  return false;
}
