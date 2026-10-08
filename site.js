(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fonts first, then fade copy in.
  const go = () => html.classList.add("is-ready");
  const fail = setTimeout(go, 1400);
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => { clearTimeout(fail); go(); }).catch(go);

  // Contour lines behind the hero. Same language as the mark.
  (() => {
    const canvas = document.querySelector("canvas.contour");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const CELL = 16;
    const LEVELS = [0.38, 0.45, 0.52, 0.59, 0.66];
    let W = 0, H = 0, cols = 0, rows = 0, vals;

    function resize() {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.ceil(r.width);
      H = Math.ceil(r.height);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      vals = new Float32Array(cols * rows);
    }

    function hash(x, y, z) {
      let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    }
    const sm = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    function noise(x, y, z) {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi);
      const n0 = lerp(
        lerp(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf),
        lerp(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf), yf);
      const n1 = lerp(
        lerp(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf),
        lerp(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf), yf);
      return lerp(n0, n1, zf);
    }
    function field(x, y, t) {
      return 0.68 * noise(x * 0.055, y * 0.07, t) + 0.32 * noise(x * 0.14 + 11, y * 0.16 + 5, t * 1.5 + 3);
    }

    // edges: 0 top, 1 right, 2 bottom, 3 left
    const SEG = {
      1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[0, 3], [2, 1]],
      6: [[0, 2]], 7: [[0, 3]], 8: [[0, 3]], 9: [[0, 2]], 10: [[0, 1], [3, 2]],
      11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]],
    };

    function draw(t) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) vals[y * cols + x] = field(x, y, t);
      }
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      const pt = new Array(4);
      for (const L of LEVELS) {
        ctx.beginPath();
        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const a = vals[y * cols + x], b = vals[y * cols + x + 1];
            const c = vals[(y + 1) * cols + x + 1], d = vals[(y + 1) * cols + x];
            const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (!idx || idx === 15) continue;
            const px = x * CELL, py = y * CELL;
            pt[0] = [px + CELL * ((L - a) / (b - a)), py];
            pt[1] = [px + CELL, py + CELL * ((L - b) / (c - b))];
            pt[2] = [px + CELL * ((L - d) / (c - d)), py + CELL];
            pt[3] = [px, py + CELL * ((L - a) / (d - a))];
            for (const [e0, e1] of SEG[idx]) {
              ctx.moveTo(pt[e0][0], pt[e0][1]);
              ctx.lineTo(pt[e1][0], pt[e1][1]);
            }
          }
        }
        ctx.stroke();
      }
    }

    resize();
    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => { resize(); draw(last / 9000); });
      ro.observe(hero);
    }

    let last = 0, visible = true, raf = 0;
    if (reduce) { draw(0.3); return; }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (t - last < 50) return;
      last = t;
      draw(t / 9000);
    }
    raf = requestAnimationFrame(frame);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(hero);
    }
  })();

  // Scroll reveal for sections below the hero.
  (() => {
    const els = [...document.querySelectorAll(".work .reveal, .studio .reveal")];
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.2 });
    els.forEach((e) => io.observe(e));
  })();
})();
