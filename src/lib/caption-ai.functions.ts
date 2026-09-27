import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AiCaption = { text: string; translation: string; hashtags: string[] };

const Input = z.object({
  image: z.string().startsWith("data:image/").max(4_000_000),
  language: z.enum(["Hindi", "English", "Hinglish"]),
});

export const captionFromPhoto = createServerFn({ method: "POST" })
  .inputValidator((data) => Input.parse(data))
  .handler(async ({ data }): Promise<{ captions: AiCaption[] } | { error: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured yet." };
    const prompt = `Look at this photo and write 3 different trendy, viral Instagram captions in ${data.language} that match its mood and content. Each caption max 20 words. For each give an English translation/companion line and 8-12 relevant trending hashtags (with #). Reply ONLY with JSON: {"captions":[{"text":"","translation":"","hashtags":["#a"]}]}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: data.image }] }],
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Too many requests — please try again in a minute." };
      if (res.status === 402) return { error: "AI credits are used up for now. Please try later." };
      if (res.status === 403) return { error: "The AI couldn't process this photo." };
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
          if (evt.type === "response.refusal.delta" || evt.type === "error") return { error: "The AI couldn't write captions for this photo." };
        } catch { /* partial */ }
      }
    }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: "The AI didn't return captions. Try another photo." };
    try {
      const parsed = JSON.parse(match[0]) as { captions?: AiCaption[] };
      const captions = (parsed.captions ?? []).slice(0, 3).map((c) => ({ text: String(c.text ?? ""), translation: String(c.translation ?? ""), hashtags: (c.hashtags ?? []).map(String) }));
      return captions.length ? { captions } : { error: "No captions generated. Try again." };
    } catch {
      return { error: "Couldn't read the AI reply. Try again." };
    }
  });
