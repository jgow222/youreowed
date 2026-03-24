// Automated Reminder Emails for YoureOwed
// POST or GET /api/send-nudges

module.exports = async function handler(req, res) {
  try {
    // Dynamic imports to prevent top-level crashes
    const { Resend } = require("resend");
    const { createClient } = require("@supabase/supabase-js");

    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!resendKey || !supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        success: false,
        error: "Missing env vars",
        has: { resend: !!resendKey, url: !!supabaseUrl, key: !!supabaseKey },
      });
    }

    const resend = new Resend(resendKey);
    const supabase = createClient(supabaseUrl, supabaseKey);
    const SITE = "https://youreowed.org";
    const FROM = "YoureOwed <hello@youreowed.org>";
    const sent = { no_scan: 0, abandoned: 0, no_pay: 0, errors: 0, skipped: 0 };

    // Get all user profiles
    const { data: profiles, error: pErr } = await supabase
      .from("user_profiles")
      .select("id, email, name, subscription_tier, created_at")
      .not("email", "is", null);

    if (pErr || !profiles || profiles.length === 0) {
      return res.status(200).json({ success: true, message: "No profiles", sent, error: pErr?.message });
    }

    for (const p of profiles) {
      if (!p.email) { sent.skipped++; continue; }

      const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
      if (days < 1) { sent.skipped++; continue; }

      // Check activity (table may not exist)
      let events = new Set();
      try {
        const { data: acts } = await supabase
          .from("user_activity")
          .select("event_type")
          .eq("user_id", p.id);
        events = new Set((acts || []).map(a => a.event_type));
      } catch (e) { /* table doesn't exist */ }

      // Check if already emailed (table may not exist)
      async function alreadySent(type) {
        try {
          const { data } = await supabase
            .from("email_nudges_sent")
            .select("id")
            .eq("user_id", p.id)
            .eq("nudge_type", type)
            .limit(1);
          return data && data.length > 0;
        } catch (e) { return false; }
      }

      async function recordSent(type) {
        try {
          await supabase.from("email_nudges_sent").insert({
            user_id: p.id, email: p.email, nudge_type: type,
          });
        } catch (e) { /* ignore */ }
      }

      const firstName = (p.name || "").split(" ")[0] || "there";

      try {
        // 1. No scan — never started or completed
        if (!events.has("completed_screener") && !events.has("started_screener")) {
          if (!(await alreadySent("no_scan"))) {
            await resend.emails.send({
              from: FROM, to: p.email,
              subject: "You signed up but haven't checked your benefits yet",
              html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You created your account but haven't run your benefits screening yet. The average household qualifies for <strong>$5,000–$50,000+ per year</strong> in benefits they never claim.</p><p style="font-size:15px;line-height:1.6;color:#444">It takes <strong>less than 2 minutes</strong> and we check 415+ programs.</p><div style="text-align:center;margin:32px 0"><a href="${SITE}/#/screener" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Check What You're Owed →</a></div><p style="font-size:11px;color:#aaa">You're receiving this because you signed up at YoureOwed.</p></div>`,
            });
            await recordSent("no_scan");
            sent.no_scan++;
          }
        }

        // 2. Abandoned — started but never completed
        if (events.has("started_screener") && !events.has("completed_screener")) {
          if (!(await alreadySent("abandoned"))) {
            await resend.emails.send({
              from: FROM, to: p.email,
              subject: "You were almost done — pick up where you left off",
              html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You started your benefits screening but didn't finish. Just a few more questions and we'll show you every program you may qualify for.</p><div style="text-align:center;margin:32px 0"><a href="${SITE}/#/screener" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Finish My Screening →</a></div><p style="font-size:11px;color:#aaa">You're receiving this because you started a screening at YoureOwed.</p></div>`,
            });
            await recordSent("abandoned");
            sent.abandoned++;
          }
        }

        // 3. No pay — completed but still free, 2+ days
        if (days >= 2 && events.has("completed_screener") && p.subscription_tier === "free") {
          if (!(await alreadySent("no_pay"))) {
            await resend.emails.send({
              from: FROM, to: p.email,
              subject: "You found benefits — unlock your full results for $4.99/mo",
              html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You completed your screening and we found programs you may qualify for. For just <strong>$4.99/month</strong>, unlock all 415+ program details with dollar estimates.</p><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0;text-align:center"><p style="font-size:13px;color:#166534;margin:0">Most users find <strong>$5,000–$50,000+/year</strong> in benefits.</p></div><div style="text-align:center;margin:32px 0"><a href="${SITE}/#/pricing" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Unlock My Results — $4.99/mo →</a></div><p style="font-size:11px;color:#aaa">You're receiving this because you completed a screening at YoureOwed.</p></div>`,
            });
            await recordSent("no_pay");
            sent.no_pay++;
          }
        }
      } catch (emailErr) {
        sent.errors++;
      }
    }

    return res.status(200).json({ success: true, sent });
  } catch (err) {
    return res.status(200).json({ success: false, error: String(err), stack: err.stack });
  }
};
