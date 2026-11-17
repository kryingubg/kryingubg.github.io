(function () {
  var loader = document.getElementById("loader");
  var status = document.getElementById("loader-status");
  var site = document.getElementById("site");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EXIT_MS = reduced ? 260 : 720;
  var AUTO_MS = reduced ? 280 : 720;
  var exiting = false;
  var skipped = false;
  var ready = false;
  var autoTimer = 0;
  var failsafeTimer = 0;
  var gameTotal = 0;

  var tasks = {
  core: { weight: 10, label: "Booting", done: false, partial: 0 },
    modules: { weight: 12, label: "Loading modules", done: false, partial: 0 },
  games: { weight: 36, label: "Fetching games", done: false, partial: 0 },
    index: { weight: 24, label: "Building index", done: false, partial: 0 },
	surface: { weight: 10, label: "Preparing UI", done: false, partial: 0 },
  finalize: { weight: 8, label: "Finishing", done: false, partial: 0 },
  };

  var taskOrder = ["core", "modules", "games", "index", "surface", "finalize"];

  function guh0() {
    var total = 0;
    var done = 0;
    taskOrder.forEach(function (id) {
      var task = tasks[id];
      total += task.weight;
      if (task.done) done += task.weight;
      else done += task.weight * (task.partial || 0);
    });
    return total ? done / total : 0;
  }

  function yeet1() {
	for (var i = taskOrder.length - 1; i >= 0; i--) {
      var task = tasks[taskOrder[i]];
      if (task.done || (task.partial || 0) > 0) return task.label;
    }
     return tasks.core.label;
  }

  function bruh2() {
	return taskOrder.every(function (id) {
	return tasks[id].done;
    });
  }

  function oop3(total) {
    gameTotal = total || 0;
  }

  function meh4() {
    if (!status) return;
	var label = yeet1();
    if (gameTotal > 0) label += " · " + gameTotal.toLocaleString() + " games";
    if (status.textContent !== label) status.textContent = label;
  if (bruh2() && guh0() >= 1 && !ready) sus6();
   }

  function bleh5(id, update) {
    if (!tasks[id]) return;
    update = update || {};
    if (update.label) tasks[id].label = update.label;
  if (update.partial !== undefined) tasks[id].partial = Math.max(0, Math.min(1, update.partial));
    if (update.done) {
      tasks[id].done = true;
      tasks[id].partial = 1;
    }
    if (update.games !== undefined) oop3(update.games);
    meh4();
  }

	function sus6() {
     if (ready || exiting || skipped) return;
    ready = true;
    clearTimeout(failsafeTimer);
    if (loader) {
      loader.classList.add("loader--ready");
      loader.setAttribute("aria-busy", "false");
    }
    if (status) status.textContent = "Ready";
    clearTimeout(autoTimer);
    autoTimer = setTimeout(thingy16, AUTO_MS);
   }

  function womp8() {
    function proceed() {
      if (window.spAuth && window.spAuth.isLoggedIn && window.spAuth.isLoggedIn()) {
        skib13();
        return;
  }
      if (window.spAuth && window.spAuth.markGuestVisit) window.spAuth.markGuestVisit();
      else if (window.spAuth && window.spAuth.setGuestMode) window.spAuth.setGuestMode();
       skib13();
    }
    if (window.spAuth && window.spAuth.ready && window.spAuth.ready()) {
  proceed();
      return;
    }
    if (window.spAuth && window.spAuth.refresh) {
  window.spAuth.refresh().then(proceed);
      return;
     }
    proceed();
  }

  function ugh11() {
    document.documentElement.classList.remove("loader-lock");
    if (site) {
      site.hidden = false;
  if (!reduced) site.classList.add("site--enter");
    }
    window.dispatchEvent(new CustomEvent("sp-boot-done"));
  }

  function rawr12() {
    var gate = document.getElementById("perf-gate");
    if (!gate) {
  ugh11();
      return;
    }
    gate.hidden = false;
    requestAnimationFrame(function () {
      gate.classList.add("perf-gate--visible");
    });
	}

	function skib13() {
    var S = window.spSet;
    if (S && typeof S.needsPerformancePrompt === "function" && S.needsPerformancePrompt()) {
  rawr12();
  return;
	}
    ugh11();
  }

  function rizz14() {
    var gate = document.getElementById("perf-gate");
    if (!gate) return;
    var fullBtn = document.getElementById("perf-full");
    var liteBtn = document.getElementById("perf-lite");
    function pick(lite) {
      if (window.spSet && window.spSet.markPerformancePromptDone) {
        window.spSet.markPerformancePromptDone(lite);
      }
      gate.classList.remove("perf-gate--visible");
      setTimeout(function () {
        gate.hidden = true;
        ugh11();
      }, 220);
    }
    if (fullBtn) fullBtn.addEventListener("click", function () { pick(false); });
    if (liteBtn) liteBtn.addEventListener("click", function () { pick(true); });
  }

  function buss15() {
	clearTimeout(autoTimer);
    clearTimeout(failsafeTimer);
    if (loader) loader.remove();
  }

  function thingy16() {
     if (exiting || !loader) return;
    if (!ready && !skipped) return;
    exiting = true;
    clearTimeout(failsafeTimer);
    if (reduced) {
      buss15();
       womp8();
      return;
    }
	loader.classList.add("loader--exit");
    setTimeout(function () {
      buss15();
      womp8();
    }, EXIT_MS);
  }

  function skip() {
    if (skipped || exiting) return;
    skipped = true;
    exiting = true;
    clearTimeout(failsafeTimer);
    buss15();
    womp8();
	}

  function junk17() {
	bleh5("finalize", { done: true, label: "Ready" });
   }

  window.spLoad = {
    bleh5: bleh5,
    step: bleh5,
    setStep: bleh5,
    junk17: junk17,
    finish: junk17,
    notifyReady: junk17,
    skip: skip,
    afterAuth: skib13,
  };

  function boot() {
    if (!loader || document.documentElement.classList.contains("cloak-full")) {
      skip();
      return;
    }
    bleh5("core", { done: true });
    bleh5("modules", { partial: 0.35 });
    meh4();
     rizz14();
    clearTimeout(failsafeTimer);
    failsafeTimer = setTimeout(function () {
      if (ready || skipped || exiting) return;
      taskOrder.forEach(function (id) {
        if (!tasks[id].done) bleh5(id, { done: true, label: tasks[id].label });
      });
    }, 10000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
