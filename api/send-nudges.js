// ─── Automated Reminder Emails ──────────────────────────────────────────────
// Sends reminder emails to users who signed up but haven't scanned,
// abandoned the screener, or scanned but haven't paid.
//
// POST /api/send-nudges
// Deployed at: youreowed.org/api/send-nudges

let Resend, createClient;
try {
  Resend = require("resend").Resend;
  createClient = require("@supabase/supabase-js").createClient;
} catch (e) {
  // Modules not available
}

const resendKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const FROM_EMAIL = "YoureOwed <hello@youreowed.org>";
const SITE_URL = "https://youreowed.org";

// ─── Email Templates ────────────────────────────────────────────────────────

function noScanEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You signed up but haven't checked your benefits yet",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a"><div style="padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You created your account but haven't run your benefits screening yet. The average household qualifies for <strong>$5,000–$50,000+ per year</strong> in government benefits they never claim.</p><p style="font-size:15px;line-height:1.6;color:#444">It takes <strong>less than 2 minutes</strong> and we check 415+ federal and state programs.</p><div style="text-align:center;margin:32px 0"><a href="${SITE_URL}/#/screener" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Check What You're Owed →</a></div><hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:11px;color:#aaa">You're receiving this because you signed up at YoureOwed. <a href="${SITE_URL}" style="color:#aaa">youreowed.org</a></p></div></div>`,
  };
}

function abandonedEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You were almost done — pick up where you left off",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a"><div style="padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You started your benefits screening but didn't finish. Just a few more questions and we'll show you every program you may qualify for.</p><div style="text-align:center;margin:32px 0"><a href="${SITE_URL}/#/screener" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Finish My Screening →</a></div><hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:11px;color:#aaa">You're receiving this because you started a screening at YoureOwed. <a href="${SITE_URL}" style="color:#aaa">youreowed.org</a></p></div></div>`,
  };
}

function noPayEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You found benefits — unlock your full results for $4.99/mo",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a"><div style="padding:32px 24px"><div style="background:#171614;border-radius:12px;padding:24px;margin-bottom:24px"><span style="color:#00E676;font-weight:900;font-size:20px">YoureOwed</span></div><h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Hey ${firstName},</h1><p style="font-size:15px;line-height:1.6;color:#444">You completed your screening and we found programs you may qualify for. For just <strong>$4.99/month</strong>, unlock all 415+ program details with dollar estimates and application guides.</p><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:24px 0;text-align:center"><p style="font-size:13px;color:#166534;margin:0">Most users find <strong>$5,000–$50,000+/year</strong> in benefits.<br/>That's up to <strong>$10,000 for every $1</strong> you spend on YoureOwed.</p></div><div style="text-align:center;margin:32px 0"><a href="${SITE_URL}/#/pricing" style="background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">Unlock My Results — $4.99/mo →</a></div><hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:11px;color:#aaa">You're receiving this because you completed a screening at YoureOwed. <a href="${SITE_URL}" style="color:#aaa">youreowed.org</a></p></div></div>`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function tableExists(supabase, tableName) {
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1);
    return !error || !error.message.includes("does not exist");
  } catch {
    return false;
  }
}

async function hasBeenEmailed(supabase, userId, nudgeType) {
  try {
    const { data } = await supabase
      .from("email_nudges_sent")
      .select("id")
      .eq("user_id", userId)
      .eq("nudge_type", nudgeType)
      .limit(1);
    return data && data.length > 0;
  } catch {
    return false; // If table doesn't exist, assume not emailed
  }
}

async function recordEmailSent(supabase, userId, email, nudgeType) {
  try {
    await supabase.from("email_nudges_sent").insert({
      user_id: userId,
      email,
      nudge_type: nudgeType,
    });
  } catch {
    // Silently fail — don't block sending
  }
}

// ─── Main Handler ───────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Allow both GET and POST for easier testing
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check env vars
  if (!Resend || !createClient || !resendKey || !supabaseUrl || !supabaseKey) {
    return res.status(200).json({
      success: false,
      error: "Missing dependencies or env vars",
      missing: {
        Resend: !Resend,
        createClient: !createClient,
        RESEND_API_KEY: !resendKey,
        VITE_SUPABASE_URL: !supabaseUrl,
        SUPABASE_SERVICE_KEY: !supabaseKey,
      },
    });
  }

  let resend, supabase;
  try {
    resend = new Resend(resendKey);
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (initErr) {
    return res.status(200).json({ success: false, error: "Client init failed: " + String(initErr) });
  }
  const sent = { no_scan: 0, abandoned: 0, no_pay: 0, errors: 0, skipped: 0 };

  try {
    // Check if required tables exist
    const hasProfiles = await tableExists(supabase, "user_profiles");
    if (!hasProfiles) {
      return res.status(200).json({ success: true, message: "No user_profiles table yet", sent });
    }

    const hasActivity = await tableExists(supabase, "user_activity");
    const hasNudgeLog = await tableExists(supabase, "email_nudges_sent");

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, email, name, subscription_tier, created_at")
      .not("email", "is", null);

    if (profilesError || !profiles || profiles.length === 0) {
      return res.status(200).json({ success: true, message: "No profiles found", sent, error: profilesError?.message });
    }

    for (const profile of profiles) {
      if (!profile.email) continue;

      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip if signed up less than 1 day ago
      if (daysSinceSignup < 1) { sent.skipped++; continue; }

      // Get user activity (if table exists)
      let events = new Set();
      if (hasActivity) {
        const { data: activities } = await supabase
          .from("user_activity")
          .select("event_type")
          .eq("user_id", profile.id);
        events = new Set((activities || []).map(a => a.event_type));
      }

      const hasStarted = events.has("started_screener");
      const hasCompleted = events.has("completed_screener");
      const isPaid = profile.subscription_tier !== "free";

      try {
        // 1. No scan — signed up but never started or completed screening
        if (!hasCompleted && !hasStarted) {
          const alreadySent = hasNudgeLog ? await hasBeenEmailed(supabase, profile.id, "no_scan") : false;
          if (!alreadySent) {
            const template = noScanEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            if (hasNudgeLog) await recordEmailSent(supabase, profile.id, profile.email, "no_scan");
            sent.no_scan++;
          }
        }

        // 2. Abandoned — started but never completed
        if (hasStarted && !hasCompleted) {
          const alreadySent = hasNudgeLog ? await hasBeenEmailed(supabase, profile.id, "abandoned") : false;
          if (!alreadySent) {
            const template = abandonedEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            if (hasNudgeLog) await recordEmailSent(supabase, profile.id, profile.email, "abandoned");
            sent.abandoned++;
          }
        }

        // 3. No pay — completed screening 2+ days ago, still free
        if (daysSinceSignup >= 2 && hasCompleted && !isPaid) {
          const alreadySent = hasNudgeLog ? await hasBeenEmailed(supabase, profile.id, "no_pay") : false;
          if (!alreadySent) {
            const template = noPayEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            if (hasNudgeLog) await recordEmailSent(supabase, profile.id, profile.email, "no_pay");
            sent.no_pay++;
          }
        }
      } catch (emailErr) {
        console.error(`Failed to send to ${profile.email}:`, emailErr?.message || emailErr);
        sent.errors++;
      }
    }

    return res.status(200).json({ success: true, sent });
  } catch (err) {
    console.error("Send nudges error:", err?.message || err);
    return res.status(200).json({ success: false, error: err?.message || "Unknown error", sent });
  }
};
