/* ============================================================
   WAZALENDO — Interactive JS
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById("site-header");
  const hero = document.getElementById("hero");
  const heroVideo = document.getElementById("hero-video");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.getElementById("motion-toggle");
  let ambiencePaused = reducedMotion.matches;

  if (hero && ambiencePaused) hero.classList.add("motion-paused");

  function startHeroVideo() {
    if (!heroVideo || ambiencePaused || document.hidden) return;
    heroVideo.play().catch(() => {});
  }

  if (heroVideo) {
    heroVideo.addEventListener("playing", () => hero.classList.add("has-video"));
    heroVideo.addEventListener("error", () => hero.classList.remove("has-video"));
    startHeroVideo();
  }

  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (motionToggle) {
    motionToggle.setAttribute("aria-pressed", String(ambiencePaused));
    motionToggle.textContent = ambiencePaused ? "Resume motion" : "Pause motion";
    motionToggle.addEventListener("click", () => {
      ambiencePaused = !ambiencePaused;
      if (hero) hero.classList.toggle("motion-paused", ambiencePaused);
      motionToggle.setAttribute("aria-pressed", String(ambiencePaused));
      motionToggle.textContent = ambiencePaused ? "Resume motion" : "Pause motion";
      if (ambiencePaused) {
        stopParticles();
        if (heroVideo) heroVideo.pause();
      } else {
        startParticles();
        startHeroVideo();
      }
    });
  }

  /* ---------- Ambient field particles ---------- */
  const canvas = document.getElementById("hero-particles");
  let stopParticles = () => {};
  let startParticles = () => {};
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let particles = [];
    let frame = 0;
    let running = false;

    const PARTICLE_COUNT = 44;
    const COLORS = ["#58740b", "#8bb416", "#191c16"];

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function randomParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.22,
        vy: Math.random() * -0.28 - 0.05,
        alpha: Math.random() * 0.28 + 0.08,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        flicker: Math.random() * Math.PI * 2,
      };
    }

    function initParticles() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, randomParticle);
    }

    function drawParticles() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.flicker += 0.025;
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.flicker));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10 || p.x < -10 || p.x > width + 10) {
          Object.assign(p, randomParticle(), { y: height + 5, x: Math.random() * width });
        }
      });
      frame = requestAnimationFrame(drawParticles);
    }

    if (ctx) {
      initParticles();
      startParticles = () => {
        if (running || ambiencePaused || document.hidden) return;
        running = true;
        drawParticles();
      };
      stopParticles = () => {
        running = false;
        cancelAnimationFrame(frame);
      };
      window.addEventListener("resize", initParticles, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopParticles();
          if (heroVideo) heroVideo.pause();
        } else {
          startParticles();
          startHeroVideo();
        }
      });
      startParticles();
    }
  }

  /* ---------- Pointer parallax on the hero ---------- */
  const lionWrap = document.getElementById("hero-lion-wrap");
  if (hero && lionWrap && !reducedMotion.matches) {
    hero.addEventListener("pointermove", (event) => {
      if (ambiencePaused || event.pointerType === "touch" || hero.classList.contains("is-roaring")) return;
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
      lionWrap.style.setProperty("--parallax-x", `${x.toFixed(1)}px`);
      lionWrap.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      lionWrap.style.setProperty("--parallax-x", "0px");
      lionWrap.style.setProperty("--parallax-y", "0px");
    });
  }

  /* ---------- Lion roar ---------- */
  const roarBtn = document.getElementById("roar-btn");
  const pulse = document.getElementById("hero-pulse");
  const roarStatus = document.getElementById("roar-status");

  if (roarBtn && hero) {
    roarBtn.addEventListener("click", () => {
      if (hero.classList.contains("is-roaring")) return;
      hero.classList.add("is-roaring");
      roarBtn.setAttribute("aria-pressed", "true");
      if (roarStatus) roarStatus.textContent = "The lion roars.";

      if (heroVideo) {
        if (Number.isFinite(heroVideo.duration) && heroVideo.duration > 4) {
          heroVideo.currentTime = Math.min(3.5, heroVideo.duration - 3.5);
        }
        heroVideo.muted = false;
        heroVideo.play().catch(() => {});
      }

      if (pulse) {
        pulse.classList.remove("pulsing");
        void pulse.offsetWidth;
        pulse.classList.add("pulsing");
      }

      window.setTimeout(() => {
        hero.classList.remove("is-roaring");
        roarBtn.setAttribute("aria-pressed", "false");
        if (pulse) pulse.classList.remove("pulsing");
        if (roarStatus) roarStatus.textContent = "The lion is still.";
        if (heroVideo) heroVideo.muted = true;
      }, reducedMotion.matches ? 160 : 4600);
    });
  }

  /* ---------- Intersection observer for card animations ---------- */
  const items = document.querySelectorAll(".sightings-grid li");
  if (items.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Math.min(entry.target.dataset.delay || 0, 400);
          setTimeout(() => entry.target.classList.add("visible"), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach((el, i) => {
      el.dataset.delay = Math.min(i * 60, 400);
      io.observe(el);
    });
  }

  /* ---------- Live stat counters ---------- */
  function countUp(el, target, duration) {
    if (reducedMotion.matches) {
      el.textContent = target;
      return;
    }
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // Count unique species and countries from the loaded sighting metadata.
  const cards = document.querySelectorAll(".sightings-grid li");
  const speciesSet = new Set();
  const countrySet = new Set();
  cards.forEach((li) => {
    const species = (li.dataset.species || "").trim();
    const country = (li.dataset.country || "").trim();
    if (species) speciesSet.add(species);
    if (country) countrySet.add(country);
  });

  const statSpecies  = document.getElementById("stat-species");
  const statCountries = document.getElementById("stat-countries");
  const statRecords  = document.getElementById("stat-records");

  if (statSpecies)   countUp(statSpecies,   speciesSet.size, 1800);
  if (statCountries) countUp(statCountries, countrySet.size, 2000);
  if (statRecords)   countUp(statRecords,   cards.length, 1600);

  /* ---------- African sighting lights ---------- */
  const mapPoints = document.getElementById("africa-map-points");
  const mapCount = document.getElementById("africa-map-count");
  const mapDetail = document.getElementById("africa-map-detail");

  if (mapPoints && mapCount && mapDetail) {
    const africanRecords = Array.from(cards).map((card) => ({
      species: (card.dataset.species || "Unknown species").trim(),
      country: (card.dataset.country || "").trim(),
      latitude: Number(card.dataset.latitude),
      longitude: Number(card.dataset.longitude),
    })).filter((record) =>
      record.country && Number.isFinite(record.latitude) && Number.isFinite(record.longitude) &&
      record.latitude >= -35 && record.latitude <= 38 &&
      record.longitude >= -18 && record.longitude <= 52
    );

    const countries = new Map();
    africanRecords.forEach((record) => {
      const group = countries.get(record.country) || { records: [], latitude: 0, longitude: 0 };
      group.records.push(record);
      group.latitude += record.latitude;
      group.longitude += record.longitude;
      countries.set(record.country, group);
    });

    mapCount.textContent = africanRecords.length;
    mapDetail.textContent = africanRecords.length
      ? "Select a light for species and record count"
      : "No African locations in these loaded records";

    const svgNamespace = "http://www.w3.org/2000/svg";
    countries.forEach((group, country) => {
      const latitude = group.latitude / group.records.length;
      const longitude = group.longitude / group.records.length;
      const x = ((longitude + 18) / 70) * 260;
      const y = ((38 - latitude) / 73) * 273;
      const species = new Set(group.records.map((record) => record.species));
      const marker = document.createElementNS(svgNamespace, "g");
      const recordLabel = group.records.length === 1 ? "record" : "records";
      const label = `${country}: ${group.records.length} loaded ${recordLabel}`;
      marker.setAttribute("class", "africa-map__marker");
      marker.setAttribute("role", "button");
      marker.setAttribute("tabindex", "0");
      marker.setAttribute("aria-label", label);
      marker.setAttribute("aria-pressed", "false");
      marker.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

      const hitArea = document.createElementNS(svgNamespace, "circle");
      hitArea.setAttribute("class", "africa-map__hit");
      hitArea.setAttribute("r", "14");
      marker.appendChild(hitArea);

      const halo = document.createElementNS(svgNamespace, "circle");
      halo.setAttribute("class", "africa-map__halo");
      halo.setAttribute("r", String(Math.min(9, 5 + group.records.length)));
      marker.appendChild(halo);

      const point = document.createElementNS(svgNamespace, "circle");
      point.setAttribute("class", "africa-map__point");
      point.setAttribute("r", "2.8");
      marker.appendChild(point);

      const selectMarker = () => {
        mapPoints.querySelectorAll(".africa-map__marker.is-active").forEach((active) => {
          active.classList.remove("is-active");
          active.setAttribute("aria-pressed", "false");
        });
        marker.classList.add("is-active");
        marker.setAttribute("aria-pressed", "true");
        mapDetail.textContent = `${country} · ${group.records.length} ${recordLabel} · ${species.size} species`;
      };

      marker.addEventListener("click", selectMarker);
      marker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectMarker();
        }
      });
      mapPoints.appendChild(marker);
    });
  }

  /* ---------- Filter / Search ---------- */
  const searchInput = document.getElementById("filter-search");
  const chips = document.querySelectorAll(".chip[data-filter]");
  const noResults = document.getElementById("no-results");
  let activeFilter = "all";

  function applyFilters() {
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    let visible = 0;
    items.forEach((li) => {
      const name    = (li.dataset.name    || "").toLowerCase();
      const kingdom = (li.dataset.kingdom || "").toLowerCase();
      const hasPhoto = li.dataset.hasPhoto === "true";

      let show = true;
      if (query && !name.includes(query)) show = false;
      if (activeFilter === "animalia"  && !kingdom.includes("animalia"))  show = false;
      if (activeFilter === "plantae"   && !kingdom.includes("plantae"))   show = false;
      if (activeFilter === "photo"     && !hasPhoto) show = false;

      li.hidden = !show;
      if (show) visible++;
    });
    if (noResults) noResults.hidden = visible > 0;
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("chip--active"));
      chip.classList.add("chip--active");
      activeFilter = chip.dataset.filter;
      applyFilters();
    });
  });

  /* ---------- Smooth scroll for CTA ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

})();
