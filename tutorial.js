(function () {
  var AUTO_OFF_KEY = "kobran-orbit-guide-auto-off";
  var guide = document.getElementById("guide");
  var spot = document.getElementById("guide-spot");
  var card = document.getElementById("guide-card");
  var titleEl = document.getElementById("guide-title");
  var bodyEl = document.getElementById("guide-body");
	var nextBtn = document.getElementById("guide-next");
  var skipBtn = document.getElementById("guide-skip");
  var stepCountEl = document.getElementById("guide-step-count");
  var dotsEl = document.getElementById("guide-dots");
  var finishOpt = document.getElementById("guide-finish-opt");
   var autoOffInput = document.getElementById("guide-auto-off");
  var guideActions = document.getElementById("guide-actions");
  var guidePrompt = document.getElementById("guide-prompt");
  var promptKeep = document.getElementById("guide-prompt-keep");
  var promptStop = document.getElementById("guide-prompt-stop");
  var active = false;
   var index = 0;
  var layoutTimer = 0;
  var steps = [
    {
      title: "Welcome to krying",
      body: "games, tools, chat, the usual. this tour is short. hit next.",
      center: true,
    },
    {
      title: "Discord button",
  body: "up top next to the kobran name. join if u want updates without refreshing all day.",
      target: ".site__header-discord",
      pad: 8,
      altTarget: ".site__brand-row",
    },
	{
      title: "Search the library",
      body: "type a game name. grid filters as u go.",
  target: "#game-search",
      pad: 10,
	},
    {
      title: "Choose a game",
  body: "click anything. it opens in the player.",
  target: "#games-grid",
      pad: 14,
      fallback: ".site__hero",
    },
    {
      title: "Navigate through tabs here",
       body: "hover the bottom center for the dock. games, hub, entertainment, news, chat, all that.",
      target: ".site__nav-track",
      pad: 10,
      dock: true,
    },
    {
      title: "AI tab",
       body: "bring ur own key and chat. we dont keep it.",
	target: "#nav-ai",
      pad: 10,
      dock: true,
	},
  {
      title: "Open the Hub",
      body: "proxies, apps, tools, extras. side stash for stuff that isnt just games.",
      target: "#nav-hub",
      pad: 10,
      dock: true,
    },
    {
      title: "Ready?",
      body: "thats it. search a game, poke around the hub, or hop in chat.",
      center: true,
      finish: true,
    },
  ];

  function guh0() {
     try {
      return localStorage.getItem(AUTO_OFF_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function yeet1(off) {
    try {
      if (off) localStorage.setItem(AUTO_OFF_KEY, "1");
       else localStorage.removeItem(AUTO_OFF_KEY);
	} catch (e) {}
  }

  function bruh2() {
    var vv = window.visualViewport;
    if (!vv) {
      return { width: window.innerWidth, height: window.innerHeight, offsetX: 0, offsetY: 0 };
	}
    return { width: vv.width, height: vv.height, offsetX: vv.offsetLeft, offsetY: vv.offsetTop };
  }

  function oop3() {
    var vp = bruh2();
     return vp.width < 640 || vp.height < 520;
  }

  function meh4(step) {
    if (!step.target) return null;
    var el = document.querySelector(step.target);
    if (el && el.offsetParent !== null && el.getClientRects().length) return el;
    if (step.altTarget) {
      var altEl = document.querySelector(step.altTarget);
      if (altEl) return altEl;
    }
    if (step.fallback) {
       var fb = document.querySelector(step.fallback);
      if (fb) return fb;
    }
    if (step.target === "#games-grid") {
  var cardNode = document.querySelector(".site__card");
      if (cardNode) return cardNode;
    }
    return el;
  }

  function bleh5() {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    steps.forEach(function (_, i) {
      var dot = document.createElement("span");
   dot.className = "guide__dot";
      if (i === index) dot.classList.add("guide__dot--active");
      if (i < index) dot.classList.add("guide__dot--done");
      dotsEl.appendChild(dot);
    });
  }

  function sus6() {
    if (!card) return;
	card.classList.remove("guide__card--center", "guide__card--sheet", "guide__card--above");
    card.style.top = "";
    card.style.left = "";
    card.style.right = "";
    card.style.bottom = "";
  card.style.transform = "";
  card.style.maxHeight = "";
  }

  function goof7(rect, center, step) {
    if (!card) return;
	sus6();
    var vp = bruh2();
    var margin = Math.max(12, Math.min(18, vp.width * 0.04));
    var safeBottom = margin + (window.innerHeight - vp.height - vp.offsetY > 0 ? 0 : 0);
    var cardRect = card.getBoundingClientRect();
	var cardH = cardRect.height || 220;
    var cardW = cardRect.width || Math.min(420, vp.width - margin * 2);

    if (center || !rect || oop3()) {
      if (oop3() || !rect) {
        card.classList.add("guide__card--sheet");
        card.style.left = vp.offsetX + margin + "px";
        card.style.right = margin + "px";
        card.style.bottom = margin + safeBottom + "px";
        card.style.maxHeight = Math.max(160, vp.height - margin * 2 - 24) + "px";
	return;
      }
  }

    if (center || !rect) {
      card.classList.add("guide__card--center");
      return;
    }

    var spaceBelow = vp.height + vp.offsetY - rect.bottom;
    var spaceAbove = rect.top - vp.offsetY;
    var preferAbove = step && step.dock;
  var placeAbove = preferAbove || (spaceBelow < cardH + margin * 2 && spaceAbove > spaceBelow);

    if (placeAbove) {
	card.classList.add("guide__card--above");
      var top = rect.top - cardH - margin;
      if (top < vp.offsetY + margin) top = vp.offsetY + margin;
      card.style.top = top + "px";
  } else {
      var topBelow = rect.bottom + margin;
      if (topBelow + cardH > vp.offsetY + vp.height - margin) {
        topBelow = Math.max(vp.offsetY + margin, vp.offsetY + vp.height - cardH - margin);
      }
      card.style.top = topBelow + "px";
    }

    var left = rect.left + rect.width * 0.5 - cardW * 0.5;
	left = Math.max(vp.offsetX + margin, Math.min(left, vp.offsetX + vp.width - cardW - margin));
    card.style.left = left + "px";
    card.style.maxHeight = Math.max(140, vp.height - margin * 2) + "px";
  }

  function womp8(box) {
    var vp = bruh2();
    var m = 6;
    var minW = 28;
    var minH = 20;
  var left = Math.max(vp.offsetX + m, box.left);
    var top = Math.max(vp.offsetY + m, box.top);
    var right = Math.min(vp.offsetX + vp.width - m, box.left + box.width);
    var bottom = Math.min(vp.offsetY + vp.height - m, box.top + box.height);
    return {
      top: top,
  left: left,
	width: Math.max(minW, right - left),
      height: Math.max(minH, bottom - top),
      bottom: bottom,
    };
  }

	function flop9(step) {
    if (!step || !step.target) return false;
     var t = step.target;
    return t === ".site__nav-track" || t === "#nav-dock" || t.indexOf("#nav-") === 0 || !!step.dock;
  }

  function yolo10(box, pad, step) {
    if (!spot || !box) return;
    var clamped = womp8(box);
    spot.hidden = false;
    spot.style.top = clamped.top + "px";
	spot.style.left = clamped.left + "px";
    spot.style.width = clamped.width + "px";
    spot.style.height = clamped.height + "px";
  goof7(
      {
        top: clamped.top + pad,
	left: clamped.left + pad,
        width: Math.max(0, clamped.width - pad * 2),
 	bottom: clamped.bottom - pad,
      },
  false,
      step
  );
  }

  function ugh11(step, tries) {
    tries = tries || 0;
  if (window.spDock && window.spDock.snapOpen) {
      window.spDock.snapOpen();
     } else if (window.spDock) {
  window.spDock.open(true);
  }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
	var pad = step.pad || 10;
        var box = null;
	if (step.target === ".site__nav-track" && window.spDock && window.spDock.measureTabsRect) {
          box = window.spDock.measureTabsRect(pad);
        } else {
          var el = meh4(step);
          if (el) {
	var rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              box = {
                top: rect.top - pad,
                left: rect.left - pad,
                width: rect.width + pad * 2,
                 height: rect.height + pad * 2,
                bottom: rect.bottom + pad,
              };
            }
          }
        }
  if ((!box || box.width < 24 || box.height < 16) && tries < 16) {
          setTimeout(function () {
 	ugh11(step, tries + 1);
          }, 50);
          return;
        }
        if (!box) {
	spot.hidden = true;
          goof7(null, true, step);
	return;
        }
        yolo10(box, pad, step);
      });
    });
  }

  function rawr12() {
    var step = steps[index];
    if (!spot) return;
    if (step.center || !step.target) {
      spot.hidden = true;
      goof7(null, true, step);
      return;
    }
     if (flop9(step)) {
      ugh11(step, 0);
       return;
    }
    var el = meh4(step);
  if (!el) {
  spot.hidden = true;
  goof7(null, true, step);
      return;
    }
    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    requestAnimationFrame(function () {
	requestAnimationFrame(function () {
        var rect = el.getBoundingClientRect();
        var pad = step.pad || 10;
        yolo10(
          {
	top: rect.top - pad,
 	left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            bottom: rect.bottom + pad,
          },
          pad,
          step
        );
      });
    });
  }

	function skib13() {
    if (guidePrompt) guidePrompt.hidden = true;
    if (guideActions) guideActions.hidden = false;
    if (titleEl) titleEl.hidden = false;
  if (bodyEl) bodyEl.hidden = false;
    if (dotsEl) dotsEl.hidden = false;
	if (finishOpt) finishOpt.hidden = !(steps[index] && steps[index].finish);
  }

  function rizz14() {
    if (!guidePrompt) {
      thingy16(false);
      return;
    }
    if (guideActions) guideActions.hidden = true;
     if (finishOpt) finishOpt.hidden = true;
    if (titleEl) titleEl.hidden = true;
  if (bodyEl) bodyEl.hidden = true;
    if (dotsEl) dotsEl.hidden = true;
    guidePrompt.hidden = false;
    if (promptKeep) promptKeep.focus();
  }

	function buss15() {
    var step = steps[index];
    if (!step) return;
    skib13();
	if (guide) guide.classList.toggle("guide--focus", !step.center && !!step.target);
     if (titleEl) titleEl.textContent = step.title;
    if (bodyEl) bodyEl.textContent = step.body;
    if (stepCountEl) stepCountEl.textContent = index + 1 + " / " + steps.length;
    if (nextBtn) nextBtn.textContent = step.finish ? "Launch krying" : "Next";
    if (finishOpt) finishOpt.hidden = !step.finish;
    if (autoOffInput && !step.finish) autoOffInput.checked = false;
    bleh5();
  requestAnimationFrame(function () {
      rawr12();
	requestAnimationFrame(rawr12);
    });
    if (nextBtn) nextBtn.focus();
  }

  function thingy16(fromFinish) {
    if (fromFinish && autoOffInput && autoOffInput.checked) yeet1(true);
    active = false;
    document.documentElement.classList.remove("guide-open");
    if (guide) {
      guide.hidden = true;
      guide.classList.remove("guide--active");
    }
    if (spot) spot.hidden = true;
    skib13();
    if (window.spDock) window.spDock.close();
    window.removeEventListener("resize", blob18);
    window.removeEventListener("scroll", blob18, true);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", blob18);
      window.visualViewport.removeEventListener("scroll", blob18);
    }
  }

  function junk17() {
    if (!active) return;
    if (index >= steps.length - 1) {
      thingy16(true);
      return;
    }
    index += 1;
    buss15();
  }

  function blob18() {
	if (!active) return;
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(rawr12, 40);
  }

  function tmpx19() {
    window.addEventListener("resize", blob18);
    window.addEventListener("scroll", blob18, true);
	if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", blob18);
      window.visualViewport.addEventListener("scroll", blob18);
    }
  }

  function guh20(force) {
    if (!guide || active) return;
    if (document.documentElement.classList.contains("cloak-full")) return;
    if (!force && guh0()) return;
    active = true;
    index = 0;
    guide.hidden = false;
    document.documentElement.classList.add("guide-open");
	requestAnimationFrame(function () {
      guide.classList.add("guide--active");
      buss15();
    });
    tmpx19();
  }

	if (nextBtn) nextBtn.addEventListener("click", junk17);
  if (skipBtn) {
    skipBtn.addEventListener("click", function () {
  if (!active) return;
      rizz14();
    });
  }
  if (promptKeep) {
    promptKeep.addEventListener("click", function () {
       thingy16(false);
    });
	}
  if (promptStop) {
	promptStop.addEventListener("click", function () {
      yeet1(true);
      thingy16(false);
  });
   }

  document.addEventListener("keydown", function (e) {
  if (!active) return;
    if (guidePrompt && !guidePrompt.hidden) {
      if (e.key === "Escape") {
        e.preventDefault();
        thingy16(false);
      }
  return;
    }
  if (e.key === "Enter" && document.activeElement !== nextBtn && document.activeElement !== skipBtn) {
  e.preventDefault();
      junk17();
    }
  });

  window.spTut = {
     start: function (force) {
      guh20(!!force);
    },
  reset: function () {
      yeet1(false);
    },
  };
})();
