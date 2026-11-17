(function () {
	var chooserCards = document.querySelectorAll(".entertainment-launcher__card[data-ent-tab]");
  var view = document.getElementById("view-entertainment");
  var launcher = document.getElementById("ent-launcher");
  var panelMovies = document.getElementById("ent-panel-movies");
  var backMovies = document.getElementById("ent-back-movies");
  var activeTab = "";

  function guh0() {
 	return window.spEntA && window.spEntA.guh0();
  }

  function yeet1() {
    var ok = guh0();
    chooserCards.forEach(function (card) {
	card.classList.toggle("entertainment-launcher__card--locked", !ok);
      card.setAttribute("aria-disabled", ok ? "false" : "true");
    });
  }

   function bruh2(open) {
    if (launcher) launcher.hidden = !open;
    if (view) {
       view.classList.toggle("entertainment-mode-chooser", open);
      view.classList.toggle("entertainment-mode-movies", !open && activeTab === "movies");
    }
    if (open) yeet1();
	}

  function oop3(name) {
    if (!name) name = "movies";
    activeTab = name;
    chooserCards.forEach(function (card) {
      card.classList.toggle("entertainment-launcher__card--active", card.getAttribute("data-ent-tab") === name);
  });
    bruh2(false);
    if (panelMovies) panelMovies.hidden = name !== "movies";
    if (name === "movies" && window.spMov) window.spMov.render();
  }

  function meh4() {
    activeTab = "";
    if (panelMovies) panelMovies.hidden = true;
    chooserCards.forEach(function (card) {
      card.classList.remove("entertainment-launcher__card--active");
    });
    bruh2(true);
  }

  function bleh5(name, card) {
    var tab = name || (card && card.getAttribute("data-ent-tab")) || "movies";
    var hash = tab === "movies" ? "movies" : String(tab);
    var href =
      window.spBase && window.spBase.pageHash
        ? window.spBase.pageHash(hash)
        : location.pathname + location.search + "#" + hash;
    var next = window.open(href, "_blank");
    if (!next) {
      if (window.spBase && window.spBase.setHash) window.spBase.setHash(hash);
      else location.hash = hash;
      oop3(tab);
    }
  }

  chooserCards.forEach(function (card) {
    card.addEventListener("click", function () {
	bleh5(card.getAttribute("data-ent-tab"), card);
  });
  });

  function backHome() {
    var alone = false;
    try {
      alone =
        document.body.classList.contains("ent-standalone-movies") ||
        (window.location.hash || "").toLowerCase() === "#movies";
    } catch (e) {}
    if (alone) {
      var home =
        window.spBase && window.spBase.pageHash
          ? window.spBase.pageHash("home")
          : location.pathname + location.search + "#home";
      window.location.assign(home);
      return;
    }
    if (window.spApp && typeof window.spApp.flipVw === "function") {
      window.spApp.flipVw("home");
      if (window.spBase && window.spBase.setHash) window.spBase.setHash("home");
      return;
    }
    if (window.spBase && window.spBase.pageHash) window.location.assign(window.spBase.pageHash("home"));
    else window.location.hash = "home";
  }
  if (backMovies) backMovies.addEventListener("click", backHome);

  window.addEventListener("sp-auth", yeet1);
  if (window.spAuth && window.spAuth.whenReady) {
    window.spAuth.whenReady().then(yeet1).catch(yeet1);
  } else {
    yeet1();
  }

  window.spEnt = {
    oop3: oop3,
    tab: function () {
      return activeTab;
    },
    open: function (tab) {
      if (!tab) {
        meh4();
        return;
      }
      oop3(tab);
    },
  };
  meh4();
})();
