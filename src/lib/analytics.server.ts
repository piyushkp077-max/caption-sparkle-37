import { getRequest } from "@tanstack/react-start/server";

export async function logEvent(event: "visit" | "ai", visitorId: string) {
  try {
    const req = getRequest() as Request & { cf?: { city?: string; country?: string } };
    const cf = req?.cf;
    const city = cf?.city ?? req?.headers.get("cf-ipcity") ?? null;
    const country = cf?.country ?? req?.headers.get("cf-ipcountry") ?? null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("app_events").insert({ event, visitor_id: visitorId.slice(0, 64), city, country });
  } catch (e) {
    console.error("logEvent failed", e);
  }
}
