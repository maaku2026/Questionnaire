/* Tattoo website brief — form logic.
   One section per screen, almost everything a tap, answers autosaved in the browser. */

const STORAGE_KEY = "maaku-brief-v1";
const CONTACT_EMAIL = "chelvin.marc@gmail.com";
const MAX_CHIPS = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ------------------------------------------------------------------ */
/* The questions                                                       */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: "start",
    kicker: "Before you start",
    title: 'Your tattoo website, <em>planned in six minutes.</em>',
    intro:
      "I build tattoo websites. This is how I find out what yours should do, so I'm not guessing. Almost everything is a tick — there are only a handful of boxes you actually need to type in.",
    hero: true,
    fields: [
      { type: "note", text: "Skip anything you don't care about. I'll pick for you, and we can change it later. Your answers save in this browser as you go, so you can close this and come back." },
      {
        type: "note",
        text: `<details class="privacy">
          <summary>Privacy — what happens to your answers</summary>
          <div class="privacy__body">
            <p><strong>Short version:</strong> this form emails your answers to ${CONTACT_EMAIL} so I can plan your site. They aren't published, sold or used for marketing.</p>
            <p><strong>What's collected:</strong> only what you type or tick — your name, your email, your answers, and any contact details or links you choose to add.</p>
            <p><strong>Where it goes:</strong> your answers are emailed to ${CONTACT_EMAIL} through Resend, an email delivery service. That's the only third party involved. Your email address is the reply-to, so any reply comes straight back to you. This site has no accounts and no database — the email is the record.</p>
            <p><strong>Saved in your browser:</strong> a draft is kept on your own device so you can close the page and come back. It doesn't leave your device until you press send, and you can wipe it any time by clearing site data in your browser settings.</p>
            <p><strong>No tracking:</strong> no analytics, no cookies, no advertising, no profiling. Photos aren't uploaded here — they're emailed separately, after this.</p>
            <p><strong>How long it's kept:</strong> while your site is being built, and only as long as needed to answer you. Ask me to delete it whenever you like and I will.</p>
            <p>Want a copy of what you sent, a correction, or deletion? Write to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
          </div>
        </details>`,
      },
    ],
  },

  {
    id: "you",
    kicker: "01 — You and the shop",
    title: "First, the basics.",
    intro: "Exactly as they should appear on the site. Nothing here gets published until you've seen it.",
    fields: [
      {
        type: "row", cols: 2, fields: [
          { id: "name", type: "text", label: "Your name on the site", required: true, placeholder: "e.g. Chelvin Marc" },
          { id: "email", type: "text", inputMode: "email", label: "Your email, for my reply", required: true, placeholder: "you@example.com" },
        ],
      },
      { id: "shop", type: "text", label: "Shop name and the address people should be given", placeholder: "e.g. Black Door Tattoo, 24 Mill Street, Leeds" },
      {
        id: "shopMode", type: "radio", label: "One shop, or more than one?",
        options: ["Just one shop", "More than one"],
      },
      {
        id: "shopMore", type: "text", label: "Where else do you work?",
        showIf: { id: "shopMode", equals: "More than one" },
        placeholder: "Shops, cities, or 'guest spots a few times a year'",
      },
      { id: "hours", type: "text", label: "Days and hours someone can walk in", placeholder: "e.g. Tue–Sat, 11–6, closed Mondays" },
      {
        id: "phone", type: "radio", label: "Phone number on the site?",
        options: ["Shop number", "My own number", "No phone — messages only"],
      },
      {
        type: "row", cols: 3, fields: [
          { id: "instagram", type: "text", label: "Instagram", placeholder: "@handle" },
          { id: "tiktok", type: "text", label: "TikTok", placeholder: "@handle" },
          { id: "facebook", type: "text", label: "Facebook", placeholder: "page name" },
        ],
      },
    ],
  },

  {
    id: "job",
    kicker: "02 — The one job",
    title: "If the site could only do one thing, what would it be?",
    intro: "Pick the one that matters most. The rest still happens — this just tells me what to build everything else around.",
    fields: [
      {
        id: "oneJob", type: "radio", label: "The one job",
        options: [
          "Get booking messages",
          "Prove the work is good, so people stop hesitating",
          "Answer the questions I type out ten times a day",
          "Look legitimate when someone googles my name",
        ],
      },
      {
        id: "asked", type: "textarea", label: "What do people ask you most, before they book?",
        hint: "One or two lines is plenty. These often become the words on the site.",
        placeholder: "e.g. Do you do cover-ups? How much for a small one? Do you take deposits?",
      },
    ],
  },

  {
    id: "sections",
    kicker: "03 — Sections",
    title: "What goes on it.",
    intro: "The first four come with every site I build. Tick any others you want — and skip the ones you're unsure about. More sections means more photos and more writing; four done well beats eight done thin.",
    fields: [
      {
        id: "sections", type: "checks", label: "Sections",
        options: [
          "Home", "Work / gallery", "About", "Book",
          "Prices and minimums", "Aftercare", "FAQ", "Guest spots and travel",
          "Shop info, hours, map", "Reviews or press", "Flash sheet / available designs",
          "Merch or gift cards", "Blog or news",
        ],
        preselect: ["Home", "Work / gallery", "About", "Book"],
      },
      { id: "sectionsExtra", type: "textarea", label: "Anything you want that isn't on that list?", placeholder: "Optional" },
      { id: "sectionsNo", type: "text", label: "Anything on that list you're sure you don't want?", placeholder: "Optional" },
    ],
  },

  {
    id: "booking",
    kicker: "04 — Booking",
    title: "How people reach you.",
    intro: "This decides what the Book button does, and which questions the site asks before a message lands in your inbox.",
    fields: [
      {
        id: "channels", type: "checks", label: "How bookings reach you now — tick all that apply",
        options: ["Instagram DM", "Text", "Phone call", "Email", "People walk in"],
      },
      {
        id: "bookAction", type: "radio", label: "What should the Book button do?",
        options: [
          "A form on the site that emails me",
          "No form — just buttons to DM and text",
          "Both: form first, DM as the fallback",
        ],
      },
      {
        id: "formFields", type: "checks", label: "If there's a form, what should it ask?",
        options: [
          "Name", "Email", "Phone", "Tattoo idea", "Placement", "Approximate size",
          "Budget", "Preferred dates", "Reference photos", "How they found me", "Confirm they're 18+",
        ],
        preselect: ["Name", "Email", "Tattoo idea", "Placement", "Approximate size", "Reference photos", "Confirm they're 18+"],
      },
      {
        id: "filterOut", type: "textarea", label: "What should the form filter out before it reaches you?",
        hint: "Cover-ups, under 18, hands/neck/face on new clients, colour if you only do black and grey — this changes the wording and the fields.",
        placeholder: "Optional, but it saves you a lot of replying",
      },
      { id: "deposit", type: "text", label: "Deposits — do you take one? How much, and how do people pay it?", placeholder: "e.g. £50 by bank transfer, off the final price" },
    ],
  },

  {
    id: "photos",
    kicker: "05 — Photos",
    title: "The part that decides how good it looks.",
    intro: "Don't send anything yet — just tell me what you've got.",
    fields: [
      {
        id: "photoCount", type: "radio", label: "Finished photos you're happy to show",
        options: ["Fewer than 5", "5–15", "15–30", "30+"],
      },
      {
        id: "photoWho", type: "radio", label: "Who takes them?",
        options: ["Me", "A photographer", "Both"],
      },
      {
        id: "healed", type: "radio", label: "Do you have healed photos, not just fresh?",
        options: ["Yes", "A few", "No"],
      },
      {
        id: "organise", type: "radio", label: "How should the work be organised?",
        options: [
          "One grid, newest first",
          "By style",
          "By placement",
          "Colour and black & grey kept separate",
          "Flash kept separate from tattoos",
        ],
      },
      { type: "note", text: `After you send this, email 10–15 of your favourites to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> — as files if you can. That's the whole job.` },
    ],
  },

  {
    id: "look",
    kicker: "06 — Look",
    title: "How it should feel.",
    intro: "You don't need to know what you want it to look like. Pick words, and I'll do the rest.",
    fields: [
      {
        id: "words", type: "chips", label: "Three words for how the site should feel", max: MAX_CHIPS,
        options: [
          "Dark", "Bright", "Minimal", "Bold", "Clean", "Grimy", "Vintage flash",
          "Modern", "Soft", "Loud", "Quiet", "Handmade", "High-end", "Street",
        ],
      },
      {
        id: "bg", type: "radio", label: "Background",
        options: ["Dark", "Light", "Your call"],
      },
      { id: "likes", type: "textarea", label: "A site you like the feel of", hint: "Doesn't have to be a tattoo site. One or two links.", placeholder: "Paste links here" },
      { id: "dislikes", type: "text", label: "A site you can't stand — and why, in three words", placeholder: "Optional" },
      {
        id: "logo", type: "radio", label: "Logo or name",
        options: ["I have a logo file", "Just type my name", "Don't have one"],
      },
      { id: "colours", type: "text", label: "Colours you already use, if any", placeholder: "e.g. black, bone white, one red" },
      {
        id: "imagery", type: "radio", label: "Imagery",
        options: ["Photos only", "Photos plus some illustration", "My flash art too"],
      },
    ],
  },

  {
    id: "words",
    kicker: "07 — Words, money, rules",
    title: "What you say, and what you never say.",
    intro: "The wording on a tattoo site does more work than the design. Here's where you get to set the rules.",
    fields: [
      {
        id: "prices", type: "radio", label: "Prices on the site?",
        options: ["Hourly rate", "Starting at", "Minimum only", "Nothing — ask me"],
      },
      { id: "priceWords", type: "text", label: "\u201cMinimum\u201d or \u201cstarting at\u201d — how do you say it?", placeholder: "Optional" },
      {
        id: "tired", type: "textarea", label: "Questions you're tired of answering",
        hint: "I'll put the answers on the site so people stop asking.",
        placeholder: "e.g. Does it hurt? Can I bring a friend? Do you do walk-ins?",
      },
      {
        id: "aftercare", type: "radio", label: "Aftercare",
        options: ["Not on the site", "A short list", "Its own page"],
      },
      {
        id: "voice", type: "radio", label: "How do you talk about yourself?",
        options: ["\u201cI\u201d", "\u201cWe\u201d"],
      },
      { id: "banned", type: "text", label: "Words you never want used about your work", placeholder: "Optional" },
      {
        id: "never", type: "textarea", label: "Anything you never want on the site?",
        hint: "Photos of a certain kind of work, prices, your full name, your personal number.",
        placeholder: "Optional",
      },
    ],
  },

  {
    id: "logistics",
    kicker: "08 — Logistics",
    title: "Getting it live.",
    intro: "The boring bits. A domain is the only step with a waiting period, so it's worth sorting first.",
    fields: [
      {
        id: "domain", type: "radio", label: "Do you own a domain name?",
        options: ["Yes, I own one", "No", "No idea"],
      },
      {
        id: "domainName", type: "text", label: "Which one?",
        showIf: { id: "domain", equals: "Yes, I own one" },
        placeholder: "e.g. yourname.com",
      },
      {
        id: "updates", type: "radio", label: "Who updates photos after launch?",
        options: ["Me — teach me", "I text them to you and you do it"],
      },
      { id: "deadline", type: "text", label: "Anything coming up the site should be live for?", placeholder: "Guest spot, convention, shop move, new flash set" },
      { id: "budget", type: "text", label: "Optional: budget range, and whether monthly is easier", placeholder: "Skip if you'd rather talk about it" },
    ],
  },

  {
    id: "last",
    kicker: "09 — Last bit",
    title: "Anything else?",
    intro: "Then it's done, and it lands in my inbox.",
    fields: [
      {
        id: "anything", type: "textarea", label: "Anything else — or anything you already have?",
        hint: "A price list, a logo, an aftercare sheet, a photo of the shop. Mention it here and send it with your photos afterwards.",
        placeholder: "Optional",
      },
      { type: "note", text: `Your answers go straight to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. Nothing is published and nothing is shared — the privacy note on the first screen explains exactly where it goes. Questions about me rather than the site? Just write to that address.` },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

let state = load();
let index = 0;
let submitting = false;

function load() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    saved = {};
  }
  const next = {};
  for (const section of SECTIONS) {
    for (const field of flatFields(section)) {
      if (field.type === "note" || !field.id) continue;
      const value = saved[field.id];
      if (field.type === "checks" || field.type === "chips") {
        next[field.id] = Array.isArray(value) ? value.filter((v) => field.options.includes(v)) : [...(field.preselect || [])];
      } else if (field.type === "radio") {
        next[field.id] = typeof value === "string" && field.options.includes(value) ? value : "";
      } else {
        next[field.id] = typeof value === "string" ? value : "";
      }
    }
  }
  return next;
}

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode — carry on without autosave */
    }
  }, 250);
}

