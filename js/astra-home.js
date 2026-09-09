/* ============================================================
   ASTRA DIGITAL MARKET — Homepage interactions
   Vanilla JS. No dependencies. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Repair legacy mojibake in existing homepage HTML ---------- */
  var mojibake = [
    ['â€”', '—'], ['â€“', '–'], ['â†—', '→'], ['â†’', '→'],
    ['â†‘', '↑'], ['â†“', '↓'], ['âœ¦', '✨'], ['âš™ï¸', '⚙️'],
    ['ðŸ–¥ï¸', '🖥️'], ['ðŸ“±', '📱'], ['ðŸ¤–', '🤖'], ['ðŸ“Š', '📊'],
    ['ðŸ“ˆ', '📈'], ['ðŸ“‹', '📋'], ['ðŸ”¥', '🔥'], ['ðŸ’¡', '💡'],
    ['ðŸ”§', '🔧'], ['ðŸŽ¯', '🎯'], ['ðŸŒŸ', '🌟'], ['â‚¹', '₹'],
    ['Â©', '©'], ['Â®', '®'], ['Â·', '·'], ['â€œ', '“'], ['â€', '”'],
    ['â€˜', '‘'], ['â€™', '’'], ['â€¦', '…']
  ];

  function repairMojibake(value) {
    var out = value;
    for (var i = 0; i < mojibake.length; i++) out = out.split(mojibake[i][0]).join(mojibake[i][1]);
    return out;
  }

  function repairNode(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var fixed = repairMojibake(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    }
    var elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (var e = 0; e < elements.length; e++) {
      var el = elements[e];
      for (var a = 0; a < el.attributes.length; a++) {
        var attr = el.attributes[a];
        var fixedAttr = repairMojibake(attr.value);
        if (fixedAttr !== attr.value) el.setAttribute(attr.name, fixedAttr);
      }
    }
  }

  repairNode(document.body);

  /* ---------- Mobile Digital Growth System layout fix ---------- */
  var fixStyle = document.createElement('style');
  fixStyle.id = 'astra-mobile-growth-fix';
  fixStyle.textContent = '@media (max-width:480px){' +
    '.ap-system-visual{padding:24px!important;min-height:360px!important;overflow:hidden!important;}' +
    '.ap-system-visual .ap-node{position:absolute!important;display:block!important;font-size:9.5px!important;line-height:1.2!important;padding:8px 10px!important;white-space:nowrap!important;max-width:42%!important;z-index:3!important;animation:none!important;transform:none!important;box-sizing:border-box!important;}' +
    '.ap-system-visual .ap-node:nth-child(3){top:8%!important;left:3%!important;right:auto!important;bottom:auto!important;}' +
    '.ap-system-visual .ap-node:nth-child(4){top:8%!important;right:3%!important;left:auto!important;bottom:auto!important;}' +
    '.ap-system-visual .ap-node:nth-child(5){bottom:8%!important;left:3%!important;right:auto!important;top:auto!important;}' +
    '.ap-system-visual .ap-node:nth-child(6){bottom:8%!important;right:3%!important;left:auto!important;top:auto!important;}' +
  '}';
  document.head.appendChild(fixStyle);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.ap-nav');
  function onScroll() { if (nav) nav.classList.toggle('ap-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.ap-burger');
  var mobile = document.getElementById('apMobile');
  if (burger && mobile) {
    function closeMenu() {
      burger.setAttribute('aria-expanded', 'false');
      mobile.classList.remove('ap-open');
      burger.setAttribute('aria-label', 'Open menu');
    }
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobile.classList.toggle('ap-open', !open);
    });
    mobile.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (mobile.classList.contains('ap-open') && !mobile.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }

  var revealEls = document.querySelectorAll('.ap-reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ap-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('ap-in'); });

  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var raw = el.getAttribute('data-count'), target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length, dur = 1600, start = null;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else counters.forEach(animateCount);

  document.querySelectorAll('.ap-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
})();
