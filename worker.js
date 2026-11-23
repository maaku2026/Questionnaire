/**
 * Tattoo website brief — Cloudflare Worker.
 * Serves the static form and emails each submission to one inbox via Resend.
 *
 * Secrets / vars:
 *   RESEND_API_KEY  (secret)  — from resend.com/api-keys
 *   MAIL_TO         (optional) — default chelvin.marc@gmail.com
 *   MAIL_FROM       (optional) — default "Maaku Brief <onboarding@resend.dev>"
 */

const DEFAULT_TO = "chelvin.marc@gmail.com";
const DEFAULT_FROM = "Maaku Brief <onboarding@resend.dev>";
const MAX_BODY_BYTES = 120_000;
const MAX_SECTIONS = 12;
const MAX_ITEMS = 40;
const MAX_TEXT = 4000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/submit") {
      if (request.method !== "POST") {
        return json({ ok: false, message: "Method not allowed." }, 405, { allow: "POST" });
      }
      return handleSubmit(request, env, url);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ ok: false, message: "Not found." }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleSubmit(request, env, url) {
  // Same-origin only: blocks other sites from posting into the inbox.
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      return json({ ok: false, message: "Bad request." }, 403);
    }
    if (originHost !== url.host && originHost !== request.headers.get("host")) {
      return json({ ok: false, message: "Bad request." }, 403);
    }
  }

  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, message: "That was too big to send." }, 413);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Bad request." }, 400);
  }

  // Hidden honeypot field: real people never fill it in.
  if (typeof payload?.website === "string" && payload.website.trim() !== "") {
    return json({ ok: true });
  }

  const name = clean(payload?.name, 80);
  const email = clean(payload?.email, 160);

  if (!name) {
    return json({ ok: false, message: "A name is needed." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, message: "That email doesn't look right." }, 400);
  }

  const sections = normaliseSummary(payload?.summary);
  if (!sections.length) {
    return json({ ok: false, message: "No answers came through." }, 400);
  }

  const apiKey = env?.RESEND_API_KEY;
  if (!apiKey) {
    return json(
      { ok: false, message: "Email sending isn't configured yet." },
      503
    );
  }

  const to = clean(env?.MAIL_TO, 200) || DEFAULT_TO;
  const from = clean(env?.MAIL_FROM, 200) || DEFAULT_FROM;

  const shop = sections.flatMap((s) => s.items).find((i) => /shop name/i.test(i.q))?.a || "";
  const subject = `Tattoo website brief — ${name}${shop ? ` (${firstClause(shop)})` : ""}`;

  const body = { from, to: [to], subject, reply_to: email, html: renderHtml(name, email, sections), text: renderText(name, email, sections) };

  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("resend network error", error);
    return json({ ok: false, message: "Couldn't reach the mail service. Try again in a moment." }, 502);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("resend error", response.status, detail.slice(0, 500));
    return json(
      {
        ok: false,
        message:
          response.status === 401 || response.status === 403
            ? "The mail service rejected the API key."
            : "The mail service didn't accept it. Try again in a moment.",
      },
      502
    );
  }

  return json({ ok: true });
}

/* ------------------------------------------------------------------ */

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);
}

function firstClause(value) {
  return value.split(/[,–—-]/)[0].trim().slice(0, 40);
}

function normaliseSummary(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_SECTIONS)
    .map((section) => {
      const label = clean(section?.section, 80) || "Answers";
      const items = Array.isArray(section?.items)
        ? section.items
            .slice(0, MAX_ITEMS)
            .map((item) => ({
              q: clean(item?.q, 220),
              a: clean(item?.a, MAX_TEXT),
            }))
            .filter((item) => item.q && item.a)
        : [];
      return { label, items };
    })
    .filter((section) => section.items.length);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderText(name, email, sections) {
  const parts = [`Tattoo website brief`, `From: ${name} <${email}>`, ""];
  for (const section of sections) {
    parts.push(section.label.toUpperCase(), "");
    for (const item of section.items) {
      parts.push(`- ${item.q}`, `  ${item.a.replace(/\n/g, "\n  ")}`, "");
    }
  }
  parts.push("—", "Reply straight to this email to answer them.");
  return parts.join("\n");
}

function renderHtml(name, email, sections) {
  const blocks = sections
    .map(
      (section) => `
      <tr><td style="padding:26px 0 8px;">
        <div style="font:600 11px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#1c8f52;">${esc(section.label)}</div>
      </td></tr>
      ${section.items
        .map(
          (item) => `
      <tr><td style="padding:0 0 14px;">
        <div style="font:500 13px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#7a726a;">${esc(item.q)}</div>
        <div style="font:400 15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1715;white-space:pre-wrap;">${esc(item.a)}</div>
      </td></tr>`
        )
        .join("")}`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f0f7f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fbfdfb;border:1px solid #d9e6dd;">
<tr><td style="padding:30px 30px 6px;">
  <div style="font:400 30px/1.15 Georgia,'Times New Roman',serif;color:#1a1715;letter-spacing:-.01em;">New website brief</div>
  <div style="font:400 14px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#5f574f;padding-top:8px;">
    <strong style="color:#1a1715;">${esc(name)}</strong> · <a href="mailto:${esc(email)}" style="color:#1c8f52;text-decoration:none;">${esc(email)}</a>
  </div>
  <div style="height:1px;background:#d9e6dd;margin:22px 0 4px;"></div>
</td></tr>
<tr><td style="padding:0 30px 22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${blocks}</table>
</td></tr>
<tr><td style="padding:18px 30px 28px;border-top:1px solid #e2dacd;">
  <div style="font:400 12px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#8a8177;">Reply to this email to answer them directly.</div>
</td></tr>
</table>
<div style="font:400 11px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#a49a8c;padding-top:16px;">Sent from the tattoo website brief form</div>
</td></tr></table>
</body></html>`;
}