function flatFields(section) {
  const out = [];
  for (const entry of section.fields) {
    if (entry.type === "row") out.push(...entry.fields);
    else out.push(entry);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

const stepsEl = document.getElementById("steps");
const form = document.getElementById("form");

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderField(field) {
  if (field.type === "note") {
    return `<div class="note">${field.text}</div>`;
  }

  const value = state[field.id];
  const req = field.required ? '<span class="req" aria-hidden="true">*</span>' : "";
  const labelBlock = `<legend>${esc(field.label)}${req}</legend>` +
    (field.hint ? `<p class="hint">${esc(field.hint)}</p>` : "");
  const error = `<p class="field-error" data-error="${field.id}" hidden></p>`;

  let control;

  if (field.type === "text") {
    const type = field.inputMode === "email" ? "email" : "text";
    return `<div class="field" data-wrap="${field.id}">
      <label class="label" for="${field.id}">${esc(field.label)}${req}</label>
      <input id="${field.id}" name="${field.id}" type="${type}" ${field.inputMode === "email" ? 'inputmode="email" autocomplete="email"' : ""}
        value="${esc(value)}" placeholder="${esc(field.placeholder || "")}" data-field="${field.id}" />
      ${error}
    </div>`;
  }

  if (field.type === "textarea") {
    return `<div class="field" data-wrap="${field.id}">
      <label class="label" for="${field.id}">${esc(field.label)}${req}</label>
      ${field.hint ? `<p class="hint">${esc(field.hint)}</p>` : ""}
      <textarea id="${field.id}" name="${field.id}" rows="3" placeholder="${esc(field.placeholder || "")}" data-field="${field.id}">${esc(value)}</textarea>
      ${error}
    </div>`;
  }

  const multi = field.type !== "radio";
  const selected = multi ? value : value ? [value] : [];
  control = field.options
    .map((option) => {
      const checked = selected.includes(option);
      return `<label class="chip${multi ? " chip--tick" : ""}">
        <input type="${multi ? "checkbox" : "radio"}" name="${field.id}" value="${esc(option)}"
          data-field="${field.id}" ${checked ? "checked" : ""} />
        <span>${esc(option)}</span>
      </label>`;
    })
    .join("");

  const counter = field.max
    ? `<p class="counter" data-counter="${field.id}">${selected.length} of ${field.max} picked</p>`
    : "";

  return `<fieldset class="field" data-wrap="${field.id}">
    ${labelBlock}
    <div class="choices">${control}</div>
    ${counter}
    ${error}
  </fieldset>`;
}

function render() {
  stepsEl.innerHTML = SECTIONS.map((section, i) => {
    const body = section.fields
      .map((entry) => {
        if (entry.type === "row") {
          return `<div class="two">${entry.fields.map(renderField).join("")}</div>`;
        }
        return renderField(entry);
      })
      .join("");

    return `<section class="step" id="step-${section.id}" data-step="${i}" aria-labelledby="h-${section.id}">
      <p class="kicker">${esc(section.kicker)}</p>
      <h${section.hero ? 1 : 2} id="h-${section.id}">${section.title}</h${section.hero ? 1 : 2}>
      ${section.intro ? `<p class="lede">${esc(section.intro)}</p>` : ""}
      ${section.hero ? heroExtras() : ""}
      <div class="fields">${body}</div>
    </section>`;
  }).join("");
}

function heroExtras() {
  return `<div class="hero__meta">
      <span class="pill pill--accent">About 6 minutes</span>
      <span class="pill">Mostly tick boxes</span>
      <span class="pill">Skip what you like</span>
    </div>
    <div class="card-row">
      <div class="card">
        <h3>Video editing</h3>
        <p>Reels, promos and tattoo films — <a href="https://maaku2026.github.io/maaku-portfolio/" target="_blank" rel="noopener">see the video portfolio</a>.</p>
      </div>
      <div class="card">
        <h3>Multimedia showcase</h3>
        <p>Photography, design and everything else — <a href="https://maaku2026.github.io/Maaku-s-Portfolio/" target="_blank" rel="noopener">see the full portfolio</a>.</p>
      </div>
    </div>
    <p class="contact">Questions about me, rather than the site? <a href="mailto:${CONTACT_EMAIL}"><strong>${CONTACT_EMAIL}</strong></a></p>`;
}

/* ------------------------------------------------------------------ */
/* Interaction                                                         */
/* ------------------------------------------------------------------ */

function wrapOf(id) {
  return form.querySelector(`[data-wrap="${id}"]`);
}

function updateCounter(field) {
  if (!field.max) return;
  const el = form.querySelector(`[data-counter="${field.id}"]`);
  if (!el) return;
  const count = (state[field.id] || []).length;
  el.textContent = `${count} of ${field.max} picked`;
  el.classList.toggle("is-full", count >= field.max);
}

function updateConditionals() {
  for (const section of SECTIONS) {
    for (const field of flatFields(section)) {
      if (!field.showIf) continue;
      const wrap = wrapOf(field.id);
      if (!wrap) continue;
      const source = state[field.showIf.id];
      const show = Array.isArray(source) ? source.includes(field.showIf.equals) : source === field.showIf.equals;
      wrap.classList.toggle("is-hidden", !show);
    }
  }
}

function setError(id, message) {
  const wrap = wrapOf(id);
  const el = form.querySelector(`[data-error="${id}"]`);
  if (el) {
    el.textContent = message || "";
    el.hidden = !message;
  }
  if (wrap) wrap.classList.toggle("invalid", Boolean(message));
}

form.addEventListener("change", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;
  const id = input.dataset.field;
  const field = allFields().find((f) => f.id === id);
  if (!field) return;

  // Text inputs and textareas are owned by the "input" handler. Before this
  // guard, blurring a text box ran the checkbox branch below and split the
  // typed value into an array of single characters.
  if (field.type === "text" || field.type === "textarea") return;

  if (field.type === "radio") {
    state[id] = input.value;
  } else if (field.type === "chips") {
    let picked = state[id] || [];
    if (input.checked) {
      picked = [...picked.filter((v) => v !== input.value), input.value];
      if (field.max && picked.length > field.max) picked = picked.slice(picked.length - field.max);
    } else {
      picked = picked.filter((v) => v !== input.value);
    }
    state[id] = picked;
    // re-sync the inputs after dropping the oldest pick
    form.querySelectorAll(`input[data-field="${id}"]`).forEach((box) => {
      box.checked = picked.includes(box.value);
    });
  } else {
    const picked = new Set(state[id] || []);
    if (input.checked) picked.add(input.value);
    else picked.delete(input.value);
    state[id] = [...picked];
  }

  setError(id, "");
  updateConditionals();
  updateCounter(field);
  save();
});

form.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;
  const field = allFields().find((f) => f.id === input.dataset.field);
  if (!field || (field.type !== "text" && field.type !== "textarea")) return;
  state[field.id] = input.value;
  if (field.required && input.value.trim()) setError(field.id, "");
  save();
});

