/* ============================================================
   ASTRA DIGITAL MARKET — Homepage interactions
   Vanilla JS. No dependencies. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Repair legacy mojibake in existing homepage HTML ---------- */
  /* The original homepage contains a few characters that were saved with
     an incorrect UTF-8 conversion. Repair those characters in the browser
     without changing the original page structure or visual design. */
  var mojibake = [
    ['â€”', '—'],
    ['â€“', '–'],
    ['â†—', '→'],
    ['â†’', '→'],
    ['â†‘', '↑'],
    ['â†“', '↓'],
    ['âœ¦', '✨'],
    ['âœ“', '✓'],
    ['âš™ï¸', '⚙️'],
    ['âš¡', '⚡'],
    ['â—', '●'],
    ['ðŸ–¥ï¸', '🖥️'],
    ['ðŸ“±', '📱'],
    ['ðŸ¤–', '🤖'],
    ['ðŸ“Š', '📊'],
    ['ðŸ“ˆ', '📈'],
    ['ðŸ“‹', '📋'],
    ['ðŸ“', '📁'],
    ['ðŸ”¥', '🔥'],
    ['ðŸ’¡', '💡'],
    ['ðŸ”§', '🔧'],
    ['ðŸŽ¯', '🎯'],
    ['ðŸŸ¢', '🟢'],
    ['ðŸŒŸ', '🌟'],
    ['â‚¹', '₹'],
    ['Â©', '©'],
    ['Â®', '®'],
    ['Â·', '·'],
    ['â€œ', '“'],
    ['â€', '”'],
    ['â€˜', '‘'],
    ['â€™', '’'],
    ['â€¦', '…']
  ];

  function repairMojibake(value) {
    var out = value;
    for (var i = 0; i < mojibake.length; i++) {
      out = out.split(mojibake[i][0]).join(mojibake[i][1]);
    }
    return out;
  }

  function repairNode(root) {
    if (!root) return;
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

  /* defer guarantees the document body has been parsed before this runs. */
  repairNode(document.body);

  /* ---------- Professional homepage section order ---------- */
  /* Keep the existing design and content intact; only move the existing
     top-level sections into a clearer customer journey. */
  function arrangeHomepageSections() {
    var main = document.querySelector('main');
    if (!main) return;

    var sections = Array.prototype.slice.call(main.children);
    var bySelector = function (selector) { return main.querySelector(selector); };
    var testimonials = sections.find(function (el) {
      return el.tagName === 'SECTION' &&
        !el.id &&
        el !== bySelector('.ap-hero') &&
        el !== bySelector('.ap-process') &&
        el !== bySelector('.ap-statement') &&
        el !== bySelector('.ap-final') &&
        el.textContent.indexOf('WHAT OUR CLIENTS SAY') !== -1;
    });

    var order = [
      bySelector('.ap-hero'),
      bySelector('.ap-strip'),
      bySelector('#build'),
      sections.find(function (el) {
        return el.tagName === 'SECTION' &&
          el.classList.contains('ap-why') &&
          !el.id &&
          el.textContent.indexOf('Why Astra') !== -1;
      }),
      bySelector('#develop'),
      bySelector('.ap-process'),
      bySelector('#work'),
      bySelector('#results'),
      bySelector('#marketing'),
      bySelector('#apps'),
      bySelector('#automation'),
      bySelector('#meta-whatsapp'),
      bySelector('#pricing-home'),
      testimonials,
      bySelector('.ap-statement'),
      bySelector('.ap-final')
    ];

    var valid = order.filter(function (el, index) {
      return el && order.indexOf(el) === index;
    });

    valid.forEach(function (el) { main.appendChild(el); });
  }

  arrangeHomepageSections();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav shadow ---------- */
  var nav = document.querySelector('.ap-nav');
  function onScroll() {
    if (nav) nav.classList.toggle('ap-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
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
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (mobile.classList.contains('ap-open') &&
          !mobile.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.ap-reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('ap-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('ap-in'); });
  }

  /* ---------- Stat counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var decimals = (raw.split('.')[1] || '').length;
    var dur = 1600, start = null;
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Card spotlight follows cursor ---------- */
  document.querySelectorAll('.ap-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
})();
