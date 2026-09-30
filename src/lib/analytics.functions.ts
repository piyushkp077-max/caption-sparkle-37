import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ visitorId: z.string().min(8).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { logEvent } = await import("./analytics.server");
    await logEvent("visit", data.visitorId);
    return { ok: true };
  });
