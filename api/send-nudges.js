// ─── Automated Reminder Emails ──────────────────────────────────────────────
// Sends reminder emails to users who signed up but haven't scanned,
// abandoned the screener, or scanned but haven't paid.
//
// Called daily by a scheduled task or manually via:
// POST /api/send-nudges?key=YOUR_KEY
//
// Deployed at: youreowed.org/api/send-nudges

const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const FROM_EMAIL = "YoureOwed <hello@youreowed.org>";
const SITE_URL = "https://youreowed.org";

// ─── Email Templates ────────────────────────────────────────────────────────

function noScanEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You signed up but haven't checked your benefits yet",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 24px;">
          <div style="background: #171614; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <span style="color: #00E676; font-weight: 900; font-size: 20px;">YoureOwed</span>
          </div>
          
          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Hey ${firstName},</h1>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            You created your account but haven't run your benefits screening yet. The average household qualifies for <strong>$5,000–$50,000+ per year</strong> in government benefits they never claim.
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            It takes <strong>less than 2 minutes</strong> and we check 335+ federal and state programs. Your information stays completely private.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${SITE_URL}/#/screener" style="background: #00E676; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              Check What You're Owed →
            </a>
          </div>
          
          <p style="font-size: 13px; color: #888; line-height: 1.5;">
            People just like you are discovering thousands in unclaimed benefits every day. Don't leave money on the table.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #aaa;">
            You're receiving this because you signed up at YoureOwed. 
            <a href="${SITE_URL}" style="color: #aaa;">youreowed.org</a>
          </p>
        </div>
      </div>
    `,
  };
}

function abandonedEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You were almost done — pick up where you left off",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 24px;">
          <div style="background: #171614; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <span style="color: #00E676; font-weight: 900; font-size: 20px;">YoureOwed</span>
          </div>
          
          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Hey ${firstName},</h1>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            You started your benefits screening but didn't finish. Your progress is saved — you can pick up right where you left off.
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            Just a few more questions and we'll show you every program you may qualify for, with <strong>estimated dollar amounts</strong> for each one.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${SITE_URL}/#/screener" style="background: #00E676; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              Finish My Screening →
            </a>
          </div>
          
          <p style="font-size: 13px; color: #888; line-height: 1.5;">
            It only takes another minute or two. Your answers are private and never shared.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #aaa;">
            You're receiving this because you started a screening at YoureOwed. 
            <a href="${SITE_URL}" style="color: #aaa;">youreowed.org</a>
          </p>
        </div>
      </div>
    `,
  };
}

function noPayEmail(name) {
  const firstName = name?.split(" ")[0] || "there";
  return {
    subject: "You found benefits — unlock your full results for $4.99/mo",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 24px;">
          <div style="background: #171614; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <span style="color: #00E676; font-weight: 900; font-size: 20px;">YoureOwed</span>
          </div>
          
          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Hey ${firstName},</h1>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            You completed your screening and we found programs you may qualify for. But you're still on the free plan, which means you can only see a preview.
          </p>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            For just <strong>$4.99/month</strong>, you'll unlock:
          </p>
          
          <ul style="font-size: 15px; line-height: 1.8; color: #444; padding-left: 20px;">
            <li>All 335+ program details with estimated dollar amounts</li>
            <li>Step-by-step application guides</li>
            <li>AI assistant to answer your questions</li>
            <li>Deadline reminders so you never miss a window</li>
          </ul>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
            <p style="font-size: 13px; color: #166534; margin: 0;">
              Most users find <strong>$5,000–$50,000+/year</strong> in benefits.<br/>
              That's up to <strong>$10,000 for every $1</strong> you spend on YoureOwed.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${SITE_URL}/#/pricing" style="background: #00E676; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              Unlock My Results — $4.99/mo →
            </a>
          </div>
          
          <p style="font-size: 13px; color: #888; line-height: 1.5;">
            Cancel anytime. 7-day money-back guarantee.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 11px; color: #aaa;">
            You're receiving this because you completed a screening at YoureOwed. 
            <a href="${SITE_URL}" style="color: #aaa;">youreowed.org</a>
          </p>
        </div>
      </div>
    `,
  };
}

// ─── Track which emails we've already sent ──────────────────────────────────

async function hasBeenEmailed(userId, nudgeType) {
  const { data } = await supabase
    .from("email_nudges_sent")
    .select("id")
    .eq("user_id", userId)
    .eq("nudge_type", nudgeType)
    .limit(1);
  return data && data.length > 0;
}

async function recordEmailSent(userId, email, nudgeType) {
  await supabase.from("email_nudges_sent").insert({
    user_id: userId,
    email,
    nudge_type: nudgeType,
  });
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simple auth check
  const key = req.query.key || req.headers["x-api-key"];
  if (key !== process.env.NUDGE_API_KEY && key !== process.env.SUPABASE_SERVICE_KEY?.slice(0, 20)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sent = { no_scan: 0, abandoned: 0, no_pay: 0, errors: 0 };

  try {
    // Get all user profiles
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, email, name, subscription_tier, created_at")
      .not("email", "is", null);

    if (!profiles) {
      return res.status(200).json({ message: "No profiles found", sent });
    }

    for (const profile of profiles) {
      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get user activity
      const { data: activities } = await supabase
        .from("user_activity")
        .select("event_type")
        .eq("user_id", profile.id);

      const events = new Set((activities || []).map(a => a.event_type));
      const hasStarted = events.has("started_screener");
      const hasCompleted = events.has("completed_screener");
      const isPaid = profile.subscription_tier !== "free";

      try {
        // 1. No scan — signed up 1+ days ago, never completed screening
        if (daysSinceSignup >= 1 && !hasCompleted && !hasStarted) {
          if (!(await hasBeenEmailed(profile.id, "no_scan"))) {
            const template = noScanEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            await recordEmailSent(profile.id, profile.email, "no_scan");
            sent.no_scan++;
          }
        }

        // 2. Abandoned — started screener 1+ days ago, never completed
        if (daysSinceSignup >= 1 && hasStarted && !hasCompleted) {
          if (!(await hasBeenEmailed(profile.id, "abandoned"))) {
            const template = abandonedEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            await recordEmailSent(profile.id, profile.email, "abandoned");
            sent.abandoned++;
          }
        }

        // 3. No pay — completed screening 2+ days ago, still free
        if (daysSinceSignup >= 2 && hasCompleted && !isPaid) {
          if (!(await hasBeenEmailed(profile.id, "no_pay"))) {
            const template = noPayEmail(profile.name);
            await resend.emails.send({
              from: FROM_EMAIL,
              to: profile.email,
              subject: template.subject,
              html: template.html,
            });
            await recordEmailSent(profile.id, profile.email, "no_pay");
            sent.no_pay++;
          }
        }
      } catch (emailErr) {
        console.error(`Failed to send to ${profile.email}:`, emailErr);
        sent.errors++;
      }
    }

    return res.status(200).json({ success: true, sent });
  } catch (err) {
    console.error("Send nudges error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
