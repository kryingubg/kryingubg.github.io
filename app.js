(function () {
  var site = document.getElementById("site");
  var siteCanvas = document.getElementById("site-canvas");
  var logo = document.getElementById("site-logo");
  var gameSearch = document.getElementById("game-search");
   var gamesGrid = document.getElementById("games-grid");
   var gameEmpty = document.getElementById("game-empty");
  var gameCount = document.getElementById("game-count");
  var player = document.getElementById("game-player");
   var playerBack = document.getElementById("player-back");
  var playerTitle = document.getElementById("player-title");
   var playerFrame = document.getElementById("player-frame");
  var playerFs = document.getElementById("player-fs");
  var viewHome = document.getElementById("view-home");
  var viewGames = document.getElementById("view-games");
  var viewHub = document.getElementById("view-hub");
  var viewBrowser = document.getElementById("view-browser");
  var viewEntertainment = document.getElementById("view-entertainment");
  var viewRepTools = document.getElementById("view-rep-tools");
  var viewAi = document.getElementById("view-ai");
  var viewTutorial = document.getElementById("view-tutorial");
  var viewChat = document.getElementById("view-chat");
   var viewTabCloak = document.getElementById("view-tab-cloak");
  var viewSettings = document.getElementById("view-settings");
  var navGames = document.getElementById("nav-games");
  var navLinks = document.querySelectorAll(".site__nav-link[data-view]");
  var navChat = document.getElementById("nav-chat");
  var kryGoGames = document.getElementById("kry-go-games");
  var kryGoBr = document.getElementById("kry-go-browser");

  var allGames = [];
  var filteredGames = [];
	var renderedCount = 0;
  var filterTimer = 0;
  var listObserver = null;
  var gridSentinel = null;
	var GUH0 = 28;
  var YEET1 = 14;
  var BRUH2 = 16;
  var lazyThumbObserver = null;
  var warmedThumbs = new Set();
  var thumbQueue = [];
  var thumbQueueActive = 0;
  var activeGame = null;
  var activeView = "home";

  document.addEventListener("keydown", (e) => {
    if (player && !player.hidden && e.key === "Escape") {
      killPlayer();
    }
   });

  if (logo) {
  logo.addEventListener("click", (e) => {
      e.preventDefault();
      killPlayer();
      flipVw("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (kryGoGames) kryGoGames.addEventListener("click", function () { flipVw("games"); });
  if (kryGoBr) kryGoBr.addEventListener("click", function () { flipVw("browser"); });

  function flipVw(name) {
    activeView = name;
    navLinks.forEach(function (link) {
      var on = link.getAttribute("data-view") === name;
      link.classList.toggle("site__nav-link--active", on);
    });
    if (viewHome) viewHome.hidden = name !== "home";
    if (viewGames) viewGames.hidden = name !== "games";
    if (viewHub) viewHub.hidden = name !== "hub";
 	if (viewBrowser) viewBrowser.hidden = name !== "browser";
    if (viewEntertainment) viewEntertainment.hidden = name !== "entertainment";
    if (viewRepTools) viewRepTools.hidden = name !== "rep-tools";
    if (viewAi) viewAi.hidden = name !== "ai";
    if (viewTutorial) viewTutorial.hidden = name !== "tutorial";
    if (viewChat) viewChat.hidden = name !== "chat";
    if (viewTabCloak) viewTabCloak.hidden = name !== "tab-cloak";
    if (viewSettings) viewSettings.hidden = name !== "settings";
    [viewHome, viewGames, viewHub, viewBrowser, viewEntertainment, viewRepTools, viewAi, viewTutorial, viewChat, viewTabCloak, viewSettings].forEach(function (view) {
      if (!view) return;
      view.classList.toggle("site__view--active", view.id === "view-" + name);
    });
    if (name === "hub" && window.spHub) window.spHub.render();
    if (name === "browser" && window.spBr) window.spBr.open();
    if (name === "entertainment") {
      if (window.spEnt) window.spEnt.open();
      else if (window.spMov) window.spMov.render();
    }
    if (name === "rep-tools" && window.spRep) window.spRep.open();
    if (name === "ai" && window.spAi) window.spAi.render();
    if (name === "tab-cloak" && window.spTab) window.spTab.render();
    if (window.spGlide) {
	var activeLink = document.querySelector(".site__nav-link--active");
      if (activeLink) window.spGlide.move(activeLink);
    }
    var hash = "";
    try {
      hash = (window.location.hash || "").toLowerCase();
    } catch (e) {}
    var standaloneMovies = name === "entertainment" && hash === "#movies";
    var standaloneRep = name === "rep-tools" && hash === "#rep";
    document.body.classList.toggle("ent-standalone-movies", standaloneMovies);
    document.body.classList.toggle("rep-standalone", standaloneRep);
    document.body.classList.remove("ent-standalone-sports");
    document.body.classList.remove("ent-standalone-music");
    document.body.classList.toggle("site--browser-open", name === "browser");
    document.body.classList.toggle("site--ai-open", name === "ai");
    document.body.classList.toggle("site--home-open", name === "home");
    try {
      var keep =
        (name === "entertainment" && hash === "#movies") ||
        (name === "rep-tools" && (hash === "#rep" || hash === "#rep-tools"));
      if (!keep && window.spBase && window.spBase.setHash) window.spBase.setHash(name);
      else if (!keep) {
        try {
          history.replaceState(null, "", location.pathname + location.search + "#" + name);
        } catch (e3) {
          location.hash = name;
        }
      }
    } catch (e2) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      flipVw(link.getAttribute("data-view"));
    });
  });

  function navHideStuff() {
    var hiddenActive = false;
    navLinks.forEach(function (link) {
      var view = link.getAttribute("data-view");
      var layoutHide =
        window.spCfg && window.spCfg.layoutVisible && !window.spCfg.layoutVisible("nav", view);
      link.hidden = !!layoutHide;
      if (link.hidden && view === activeView) hiddenActive = true;
    });
    if (hiddenActive) flipVw("home");
    if (window.spGlide) {
      var activeLink = document.querySelector(".site__nav-link--active:not([hidden])");
      if (activeLink) window.spGlide.move(activeLink);
    }
  }

  window.addEventListener("sp-cfg", navHideStuff);
  if (window.spCfg && window.spCfg.whenReady) {
    window.spCfg.whenReady().then(navHideStuff);
  } else if (window.spCfg && window.spCfg.load) {
    window.spCfg.load().then(navHideStuff);
  } else {
    navHideStuff();
  }

  var tutorialReplay = document.getElementById("tutorial-replay");
  if (tutorialReplay) {
    tutorialReplay.addEventListener("click", function () {
      flipVw("games");
	if (window.spTut && window.spTut.start) {
        window.spTut.start(true);
      }
    });
  }

  var routed = false;
  try {
    if (location.hash === "#home" || location.hash === "#") {
      routed = true;
      flipVw("home");
    }
    if (location.hash === "#browser") {
      routed = true;
      flipVw("browser");
	}
    if (location.hash === "#hub") {
  routed = true;
      flipVw("hub");
    }
    if (location.hash === "#entertainment") {
      routed = true;
  flipVw("entertainment");
      if (window.spEnt) window.spEnt.open();
  }
    if (location.hash === "#movies") {
      routed = true;
      flipVw("entertainment");
      if (window.spEnt) window.spEnt.open("movies");
    }
    if (location.hash === "#rep" || location.hash === "#rep-tools") {
      routed = true;
      flipVw("rep-tools");
      if (window.spRep) window.spRep.open(location.hash === "#rep" ? "finders" : "");
    }
    if (location.hash === "#games") {
      routed = true;
      flipVw("games");
    }
    if (location.hash === "#apps" || location.hash === "#youtube" || location.hash === "#tiktok" || location.hash === "#snapchat" || location.hash === "#chatgpt" || location.hash === "#instagram" || location.hash === "#gauthai") {
      routed = true;
      flipVw("games");
  }
    if (location.hash === "#ai") {
      routed = true;
      flipVw("ai");
    }
    if (location.hash === "#tutorial") {
      routed = true;
      flipVw("tutorial");
    }
    if (location.hash === "#tab-cloak" || location.hash === "#cloak") {
      routed = true;
  flipVw("tab-cloak");
     }
    if (location.hash === "#settings") {
      routed = true;
      flipVw("settings");
    }
	if (!routed) flipVw("home");
  } catch (err) {
    try {
	flipVw("home");
    } catch (e2) {}
  }

  function routeHash() {
    var hash = "";
    try {
      hash = (window.location.hash || "").toLowerCase();
    } catch (e) {
      return;
    }
    if (hash === "#home" || hash === "#" || hash === "") {
      flipVw("home");
      return;
    }
    if (hash === "#entertainment") {
      flipVw("entertainment");
      if (window.spEnt) window.spEnt.open();
      return;
    }
    if (hash === "#movies") {
      flipVw("entertainment");
      if (window.spEnt) window.spEnt.open("movies");
      return;
    }
    if (hash === "#rep" || hash === "#rep-tools") {
      flipVw("rep-tools");
      if (window.spRep) window.spRep.open(hash === "#rep" ? "finders" : "");
      return;
    }
    if (hash === "#games") {
      flipVw("games");
      return;
    }
    if (hash === "#browser") {
      flipVw("browser");
      return;
    }
    if (hash === "#hub") {
      flipVw("hub");
      return;
    }
    if (hash === "#ai") {
      flipVw("ai");
      return;
    }
    if (hash === "#tab-cloak" || hash === "#cloak") {
      flipVw("tab-cloak");
      return;
    }
    if (hash === "#settings") {
      flipVw("settings");
      return;
    }
    if (hash === "#tutorial") {
      flipVw("tutorial");
    }
  }
  window.addEventListener("hashchange", routeHash);

  function setsOn() {
    var S = window.spSet;
	return S ? S.get.bind(S) : function () { return true; };
  }

  function ambiSyncLol() {
    var get = setsOn();
    womp8();
    if (!site || site.hidden) return;
    if (document.body.classList.contains("fx-no-particles") || !get("particles")) {
       rizz14();
      if (siteCanvas) siteCanvas.style.display = "none";
      return;
	}
    if (siteCanvas) siteCanvas.style.display = "";
    if (!siteAmbienceOn) skib13();
  }

  window.addEventListener("sp-set", ambiSyncLol);

  function hueId(id) {
    var s = String(id || "");
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  function slugDashy(id) {
    return String(id)
      .replace(/([a-z])(\d)/g, "$1-$2")
	.replace(/(\d)([a-z])/g, "$1-$2")
      .replace(/_/g, "-")
      .replace(/\./g, "-");
  }

  function assetUrl(raw) {
    if (window.spBase && window.spBase.assetUrl) return window.spBase.assetUrl(raw);
    return String(raw || "");
  }

  function picUrl(game) {
    var raw = "";
    if (game) {
      var cover = game.cover || "";
      var image = game.image || game.thumb || "";
      if (/^https?:\/\//i.test(cover)) return String(cover);
      if (/^https?:\/\//i.test(image)) return String(image);
      raw = cover || image || "";
    }
    if (raw) return assetUrl(raw);
    return assetUrl("assets/thumbs/" + encodeURIComponent(String((game && game.id) || "")) + ".png");
  }

	function drainThumbs() {
    if (thumbQueueActive >= BRUH2 || !thumbQueue.length) return;
    thumbQueue.sort(function (a, b) {
      return a.priority - b.priority;
    });
    while (thumbQueueActive < BRUH2 && thumbQueue.length) {
      var job = thumbQueue.shift();
  thumbQueueActive++;
      job.run(function () {
        thumbQueueActive--;
        drainThumbs();
  });
    }
  }

  function schedThumb(priority, run) {
    thumbQueue.push({ priority: priority, run: run });
    drainThumbs();
  }

  function preloadPics(games, count) {
    return;
  }

  function warmPics(games, start, count) {
    if (!games || !games.length) return;
    var end = Math.min(start + Math.min(count || 8, 8), games.length);
    for (var i = start; i < end; i++) {
      var href = picUrl(games[i]);
      if (!href || warmedThumbs.has(href)) continue;
      warmedThumbs.add(href);
      if (warmedThumbs.size > 400) warmedThumbs.clear();
      var probe = new Image();
      probe.decoding = "async";
      probe.referrerPolicy = "no-referrer";
      if (i - start < 4) probe.fetchPriority = "high";
      probe.src = href;
    }
  }

  function lazyWatch() {
    if (lazyThumbObserver) return lazyThumbObserver;
    lazyThumbObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
  var start = entry.target.__thumbStart;
          if (start) start();
          lazyThumbObserver.unobserve(entry.target);
          entry.target.__thumbStart = null;
	});
       },
      { rootMargin: "720px 0px", threshold: 0.01 }
    );
    return lazyThumbObserver;
  }

  function stickPic(thumb, game, index) {
    var href = picUrl(game);
    var fallback = "";
    var lowData = document.body && document.body.classList.contains("fx-low-data");
    var tries = [];
    if (href) tries.push(href);
    if (game && game.cover && /^https?:\/\//i.test(String(game.cover)) && tries.indexOf(game.cover) === -1) {
      tries.push(String(game.cover));
    }
    if (game && game.image && /^https?:\/\//i.test(String(game.image)) && tries.indexOf(game.image) === -1) {
      tries.push(String(game.image));
    }
    fallback = assetUrl("assets/thumbs/" + encodeURIComponent(String((game && game.id) || "")) + ".png");
    if (fallback && tries.indexOf(fallback) === -1) tries.push(fallback);
    var oop3 = function () {
      if (thumb.__thumbLoaded) return;
      thumb.__thumbLoaded = true;
      schedThumb(index, function (done) {
        var img = document.createElement("img");
        img.className = "site__card-img";
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        img.width = lowData ? 140 : 200;
        img.height = lowData ? 140 : 200;
        img.decoding = "async";
        img.loading = index < (lowData ? 16 : 32) ? "eager" : "lazy";
        if (!lowData && index < 20) img.fetchPriority = "high";
        else img.fetchPriority = "auto";
        var step = 0;
        var freed = false;
        function free() {
          if (freed) return;
          freed = true;
          done();
        }
        img.addEventListener(
          "load",
          function () {
            thumb.classList.add("site__card-thumb--has-img");
            free();
          },
          { once: true }
        );
        img.addEventListener(
          "error",
          function () {
            step += 1;
            if (step < tries.length) {
              img.src = tries[step];
              return;
            }
            img.remove();
            thumb.classList.remove("site__card-thumb--has-img");
            free();
          },
          { once: false }
        );
        thumb.prepend(img);
        img.src = tries[0] || fallback;
        setTimeout(free, 40);
      });
    };
    if (index < (lowData ? 14 : 36)) {
      oop3();
      return;
    }
    thumb.__thumbStart = oop3;
    lazyWatch().observe(thumb);
  }

  function gotPic(game) {
    if (game && game.hasThumb === true) return true;
    if (game && game.hasThumb === false) return false;
    if (game && (game.cover || game.image || game.thumb)) return true;
    return false;
  }

	function cmpPics(a, b) {
    var ah = gotPic(a) ? 0 : 1;
    var bh = gotPic(b) ? 0 : 1;
    if (ah !== bh) return ah - bh;
    return String(a.title || "").localeCompare(String(b.title || ""), undefined, { sensitivity: "base" });
  }

  function sortPics(list) {
    return list.slice().sort(cmpPics);
  }

	function filtGames() {
    var q = (gameSearch && gameSearch.value ? gameSearch.value : "").trim().toLowerCase();
    if (!q) return allGames;
    return allGames.filter(function (game) {
      return (game.search || "").includes(q);
	});
  }

	function wipeGrid() {
    renderedCount = 0;
   if (listObserver) {
  listObserver.disconnect();
      listObserver = null;
    }
     if (gridSentinel) {
      gridSentinel.remove();
      gridSentinel = null;
    }
    if (gamesGrid) gamesGrid.innerHTML = "";
	}

  function mkSentinel() {
  if (!gamesGrid || gridSentinel) return;
     gridSentinel = document.createElement("div");
    gridSentinel.className = "site__grid-sentinel";
     gridSentinel.setAttribute("aria-hidden", "true");
    gamesGrid.appendChild(gridSentinel);
  }

  function watchList() {
    if (listObserver || !gridSentinel || renderedCount >= filteredGames.length) return;
    listObserver = new IntersectionObserver(
      function (entries) {
         if (entries.some(function (entry) {
	return entry.isIntersecting;
        })) {
          dumpBatch();
        }
      },
       { rootMargin: "500px 0px" }
    );
    listObserver.observe(gridSentinel);
  }

  function mkCard(game, index) {
    var card = document.createElement("article");
	card.className = "site__card site__card--ready";
    card.dataset.index = String(index);
     card.style.setProperty("--i", String(index % 24));
    card.tabIndex = 0;
    var thumb = document.createElement("div");
    thumb.className = "site__card-thumb";
    thumb.style.setProperty("--hue", String(hueId(game.id)));
     stickPic(thumb, game, index);
  var play = document.createElement("span");
    play.className = "site__card-play";
    play.setAttribute("aria-hidden", "true");
	play.innerHTML = '<span class="site__card-play-btn"><span class="site__card-play-arrow" aria-hidden="true"></span><span class="site__card-play-label">Play</span></span>';
     var foot = document.createElement("div");
    foot.className = "site__card-foot";
    var title = document.createElement("h3");
	title.className = "site__card-title";
    title.textContent = game.title;
    foot.append(title);
    var fav = document.createElement("button");
    fav.type = "button";
    fav.className = "site__card-fav";
    fav.setAttribute("aria-label", "Favorite");
    fav.dataset.gameId = game.id;
    var favOn = !!(window.spLib && typeof window.spLib.isFavorite === "function" && window.spLib.isFavorite(game.id));
    if (favOn) {
  fav.classList.add("site__card-fav--on");
      fav.textContent = "♥";
    } else {
      fav.textContent = "♡";
    }
    fav.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!window.spLib || typeof window.spLib.toggleFavorite !== "function") return;
      window.spLib.toggleFavorite(game.id).then(function () {
        var on = typeof window.spLib.isFavorite === "function" && window.spLib.isFavorite(game.id);
	fav.classList.toggle("site__card-fav--on", !!on);
        fav.textContent = on ? "♥" : "♡";
      });
	});
    thumb.append(play);
	card.append(thumb, foot, fav);
    return card;
  }

  function dumpBatch() {
    if (!gamesGrid || renderedCount >= filteredGames.length) return;
    var end = Math.min(renderedCount + GUH0, filteredGames.length);
    var frag = document.createDocumentFragment();
    for (var i = renderedCount; i < end; i++) {
      frag.appendChild(mkCard(filteredGames[i], i));
    }
    mkSentinel();
    gamesGrid.insertBefore(frag, gridSentinel);
    renderedCount = end;
    warmPics(filteredGames, renderedCount, YEET1);
    if (filteredGames.length > 0) {
      var ratio = renderedCount / filteredGames.length;
      loadStep("index", {
        partial: 0.45 + ratio * 0.55,
  label: "Rendering " + renderedCount.toLocaleString() + " / " + filteredGames.length.toLocaleString() + " cards",
         games: allGames.length,
      });
    }
    if (renderedCount >= filteredGames.length && listObserver) {
      listObserver.disconnect();
      listObserver = null;
    } else {
  watchList();
    }
  }

   function doFilter() {
    filteredGames = filtGames();
    wipeGrid();
    var q = gameSearch && gameSearch.value ? gameSearch.value.trim() : "";
    if (gameEmpty) gameEmpty.hidden = filteredGames.length > 0 || !q;
    cntGames(filteredGames.length, allGames.length);
  loadStep("index", {
      partial: 0.45,
      label: "Sorting " + filteredGames.length.toLocaleString() + " titles",
      games: allGames.length,
	});
    dumpBatch();
  }

  function slowFilter() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(doFilter, 100);
  }

  function cntGames(visible, total) {
    if (!gameCount) return;
  if (visible === total) {
      gameCount.textContent = total.toLocaleString() + " games ready";
    } else {
      gameCount.textContent = visible.toLocaleString() + " of " + total.toLocaleString() + " games";
    }
  }

  if (gamesGrid) {
    gamesGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".site__card");
	if (!card) return;
      var idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx) && filteredGames[idx]) yeetGame(filteredGames[idx]);
    });
    gamesGrid.addEventListener("keydown", function (e) {
      var card = e.target.closest(".site__card");
      if (!card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var idx = parseInt(card.dataset.index, 10);
        if (!isNaN(idx) && filteredGames[idx]) yeetGame(filteredGames[idx]);
	}
    });
  }

  if (gameSearch) {
    gameSearch.addEventListener("input", slowFilter);
     gameSearch.addEventListener("search", doFilter);
  }

	function fixUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return (
      "/" +
      String(path)
  .replace(/^\/+/, "")
  .split("/")
        .map(function (part) {
          return encodeURIComponent(part);
        })
        .join("/")
  );
  }

  function cdnNope(url) {
     var u = String(url || "").toLowerCase();
    if (/cdn\.jsdelivr\.net\/gh\/3kh0\/3kh0-lite/i.test(u)) return true;
    if (/raw\.githack\.com\/3kh0\/3kh0-lite/i.test(u)) return true;
     if (/raw\.githubusercontent\.com\/3kh0\/3kh0-lite/i.test(u)) return true;
    return false;
  }

  function onCdn() {
    return !!(window.spBase && window.spBase.isCdn && window.spBase.isCdn());
  }

  function playUrl(game) {
    if (!game) return "";
    var p = String(game.path || "").trim();
    if (/^https?:\/\//i.test(p)) {
      if (cdnNope(p)) return "";
      if (onCdn()) return p;
      var frame = "/api/game-frame?u=" + encodeURIComponent(p);
      return (window.spBase && window.spBase.apiUrl) ? window.spBase.apiUrl(frame) : frame;
    }
    if (/^\/(app-viewer|sail|gameFiles|gamefiles|active|apps|games|refined-beta)\b/i.test(p)) {
      if (onCdn()) {
        var rel = p.replace(/^\/+/, "");
        if (rel.endsWith("/")) rel += "index.html";
        if (window.spBase && window.spBase.htmlUrl) return window.spBase.htmlUrl(rel);
        return assetUrl(rel);
      }
      return p;
    }
    if (p && p.charAt(0) !== "/") return assetUrl(p);
    if (!game.id) return p ? assetUrl(p.replace(/^\//, "")) : "";
    var play = assetUrl("play.html") || "play.html";
    return play + (play.indexOf("?") >= 0 ? "&" : "?") + "id=" + encodeURIComponent(game.id) + "&_=" + Date.now();
  }

  function jamGame(game) {
    if (!playerFrame) return;
    playerFrame.onload = null;
    if (location.protocol === "file:") {
      playerFrame.src = String(game.path || "").replace(/^\/+/, "");
      return;
    }
    var src = "";
    if (game && game.id && !onCdn()) {
      var play = assetUrl("play.html") || "play.html";
      src = play + (play.indexOf("?") >= 0 ? "&" : "?") + "id=" + encodeURIComponent(game.id) + "&_=" + Date.now();
    } else {
      src = playUrl(game);
    }
    if (!src) {
      playerFrame.srcdoc =
        '<body style="margin:0;background:#0b0b10;color:#fff;font:16px/1.4 sans-serif;display:grid;place-items:center;height:100vh">cant boot this one rn</body>';
      return;
    }
    playerFrame.removeAttribute("srcdoc");
    playerFrame.src = src;
  }

  function yeetGame(game) {
  if (!player || !playerFrame || !game) return;
    activeGame = game;
    if (window.spLib && typeof window.spLib.trackRecent === "function") {
      try { window.spLib.trackRecent(game.id); } catch (e) {}
    }
	if (playerTitle) playerTitle.textContent = game.title;
    player.hidden = false;
    document.documentElement.classList.add("player-open");
     jamGame(game);
    playerBack && playerBack.focus();
  }

  function killPlayer() {
    if (!player || !playerFrame) return;
    activeGame = null;
	player.hidden = true;
    playerFrame.onload = null;
	playerFrame.src = "about:blank";
    document.documentElement.classList.remove("player-open");
	if (gameSearch) gameSearch.focus();
  }

  if (playerBack) playerBack.addEventListener("click", killPlayer);

  window.addEventListener("sp-clk-on", function () {
    killPlayer();
  });

  window.addEventListener("sp-clk-off", function () {});

  if (playerFs) {
    playerFs.addEventListener("click", () => {
      var wrap = document.querySelector(".player__frame-wrap");
	var el = wrap || playerFrame;
      if (!document.fullscreenElement) {
	if (el.requestFullscreen) el.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });
  }

  function loadStep(id, update) {
    var L = window.spLoad;
    if (!L) return;
	if (typeof L.setStep === "function") {
  L.setStep(id, update);
      return;
    }
    if (id === "finalize" && update && update.done && typeof L.notifyReady === "function") {
      L.notifyReady();
    }
  }

  function grabGamesProg(url) {
    loadStep("games", { partial: 0.05, label: "Connecting to game library" });
     return fetch(url).then(function (res) {
      loadStep("games", { partial: 0.18, label: "Receiving game data" });
      if (!res.ok) throw new Error("bad status");
      var total = parseInt(res.headers.get("content-length") || "0", 10);
      if (!total || !res.body || !res.body.getReader) {
  return res.json().then(function (data) {
          loadStep("games", { done: true, label: "Game library synced", games: Array.isArray(data) ? data.length : 0 });
           return data;
        });
      }
      var reader = res.body.getReader();
      var chunks = [];
      var received = 0;
      function pump() {
        return reader.read().then(function (result) {
          if (result.done) {
             var merged = new Uint8Array(received);
            var offset = 0;
            chunks.forEach(function (chunk) {
              merged.set(chunk, offset);
              offset += chunk.length;
            });
	var text = new TextDecoder().decode(merged);
            var data = JSON.parse(text);
            loadStep("games", { done: true, label: "Game library synced", games: Array.isArray(data) ? data.length : 0 });
            return data;
          }
          chunks.push(result.value);
          received += result.value.length;
          loadStep("games", {
             partial: 0.18 + (received / total) * 0.82,
            label: "Downloading games " + Math.round((received / total) * 100) + "%",
          });
           return pump();
	});
      }
      return pump();
    });
  }

  function prefetchPics(games, count) {
    warmPics(games, 0, Math.min(count || 8, 8));
  }

  function loadStaticGames() {
    return fetch(assetUrl("games.json") || "games.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("bad");
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.games)) return data.games;
        return [];
      });
  }

  function loadApiGames() {
    var gamesApi = (window.spBase && window.spBase.apiUrl) ? window.spBase.apiUrl("/api/games") : "/api/games";
    return fetch(gamesApi, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("bad");
        return res.json();
      })
      .then(function (data) {
        return Array.isArray(data) ? data : [];
      });
  }

  function loadCatalog() {
    loadStep("games", { partial: 0.05, label: "pulling game catalogs" });
    if (onCdn()) {
      return loadStaticGames()
        .catch(function () {
          return [];
        })
        .then(function (list) {
          loadStep("games", {
            done: true,
            label: "Game library synced",
            games: Array.isArray(list) ? list.length : 0,
          });
          return list || [];
        });
    }
    var blox = Promise.resolve([]);
    if (window.spBloxGames && window.spBloxGames.loadAll) {
      blox = window.spBloxGames
        .loadAll(function (p) {
          loadStep("games", {
            partial: 0.08 + p * 0.9,
            label: "loading sources " + Math.round(p * 100) + "%",
          });
        })
        .catch(function () {
          return [];
        });
    }
    return blox.then(function (data) {
      if (data && data.length) {
        loadStep("games", {
          done: true,
          label: "Game library synced",
          games: data.length,
        });
        return data;
      }
      return loadStaticGames()
        .catch(function () {
          return loadApiGames();
        })
        .then(function (list) {
          loadStep("games", {
            done: true,
            label: "Game library synced",
            games: Array.isArray(list) ? list.length : 0,
          });
          return list || [];
        });
    });
  }

  function meh4(games) {
    allGames = sortPics(games);
    prefetchPics(allGames, 8);
	loadStep("index", { partial: 0.12, label: "Indexing " + (games.length || 0).toLocaleString() + " games" });
    doFilter();
  }

  function bleh5() {
    loadStep("surface", { done: true, label: "Interface ready" });
	loadStep("finalize", { done: true, label: "Ready" });
  }

  function sus6() {
    if (!gamesGrid) {
  loadStep("modules", { done: true, label: "Modules loaded" });
      bleh5();
      return;
    }
	loadStep("modules", { done: true, label: "Modules loaded" });
	loadStep("surface", { partial: 0.4, label: "Wiring game grid" });
    try {
      loadCatalog()
        .then(function (data) {
          allGames = data || [];
          try {
            meh4(allGames);
          } catch (e) {
            allGames = data || [];
            filteredGames = allGames.slice();
            wipeGrid();
            dumpBatch();
            cntGames(filteredGames.length, allGames.length);
          }
          try {
            window.dispatchEvent(new CustomEvent("kobran-games-ready", { detail: { games: allGames } }));
          } catch (e2) {}
          loadStep("index", { done: true, label: "Game index ready" });
          loadStep("surface", { partial: 0.85, label: "Hydrating views" });
          bleh5();
        })
        .catch(function () {
          allGames = [];
          try { meh4(allGames); } catch (e3) {}
          if (gameCount) gameCount.textContent = "0 games";
          if (gameEmpty) {
            gameEmpty.hidden = false;
            gameEmpty.textContent = "something went wrong, report it to the website manager pls&ty :)";
          }
          loadStep("games", { done: true, label: "Library unavailable" });
          loadStep("index", { done: true, label: "Index unavailable" });
          bleh5();
        });
    } catch (err) {
      loadStep("games", { done: true, label: "Library unavailable" });
      loadStep("index", { done: true, label: "Index unavailable" });
      bleh5();
    }
  }

  sus6();
  loadStep("surface", { done: true, label: "UI ready" });

  var siteParticles = [];
  var siteRaf = 0;
	var siteCtx = null;
  var siteAmbienceOn = false;
  var siteAccentRgb = { r: 183, g: 148, b: 255 };
   var siteGlowStrength = 0.55;

  function womp8() {
    var accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#b794ff";
	siteGlowStrength = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glow-strength")) || 0.55;
    if (accent.charAt(0) === "#" && accent.length >= 7) {
      siteAccentRgb = {
        r: parseInt(accent.slice(1, 3), 16),
        g: parseInt(accent.slice(3, 5), 16),
	b: parseInt(accent.slice(5, 7), 16),
      };
     }
  }

	function flop9() {
    if (!siteCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    siteCanvas.width = Math.floor(window.innerWidth * dpr);
    siteCanvas.height = Math.floor(window.innerHeight * dpr);
    siteCanvas.style.width = window.innerWidth + "px";
  siteCanvas.style.height = window.innerHeight + "px";
    siteCtx = siteCanvas.getContext("2d", { alpha: true });
    if (siteCtx) siteCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

   function yolo10() {
    var n = Math.min(14, Math.floor((window.innerWidth * window.innerHeight) / 52000));
    siteParticles = [];
	for (var i = 0; i < n; i++) {
      siteParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.8 + 0.3,
  vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        hue: 240 + Math.random() * 60,
         a: Math.random() * 0.3 + 0.1,
      });
    }
  }

  function ugh11() {
  if (!siteCtx || !siteCanvas || !siteAmbienceOn) return;
	if (document.body.classList.contains("fx-no-particles") || document.hidden) {
      rizz14();
  return;
    }
    var rgb = siteAccentRgb;
    var strength = siteGlowStrength;
    siteCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var p of siteParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;
      siteCtx.beginPath();
      siteCtx.fillStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (p.a * (0.6 + strength * 0.8)) + ")";
 	siteCtx.arc(p.x, p.y, p.r * (0.8 + strength * 0.5), 0, Math.PI * 2);
      siteCtx.fill();
    }
    siteRaf = requestAnimationFrame(ugh11);
  }

  function rawr12() {
  flop9();
    yolo10();
  }

  function skib13() {
    if (siteAmbienceOn || !siteCanvas) return;
    if (document.body.classList.contains("fx-no-particles") || !setsOn()("particles")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      siteCanvas.style.display = "none";
      return;
    }
    siteCanvas.style.display = "";
    siteAmbienceOn = true;
	womp8();
    flop9();
    yolo10();
     cancelAnimationFrame(siteRaf);
    siteRaf = requestAnimationFrame(ugh11);
    window.addEventListener("resize", rawr12);
  }

  function rizz14() {
    siteAmbienceOn = false;
    cancelAnimationFrame(siteRaf);
    window.removeEventListener("resize", rawr12);
    siteParticles = [];
    if (siteCtx && siteCanvas) {
      siteCtx.clearRect(0, 0, siteCanvas.width, siteCanvas.height);
  }
  }

  window.addEventListener("kobran-boot-complete", function () {
    skib13();
    if (window.spGlide) {
      requestAnimationFrame(function () {
        window.spGlide.init();
        var activeLink = document.querySelector(".site__nav-link--active");
        if (activeLink) window.spGlide.move(activeLink);
   });
    }
  });

  var trailEl = document.getElementById("cursor-trail");
  var trailX = 0;
  var trailY = 0;
  var trailRaf = 0;

  function buss15() {
    trailRaf = 0;
    if (!trailEl || document.body.classList.contains("fx-no-trail") || document.hidden) {
	if (trailEl) trailEl.hidden = true;
      return;
    }
    trailEl.hidden = false;
    trailEl.style.transform = "translate3d(" + (trailX - 8) + "px," + (trailY - 8) + "px,0)";
  }

  function thingy16() {
    if (trailRaf) return;
    trailRaf = requestAnimationFrame(buss15);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
  if (trailEl) trailEl.hidden = true;
	rizz14();
    } else {
      ambiSyncLol();
      thingy16();
    }
  });

  document.addEventListener(
    "mousemove",
    function (e) {
      trailX = e.clientX;
      trailY = e.clientY;
      thingy16();
    },
    { passive: true }
  );

	window.addEventListener("sp-set", function () {
    ambiSyncLol();
    if (document.body.classList.contains("fx-no-trail")) {
      if (trailEl) trailEl.hidden = true;
    } else {
 	thingy16();
    }
  });

  if (trailEl && !document.body.classList.contains("fx-no-trail")) {
    thingy16();
  }

	window.spApp = {
    flipVw: flipVw,
    activeView: function () {
      return activeView;
    },
    getGames: function () {
      return allGames.slice();
    },
    openGameById: function (id) {
	var game = allGames.find(function (g) {
        return g.id === id;
      });
      if (!game) return;
	flipVw("games");
      yeetGame(game);
    },
  };
})();
