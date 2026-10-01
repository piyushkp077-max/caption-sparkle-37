import { getRequest } from "@tanstack/react-start/server";

type CfRequest = Request & { cf?: { city?: string; country?: string } };

export async function logEvent(event: "visit" | "ai", visitorId: string, request?: Request) {
  try {
    const req = (request ?? getRequest()) as CfRequest;
    const city = req?.cf?.city ?? req?.headers.get("cf-ipcity") ?? null;
    const country = req?.cf?.country ?? req?.headers.get("cf-ipcountry") ?? null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("app_events").insert({ event, visitor_id: visitorId.slice(0, 64), city, country });
  } catch (e) {
    console.error("logEvent failed", e);
  }
}
