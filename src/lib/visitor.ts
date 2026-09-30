export function getVisitorId(): string {
  try {
    let id = localStorage.getItem("cc-visitor");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("cc-visitor", id); }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2, 12);
  }
}
