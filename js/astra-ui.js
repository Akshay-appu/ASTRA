/* ============================================================
   ASTRA DIGITAL MARKET — Global interactions (all pages)
   Vanilla JS. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky nav */
  var nav = document.querySelector('.ap-nav');
  function onScroll() { if (nav) nav.classList.toggle('ap-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.ap-burger');
  var mobile = document.getElementById('auMobile');
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

  /* About page: Vision & Values section */
  if (document.body.classList.contains('ap-page') && document.querySelector('.ap-pagehero') && document.querySelector('.ap-final')) {
    var visionValues = document.createElement('section');
    visionValues.className = 'ap-section';
    visionValues.setAttribute('aria-labelledby', 'vision-values-title');
    visionValues.innerHTML = `
      <div class="ap-container">
        <div class="ap-sec-head ap-center">
          <p class="ap-eyebrow ap-reveal">OUR VISION &amp; VALUES</p>
          <h2 id="vision-values-title" class="ap-h2 ap-reveal ap-d1">What Drives <span class="ap-gold">Astra.</span></h2>
          <p class="ap-lead ap-reveal ap-d2">Our vision shapes where we are going, while our values define how we work with every client and every project.</p>
        </div>
        <div class="ap-grid-2">
          <article class="ap-card ap-reveal">
            <div class="ap-card-ico" aria-hidden="true">✦</div>
            <p class="ap-card-num">OUR VISION</p>
            <h3 class="ap-h3">Trusted Digital Growth Partner</h3>
            <p>To become one of India's most trusted digital growth partners by delivering creative, data-driven, and result-oriented marketing and technology solutions.</p>
          </article>
          <article class="ap-card ap-reveal ap-d1">
            <div class="ap-card-ico" aria-hidden="true">◆</div>
            <p class="ap-card-num">OUR VALUES</p>
            <h3 class="ap-h3">Principles Behind Our Work</h3>
            <p><strong>Integrity</strong> — We build trust through honest communication and transparent work.</p>
            <p><strong>Innovation</strong> — We embrace modern technology, AI, and creative thinking.</p>
            <p><strong>Results</strong> — We focus on measurable business growth and meaningful outcomes.</p>
            <p><strong>Partnership</strong> — We work alongside our clients with long-term commitment.</p>
            <p><strong>Excellence</strong> — We pursue high standards in strategy, design, technology, and execution.</p>
          </article>
        </div>
      </div>`;
    document.querySelector('.ap-final').parentNode.insertBefore(visionValues, document.querySelector('.ap-final'));
  }

  /* Reveal on scroll */
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

  /* Counters */
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
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
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
  } else { counters.forEach(animateCount); }

  /* Card spotlight */
  document.querySelectorAll('.ap-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* Contact form: use the current EmailJS public key. */
  if (window.emailjs && document.getElementById('astraContactForm')) {
    emailjs.init({ publicKey: 'AL9B7C0QaChnJZX-Q' });
    var originalEmailJSSend = window.emailjs.send.bind(window.emailjs);
    window.emailjs.send = function (serviceId, templateId, templateParams, options) {
      if (serviceId === 'service_1ve16ms') serviceId = 'service_5gifhqn';
      return originalEmailJSSend(serviceId, templateId, templateParams, options);
    };
  }

  /* Footer year */
  var yr = document.getElementById('auYear');
  if (yr) yr.textContent = new Date().getFullYear();
})();
