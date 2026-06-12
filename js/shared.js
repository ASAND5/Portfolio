/* ==============================================================
   ABRAR'S PORTFOLIO — SHARED JAVASCRIPT
   File: js/shared.js
   ============================================================== */

/* ─── SIDE NAVIGATION ─────────────────────────────────────── */
const sidenav        = document.getElementById('sidenav');
const sidenavOverlay = document.getElementById('sidenavOverlay');

function openNav()  {
  sidenav.classList.add('active');
  sidenavOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  sidenav.classList.remove('active');
  sidenavOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('hamburgerBtn')?.addEventListener('click', openNav);
document.getElementById('sidenavCloseBtn')?.addEventListener('click', closeNav);
sidenavOverlay?.addEventListener('click', closeNav);

// Mark active link
document.querySelectorAll('.sidenav-nav a').forEach(link => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (link.getAttribute('href') === path) link.classList.add('active');
});

/* ─── LOAD MORE (generic) ─────────────────────────────────── */
/*
  Call setupLoadMore(buttonId, 'selector-for-hidden-items')
  Hidden items must have class "extra" (flex) or "extra-block" (block).
*/
function setupLoadMore(btnId, selector, batchSize) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  batchSize = batchSize || 999; // default: show all at once

  btn.addEventListener('click', () => {
    const hidden = [...document.querySelectorAll(selector + ':not(.visible)')];
    hidden.slice(0, batchSize).forEach(el => el.classList.add('visible'));

    const stillHidden = document.querySelectorAll(selector + ':not(.visible)');
    if (stillHidden.length === 0) {
      btn.textContent = '✓ All loaded';
      btn.disabled = true;
    }
  });
}

/* ─── GALLERY LIGHTBOX ────────────────────────────────────── */
let _gallery = [], _lbIdx = 0;

function initLightbox(itemSelector) {
  _gallery = [];
  document.querySelectorAll(itemSelector).forEach((el, i) => {
    const img = el.querySelector('img');
    const cap = el.querySelector('.gallery-caption');
    if (!img) return;
    _gallery.push({ src: img.dataset.full || img.src, cap: cap ? cap.textContent : '' });
    el.addEventListener('click', () => _openLB(i));
  });
}

function _openLB(idx) {
  _lbIdx = idx;
  _renderLB();
  document.getElementById('lightbox')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function _renderLB() {
  const d = _gallery[_lbIdx];
  if (!d) return;
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  if (img) img.src = d.src;
  if (cap) cap.textContent = d.cap;
}

function lbClose() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}
function lbPrev() { _lbIdx = (_lbIdx - 1 + _gallery.length) % _gallery.length; _renderLB(); }
function lbNext() { _lbIdx = (_lbIdx + 1) % _gallery.length; _renderLB(); }

document.getElementById('lightbox')?.addEventListener('click', e => {
  if (e.target.id === 'lightbox') lbClose();
});
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox')?.classList.contains('open')) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'ArrowRight') lbNext();
});

/* ─── SCROLL FADE-IN ──────────────────────────────────────── */
function initScrollAnim() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

/* ─── CONTACT FORM PRE-FILL (from URL params) ─────────────── */
function prefillContact() {
  const params = new URLSearchParams(window.location.search);
  const subj = params.get('subject');
  const msg  = params.get('message');
  if (subj && document.getElementById('contactSubject'))
    document.getElementById('contactSubject').value = decodeURIComponent(subj);
  if (msg && document.getElementById('contactMessage'))
    document.getElementById('contactMessage').value = decodeURIComponent(msg);
}

/* ─── CHESS CHALLENGE ─────────────────────────────────────── */
function openChessChallenge() {
  document.getElementById('chessModal')?.classList.add('open');
}
function closeChessModal() {
  document.getElementById('chessModal')?.classList.remove('open');
}
function launchChessChallenge() {
  const user = document.getElementById('chessOpponent')?.value.trim();
  if (!user) { alert('Please enter your Chess.com username.'); return; }
  // Opens Chess.com — user logs in there, not on this site
  window.open(`https://www.chess.com/member/${user}`, '_blank');
  closeChessModal();
}

/* ─── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnim();
  prefillContact();

  // Gallery lightbox (if present on page)
  if (document.querySelector('.gallery-item')) initLightbox('.gallery-item');
});
