/* ==============================================================
   RIPPLE BACKGROUND — GLASSMORPHIC NATURAL WATER SHIMMER
   File: js/ripple-bg.js

   Vertical shimmer lines drift slowly and constantly at rest.
   Moving the cursor bends nearby lines outward on both sides
   (left lines bend left, right lines bend right) with a soft,
   short-range, slow-settling warp — not discrete spawned rings.

   No dependencies. Pure canvas + JS.

   HOW TO EDIT (all values tuned and approved — change carefully):
   - gap              → spacing between vertical lines (46px)
   - ctx.lineWidth     → line thickness (2.4)
   - WARP_RADIUS       → how close the cursor must be to bend a
                          line, in px (48 — kept intentionally tight)
   - WARP_STRENGTH     → how far lines bend at the cursor (8)
   - GLOW_RADIUS        → size of the soft glow halo, in px (45)
   - AMBIENT_SPEED      → how fast the constant background drift
                          animates (0.006 — slow and calm)
   - CURSOR_EASE        → how quickly the tracked point catches up
                          to the real cursor (0.05 — soft glide)
   ============================================================== */

(function () {
  const canvas = document.getElementById('rippleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Cursor tracking, eased for a soft natural lag ──────────
  let mouseX = width / 2, mouseY = height / 2;
  let easedX = mouseX, easedY = mouseY;
  let mouseActive = 0; // fades 0→1 on move, decays back to 0 at rest
  const CURSOR_EASE = 0.05;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseActive = 1;
  });

  // ── Soft trailing history (a handful of past points, each
  //    with its own fading strength — gives a continuous wake
  //    rather than isolated rings) ─────────────────────────────
  let trail = [];
  const TRAIL_MAX = 18;

  let t = 0; // time accumulator for ambient drift
  const AMBIENT_SPEED = 0.006;

  function draw() {
    t += AMBIENT_SPEED;

    // ease cursor position — soft natural glide
    easedX += (mouseX - easedX) * CURSOR_EASE;
    easedY += (mouseY - easedY) * CURSOR_EASE;

    // decay activity when idle
    mouseActive *= 0.985;

    // push a trail point occasionally while active
    if (mouseActive > 0.05) {
      trail.push({ x: easedX, y: easedY, age: 0 });
      if (trail.length > TRAIL_MAX) trail.shift();
    }
    trail.forEach(p => p.age += 0.6); // ages slowly, lingers
    trail = trail.filter(p => p.age < 140);

    ctx.clearRect(0, 0, width, height);

    // ── Base ambient wash — extremely soft, sets the "water" tone ──
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    baseGrad.addColorStop(0, 'rgba(150,190,235,0.045)');
    baseGrad.addColorStop(1, 'rgba(210,230,250,0.03)');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // ── Ambient VERTICAL shimmer lines, calm constant motion ──
    const gap = 46;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let x = -gap; x < width + gap; x += gap) {
      ctx.beginPath();
      for (let y = 0; y <= height; y += 14) {
        // gentle ambient sine drift — kept purely vertical in feel
        let offset = Math.sin(y * 0.006 + t * 1.3 + x * 0.01) * 5;

        // cursor influence — pushes lines away on BOTH sides:
        // lines left of the cursor bend left, lines right bend
        // right. Tight falloff (under 50px), single smooth bump.
        let distortion = 0;
        for (const p of trail) {
          const dx = x - p.x, dy = y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const strength = Math.max(0, 1 - dist / 48) * (1 - p.age / 140);
          const direction = dx === 0 ? 0 : Math.sign(dx); // -1 left, +1 right
          distortion += direction * strength * 8 * Math.exp(-dist / 30);
        }

        const px = x + offset + distortion;
        if (y === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      const bandOpacity = 0.05 + 0.02 * Math.sin(x * 0.02 + t);
      ctx.strokeStyle = `rgba(120,165,220,${bandOpacity})`;
      ctx.stroke();
    }

    // ── Soft glow following the cursor — subtle, glassy ──────
    if (mouseActive > 0.02) {
      const glow = ctx.createRadialGradient(
        easedX, easedY, 0, easedX, easedY, 45
      );
      glow.addColorStop(0, `rgba(180,210,255,${0.10 * mouseActive})`);
      glow.addColorStop(1, 'rgba(180,210,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
