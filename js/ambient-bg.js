/* ==============================================================
   AMBIENT BACKGROUND — CURSOR-FOLLOWING BLOB
   File: js/ambient-bg.js

   Smoothly trails the mouse with a soft lag. No dependencies.
   Works alongside the ambient-bg CSS in shared.css, which
   handles the 3 slowly-drifting background blobs on its own
   via pure CSS animations — this file only controls the 4th
   blob (blob-cursor) that follows the pointer.

   HOW TO EDIT:
   - Easing speed  → change the 0.06 value in animate() below
                     (smaller = slower/laggier, larger = snappier)
   - Blob size     → must match .blob-cursor width/height in
                     shared.css (currently 340px) — if you resize
                     it there, update the "170" offset below too
                     (half of the blob's width/height)
   - Opacity       → change '0.22' to match .blob-cursor opacity
                     in shared.css
   ============================================================== */

(function () {
  const blob = document.getElementById('cursorBlob');
  if (!blob) return; // safely does nothing if this page has no blob

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let blobX  = mouseX;
  let blobY  = mouseY;

  // EDIT: half of .blob-cursor's width/height in shared.css (340px / 2)
  const BLOB_HALF_SIZE = 170;

  // EDIT: how strongly the blob is visible while the cursor is active
  const ACTIVE_OPACITY = '0.22';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    blob.style.opacity = ACTIVE_OPACITY;
  });

  window.addEventListener('mouseleave', () => {
    blob.style.opacity = '0';
  });

  function animate() {
    // EDIT: 0.06 = easing strength — smaller number = softer, laggier trail
    blobX += (mouseX - blobX) * 0.15;
    blobY += (mouseY - blobY) * 0.15;

    blob.style.transform =
      `translate(${blobX - BLOB_HALF_SIZE}px, ${blobY - BLOB_HALF_SIZE}px)`;

    requestAnimationFrame(animate);
  }

  animate();
})();
