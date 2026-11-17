(function () {
  var GUH0 = "kobran-cloak-stage";
  var YEET1 = "krying";
  var BRUH2 = "Lesson 4.2: Graphing Linear Equations | Algebra I";
  var SITE_ICO = "/assets/kobran-logo.webp";
  var HIDE_ICO = "https://www.google.com/s2/favicons?domain=classroom.google.com&sz=64";
  var cloakEl = document.getElementById("study-cloak");
	var dateEl = document.getElementById("study-cloak-date");
  var loader = document.getElementById("loader");
  var site = document.getElementById("site");
  var active = false;

 	function loadAct() {
    try {
      var n = parseInt(localStorage.getItem(GUH0) || "0", 10);
      return n >= 1;
    } catch (e) {
       return false;
    }
  }

  function saveAct() {
    try {
      localStorage.setItem(GUH0, active ? "1" : "0");
    } catch (e) {}
	}

  function setIco(url) {
    try {
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      var link = document.createElement("link");
      link.id = "kobran-cloak-favicon";
      link.rel = "icon";
      link.href = url;
      link.type = /\.svg(\?|$)/i.test(url) || String(url).indexOf("data:image/svg") === 0 ? "image/svg+xml" : /\.webp(\?|$)/i.test(url) ? "image/webp" : "image/png";
      document.head.insertBefore(link, document.head.firstChild);
    } catch (e) {}
  }

  function fixDate() {
	if (!dateEl) return;
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function hideLoadCloak() {
    if (!active) return;
    if (window.spLoad) window.spLoad.skip();
    else {
  document.documentElement.classList.remove("loader-lock");
	if (loader) {
        loader.hidden = true;
        loader.remove();
      }
      if (site) site.hidden = false;
    }
  }

  function doCloak(options) {
    options = options || {};
    document.documentElement.classList.toggle("cloak-full", active);
    if (cloakEl) {
      cloakEl.hidden = !active;
      cloakEl.classList.toggle("study-cloak--open", active);
      cloakEl.setAttribute("aria-hidden", active ? "false" : "true");
	}
    document.title = active ? BRUH2 : YEET1;
    setIco(active ? HIDE_ICO : SITE_ICO);
    if (options.persist !== false) saveAct();
    if (active) {
      hideLoadCloak();
 	fixDate();
      if (options.notify !== false) {
        window.dispatchEvent(new CustomEvent("sp-clk-on"));
      }
    } else if (options.notify !== false) {
      window.dispatchEvent(new CustomEvent("sp-clk-off"));
    }
  }

  function flipCloak() {
    active = !active;
    doCloak({ persist: true, notify: true });
  }

	document.addEventListener("keydown", function (e) {
    if (!e.ctrlKey || e.key.toLowerCase() !== "e") return;
    if (e.altKey || e.metaKey || e.shiftKey) return;
  var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    e.preventDefault();
    flipCloak();
  });

  if (cloakEl) {
	cloakEl.addEventListener("click", function (e) {
      if (e.target.closest("a")) e.preventDefault();
    });
  }

  window.spClk = {
	isActive: function () {
      return active;
    },
  reset: function () {
	active = false;
	doCloak({ persist: true, notify: true });
    },
  };

  active = loadAct();
  doCloak({ persist: false, notify: active });
  fixDate();
})();
