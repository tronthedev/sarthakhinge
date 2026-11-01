(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) setMenu(false); });
  }

  /* ---------- Hero letter split ---------- */
  var hero = document.querySelector('.hero');
  var lines = document.querySelectorAll('[data-line]');
  var letters = [];
  lines.forEach(function (line, li) {
    var text = line.textContent.trim();
    line.textContent = '';
    var n = text.length;
    text.split('').forEach(function (chr, i) {
      var outer = document.createElement('span');
      outer.className = 'ch' + (li === 0 && i === 0 ? ' ch-s' : '');
      var inner = document.createElement('span');
      inner.className = 'ch-in';
      inner.textContent = chr;
      outer.appendChild(inner);
      line.appendChild(outer);
      var spread = (i - (n - 1) / 2) / ((n - 1) / 2 || 1); // -1..1
      var horizontal = i % 2 === 0;
      letters.push({
        el: outer,
        x: horizontal ? spread * 1.1 + (spread >= 0 ? 0.35 : -0.35) : spread * 0.25,
        y: horizontal ? (li === 0 ? -0.15 : 0.15) : (li === 0 ? -1 : 1) * (0.7 + (i % 3) * 0.2),
        r: spread * 14,
        rx: (li === 0 ? -1 : 1) * (50 + (i % 3) * 25),
        ry: (i % 2 === 0 ? 1 : -1) * (60 + (i % 4) * 30)
      });
    });
  });

  /* ---------- Parallax exit (scroll-driven, rAF) ---------- */
  var ticking = false, lastP = -1;
  function render() {
    ticking = false;
    var mobile = window.innerWidth <= 760;
    var range = hero.offsetHeight * (mobile ? 0.85 : 0.7);
    var p = Math.min(Math.max(window.scrollY / range, 0), 1);
    if (reduce.matches) p = 0;
    if (p === lastP) return;
    lastP = p;
    var k = mobile ? 0.4 : 1;                 // gentler on mobile
    var e = p * p * (3 - 2 * p);              // smoothstep
    var vw = window.innerWidth / 100;
    var vh = window.innerHeight / 100;
    var fade = Math.max(0, 1 - Math.max(0, p - 0.15) / 0.8);
    for (var i = 0; i < letters.length; i++) {
      var l = letters[i];
      l.el.style.transform = p === 0 ? '' :
        'translate3d(' + (l.x * e * 30 * vw * k).toFixed(1) + 'px,' + (l.y * e * 40 * vh * k).toFixed(1) + 'px,0) rotateX(' + (l.rx * e * k).toFixed(1) + 'deg) rotateY(' + (l.ry * e * k).toFixed(1) + 'deg) rotate(' + (l.r * e * k).toFixed(1) + 'deg)';
      l.el.style.opacity = fade.toFixed(3);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { lastP = -1; onScroll(); });
  reduce.addEventListener && reduce.addEventListener('change', function () { lastP = -1; onScroll(); });
  render();
})();
/* ---------- Screen opening intro ---------- */
(function () {
  var intro = document.getElementById('intro');
  if (!intro) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { intro.remove(); return; }

  var root = document.documentElement, timers = [], finished = false;
  root.classList.add('intro-lock');
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    intro.classList.add('is-open', 'is-done');
    root.classList.remove('intro-lock');
    setTimeout(function () { intro.remove(); }, 800);
  }

  at(80, function () { intro.classList.add('is-line'); });   // line draws from center
  at(520, function () { intro.classList.add('is-open'); });  // halves split apart
  at(1250, finish);
  intro.addEventListener('click', finish);
  document.addEventListener('keydown', finish, { once: true });
})();
/* ---------- Project screenshot sliders ---------- */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.shot-btn');
    if (!btn) return;
    var shots = btn.parentElement.querySelector('.shots');
    var dir = btn.classList.contains('shot-next') ? 1 : -1;
    shots.scrollBy({ left: dir * shots.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  });
})();