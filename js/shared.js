/* ==============================================================
   ABRAR'S PORTFOLIO — SHARED JAVASCRIPT
   File: js/shared.js
   ============================================================== */

/* ─── HERO GLASS BANDS — cursor proximity brightening ───────
   Hero section only. Bands stay in their normal drift animation;
   nearby bands just brighten smoothly as the cursor approaches. */
(function () {
  const hero  = document.querySelector('.hero');
  const bands = document.querySelectorAll('.hero-glass-band');
  if (!hero || !bands.length) return;

  const REACT_RADIUS = 90; // px — how close the cursor must be to react

  hero.addEventListener('mousemove', (e) => {
    const heroRect = hero.getBoundingClientRect();
    const mouseX = e.clientX - heroRect.left;

    bands.forEach(band => {
      const bandRect = band.getBoundingClientRect();
      const bandCenterX = bandRect.left - heroRect.left + bandRect.width / 2;
      const dist = Math.abs(mouseX - bandCenterX);

      if (dist < REACT_RADIUS) {
        band.classList.add('near-cursor');
      } else {
        band.classList.remove('near-cursor');
      }
    });
  });

  hero.addEventListener('mouseleave', () => {
    bands.forEach(band => band.classList.remove('near-cursor'));
  });
})();

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

/* ─── LETTERBOXD RSS FEED — auto-refreshes every 10-15 min ────
   Fetches your Letterboxd RSS feed via a free public proxy
   (RSS feeds can't be fetched directly from browser JS due to
   CORS). HOW TO EDIT: change RSS_URL or REFRESH_MINUTES below.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const container = document.getElementById('letterboxdFeed');
  const label = document.getElementById('liveEmbedUpdated');
  if (!container) return; // only runs on pages with this section

  const RSS_URL = 'https://letterboxd.com/bored_man_ab/rss/';
  const PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(RSS_URL);
  const REFRESH_MINUTES = 12; // EDIT: 10-15 as you like
  const MAX_ENTRIES = 5;      // EDIT: how many recent entries to show

  async function loadFeed() {
    try {
      const res = await fetch(PROXY_URL);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        container.innerHTML = '<div class="live-embed-loading">No recent activity yet.</div>';
        return;
      }

      container.innerHTML = data.items.slice(0, MAX_ENTRIES).map(item => {
        const date = new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
        // Letterboxd includes a poster image in the description HTML — extract it
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        const posterSrc = imgMatch ? imgMatch[1] : '';

        return `
          <div class="lb-entry">
            ${posterSrc ? `<img class="lb-entry-poster" src="${posterSrc}" alt="" loading="lazy" />` : ''}
            <div>
              <div class="lb-entry-title"><a href="${item.link}" target="_blank">${item.title}</a></div>
              <div class="lb-entry-date">${date}</div>
            </div>
          </div>
        `;
      }).join('');

      if (label) {
        const now = new Date();
        label.textContent = 'Updated ' + now.toLocaleTimeString([], { minute: '2-digit' }) + ' minutes ago';
      }
    } catch (err) {
      container.innerHTML = '<div class="live-embed-loading">Could not load activity right now.</div>';
    }
  }

  loadFeed(); // initial load
  setInterval(loadFeed, REFRESH_MINUTES * 60 * 1000);
})();

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

/* ─── REVEAL BOX — repeats every time, both scroll directions ─
   Unlike initScrollAnim() (.fade-up, animates once and stops
   watching), this keeps watching forever: toggles .in-view on
   and off every time an element enters/exits the viewport. */
function initRevealBoxes() {
  const revealEls = document.querySelectorAll('.reveal-box');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
      // NOTE: no unobserve() here — keeps watching forever,
      // so it fades in/out every time, in both directions
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
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
  initRevealBoxes();
  prefillContact();

  // Gallery lightbox (if present on page)
  if (document.querySelector('.gallery-item')) initLightbox('.gallery-item');
});
