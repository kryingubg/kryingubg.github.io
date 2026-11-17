(function () {
  var c = null;
  var g = null;
  var bits = [];
  var loop = 0;
  var go = false;
  var W = 0;
  var H = 0;
  var mist = null;
  var last = 0;

  function yeet() {
    var sz = 1.2 + Math.random() * 2.4;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      sz: sz,
      vy: 0.35 + Math.random() * 1.1 + sz * 0.08,
      vx: -0.25 + Math.random() * 0.5,
      a: 0.35 + Math.random() * 0.45,
    };
  }

  function dumpBits(n) {
    bits = [];
    for (var i = 0; i < n; i++) bits.push(yeet());
  }

  function fit() {
    if (!c || !g) return;
    W = window.innerWidth || 1;
    H = window.innerHeight || 1;
    var d = Math.min(window.devicePixelRatio || 1, 1.25);
    c.width = Math.floor(W * d);
    c.height = Math.floor(H * d);
    c.style.width = W + "px";
    c.style.height = H + "px";
    g.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.floor((W * H) / 28000);
    if (n < 16) n = 16;
    if (n > 36) n = 36;
    if (document.body && document.body.classList.contains("ent-standalone-movies")) n = Math.min(n, 18);
    if (document.body && document.body.classList.contains("fx-performance")) n = Math.min(n, 14);
    dumpBits(n);
  }

  function frame(now) {
    if (!go || !g) {
      loop = 0;
      return;
    }
    if (now - last < 33) {
      loop = requestAnimationFrame(frame);
      return;
    }
    last = now;
    g.clearRect(0, 0, W, H);
    g.fillStyle = "rgba(245,252,255,0.85)";
    for (var i = 0; i < bits.length; i++) {
      var p = bits[i];
      p.y += p.vy;
      p.x += p.vx;
      if (p.y > H + 8) {
        p.y = -8;
        p.x = Math.random() * W;
      }
      if (p.x > W + 8) p.x = -8;
      if (p.x < -8) p.x = W + 8;
      g.globalAlpha = p.a;
      g.beginPath();
      g.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    loop = requestAnimationFrame(frame);
  }

  function kick() {
    if (!c || !g || loop) return;
    loop = requestAnimationFrame(frame);
  }

  function kill() {
    if (loop) cancelAnimationFrame(loop);
    loop = 0;
    if (g && c) g.clearRect(0, 0, W, H);
  }

  function mistUp(on) {
    if (!mist) {
      mist = document.getElementById("winter-mist");
      if (!mist) {
        mist = document.createElement("div");
        mist.id = "winter-mist";
        mist.className = "winter-mist";
        mist.setAttribute("aria-hidden", "true");
        document.body.insertBefore(mist, document.body.firstChild);
      }
    }
    mist.hidden = !on;
  }

  function sync() {
    var want = false;
    try {
      if (window.spSet && typeof window.spSet.get === "function") {
        want = !!window.spSet.get("winterOn");
      }
    } catch (e) {}
    if (document.body) document.body.classList.toggle("fx-winter", want);
    var snow = want;
    if (document.body && document.body.classList.contains("fx-performance")) snow = false;
    if (document.body && document.body.classList.contains("fx-low-data")) snow = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) snow = false;
    mistUp(false);
    go = snow;
    if (c) {
      if (snow) c.removeAttribute("hidden");
      else c.setAttribute("hidden", "");
    }
    if (snow) {
      fit();
      kick();
    } else {
      kill();
    }
  }

  function boot() {
    c = document.getElementById("winter-canvas");
    if (!c) {
      c = document.createElement("canvas");
      c.id = "winter-canvas";
      c.className = "winter-canvas";
      c.setAttribute("aria-hidden", "true");
      document.body.appendChild(c);
    }
    c.className = "winter-canvas";
    g = c.getContext("2d", { alpha: true });
    window.addEventListener("resize", function () {
      if (go) fit();
    });
    window.addEventListener("sp-set", sync);
    sync();
  }

  window.spWinter = { sync: sync };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