form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  if (event.target.tagName === "TEXTAREA") return;
  if (event.target.closest("[data-field]")) {
    event.preventDefault();
    next();
  }
});

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const nav = document.getElementById("nav");
const backBtn = document.getElementById("back");
const nextBtn = document.getElementById("next");
const stepLabel = document.getElementById("stepLabel");
const navCount = document.getElementById("navCount");
const progressFill = document.getElementById("progressFill");
const progress = document.getElementById("progress");

function allFields() {
  return SECTIONS.flatMap(flatFields);
}

function show(i) {
  index = Math.max(0, Math.min(SECTIONS.length - 1, i));
  document.querySelectorAll(".step").forEach((el, n) => {
    el.classList.toggle("is-active", n === index);
  });
  const section = SECTIONS[index];
  const isLast = index === SECTIONS.length - 1;

  backBtn.hidden = index === 0;
  nextBtn.textContent = index === 0 ? "Start" : isLast ? "Send my answers" : "Continue";
  stepLabel.textContent = section.kicker.replace(/ \u2014 .*/, "") || "Start here";
  navCount.textContent = `${index + 1} / ${SECTIONS.length}`;

  const pct = Math.round((index / (SECTIONS.length - 1)) * 100);
  progressFill.style.width = `${pct}%`;
  progress.setAttribute("aria-valuenow", String(pct));

  nav.hidden = false;
  formError.hidden = true;
  window.scrollTo(0, 0);
}

