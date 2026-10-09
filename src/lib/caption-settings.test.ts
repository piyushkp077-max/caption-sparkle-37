import { describe, expect, test } from "bun:test";
import { captionInput, globalCategories, globalCategoryFor } from "./caption-settings";

describe("caption generation settings", () => {
  test.each(["English", "Hindi", "Hinglish", "Arabic", "Spanish", "French", "German", "Urdu", "Persian", "Turkish", "Hebrew", "Italian"])("accepts %s for a single text prompt", (language) => {
    const result = captionInput.safeParse({ kind: "prompt", prompt: "A sunset by the sea", language });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.language).toBe(language);
  });
  test("text generation requires a nonempty prompt", () => {
    expect(captionInput.safeParse({ kind: "prompt", prompt: " ", language: "English" }).success).toBe(false);
  });
  test("media generation still accepts images and requires them", () => {
    expect(captionInput.safeParse({ kind: "photo", images: ["data:image/jpeg;base64,abc"], language: "Hindi" }).success).toBe(true);
    expect(captionInput.safeParse({ kind: "video", images: [], language: "Hindi" }).success).toBe(false);
  });
  test("all legacy categories map to exactly the four global categories", () => {
    expect(globalCategories).toHaveLength(4);
    expect(globalCategoryFor("Attitude")).toBe("Luxury & Success Attitude");
    expect(globalCategoryFor("Instagram Reels")).toBe("Short & Aesthetic Captions");
    expect(globalCategoryFor("Life")).toBe("Still Quotes");
    expect(captionInput.safeParse({ kind: "prompt", prompt: "Training", language: "English", category: "Gym & Fitness" }).success).toBe(true);
    expect(captionInput.safeParse({ kind: "prompt", prompt: "Training", language: "English", category: "Attitude" }).success).toBe(false);
  });
});