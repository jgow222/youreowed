// ─── Admin Access Control ────────────────────────────────────────────────────
// Only these email addresses can access admin pages (affiliate dashboard, etc.)

const ADMIN_EMAILS = [
  "jcorbitt2005@gmail.com",
];

export function isAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
