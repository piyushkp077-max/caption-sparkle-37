import { z } from "zod";

export const globalCategories = ["Short & Aesthetic Captions", "Luxury & Success Attitude", "Gym & Fitness", "Still Quotes"] as const;
export const captionLanguages = ["English", "Hindi", "Hinglish", "Arabic", "Spanish", "French", "German", "Urdu", "Persian", "Turkish", "Hebrew", "Portuguese", "Italian", "Dutch", "Polish", "Russian", "Greek", "Swedish", "Danish", "Norwegian", "Romanian"] as const;
export type CaptionLanguage = (typeof captionLanguages)[number];
export type GlobalCategory = (typeof globalCategories)[number];
export const captionInput = z.object({
  images: z.array(z.string().startsWith("data:image/").max(3_000_000)).max(4).default([]),
  kind: z.enum(["photo", "video", "prompt"]),
  language: z.enum(captionLanguages),
  category: z.enum(globalCategories).optional(),
  prompt: z.string().trim().max(2000).default(""),
  visitorId: z.string().max(64).optional(),
}).refine((data) => data.kind === "prompt" ? data.prompt.length > 0 : data.images.length > 0, { message: "Add a prompt or media." });

export function globalCategoryFor(category: string): GlobalCategory {
  if (category === "Attitude" || category === "Motivation") return globalCategories[1];
  if (category === "Instagram Reels" || category === "Romantic" || category === "Friends") return globalCategories[0];
  return globalCategories[3];
}