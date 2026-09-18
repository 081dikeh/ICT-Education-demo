/* ==========================================================================
   ICT EDUCATION CDS — Script
   Shared across index.html, gallery.html and outreach.html.
   Every block below checks that its elements exist before wiring up,
   so this single file works on every page without errors.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------- Footer year ---------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------- Sticky header ---------------------------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    if (header) {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
  };

  /* ---------------------------- Mobile menu ---------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------- Active nav link on scroll (home page only) ---------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');
  const onHomePage = document.body.classList.contains('subpage') === false && sections.length > 0;

  const setActiveLink = () => {
    if (!onHomePage) return;
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navAnchors.forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active-link', href === `#${current}`);
    });
  };

  /* ---------------------------- Scroll reveal (IntersectionObserver) ---------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------- Leadership carousel (index.html) ---------------------------- */
  const teamTrack = document.getElementById('teamTrack');
  const teamPrev = document.getElementById('teamPrev');
  const teamNext = document.getElementById('teamNext');
  const teamDotsWrap = document.getElementById('teamDots');

  if (teamTrack && teamPrev && teamNext) {
    const cards = Array.from(teamTrack.children);

    if (teamDotsWrap) {
      cards.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'team-dot';
        if (i === 0) dot.classList.add('is-active');
        teamDotsWrap.appendChild(dot);
      });
    }
    const dots = teamDotsWrap ? Array.from(teamDotsWrap.children) : [];

    const cardStep = () => (cards[0] ? cards[0].getBoundingClientRect().width + 22 : 220);

    const updateCarouselState = () => {
      const maxScroll = teamTrack.scrollWidth - teamTrack.clientWidth - 4;
      teamPrev.disabled = teamTrack.scrollLeft <= 4;
      teamNext.disabled = teamTrack.scrollLeft >= maxScroll;

      if (dots.length) {
        const index = Math.round(teamTrack.scrollLeft / cardStep());
        dots.forEach((d, i) => d.classList.toggle('is-active', i === Math.min(index, dots.length - 1)));
      }
    };

    teamPrev.addEventListener('click', () => {
      teamTrack.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
    teamNext.addEventListener('click', () => {
      teamTrack.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });
    dots.forEach((dot, i) => {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', () => {
        teamTrack.scrollTo({ left: i * cardStep(), behavior: 'smooth' });
      });
    });

    teamTrack.addEventListener('scroll', () => window.requestAnimationFrame(updateCarouselState));
    window.addEventListener('resize', updateCarouselState);
    updateCarouselState();

    /* Keep the touched/clicked card's caption visible on touch devices */
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
      });
    });
  }

  /* ---------------------------- Gallery page: filter + lightbox ---------------------------- */
  const galleryMasonry = document.getElementById('galleryMasonry');

  if (galleryMasonry) {
    const tiles = Array.from(galleryMasonry.querySelectorAll('.gallery-tile'));
    const filterChips = document.querySelectorAll('.filter-chip');
    const galleryEmpty = document.getElementById('galleryEmpty');

    let visibleTiles = tiles.slice();

    const applyFilter = (filter) => {
      let anyVisible = false;
      tiles.forEach(tile => {
        const matches = filter === 'all' || tile.dataset.category === filter;
        tile.classList.toggle('is-hidden', !matches);
        tile.classList.toggle('is-shown', matches);
        if (matches) anyVisible = true;
      });
      visibleTiles = tiles.filter(t => !t.classList.contains('is-hidden'));
      if (galleryEmpty) galleryEmpty.classList.toggle('show', !anyVisible);
    };

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        applyFilter(chip.dataset.filter);
      });
    });

    /* Lightbox */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTag = document.getElementById('lightboxTag');
    const lightboxText = document.getElementById('lightboxText');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentIndex = 0;

    const categoryLabels = {
      market: 'Market Outreach',
      workshop: 'Workshops',
      training: 'Training',
      events: 'Events & Team'
    };

    const showImage = (index) => {
      if (!visibleTiles.length) return;
      currentIndex = (index + visibleTiles.length) % visibleTiles.length;
      const tile = visibleTiles[currentIndex];
      const img = tile.querySelector('img');
      lightboxImg.src = tile.dataset.full;
      lightboxImg.alt = img ? img.alt : '';
      if (lightboxTag) lightboxTag.textContent = categoryLabels[tile.dataset.category] || '';
      if (lightboxText) lightboxText.textContent = tile.dataset.caption || '';
      if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${visibleTiles.length}`;
    };

    const openLightbox = (tile) => {
      visibleTiles = tiles.filter(t => !t.classList.contains('is-hidden'));
      const index = visibleTiles.indexOf(tile);
      showImage(index === -1 ? 0 : index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    tiles.forEach(tile => {
      tile.addEventListener('click', () => openLightbox(tile));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));

    if (lightbox) {
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    });
  }

  /* ---------------------------- Outreach page: expand/collapse detail ---------------------------- */
  const outreachList = document.getElementById('outreachList');
  if (outreachList) {
    outreachList.querySelectorAll('.outreach-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.outreach-card');
        const isOpen = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen);
        btn.firstChild.textContent = isOpen ? 'Show less ' : 'Read more ';
      });
    });
  }

  /* ---------------------------- Contact form validation (index.html) ---------------------------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    const validators = {
      name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
      phone: (v) => v.trim() === '' || /^[+\d][\d\s-]{6,}$/.test(v) || 'Please enter a valid phone number.',
      subject: (v) => v.trim().length >= 3 || 'Please enter a subject.',
      message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.',
    };

    const SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyg0hXuIoSG7IpmkF9XlFXm1I6UE6773DfL7IvLlvaj89FAnS8l7jYvVqYoakAjWN2FMA/exec';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      Object.keys(validators).forEach((field) => {
        const input = form.elements[field];
        const row = input.closest('.form-row');
        const errorEl = form.querySelector(`[data-error-for="${field}"]`);
        const result = validators[field](input.value);

        if (result === true) {
          row.classList.remove('invalid');
          errorEl.textContent = '';
        } else {
          row.classList.add('invalid');
          errorEl.textContent = result;
          isValid = false;
        }
      });

      if (!isValid) {
        formSuccess.classList.remove('show');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const data = new URLSearchParams({
        name: form.elements.name.value,
        phone: form.elements.phone.value,
        subject: form.elements.subject.value,
        message: form.elements.message.value,
      });

      fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: data,
      })
        .then(() => {
          formSuccess.classList.add('show');
          form.reset();
          setTimeout(() => formSuccess.classList.remove('show'), 10000);
        })
        .catch(() => {
          alert('Something went wrong sending your message. Please try again or contact us directly.');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        });
    });
  }

  /* ---------------------------- Back to top ---------------------------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------- Scroll listeners ---------------------------- */
  window.addEventListener('scroll', () => {
    onScroll();
    setActiveLink();
  });
  onScroll();
  setActiveLink();

});
