<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin analytics: app_events table (service-role only, RLS no policies) written via server fns; /admin gated by ADMIN_PASSWORD + encrypted session cookie. Why: no user accounts, keep data private.
- Caption settings share one language/category validation module across the header and caption endpoint; prompt and media use the same streaming generator to keep language behavior consistent.
- Retain legacy quote IDs and favorite storage keys when regrouping home content so existing saved captions remain accessible; new fitness entries use a separate ID range.
