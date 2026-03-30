/* ═══════════════════════════════════════════════
   TRA.HELWAN.CO — Scripts
   ═══════════════════════════════════════════════ */

/* ── Particle Background ── */
(function () {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouseX = 0, mouseY = 0;
  const COUNT = 60;
  const EASE = 50;

  function resize() {
    const dpr = devicePixelRatio || 1;
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      tx: 0, ty: 0,
      size: Math.random() * 1.4 + 0.4,
      alpha: 0,
      targetAlpha: Math.random() * 0.4 + 0.08,
      dx: (Math.random() - 0.5) * 0.12,
      dy: (Math.random() - 0.5) * 0.12,
      magnetism: 0.1 + Math.random() * 3,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      const edge = Math.min(p.x + p.tx, w - p.x - p.tx, p.y + p.ty, h - p.y - p.ty);
      p.alpha = edge > 20 ? Math.min(p.alpha + 0.012, p.targetAlpha) : p.targetAlpha * (edge / 20);
      p.x += p.dx;
      p.y += p.dy;
      p.tx += (mouseX / (EASE / p.magnetism) - p.tx) / EASE;
      p.ty += (mouseY / (EASE / p.magnetism) - p.ty) / EASE;

      ctx.beginPath();
      ctx.arc(p.x + p.tx, p.y + p.ty, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,220,${p.alpha})`;
      ctx.fill();

      if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
        Object.assign(p, createParticle());
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left - w / 2;
    mouseY = e.clientY - r.top - h / 2;
  });
  init();
  draw();
})();

/* ── Flickering Grid ── */
(function () {
  const canvas = document.getElementById('stackGrid');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CELL = 36, GAP = 3;
  let w, h, cols, rows, cells = [];

  function resize() {
    const dpr = devicePixelRatio || 1;
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    cols = Math.ceil(w / CELL);
    rows = Math.ceil(h / CELL);
    cells = [];
    for (let i = 0; i < cols * rows; i++) {
      cells.push({ alpha: Math.random() * 0.25, target: Math.random() * 0.25, timer: Math.random() * 4000 });
    }
  }

  let last = 0;
  function draw(ts) {
    const dt = ts - last;
    last = ts;
    ctx.clearRect(0, 0, w, h);
    cells.forEach((c, i) => {
      c.timer -= dt;
      if (c.timer <= 0) {
        c.target = Math.random() * 0.3;
        c.timer = 2000 + Math.random() * 5000;
      }
      c.alpha += (c.target - c.alpha) * 0.018;
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.fillStyle = `rgba(204,255,0,${c.alpha})`;
      ctx.fillRect(col * CELL + GAP / 2, row * CELL + GAP / 2, CELL - GAP, CELL - GAP);
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
})();

/* ── Spotlight Effect ── */
function initSpotlights() {
  document.querySelectorAll('.card').forEach((card) => {
    const spot = card.querySelector('.card__spotlight');
    if (!spot) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      spot.style.background = `radial-gradient(circle 180px at ${x}px ${y}px, rgba(204,255,0,0.04), transparent 70%)`;
    });
    card.addEventListener('mouseleave', () => {
      spot.style.background = '';
    });
  });
}
initSpotlights();

/* ── Text Reveal ── */
(function () {
  const el = document.getElementById('heroTagline');
  if (!el) return;
  const text = el.dataset.text;
  const highlightWords = ['vie.helwan.co'];
  text.split(' ').forEach((word) => {
    const span = document.createElement('span');
    span.className = 'word' + (highlightWords.some((hw) => word.includes(hw)) ? ' word--highlight' : '');
    span.textContent = word + ' ';
    el.appendChild(span);
  });
  setTimeout(() => {
    el.querySelectorAll('.word').forEach((span, i) => {
      setTimeout(() => span.classList.add('visible'), i * 55);
    });
  }, 300);
})();

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ── Counter Animation ── */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.hasAttribute('data-static') || el.dataset.done) return;
      el.dataset.done = '1';
      const target = +el.dataset.to;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1300;
      const start = performance.now();
      (function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      })(start);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('.metric__value').forEach((el) => counterObserver.observe(el));

/* ── Marquee — Stack Tools ── */
(function () {
  const row1 = [
    { icon: '🧱', name: 'Clay', desc: 'Enrichment waterfalls & scored TAM lists' },
    { icon: '⚙️', name: 'n8n', desc: 'Self-hosted GTM & outbound automation' },
    { icon: '🤖', name: 'Claude Code', desc: 'AI-assisted dev for agents & pipelines' },
    { icon: '💻', name: 'Cursor', desc: 'Daily coding with AI pair programming' },
    { icon: '🔗', name: 'Make', desc: 'Lightweight client integrations' },
    { icon: '📊', name: 'HubSpot', desc: 'CRM configuration & lead routing' },
  ];
  const row2 = [
    { icon: '☁️', name: 'Salesforce', desc: 'Custom objects & flow builders' },
    { icon: '🚀', name: 'Apollo', desc: 'Account sourcing & contact discovery' },
    { icon: '🐍', name: 'Python', desc: 'Enrichment scripts & segmentation models' },
    { icon: '🗄️', name: 'SQL', desc: 'Data analysis & pipeline reporting' },
    { icon: '📡', name: 'Cargo', desc: 'Signal-based activation workflows' },
    { icon: '🧠', name: 'TensorFlow', desc: 'ML models for customer segmentation' },
  ];

  function makeCard(tool) {
    return `<div class="tool-card card card--lime">
      <div class="card__spotlight"></div>
      <div class="tool-card__icon">${tool.icon}</div>
      <div class="tool-card__name">${tool.name}</div>
      <div class="tool-card__desc">${tool.desc}</div>
    </div>`;
  }

  function fill(id, data) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = data.map(makeCard).join('');
  }

  fill('marquee1a', row1);
  fill('marquee1b', row1);
  fill('marquee2a', row2);
  fill('marquee2b', row2);

  // Re-init spotlights on dynamic cards
  initSpotlights();
})();

/* ── Chat Widget ── */
(function () {
  const fab = document.getElementById('chatFab');
  const panel = document.getElementById('chatPanel');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const messages = document.getElementById('chatMessages');
  const tooltip = document.getElementById('chatTooltip');
  const tooltipClose = document.getElementById('chatTooltipClose');

  // Replace with your agent endpoint when ready
  const AGENT_URL = null;

  if (!fab || !panel) return;

  if (tooltipClose) {
    tooltipClose.addEventListener('click', (e) => {
      e.stopPropagation();
      tooltip.classList.add('hidden');
    });
  }

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (tooltip) tooltip.classList.add('hidden');
    if (panel.classList.contains('open')) input.focus();
  });

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    if (!AGENT_URL) {
      setTimeout(() => addMessage('Agent coming soon — stay tuned!', 'bot'), 400);
      return;
    }

    try {
      const res = await fetch(AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      addMessage(data.reply || data.message || 'No response.', 'bot');
    } catch {
      addMessage('Could not reach the agent. Try again later.', 'bot');
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });
})();