function validateSection(i) {
  let ok = true;
  let firstBad = null;
  for (const field of flatFields(SECTIONS[i])) {
    if (!field.required || !field.id) continue;
    const wrap = wrapOf(field.id);
    if (wrap && wrap.classList.contains("is-hidden")) continue;
    const raw = state[field.id];
    const value = (typeof raw === "string" ? raw : "").trim();
    if (!value) {
      setError(field.id, "This one's needed so I can reply.");
      ok = false;
      firstBad = firstBad || field.id;
      continue;
    }
    if (field.inputMode === "email" && !EMAIL_RE.test(value)) {
      setError(field.id, "That email doesn't look right — check for a typo?");
      ok = false;
      firstBad = firstBad || field.id;
    }
  }
  if (firstBad) {
    const el = document.getElementById(firstBad);
    if (el) el.focus({ preventScroll: false });
  }
  return ok;
}

function validateAll() {
  for (let i = 0; i < SECTIONS.length; i++) {
    if (!validateSection(i)) {
      show(i);
      return false;
    }
  }
  return true;
}

function next() {
  if (submitting) return;
  if (!validateSection(index)) return;
  if (index === SECTIONS.length - 1) {
    submit();
    return;
  }
  show(index + 1);
}

backBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", next);

/* ------------------------------------------------------------------ */
/* Sending                                                             */
/* ------------------------------------------------------------------ */

