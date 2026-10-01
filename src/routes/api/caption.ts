import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Input = z.object({
  images: z.array(z.string().startsWith("data:image/").max(3_000_000)).min(1).max(4),
  kind: z.enum(["photo", "video"]),
  language: z.enum(["Hindi", "English", "Hinglish"]),
  visitorId: z.string().max(64).optional(),
});

const fail = (error: string, status: number) => Response.json({ error }, { status });

// Streams NDJSON: first {"mood":""}, then one {"text","translation","hashtags"} per line as the AI writes them.
export const Route = createFileRoute("/api/caption")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Input.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("Invalid upload.", 400);
        const data = parsed.data;
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return fail("AI is not configured yet.", 500);
        const { logEvent } = await import("@/lib/analytics.server");
        void logEvent("ai", data.visitorId || "unknown", request);

        const what = data.kind === "video" ? `these ${data.images.length} frames from one video (treat them as one reel)` : "this photo";
        const prompt = `Deeply analyse ${what}: people, expressions, setting, light, colours, action and story. Pick the single dominant mood from: Emotional, Attitude, Sad, Aesthetic, Cinematic, Funny, Motivational, Royal, Romantic, Friendship.
Write 9 highly attractive, meaningful Instagram ${data.kind === "video" ? "Reel" : "post"} captions in ${data.language} tailored to that mood and to specific details you see. Every caption unique in angle and wording — no templates, no repeated openings. Max 22 words, tasteful emojis allowed. Each gets an English companion line (empty if already English) and 6-8 relevant trending hashtags.
Output format — JSON Lines ONLY, no markdown, one object per line:
line 1: {"mood":"..."}
lines 2-10: {"text":"...","translation":"...","hashtags":["#a"]}`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            input: [{ role: "user", content: [{ type: "input_text", text: prompt }, ...data.images.map((image_url) => ({ type: "input_image", image_url, detail: "low" }))] }],
          }),
        });
        if (!upstream.ok || !upstream.body) {
          const msg = upstream.status === 429 ? "Too many requests — try again in a minute." : upstream.status === 402 ? "AI credits are used up for now." : "The AI couldn't process this media.";
          return fail(msg, upstream.status === 429 || upstream.status === 402 || upstream.status === 403 ? upstream.status : 502);
        }

        const enc = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (o: unknown) => controller.enqueue(enc.encode(JSON.stringify(o) + "\n"));
            const reader = upstream.body!.getReader();
            const dec = new TextDecoder();
            let sse = "", text = "";
            const flush = (final: boolean) => {
              const lines = text.split("\n");
              text = final ? "" : lines.pop() ?? "";
              for (const raw of lines) {
                const m = raw.match(/\{.*\}/);
                if (!m) continue;
                try {
                  const o = JSON.parse(m[0]);
                  if (typeof o.mood === "string") send({ mood: o.mood });
                  else if (o.text) send({ text: String(o.text), translation: String(o.translation ?? ""), hashtags: (o.hashtags ?? []).map(String).slice(0, 8) });
                } catch { /* skip malformed line */ }
              }
            };
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                sse += dec.decode(value, { stream: true });
                const events = sse.split("\n");
                sse = events.pop() ?? "";
                for (const ev of events) {
                  if (!ev.startsWith("data:")) continue;
                  const payload = ev.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const e = JSON.parse(payload);
                    if (e.type === "response.output_text.delta") { text += e.delta; flush(false); }
                    else if (e.type === "response.refusal.delta" || e.type === "error") { send({ error: "The AI couldn't write captions for this media." }); controller.close(); return; }
                  } catch { /* partial */ }
                }
              }
              flush(true);
            } catch { send({ error: "Connection interrupted." }); }
            controller.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
      },
    },
  },
});
