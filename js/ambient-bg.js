/* ==============================================================
   WATER RIPPLE BACKGROUND
   File: js/ripple-bg.js

   - Gentle ambient sine-wave shimmer runs constantly, subtle.
   - Moving the cursor spawns expanding ripple rings that grow,
     fade, and disappear — like drops in a pond.
   - No dependencies. Pure canvas + JS.

   HOW TO EDIT:
   - RIPPLE_COLOR      → RGB values used for all ripples
   - AMBIENT_OPACITY   → how visible the constant background
                          shimmer is (keep this low)
   - RIPPLE_SPEED      → how fast rings expand outward
   - RIPPLE_LIFETIME   → how many frames a ripple lasts
   - SPAWN_INTERVAL    → how often moving the mouse creates a
                          new ripple (smaller = more ripples)
   ============================================================== */

(function () {
  const canvas = document.getElementById('rippleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ── EDITABLE SETTINGS ──────────────────────────────────────
  const RIPPLE_COLOR    = '77, 150, 255'; // blue (r,g,b)   — EDIT
  const AMBIENT_COLOR   = '160, 200, 255'; // lighter blue  — EDIT
  const AMBIENT_OPACITY = 0.05;            // constant shimmer strength
  const RIPPLE_SPEED    = 2.4;             // px per frame outward
  const RIPPLE_LIFETIME = 90;              // frames before a ripple fades out
  const SPAWN_INTERVAL  = 60;              // ms between auto ripples on move
  const MAX_RIPPLES     = 40;              // safety cap

  let width, height;
  let ripples = [];
  let lastSpawn = 0;
  let time = 0;

  // ── SETUP ───────────────────────────────────────────────────
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  resize();

  // ── MOUSE TRACKING → SPAWN RIPPLES ─────────────────────────
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastSpawn < SPAWN_INTERVAL) return;
    lastSpawn = now;

    if (ripples.length >= MAX_RIPPLES) ripples.shift();

    ripples.push({
      x: e.clientX,
      y: e.clientY + window.scrollY,
      radius: 0,
      life: 0
    });
  });

  // Occasional gentle auto-ripple even without movement (very rare, subtle)
  setInterval(() => {
    if (Math.random() < 0.4 && ripples.length < MAX_RIPPLES) {
      ripples.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0,
        life: 0
      });
    }
  }, 4000);

  // ── DRAW AMBIENT SHIMMER (very subtle constant sine waves) ──
  function drawAmbient() {
    const gap = 60;
    ctx.strokeStyle = `rgba(${AMBIENT_COLOR}, ${AMBIENT_OPACITY})`;
    ctx.lineWidth = 1;

    for (let y = 0; y < height + gap; y += gap) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const wave = Math.sin((x * 0.01) + (time * 0.015) + (y * 0.02)) * 6;
        const py = y + wave;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }

  // ── DRAW EXPANDING RIPPLE RINGS ─────────────────────────────
  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += RIPPLE_SPEED;
      r.life++;

      const fade = 1 - r.life / RIPPLE_LIFETIME;
      if (fade <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      // outer ring
      ctx.beginPath();
      ctx.arc(r.x, r.y - window.scrollY, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${RIPPLE_COLOR}, ${fade * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // inner secondary ring for a richer water look
      if (r.radius > 14) {
        ctx.beginPath();
        ctx.arc(r.x, r.y - window.scrollY, r.radius - 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE_COLOR}, ${fade * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  // ── ANIMATION LOOP ──────────────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, width, height);
    time++;

    drawAmbient();
    drawRipples();

    requestAnimationFrame(animate);
  }

  animate();
})();
