/* =========================================================
   EDIT THIS: put your GitHub username between the quotes.
   When it is set, your public repositories appear in the
   Projects section automatically.
   ========================================================= */
const GITHUB_USERNAME = "jackson-it-com";

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch { /* ignore */ } }

/* ---------- Theme toggle ---------- */
const root = document.documentElement;
const themeBtn = $("#themeToggle");
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}
const savedTheme = safeGet("theme");
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  safeSet("theme", next);
});

/* ---------- Mobile menu ---------- */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("#navLinks a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

/* ---------- Typing effect ---------- */
const roles = ["IT Support Professional", "Software Developer", "Web Developer", "Problem Solver"];
const typedEl = $("#typed");
let roleIdx = 0, charIdx = 0, deleting = false;
function type() {
  const word = roles[roleIdx];
  typedEl.textContent = word.slice(0, charIdx);
  if (!deleting && charIdx < word.length) { charIdx++; setTimeout(type, 90); }
  else if (!deleting) { deleting = true; setTimeout(type, 1500); }
  else if (charIdx > 0) { charIdx--; setTimeout(type, 45); }
  else { deleting = false; roleIdx = (roleIdx + 1) % roles.length; setTimeout(type, 300); }
}
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { typedEl.textContent = roles[0]; }
else { type(); }

/* ---------- Scroll reveal + counters ---------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    n = Math.min(target, n + step);
    el.textContent = n;
    if (n >= target) clearInterval(timer);
  }, 40);
}
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      $$("[data-count]", entry.target).forEach(countUp);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => io.observe(el));
} else {
  $$(".reveal").forEach(el => el.classList.add("visible"));
  $$("[data-count]").forEach(el => { el.textContent = el.dataset.count; });
}

/* ---------- Active nav link on scroll ---------- */
const sections = $$("main section[id]");
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    const link = $(`#navLinks a[href="#${sec.id}"]`);
    if (!link) return;
    link.classList.toggle("active", y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight);
  });
}, { passive: true });

/* ---------- Projects ---------- */
const grid = $("#projectsGrid");
const sub = $("#projectsSub");

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Shown until you publish real projects. Edit freely.
const placeholderProjects = [
  { name: "Student Records System", description: "Java application that stores and manages student data in a MySQL database.", tech: "Java · MySQL" },
  { name: "REST API", description: "A REST API for managing data, backed by PostgreSQL.", tech: "Java · PostgreSQL" },
  { name: "Expense Tracker", description: "A small tool to record and total expenses using SQLite.", tech: "Python · SQLite" }
];

function renderPlaceholders() {
  grid.innerHTML = placeholderProjects.map(p => `
    <article class="card project soon">
      <h3>${escapeHTML(p.name)}</h3>
      <p>${escapeHTML(p.description)}</p>
      <div class="meta"><span>${escapeHTML(p.tech)}</span><span>Coming soon</span></div>
    </article>`).join("");
}

async function loadRepos() {
  if (!GITHUB_USERNAME) { renderPlaceholders(); return; }
  const gh = $("#githubLink");
  gh.href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  gh.textContent = `🐙 GitHub: ${GITHUB_USERNAME}`;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&per_page=30`);
    if (!res.ok) throw new Error("GitHub request failed");
    const repos = (await res.json())
      .filter(r => !r.fork && r.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase())
      .slice(0, 6);
    if (!repos.length) { renderPlaceholders(); return; }
    sub.textContent = "Latest projects from my GitHub.";
    grid.innerHTML = repos.map(r => `
      <article class="card project">
        <h3>${escapeHTML(r.name)}</h3>
        <p>${escapeHTML(r.description || "No description yet.")}</p>
        <div class="meta">
          <span>${escapeHTML(r.language || "Code")} · ⭐ ${r.stargazers_count}</span>
          <a class="link" href="${escapeHTML(r.html_url)}" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      </article>`).join("");
  } catch {
    renderPlaceholders();
  }
}
loadRepos();

/* ---------- Contact form (opens the visitor's email app) ---------- */
const form = $("#contactForm");
const note = $("#formNote");
form.addEventListener("submit", e => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  note.className = "form-note";
  if (!name || !email || !message) { note.textContent = "Please fill in all fields."; note.classList.add("error"); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Please enter a valid email address."; note.classList.add("error"); return; }
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
  window.location.href = `mailto:jacksonmahlatse1238@gmail.com?subject=${subject}&body=${body}`;
  note.textContent = "Opening your email app…";
  note.classList.add("ok");
});

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();
