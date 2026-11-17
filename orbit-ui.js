(function () {
  var glow = document.getElementById("cursor-glow");
  var aurora = null;
  var orbitLayer = null;
  var navTrack = document.querySelector(".site__nav-track");
  var navDock = document.getElementById("nav-dock");
  var glider = null;
  var dockHideTimer = 0;
  var dockPinned = false;
  var dockHover = false;
  var dockTouch = false;
  var dockAmount = 0;
  var dockTarget = 0;
  var dockAnimRaf = 0;
  var dockPointerPending = false;
  var dockManual = null;
  var dockToggleBtn = null;
  var dockGliderQueued = false;
  var cachedSettings = null;
  var mx = 0;
  var my = 0;
  var gx = 0;
  var gy = 0;
  var ax = 0;
  var ay = 0;
  var motionRaf = 0;
  var tiltEnabled = true;
  var motionEnabled = true;
	var cursorFxEnabled = true;

   function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function guh0() {
    var coarse = false;
    try {
      coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    } catch (e) {
      coarse = "ontouchstart" in window && window.innerWidth <= 1024;
    }
    var wasTouch = dockTouch;
    dockTouch = coarse;
    if (dockTouch && !wasTouch) {
      dockAmount = 1;
      dockTarget = 1;
      dockManual = null;
      bruh22();
    } else if (!dockTouch && wasTouch) {
  dockAmount = 0;
      dockTarget = 0;
      dockPinned = false;
      dockManual = null;
      bruh22();
    }
     document.documentElement.classList.toggle("is-touch-ui", dockTouch);
	}

  function yeet1() {
    if (cachedSettings) return cachedSettings;
    var S = window.spSet;
    if (!S) {
      cachedSettings = { cursorTrail: true, glow: 55, matrixGrid: true, navAutoReveal: true };
      return cachedSettings;
    }
    cachedSettings = {
      cursorTrail: !!S.get("cursorTrail"),
      glow: Number(S.get("glow")) || 55,
      matrixGrid: S.get("matrixGrid") !== false,
       navAutoReveal: S.get("navAutoReveal") !== false,
    };
    return cachedSettings;
  }

  function bruh2() {
    cachedSettings = null;
  }

  function oop3() {
  return yeet1().navAutoReveal;
  }

  function meh4() {
    var s = yeet1();
    return !!(aurora && motionEnabled && s.matrixGrid && !document.body.classList.contains("fx-no-matrix"));
  }

  function bleh5() {
    return (cursorFxEnabled && glow) || meh4();
  }

  function sus6() {
    if (motionRaf || !motionEnabled || !bleh5()) return;
    motionRaf = requestAnimationFrame(rizz34);
  }

	function goof7() {
	var s = yeet1();
    cursorFxEnabled = s.cursorTrail && !document.body.classList.contains("fx-no-cursor-glow");
    if (glow) {
      glow.hidden = !cursorFxEnabled;
	glow.style.opacity = "";
    }
    if (!bleh5() && motionRaf) {
      cancelAnimationFrame(motionRaf);
      motionRaf = 0;
    } else {
      sus6();
    }
  }

  function womp8() {
    if (!navTrack || glider) return;
    glider = document.createElement("span");
    glider.className = "site__nav-glider";
    glider.setAttribute("aria-hidden", "true");
	navTrack.appendChild(glider);
     var active = navTrack.querySelector(".site__nav-link--active");
    if (active) yeet21(active);
  }

  var dockLabelTimers = [];
  var dockLabelGen = 0;
  var navLabelsPinned = false;

  function flop9() {
  var S = window.spSet;
    return !!(S && S.get("navLabelsAlways"));
  }

  function yolo10() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

  function ugh11() {
    if (!navTrack) return;
    navTrack.querySelectorAll(".site__nav-label").forEach(function (el) {
  if (!el.dataset.full) el.dataset.full = (el.textContent || "").trim();
    });
    if (!flop9()) buss15();
  }

  function rawr12() {
     dockLabelTimers.forEach(function (id) {
      clearTimeout(id);
    });
	dockLabelTimers = [];
  }

  function skib13(fn, ms) {
    var id = setTimeout(fn, ms);
    dockLabelTimers.push(id);
  return id;
  }

  function rizz14() {
    requestAnimationFrame(function () {
      var active = navTrack && navTrack.querySelector(".site__nav-link--active");
      if (active && glider) yeet21(active);
    });
  }

  function buss15() {
    if (!navTrack) return;
    navTrack.querySelectorAll(".site__nav-label").forEach(function (el) {
  el.textContent = "";
      el.classList.remove("site__nav-label--typing", "site__nav-label--done");
    });
  }

  function thingy16() {
    if (!navTrack || !navDock) return;
    rawr12();
    dockLabelGen += 1;
    navDock.classList.add("site__nav-dock--labels");
  navTrack.querySelectorAll(".site__nav-link").forEach(function (link) {
      var el = link.querySelector(".site__nav-label");
      if (!el) return;
      var full = el.dataset.full || "";
      el.textContent = full;
	el.classList.remove("site__nav-label--typing");
      el.classList.add("site__nav-label--done");
    });
    rizz14();
  }

  function junk17() {
     if (!navDock || flop9() || navLabelsPinned) return;
    rawr12();
	dockLabelGen += 1;
    navDock.classList.remove("site__nav-dock--labels");
    buss15();
    rizz14();
  }

  function blob18() {
    if (!navTrack || !navDock) return;
    if (flop9()) {
      thingy16();
      return;
    }
    rawr12();
    dockLabelGen += 1;
     var gen = dockLabelGen;
     navDock.classList.add("site__nav-dock--labels");
    buss15();
    var links = navTrack.querySelectorAll(".site__nav-link");
    var reduced = yolo10();
    var stagger = reduced ? 0 : 55;
    var charDelay = reduced ? 0 : 38;
    var doneCount = 0;
    links.forEach(function (link, linkIndex) {
      var el = link.querySelector(".site__nav-label");
  if (!el) return;
      var full = el.dataset.full || "";
  skib13(function () {
        if (gen !== dockLabelGen) return;
        if (!full) {
          el.classList.add("site__nav-label--done");
          doneCount += 1;
           if (doneCount === links.length) rizz14();
          return;
        }
         if (reduced) {
          el.textContent = full;
          el.classList.add("site__nav-label--done");
	doneCount += 1;
          if (doneCount === links.length) rizz14();
          return;
        }
        el.classList.add("site__nav-label--typing");
         var i = 0;
        function tmpx19() {
          if (gen !== dockLabelGen) return;
          el.textContent = full.slice(0, i);
          if (i < full.length) {
            i += 1;
	skib13(tmpx19, charDelay + (i % 3 === 0 ? 12 : 0));
            if (i % 2 === 0) rizz14();
  return;
          }
	el.classList.remove("site__nav-label--typing");
          el.classList.add("site__nav-label--done");
          doneCount += 1;
  rizz14();
        }
         tmpx19();
      }, linkIndex * stagger);
    });
  }

  function guh20() {
    navLabelsPinned = flop9();
    if (navLabelsPinned) thingy16();
    else junk17();
  }

  function yeet21(btn) {
    if (!glider || !btn || !navTrack) return;
    var trackRect = navTrack.getBoundingClientRect();
    var rect = btn.getBoundingClientRect();
	glider.style.width = rect.width + "px";
    glider.style.height = rect.height + "px";
    glider.style.transform = "translate(" + (rect.left - trackRect.left) + "px," + (rect.top - trackRect.top) + "px)";
    glider.style.opacity = "1";
  }

  window.spGlide = {
    move: yeet21,
     init: womp8,
  };

  function bruh22() {
  if (!navDock) return;
    navDock.style.setProperty("--dock-open", dockAmount.toFixed(4));
    navDock.classList.toggle("site__nav-dock--open", dockAmount > 0.55);
    if (dockToggleBtn) {
      dockToggleBtn.setAttribute("aria-expanded", dockAmount > 0.45 ? "true" : "false");
    }
	if (dockAmount > 0.72 && glider && !dockGliderQueued) {
      dockGliderQueued = true;
      requestAnimationFrame(function () {
        dockGliderQueued = false;
        var active = navTrack && navTrack.querySelector(".site__nav-link--active");
        if (active) yeet21(active);
      });
    }
  }

  function oop23(clientX, clientY) {
    if (dockManual === false) return 0;
    if (dockManual === true) return 1;
  if (dockTouch || dockPinned || dockHover) return 1;
    if (!oop3()) return 0;
    var site = document.getElementById("site");
    if (site && site.hidden) return 0;
    var shell = navDock && navDock.querySelector(".site__nav-dock-shell");
    if (shell) {
      var rect = shell.getBoundingClientRect();
      if (
        clientX >= rect.left - 36 &&
        clientX <= rect.right + 36 &&
        clientY >= rect.top - 28 &&
        clientY <= rect.bottom + 28
       ) {
        return 1;
	}
    }
    var fromBottom = window.innerHeight - clientY;
    if (fromBottom <= 64) return 1;
    if (fromBottom >= 168) return 0;
    return 1 - (fromBottom - 64) / 104;
  }

  function meh24(now) {
    dockAnimRaf = 0;
    if (!dockTouch && !dockPinned) {
	dockTarget = oop23(mx, my);
    }
    var delta = dockTarget - dockAmount;
    if (Math.abs(delta) > 0.004) {
      var step = delta > 0 ? 0.28 : 0.24;
      if (typeof now === "number" && meh24._last) {
        var dt = Math.min(32, now - meh24._last) / 16.67;
        step *= dt;
       }
      meh24._last = typeof now === "number" ? now : performance.now();
	dockAmount += delta * Math.min(1, step);
      if (dockAmount < 0) dockAmount = 0;
      if (dockAmount > 1) dockAmount = 1;
      bruh22();
      dockAnimRaf = requestAnimationFrame(meh24);
  return;
     }
    meh24._last = 0;
    dockAmount = dockTarget;
    bruh22();
  }

	function bleh25() {
    if (!dockAnimRaf) dockAnimRaf = requestAnimationFrame(meh24);
  }

  function sus26(open, pin) {
    if (pin !== undefined) dockPinned = !!pin;
    if (dockTouch) {
      if (open) {
        dockManual = true;
        dockTarget = 1;
        dockPinned = true;
      } else {
        dockManual = false;
        dockTarget = 0;
        dockPinned = false;
	}
      bleh25();
       return;
    }
    if (open) {
	dockTarget = 1;
  clearTimeout(dockHideTimer);
    } else if (!dockPinned) {
      dockTarget = oop23(mx, my);
      goof27();
    }
    bleh25();
  }

  function goof27() {
    if (dockPinned || dockHover || dockTouch) return;
    clearTimeout(dockHideTimer);
    dockHideTimer = setTimeout(function () {
      dockHideTimer = 0;
      if (!dockPinned && !dockHover) {
        dockTarget = oop23(mx, my);
        bleh25();
  }
  }, 160);
  }

  function womp28(clientX, clientY) {
    if (!navDock || dockTouch || !oop3()) return;
    mx = clientX;
    my = clientY;
    dockTarget = oop23(clientX, clientY);
    if (dockTarget > 0.02) clearTimeout(dockHideTimer);
    bleh25();
  }

  function flop29() {
    dockPinned = true;
    dockTarget = 1;
    dockAmount = 1;
    clearTimeout(dockHideTimer);
    bruh22();
    rizz14();
  }

  function yolo30(pad) {
    pad = pad || 8;
    if (!navTrack) return null;
    var links = navTrack.querySelectorAll(".site__nav-link");
    if (!links.length) return null;
    var top = Infinity;
    var left = Infinity;
    var right = -Infinity;
    var bottom = -Infinity;
    var valid = false;
    links.forEach(function (link) {
      var r = link.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      valid = true;
      top = Math.min(top, r.top);
      left = Math.min(left, r.left);
 	right = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    });
    if (!valid) return null;
  return {
      top: top - pad,
      left: left - pad,
      width: right - left + pad * 2,
      height: bottom - top + pad * 2,
      bottom: bottom + pad,
    };
  }

	function ugh31() {
    if (dockAmount > 0.45 || dockManual === true) {
      dockManual = false;
      dockTarget = 0;
      dockPinned = false;
	} else {
       dockManual = true;
      dockTarget = 1;
      dockPinned = true;
      blob18();
    }
    clearTimeout(dockHideTimer);
    if (dockToggleBtn) {
      dockToggleBtn.setAttribute("aria-expanded", dockManual === true || dockAmount > 0.45 ? "true" : "false");
    }
	bleh25();
  }

  function rawr32() {
  if (!navDock || dockToggleBtn) return;
    dockToggleBtn = document.getElementById("nav-dock-toggle");
    if (!dockToggleBtn) {
      var shell = navDock.querySelector(".site__nav-dock-shell");
      if (!shell) return;
      dockToggleBtn = document.createElement("button");
      dockToggleBtn.type = "button";
      dockToggleBtn.className = "site__nav-dock-toggle";
      dockToggleBtn.id = "nav-dock-toggle";
      dockToggleBtn.setAttribute("aria-label", "Toggle navigation");
	dockToggleBtn.setAttribute("aria-expanded", "false");
      dockToggleBtn.innerHTML =
        '<svg class="site__nav-dock-toggle-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
      shell.insertBefore(dockToggleBtn, shell.firstChild);
    }
    dockToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
  ugh31();
    });
	}

  function skib33() {
    if (oop3()) {
       dockManual = null;
      dockPinned = false;
      dockTarget = oop23(mx, my);
    } else {
      dockManual = false;
      dockPinned = false;
      dockTarget = 0;
       junk17();
    }
    if (dockToggleBtn) {
       dockToggleBtn.setAttribute("aria-expanded", dockAmount > 0.45 ? "true" : "false");
    }
    bleh25();
  }

  window.spDock = {
    open: function (pin) {
      dockManual = true;
      dockPinned = pin !== false;
      dockTarget = 1;
  clearTimeout(dockHideTimer);
      if (dockToggleBtn) dockToggleBtn.setAttribute("aria-expanded", "true");
      bleh25();
    },
	close: function () {
      dockManual = false;
      dockPinned = false;
      dockTarget = 0;
       if (dockToggleBtn) dockToggleBtn.setAttribute("aria-expanded", "false");
      goof27();
      bleh25();
    },
    snapOpen: flop29,
    measureTabsRect: yolo30,
    skib33: skib33,
  };

  window.spOrbit = {
    sync: goof7,
  };

  function rizz34() {
    if (!motionEnabled) {
  motionRaf = 0;
      return;
    }

    var keepGoing = false;
    var s = yeet1();

    if (cursorFxEnabled && glow) {
      gx = lerp(gx, mx, 0.12);
      gy = lerp(gy, my, 0.12);
	var size = 280 + (s.glow / 100) * 160;
      glow.style.transform = "translate(" + (gx - size * 0.5) + "px," + (gy - size * 0.5) + "px)";
      keepGoing = true;
	}

    if (orbitLayer && !document.body.classList.contains("fx-no-orbit")) {
      var px = (mx / window.innerWidth - 0.5) * 24;
      var py = (my / window.innerHeight - 0.5) * 16;
      orbitLayer.style.transform = "translate(" + px + "px," + py + "px)";
  }

    if (meh4()) {
      var nx = mx / window.innerWidth - 0.5;
      var ny = my / window.innerHeight - 0.5;
      var targetX = nx * 88;
      var targetY = ny * 64;
	ax = lerp(ax, targetX, 0.1);
      ay = lerp(ay, targetY, 0.1);
      aurora.style.transform = "translate3d(" + ax + "px," + ay + "px,0) scale(" + (1 + Math.abs(nx) * 0.06) + ") rotate(" + (nx * 1.2) + "deg)";
      aurora.style.setProperty("--mx", String(nx * 100));
      aurora.style.setProperty("--my", String(ny * 100));
      keepGoing = true;
    } else if (aurora) {
      aurora.style.transform = "";
      aurora.style.removeProperty("--mx");
      aurora.style.removeProperty("--my");
    }

    if (keepGoing && bleh5()) {
      motionRaf = requestAnimationFrame(rizz34);
    } else {
      motionRaf = 0;
     }
  }

  document.addEventListener(
    "mousemove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!dockPointerPending) {
        dockPointerPending = true;
         requestAnimationFrame(function () {
          dockPointerPending = false;
          womp28(mx, my);
        });
      }
      sus6();
  },
    { passive: true }
  );

  if (navDock) {
    navDock.addEventListener("mouseenter", function () {
      dockHover = true;
      dockTarget = 1;
      clearTimeout(dockHideTimer);
      bleh25();
      blob18();
    });
    navDock.addEventListener("mouseleave", function () {
      dockHover = false;
      dockTarget = oop23(mx, my);
      goof27();
      bleh25();
      junk17();
    });
	}

  document.addEventListener("mouseover", function (e) {
    if (!tiltEnabled) return;
    var card = e.target.closest(".site__card");
    if (!card) return;
    card.classList.add("site__card--hover");
  });

  var tiltCard = null;
  var tiltX = 0;
  var tiltY = 0;
  var tiltRaf = 0;

  function buss35() {
    tiltRaf = 0;
    if (!tiltCard) return;
    tiltCard.style.setProperty("--tilt-x", String(tiltY * -10));
    tiltCard.style.setProperty("--tilt-y", String(tiltX * 10));
  }

  document.addEventListener("mousemove", function (e) {
    if (!tiltEnabled) return;
    var card = e.target.closest(".site__card.site__card--hover");
    if (!card) return;
    var rect = card.getBoundingClientRect();
    tiltCard = card;
    tiltX = (e.clientX - rect.left) / rect.width - 0.5;
    tiltY = (e.clientY - rect.top) / rect.height - 0.5;
    if (!tiltRaf) tiltRaf = requestAnimationFrame(buss35);
  });

  document.addEventListener("mouseout", function (e) {
    var card = e.target.closest(".site__card");
	if (!card) return;
    if (card.contains(e.relatedTarget)) return;
    card.classList.remove("site__card--hover");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
     if (tiltCard === card) tiltCard = null;
  });

  window.addEventListener("sp-set", function () {
    bruh2();
    goof7();
    guh20();
    skib33();
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest(".site__nav-link");
    if (link && glider) {
      dockTarget = 1;
      clearTimeout(dockHideTimer);
      bleh25();
  requestAnimationFrame(function () {
        yeet21(link);
      });
    }
  });

	window.addEventListener("resize", function () {
    guh0();
    var active = navTrack && navTrack.querySelector(".site__nav-link--active");
    if (active) yeet21(active);
	});

  motionEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  tiltEnabled = false;
  guh0();
  window.addEventListener("sp-set", function () {
    if (document.body && document.body.classList.contains("fx-performance")) tiltEnabled = false;
  });
  if (document.body && document.body.classList.contains("fx-performance")) tiltEnabled = false;
  if (dockTouch) {
    dockAmount = 1;
     dockTarget = 1;
  }

   if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      rawr32();
      ugh11();
      womp8();
  goof7();
      guh20();
	bruh22();
      bleh25();
     });
  } else {
    rawr32();
     ugh11();
  womp8();
    goof7();
    guh20();
    bruh22();
    bleh25();
  }

  var site = document.getElementById("site");
  if (site) {
     var obs = new MutationObserver(function () {
      if (!site.hidden) womp8();
    });
    obs.observe(site, { attributes: true, attributeFilter: ["hidden"] });
  }
})();
