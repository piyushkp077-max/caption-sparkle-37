import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AiCaption = { text: string; translation: string; hashtags: string[] };

const Input = z.object({
  images: z.array(z.string().startsWith("data:image/").max(3_000_000)).min(1).max(4),
  kind: z.enum(["photo", "video"]),
  language: z.enum(["Hindi", "English", "Hinglish"]),
});

export const captionFromPhoto = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }): Promise<{ mood: string; captions: AiCaption[] } | { error: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured yet." };
    const what = data.kind === "video" ? `these ${data.images.length} frames taken from one video (treat them as a single reel)` : "this photo";
    const prompt = `Deeply analyse ${what}: people, expressions, setting, lighting, colours, action and overall story. Decide the single dominant mood from: Emotional, Attitude, Sad, Aesthetic, Cinematic, Funny, Motivational, Royal, Romantic, Friendship.
Then write 9 highly attractive, deeply meaningful Instagram ${data.kind === "video" ? "Reel" : "post"} captions in ${data.language} tailored exactly to that mood and to specific details you see.
Rules: every caption must be unique in structure, angle and wording — no templates, no repeated openings, no generic filler. Mix punchy one-liners, poetic lines and clever wordplay. Max 22 words each, tasteful emojis allowed.
For each caption give an English translation/companion line (empty string if caption is already English) and 6-8 highly relevant trending hashtags (with #).
Reply ONLY with JSON: {"mood":"","captions":[{"text":"","translation":"","hashtags":["#a"]}]}`;
    const content = [{ type: "input_text", text: prompt }, ...data.images.map((image_url) => ({ type: "input_image", image_url }))];
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [{ role: "user", content }],
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Too many requests — please try again in a minute." };
      if (res.status === 402) return { error: "AI credits are used up for now. Please try later." };
      if (res.status === 403) return { error: "The AI couldn't process this media." };
      return { error: `AI request failed (${res.status}).` };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta") text += evt.delta;
          if (evt.type === "response.refusal.delta" || evt.type === "error") return { error: "The AI couldn't write captions for this media." };
        } catch { /* partial */ }
      }
    }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: "The AI didn't return captions. Try again." };
    try {
      const parsed = JSON.parse(match[0]) as { mood?: string; captions?: AiCaption[] };
      const captions = (parsed.captions ?? []).slice(0, 10).map((c) => ({ text: String(c.text ?? ""), translation: String(c.translation ?? ""), hashtags: (c.hashtags ?? []).map(String).slice(0, 8) })).filter((c) => c.text);
      return captions.length ? { mood: String(parsed.mood ?? ""), captions } : { error: "No captions generated. Try again." };
    } catch {
      return { error: "Couldn't read the AI reply. Try again." };
    }
  });
