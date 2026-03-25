// Automated Reminder Emails for YoureOwed
// Simplified to diagnose deployment issues

module.exports = async function handler(req, res) {
  // Step 1: Can the function even respond?
  const diagnostics = {
    ok: true,
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    },
    modules: {},
  };

  // Step 2: Can we load modules?
  try {
    require("resend");
    diagnostics.modules.resend = "ok";
  } catch (e) {
    diagnostics.modules.resend = e.message;
  }

  try {
    require("@supabase/supabase-js");
    diagnostics.modules.supabase = "ok";
  } catch (e) {
    diagnostics.modules.supabase = e.message;
  }

  // If just diagnosing, return here
  if (req.method === "GET") {
    return res.status(200).json(diagnostics);
  }

  // Step 3: Actually try to send nudges
  try {
    const { Resend } = require("resend");
    const { createClient } = require("@supabase/supabase-js");

    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!resendKey || !supabaseUrl || !supabaseKey) {
      return res.status(200).json({ success: false, error: "Missing env vars", diagnostics });
    }

    const resend = new Resend(resendKey);
    const supabase = createClient(supabaseUrl, supabaseKey);
    const SITE = "https://youreowed.org";
    const FROM = "YoureOwed <hello@youreowed.org>";
    const sent = { no_scan: 0, abandoned: 0, no_pay: 0, errors: 0, skipped: 0 };

    const { data: profiles, error: pErr } = await supabase
      .from("user_profiles")
      .select("id, email, name, subscription_tier, created_at")
      .not("email", "is", null);

    if (pErr || !profiles || profiles.length === 0) {
      return res.status(200).json({ success: true, message: "No profiles", sent, error: pErr ? pErr.message : null });
    }

    for (const p of profiles) {
      if (!p.email) { sent.skipped++; continue; }

      var days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
      if (days < 1) { sent.skipped++; continue; }

      var events = new Set();
      try {
        var actResult = await supabase.from("user_activity").select("event_type").eq("user_id", p.id);
        if (actResult.data) events = new Set(actResult.data.map(function(a) { return a.event_type; }));
      } catch (e) { /* table may not exist */ }

      var firstName = (p.name || "").split(" ")[0] || "there";
      var hasCompleted = events.has("completed_screener");
      var hasStarted = events.has("started_screener");

      try {
        // Check if already emailed
        var alreadySent = false;
        var nudgeType = "";

        if (!hasCompleted && !hasStarted) {
          nudgeType = "no_scan";
        } else if (hasStarted && !hasCompleted) {
          nudgeType = "abandoned";
        } else if (days >= 2 && hasCompleted && p.subscription_tier === "free") {
          nudgeType = "no_pay";
        }

        if (!nudgeType) { sent.skipped++; continue; }

        // Check nudge log
        try {
          var logCheck = await supabase.from("email_nudges_sent").select("id").eq("user_id", p.id).eq("nudge_type", nudgeType).limit(1);
          if (logCheck.data && logCheck.data.length > 0) { sent.skipped++; continue; }
        } catch (e) { /* table may not exist, proceed */ }

        // Build email
        var subject = "";
        var body = "";

        if (nudgeType === "no_scan") {
          subject = "You signed up but haven't checked your benefits yet";
          body = "<p>Hey " + firstName + ",</p><p>You created your account but haven't run your benefits screening yet. The average household qualifies for <strong>$5,000-$50,000+ per year</strong> in benefits they never claim.</p><p>It takes <strong>less than 2 minutes</strong> and we check 415+ programs.</p><p><a href='" + SITE + "/#/screener' style='background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block'>Check What You're Owed</a></p>";
        } else if (nudgeType === "abandoned") {
          subject = "You were almost done - pick up where you left off";
          body = "<p>Hey " + firstName + ",</p><p>You started your benefits screening but didn't finish. Just a few more questions and we'll show you every program you may qualify for.</p><p><a href='" + SITE + "/#/screener' style='background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block'>Finish My Screening</a></p>";
        } else if (nudgeType === "no_pay") {
          subject = "You found benefits - unlock your full results for $4.99/mo";
          body = "<p>Hey " + firstName + ",</p><p>You completed your screening and we found programs you may qualify for. For just <strong>$4.99/month</strong>, unlock all 415+ program details with dollar estimates.</p><p><a href='" + SITE + "/#/pricing' style='background:#00E676;color:#000;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block'>Unlock My Results - $4.99/mo</a></p>";
        }

        await resend.emails.send({ from: FROM, to: p.email, subject: subject, html: body });

        // Log that we sent it
        try {
          await supabase.from("email_nudges_sent").insert({ user_id: p.id, email: p.email, nudge_type: nudgeType });
        } catch (e) { /* ignore */ }

        sent[nudgeType]++;
      } catch (emailErr) {
        sent.errors++;
      }
    }

    return res.status(200).json({ success: true, sent: sent });
  } catch (err) {
    return res.status(200).json({ success: false, error: String(err), stack: String(err.stack) });
  }
};