const formError = document.getElementById("formError");
const done = document.getElementById("done");

function summary() {
  return SECTIONS.filter((s) => !s.hero)
    .map((section) => {
      const items = flatFields(section)
        .map((field) => {
          if (field.type === "note" || !field.id) return null;
          const value = state[field.id];
          const answer = Array.isArray(value) ? value.join(", ") : (value || "").trim();
          if (!answer) return null;
          return { q: field.label, a: answer };
        })
        .filter(Boolean);
      return { section: section.kicker.replace(/^\d+ — /, ""), items };
    })
    .filter((s) => s.items.length);
}

function plainText(rows) {
  return rows
    .map((s) => `${s.section.toUpperCase()}\n` + s.items.map((it) => `- ${it.q}\n  ${it.a}`).join("\n"))
    .join("\n\n");
}

function mailtoLink(rows) {
  const body = `My tattoo website brief\n\n${plainText(rows)}\n\n`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Tattoo website brief — " + (state.name || "new client"))}&body=${encodeURIComponent(body.slice(0, 1800))}`;
}

async function submit() {
  if (!validateAll()) return;
  submitting = true;
  nextBtn.disabled = true;
  nextBtn.textContent = "Sending…";
  formError.hidden = true;

  const rows = summary();
  const payload = {
    name: (state.name || "").trim(),
    email: (state.email || "").trim(),
    summary: rows,
    website: document.getElementById("honeypot")?.value || "",
    sentAt: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      finish(rows);
      return;
    }

    if (res.status === 503) {
      throw new Error(
        `Email sending isn't switched on yet. Send your answers straight to <a href="${esc(mailtoLink(rows))}">${CONTACT_EMAIL}</a> instead — everything you ticked is already in that message.`
      );
    }
    throw new Error(
      data.message ||
        `That didn't go through. Try once more, or <a href="${esc(mailtoLink(rows))}">send your answers by email</a> instead.`
    );
  } catch (error) {
    const message = error instanceof TypeError
      ? `Couldn't reach the server. Check your connection, or <a href="${esc(mailtoLink(rows))}">send your answers by email</a> instead.`
      : String(error.message || error);
    formError.innerHTML = message;
    formError.hidden = false;
    formError.scrollIntoView({ block: "center", behavior: "smooth" });
  } finally {
    submitting = false;
    nextBtn.disabled = false;
    nextBtn.textContent = "Send my answers";
  }
}

function finish(rows) {
  form.hidden = true;
  nav.hidden = true;
  done.hidden = false;
  document.getElementById("stepLabel").textContent = "Sent";
  progressFill.style.width = "100%";
  progress.setAttribute("aria-valuenow", "100");

  const photoMail = document.getElementById("photoMail");
  photoMail.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Photos for my tattoo website — " + (state.name || "")
  )}&body=${encodeURIComponent("Hi Chelvin,\n\nHere are 10–15 of my favourites.\n\n")}`;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ */
/* Go                                                                  */
/* ------------------------------------------------------------------ */

render();

// a hidden field no human fills in
const honeypot = document.createElement("input");
honeypot.type = "text";
honeypot.id = "honeypot";
honeypot.name = "website";
honeypot.tabIndex = -1;
honeypot.autocomplete = "off";
honeypot.setAttribute("aria-hidden", "true");
honeypot.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
form.appendChild(honeypot);

updateConditionals();
for (const field of allFields()) updateCounter(field);
show(0);
