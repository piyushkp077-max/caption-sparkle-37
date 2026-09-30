CREATE TABLE public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  event text NOT NULL,
  city text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_events TO service_role;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX app_events_created_idx ON public.app_events (created_at DESC);
CREATE INDEX app_events_event_idx ON public.app_events (event);