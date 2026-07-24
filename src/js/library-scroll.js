/* Library row scrolling — replaces the native browser scrollbar with a
   custom progress bar (dark track, discipline-colored marker showing
   scroll position) and edge vignette shadows (fade in/out based on
   whether there's more to scroll in that direction). Also adds
   click-and-drag scrolling on desktop.

   The tricky part: a row full of project links needs both "drag to
   scroll" AND "click a project to open it" to work without fighting
   each other. The standard approach (same one browsers/carousels use):
   track how far the pointer has moved since mousedown, and only treat
   it as a drag once that exceeds a small threshold (~6px is the
   common industry figure — enough to filter out hand tremor on a
   genuine click, small enough that an intentional drag is caught
   almost immediately). If the threshold was crossed, suppress the
   click event on release so it doesn't also navigate; if it wasn't,
   the click passes through untouched and the project opens normally. */

(function () {
  const DRAG_THRESHOLD_PX = 6;

  function buildProgressBar(track, wrap) {
    const existing = wrap.nextElementSibling;
    if (existing && existing.classList.contains('library-row__progress')) return existing;
    const bar = document.createElement('div');
    bar.className = 'library-row__progress';
    bar.innerHTML = '<div class="library-row__progress-thumb"></div>';
    wrap.insertAdjacentElement('afterend', bar);
    return bar;
  }

  function updateProgress(track, bar) {
    const thumb = bar.querySelector('.library-row__progress-thumb');
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';
    const trackWidth = bar.clientWidth;
    const thumbWidth = Math.max((track.clientWidth / track.scrollWidth) * trackWidth, 40);
    const progress = track.scrollLeft / maxScroll;
    const thumbX = progress * (trackWidth - thumbWidth);
    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${thumbX}px)`;
  }

  function updateVignettes(track, wrap) {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= maxScroll - 2;
    wrap.classList.toggle('is-at-start', atStart || maxScroll <= 0);
    wrap.classList.toggle('is-at-end', atEnd || maxScroll <= 0);
  }

  function bindTrack(track) {
    if (track.dataset.scrollBound) return;
    track.dataset.scrollBound = '1';

    const wrap = track.closest('.library-row__track-wrap') || track.parentElement;
    const bar = buildProgressBar(track, wrap);
    const sync = () => { updateProgress(track, bar); updateVignettes(track, wrap); };
    sync();
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // Belt-and-braces: images/links have their own native "drag to move
    // this" behavior that intercepts the gesture before our pointer
    // handlers below ever see it (this was the actual bug — dragging
    // while over a project worked nowhere except the empty gaps between
    // cards, since only bare track background isn't natively
    // draggable). draggable="false" on the markup handles most of it;
    // this catches anything that slips through regardless of element.
    track.addEventListener('dragstart', (e) => e.preventDefault());

    // Click-and-drag scroll, desktop only (touch already scrolls
    // natively and shouldn't fight with this).
    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    // Velocity tracking for momentum — recent (time, x) samples, used to
    // estimate release speed so the scroll can keep gliding and
    // decelerate afterward instead of stopping dead the instant the
    // mouse is released, which is what felt clunky before.
    let history = [];
    let momentumFrame = null;

    function stopMomentum() {
      if (momentumFrame) { cancelAnimationFrame(momentumFrame); momentumFrame = null; }
    }

    function runMomentum(initialVelocity) {
      let velocity = initialVelocity; // px/ms
      const friction = 0.94; // per-frame decay — tuned to feel like a natural glide, not a long drift
      let lastTime = performance.now();

      function step(now) {
        const dt = now - lastTime;
        lastTime = now;
        velocity *= Math.pow(friction, dt / 16.7); // normalize decay to ~60fps regardless of actual frame rate
        track.scrollLeft -= velocity * dt;

        const maxScroll = track.scrollWidth - track.clientWidth;
        const hitBound = track.scrollLeft <= 0 || track.scrollLeft >= maxScroll;
        if (Math.abs(velocity) < 0.02 || hitBound) {
          momentumFrame = null;
          return;
        }
        momentumFrame = requestAnimationFrame(step);
      }
      momentumFrame = requestAnimationFrame(step);
    }

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      stopMomentum();
      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      history = [{ t: performance.now(), x: e.clientX }];
    });

    track.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const delta = e.clientX - startX;
      if (!isDragging && Math.abs(delta) > DRAG_THRESHOLD_PX) {
        isDragging = true;
        track.classList.add('is-dragging');
      }
      if (isDragging) {
        track.scrollLeft = startScrollLeft - delta;
        history.push({ t: performance.now(), x: e.clientX });
        if (history.length > 6) history.shift(); // only need recent samples for velocity
      }
    });

    function endDrag(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      if (isDragging) {
        // Suppress the click that would otherwise fire on release —
        // this is what stops a drag from also opening whatever
        // project happened to be under the cursor when it started.
        const suppressClick = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
        track.addEventListener('click', suppressClick, { capture: true, once: true });
        setTimeout(() => track.removeEventListener('click', suppressClick, { capture: true }), 0);

        // Estimate release velocity from the last couple of samples
        // (not the whole drag — only recent motion reflects how fast
        // the hand was actually moving at the moment of release).
        const recent = history[history.length - 1];
        const earlier = history[0];
        if (recent && earlier && recent.t !== earlier.t) {
          const vx = (recent.x - earlier.x) / (recent.t - earlier.t); // px/ms
          if (Math.abs(vx) > 0.05) runMomentum(vx);
        }
      }
      isDragging = false;
      track.classList.remove('is-dragging');
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);

    // Also drag the progress bar thumb itself to scroll.
    bar.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const rect = bar.getBoundingClientRect();
      const setFromX = (clientX) => {
        const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        track.scrollLeft = ratio * maxScroll;
      };
      setFromX(e.clientX);
      const onMove = (ev) => setFromX(ev.clientX);
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }

  function bindAll() {
    document.querySelectorAll('.library-row__track').forEach(bindTrack);
  }

  bindAll();
  document.addEventListener('content-injected', bindAll);
})();
