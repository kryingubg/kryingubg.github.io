(function () {
  var root = document.getElementById("k-browser");
  if (!root) return;

  var STORE_BOOKMARKS = "kobran-browser-bookmarks";
	var STORE_HISTORY = "kobran-browser-history";
  var STORE_SESSION = "kobran-browser-session";
   var STORE_CLOSED = "kobran-browser-closed";
  var LOAD_TIMEOUT_MS = 45000;
   var ZOOM_STEPS = [0.75, 0.85, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];

  var tabsEl = document.getElementById("k-browser-tabs");
  var backBtn = document.getElementById("k-browser-back");
  var forwardBtn = document.getElementById("k-browser-forward");
  var homeBtn = document.getElementById("k-browser-home");
	var form = document.getElementById("k-browser-form");
  var input = document.getElementById("k-browser-input");
	var clearBtn = document.getElementById("k-browser-clear");
  var refreshBtn = document.getElementById("k-browser-refresh");
   var devtoolsBtn = document.getElementById("k-browser-devtools");
  var duplicateBtn = document.getElementById("k-browser-duplicate");
  var fsBtn = document.getElementById("k-browser-fs");
	var closeBtn = document.getElementById("k-browser-close-tab");
  var bookmarkBtn = document.getElementById("k-browser-bookmark");
  var copyBtn = document.getElementById("k-browser-copy");
   var externalBtn = document.getElementById("k-browser-external");
  var zoomOutBtn = document.getElementById("k-browser-zoom-out");
  var zoomInBtn = document.getElementById("k-browser-zoom-in");
  var zoomLabelBtn = document.getElementById("k-browser-zoom-label");
  var frame = document.getElementById("k-browser-frame");
  var viewport = document.getElementById("k-browser-viewport");
  var start = document.getElementById("k-browser-start");
  var startSub = start ? start.querySelector(".k-browser__start-sub") : null;
  var startForm = document.getElementById("k-browser-start-form");
  var startInput = document.getElementById("k-browser-start-input");
  var quick = document.getElementById("k-browser-quick");
  var tiles = document.getElementById("k-browser-tiles");
	var clockEl = document.getElementById("k-browser-clock");
  var shell = document.getElementById("k-browser-shell");
  var loadBar = document.getElementById("k-browser-load");
  var secure = document.getElementById("k-browser-secure");
	var suggestEl = document.getElementById("k-browser-suggest");
  var statusBar = document.getElementById("k-browser-status");
  var statusHost = document.getElementById("k-browser-status-host");
  var statusMode = document.getElementById("k-browser-status-mode");
  var errorEl = document.getElementById("k-browser-error");
  var errorText = document.getElementById("k-browser-error-text");
  var errorRetry = document.getElementById("k-browser-error-retry");
  var errorOpen = document.getElementById("k-browser-error-open");
  var moreBtn = document.getElementById("k-browser-more");
  var menuEl = document.getElementById("k-browser-menu");

  var QUICK_LINKS = [
    { title: "YouTube", url: "https://www.youtube.com" },
    { title: "Roblox", url: "https://www.roblox.com" },
    { title: "Discord", url: "https://discord.com" },
    { title: "Cool Math", url: "https://www.coolmathgames.com" },
    { title: "Spotify", url: "https://open.spotify.com" },
    { title: "Twitch", url: "https://www.twitch.tv" },
  { title: "GitHub", url: "https://github.com" },
    { title: "Reddit", url: "https://www.reddit.com" },
  ];

  var tabs = [];
  var activeId = 0;
  var nextId = 1;
  var loading = false;
  var loadingTabId = 0;
  var loadTimer = 0;
  var clockTimer = 0;
  var suggestIndex = -1;
  var closedTabs = [];
  var browserReady = false;

  function engine() {
    if (window.spEng && window.spEng.current) {
      return window.spEng.current();
    }
    return { id: "duckduckgo", home: "https://html.duckduckgo.com/html/", search: "https://html.duckduckgo.com/html/?q=", label: "DuckDuckGo" };
  }

  function guh0() {
    if (!hasApi() && onCdn()) return "https://www.google.com/webhp?igu=1";
    if (window.spEng && window.spEng.current) {
      return window.spEng.current().home;
    }
    return "https://html.duckduckgo.com/html/";
  }

  function yeet1(query) {
    var q = String(query || "").trim();
    if (!hasApi() && onCdn()) {
      if (!q) return "https://www.google.com/webhp?igu=1";
      return "https://www.google.com/search?gbv=1&igu=1&q=" + encodeURIComponent(q);
    }
    if (window.spEng && window.spEng.bruh2) {
      return window.spEng.bruh2(query);
    }
    if (!q) return "https://html.duckduckgo.com/html/";
    return "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q);
  }

  function bruh2(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function oop3(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function bookmarks() {
    return bruh2(STORE_BOOKMARKS, []);
  }

  function meh4(list) {
    oop3(STORE_BOOKMARKS, list.slice(0, 48));
  }

	function bleh5() {
    return bruh2(STORE_HISTORY, []);
  }

  function sus6(entry) {
    if (!entry || !entry.url) return;
    var list = bleh5().filter(function (item) {
      return item.url !== entry.url;
    });
    list.unshift({
      title: entry.title || buss15(entry.url) || entry.url,
      url: entry.url,
      at: Date.now(),
  });
     oop3(STORE_HISTORY, list.slice(0, 80));
    thingy56();
  }

  function goof7() {
    var eng = engine();
    return !!(eng && eng.id === "google");
  }

  function womp8(url) {
    try {
      return /\.google\./i.test(new URL(url).hostname);
    } catch (e) {
	return false;
    }
	}

  function flop9(url, devtools) {
    if (devtools) return false;
	return goof7() && womp8(url);
  }

  function onCdn() {
    return !!(window.spBase && window.spBase.isCdn && window.spBase.isCdn());
  }

  function apiBase() {
    try {
      if (window.spBase && typeof window.spBase.apiBase === "function") {
        return String(window.spBase.apiBase() || "").replace(/\/$/, "");
      }
    } catch (e) {}
    return "";
  }

  function hasApi() {
    return !!apiBase();
  }

  function proxied(url, devtools) {
    if (!hasApi() && onCdn()) return url;
    var src = "/api/browser/frame?u=" + encodeURIComponent(url);
    if (devtools) src += "&devtools=1";
    return window.spBase && window.spBase.apiUrl ? window.spBase.apiUrl(src) : src;
  }

  function yolo10(url, bust, devtools) {
    var direct = flop9(url, devtools) || (!hasApi() && onCdn());
    var src = direct ? url : proxied(url, devtools);
    if (bust) src += (src.indexOf("?") > -1 ? "&" : "?") + "_t=" + Date.now();
    return src;
  }

  function ugh11(url, bust, devtools) {
    var src = yolo10(url, bust, devtools);
    if (/^https?:\/\//i.test(src) || /^data:/i.test(src) || /^blob:/i.test(src)) return src;
    try {
      return new URL(src, location.href).href;
    } catch (e) {
      return src;
    }
  }

  function rawr12(current, target) {
    if (!current || !target) return false;
    try {
	return new URL(current, location.origin).href === new URL(target, location.origin).href;
    } catch (e) {
      return current === target;
  }
   }

  function skib13(text) {
    var t = String(text || "").trim();
    if (!t) return "New Tab";
    return t.length > 30 ? t.slice(0, 27) + "…" : t;
  }

  function isUrl(text) {
  var q = String(text || "").trim();
    if (!q) return false;
    if (/^https?:\/\//i.test(q)) return true;
    if (/^[\w-]+(\.[\w-]+)+([\/?#]|$)/.test(q)) return true;
    return false;
  }

	function rizz14(text) {
    var q = String(text || "").trim();
    if (!q) return guh0();
    if (/^https?:\/\//i.test(q)) return q;
    if (/^[\w-]+(\.[\w-]+)+([\/?#]|$)/.test(q)) return "https://" + q.replace(/^\/+/, "");
    return yeet1(q);
  }

  function buss15(url) {
    try {
	return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return "";
    }
  }

  function thingy16(url) {
    var host = buss15(url);
    if (!host) return "";
    return "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(host) + "&sz=32";
  }

  function junk17(id) {
  for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].id === id) return tabs[i];
	}
    return null;
  }

  function blob18() {
	return tabs.slice().sort(function (a, b) {
      if (!!a.pinned === !!b.pinned) return tabs.indexOf(a) - tabs.indexOf(b);
      return a.pinned ? -1 : 1;
    });
  }

  function tmpx19(on, tabId) {
    loading = !!on;
    if (loadBar) loadBar.hidden = !loading;
    if (loading) guh20(tabId || activeId);
    else {
      yeet21();
      loadingTabId = 0;
    }
  }

  function guh20(tabId) {
    yeet21();
    loadingTabId = tabId || activeId;
     loadTimer = window.setTimeout(function () {
      if (!loading || loadingTabId !== activeId) return;
      var tab = junk17(activeId);
  if (!tab || !tab.url || !browserReady) return;
      meh24("something went wrong, report it to the website manager pls&ty :)");
      tmpx19(false);
    }, LOAD_TIMEOUT_MS);
  }

  function yeet21() {
    if (loadTimer) {
      window.clearTimeout(loadTimer);
      loadTimer = 0;
    }
  }

  function bruh22() {
  if (!errorEl) return;
    errorEl.hidden = true;
	errorEl.setAttribute("hidden", "hidden");
  }

  function oop23() {
    if (!browserReady) return false;
  var tab = junk17(activeId);
    return !!(tab && tab.url);
  }

  function meh24(message) {
     if (!oop23()) {
      bruh22();
       return;
    }
    if (errorText) errorText.textContent = "something went wrong, report it to the website manager pls&ty :)";
    if (errorEl) {
      errorEl.hidden = false;
	errorEl.removeAttribute("hidden");
    }
  tmpx19(false);
  }

  function bleh25() {
    if (!clearBtn || !input) return;
    clearBtn.hidden = !input.value;
  }

	function sus26(url) {
    return bookmarks().some(function (item) {
      return item.url === url;
    });
  }

	function goof27(tab) {
    if (!bookmarkBtn) return;
    var on = !!(tab && tab.url && sus26(tab.url));
    bookmarkBtn.classList.toggle("k-browser__btn--active", on);
    bookmarkBtn.title = on ? "Remove bookmark" : "Bookmark (Ctrl+D)";
	}

  function womp28(tab) {
    if (!devtoolsBtn) return;
    var on = !!(tab && tab.url && tab.devtools);
    devtoolsBtn.classList.toggle("k-browser__btn--active", on);
	devtoolsBtn.disabled = !tab || !tab.url;
  }

  function flop29() {
    var tab = junk17(activeId);
    if (!tab || !tab.url) return;
    tab.devtools = !tab.devtools;
    womp28(tab);
    ugh31(tab);
    oop63();
    if (!browserReady || !frame) return;
    bruh22();
    tmpx19(true, tab.id);
    frame.src = ugh11(tab.url, true, tab.devtools);
  }

  function yolo30(tab) {
    var zoom = tab && tab.zoom ? tab.zoom : 1;
    if (viewport) viewport.style.setProperty("--k-browser-zoom", String(zoom));
    if (zoomLabelBtn) zoomLabelBtn.textContent = Math.round(zoom * 100) + "%";
  }

  function ugh31(tab) {
    if (!statusBar) return;
    if (!tab || !tab.url) {
       statusBar.hidden = true;
      return;
    }
	statusBar.hidden = false;
    if (statusHost) statusHost.textContent = buss15(tab.url) || tab.url;
  if (statusMode) {
      var proxiedLoad = !flop9(tab.url, tab.devtools);
      statusMode.textContent = proxiedLoad ? "Proxied" : "Direct";
      statusMode.className = "k-browser__status-mode" + (proxiedLoad ? "" : " k-browser__status-mode--direct");
    }
  }

  function rawr32(tab, opts) {
    opts = opts || {};
    if (!tab) return;
    if (input) input.value = tab.omnibox || "";
    bleh25();
    goof27(tab);
    womp28(tab);
    yolo30(tab);
    ugh31(tab);
    if (backBtn) backBtn.disabled = tab.historyIndex <= 0;
    if (forwardBtn) forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;
    if (secure) secure.hidden = !tab.url;
    var showStart = !tab.url;
    if (start) start.hidden = !showStart;
    if (viewport) viewport.hidden = showStart;
    if (showStart) {
      bruh22();
      tmpx19(false);
      yeet21();
   thingy56();
      if (frame) {
        frame.hidden = true;
	frame.removeAttribute("src");
      }
	return;
    }
 	if (start) start.hidden = true;
    if (viewport) viewport.hidden = false;
    if (frame) frame.hidden = false;
  if (!browserReady || opts.skipLoad) {
      bruh22();
      return;
    }
   bruh22();
    var target = ugh11(tab.url, false, tab.devtools);
     if (frame && !rawr12(frame.src, target)) {
      tmpx19(true, tab.id);
  frame.src = target;
    }
  }

  function skib33() {
    browserReady = true;
    yeet61();
    bruh62();
  rawr52();
  junk57();
    var tab = junk17(activeId);
    if (tab) rawr32(tab);
    else bruh22();
  }

  function rizz34() {
    if (!tabsEl) return;
	tabsEl.innerHTML = "";
    blob18().forEach(function (tab) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "k-browser__tab" + (tab.id === activeId ? " k-browser__tab--active" : "") + (tab.pinned ? " k-browser__tab--pinned" : "");
      btn.dataset.id = String(tab.id);
      if (tab.url) {
	var icon = document.createElement("img");
        icon.className = "k-browser__tab-icon";
        icon.src = thingy16(tab.url);
        icon.alt = "";
        icon.width = 14;
        icon.height = 14;
        btn.appendChild(icon);
      }
      var label = document.createElement("span");
      label.className = "k-browser__tab-label";
      label.textContent = tab.title || "New Tab";
      var x = document.createElement("span");
  x.className = "k-browser__tab-close";
      x.setAttribute("aria-hidden", "true");
      x.textContent = "×";
      btn.append(label, x);
      btn.addEventListener("click", function (e) {
        if (e.target === x) guh40(tab.id);
        else thingy36(tab.id);
      });
      btn.addEventListener("auxclick", function (e) {
        if (e.button === 1) {
	e.preventDefault();
          guh40(tab.id);
        }
      });
      btn.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        tab.pinned = !tab.pinned;
        rizz34();
        oop63();
      });
      tabsEl.appendChild(btn);
    });
    var add = document.createElement("button");
    add.type = "button";
    add.className = "k-browser__add-tab";
    add.setAttribute("aria-label", "New tab");
    add.textContent = "+";
    add.addEventListener("click", function () {
      buss35("", "New Tab", "");
    });
    tabsEl.appendChild(add);
  }

  function buss35(url, title, omnibox, opts) {
    opts = opts || {};
    var tab = {
      id: nextId++,
      title: title || "New Tab",
      url: url || "",
      omnibox: omnibox || "",
      history: url ? [url] : [],
      historyIndex: url ? 0 : -1,
       pinned: !!opts.pinned,
      zoom: 1,
      devtools: false,
  };
    tabs.push(tab);
    thingy36(tab.id);
    oop63();
   return tab;
  }

  function thingy36(id) {
	activeId = id;
   rawr52();
    rizz34();
  rawr32(junk17(id));
  }

  function navigate(url, replace, omnibox) {
    var tab = junk17(activeId);
  if (!tab || !url) return;
    tab.url = url;
    if (omnibox != null) tab.omnibox = omnibox;
    else if (!tab.omnibox || replace) tab.omnibox = isUrl(tab.omnibox) ? tab.omnibox : buss15(url) || tab.omnibox;
    if (replace && tab.historyIndex >= 0) {
      tab.history[tab.historyIndex] = url;
    } else {
      if (tab.historyIndex < tab.history.length - 1) {
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
      }
      tab.history.push(url);
      tab.historyIndex = tab.history.length - 1;
    }
    bruh22();
    rawr52();
    if (start) start.hidden = true;
    if (viewport) viewport.hidden = false;
    if (frame) {
      frame.hidden = false;
      tmpx19(true, tab.id);
      frame.src = ugh11(url, false, tab.devtools);
    }
     rawr32(tab);
	oop63();
  }

	function junk37(raw) {
    var tab = junk17(activeId);
	if (!tab) return;
    var url = rizz14(raw);
    var label = isUrl(raw) ? skib13(buss15(url) || raw) : skib13(raw) + " · " + (engine().label || "Search");
    tab.title = label;
     tab.omnibox = String(raw || "").trim();
    rizz34();
    navigate(url, false);
	}

  function blob38(url, title, omnibox) {
    var tab = junk17(activeId);
    if (!tab) return;
    if (!tab.url) {
      tab.title = title || skib13(buss15(url) || url);
      tab.omnibox = omnibox || buss15(url) || url;
	rizz34();
      navigate(url, false);
  return;
	}
    buss35(url, title || skib13(buss15(url) || url), omnibox || buss15(url) || url);
  }

  function back() {
    var tab = junk17(activeId);
    if (!tab || tab.historyIndex <= 0) return;
    tab.historyIndex -= 1;
    tab.url = tab.history[tab.historyIndex];
    rawr32(tab);
    if (frame) {
      tmpx19(true, tab.id);
      frame.src = ugh11(tab.url, false, tab.devtools);
    }
    oop63();
  }

  function forward() {
  var tab = junk17(activeId);
    if (!tab || tab.historyIndex >= tab.history.length - 1) return;
	tab.historyIndex += 1;
  tab.url = tab.history[tab.historyIndex];
    rawr32(tab);
    if (frame) {
	tmpx19(true, tab.id);
      frame.src = ugh11(tab.url, false, tab.devtools);
    }
    oop63();
  }

  function tmpx39() {
     var tab = junk17(activeId);
    if (!tab) return;
    tab.title = "New Tab";
	tab.url = "";
    tab.omnibox = "";
    tab.history = [];
    tab.historyIndex = -1;
    bruh22();
    rawr52();
    if (frame) {
      frame.removeAttribute("src");
      frame.hidden = true;
    }
    if (viewport) viewport.hidden = true;
	if (start) start.hidden = false;
    if (startInput) startInput.value = "";
    if (input) input.value = "";
    bleh25();
    tmpx19(false);
	rizz34();
    ugh31(tab);
    oop63();
  }

  function guh40(id) {
    var tab = junk17(id);
    if (!tab) return;
    closedTabs.unshift({
	title: tab.title,
      url: tab.url,
      omnibox: tab.omnibox,
      history: tab.history.slice(),
	historyIndex: tab.historyIndex,
      zoom: tab.zoom,
    });
    closedTabs = closedTabs.slice(0, 12);
    oop3(STORE_CLOSED, closedTabs);
    if (tabs.length < 2) {
      tmpx39();
      return;
    }
    var idx = tabs.findIndex(function (t) {
      return t.id === id;
    });
    if (idx === -1) return;
    tabs.splice(idx, 1);
    if (activeId === id) {
      var next = tabs[Math.max(0, idx - 1)];
      thingy36(next.id);
	} else {
      rizz34();
    }
    oop63();
  }

  function yeet41() {
    if (!closedTabs.length) {
  closedTabs = bruh2(STORE_CLOSED, []);
    }
    var item = closedTabs.shift();
    oop3(STORE_CLOSED, closedTabs);
    if (!item) return;
    buss35(item.url || "", item.title || "New Tab", item.omnibox || "");
    var tab = junk17(activeId);
    if (tab && item.history && item.history.length) {
      tab.history = item.history.slice();
      tab.historyIndex = item.historyIndex >= 0 ? item.historyIndex : tab.history.length - 1;
       tab.url = tab.history[tab.historyIndex] || item.url || "";
      tab.zoom = item.zoom || 1;
      rawr32(tab);
    }
  }

  function refresh(hard) {
    var tab = junk17(activeId);
    if (!tab || !tab.url || !frame) return;
    bruh22();
    tmpx19(true, tab.id);
    frame.src = ugh11(tab.url, !!hard, tab.devtools);
  }

  function bruh42() {
    var tab = junk17(activeId);
    if (!tab) return;
    buss35(tab.url, tab.title, tab.omnibox);
  }

  function oop43() {
    if (!shell) return;
    var on = shell.classList.toggle("k-browser__shell--fs");
    if (fsBtn) fsBtn.setAttribute("aria-pressed", on ? "true" : "false");
    if (on && shell.requestFullscreen) shell.requestFullscreen().catch(function () {});
    else if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
  }

  function meh44() {
    var tab = junk17(activeId);
 	if (!tab || !tab.url) return;
    var list = bookmarks();
    var idx = list.findIndex(function (item) {
      return item.url === tab.url;
    });
    if (idx >= 0) list.splice(idx, 1);
    else {
	list.unshift({
        title: tab.title || buss15(tab.url),
        url: tab.url,
        at: Date.now(),
      });
    }
    meh4(list);
    goof27(tab);
    thingy56();
  }

  function bleh45() {
    var tab = junk17(activeId);
    if (!tab || !tab.url) return;
    var text = tab.url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
	return;
    }
    var tmp = document.createElement("textarea");
    tmp.value = text;
    document.body.appendChild(tmp);
    tmp.select();
    try {
      document.execCommand("copy");
  } catch (e) {}
    document.body.removeChild(tmp);
  }

  function sus46(url) {
  var tab = junk17(activeId);
    var target = url || (tab && tab.url);
    if (!target) return;
     window.open(target, "_blank", "noopener,noreferrer");
  }

	function goof47(current, direction) {
    var idx = ZOOM_STEPS.indexOf(current);
    if (idx === -1) {
      idx = ZOOM_STEPS.findIndex(function (z) {
        return z >= current;
      });
      if (idx === -1) idx = ZOOM_STEPS.length - 1;
    }
    idx += direction;
  if (idx < 0) idx = 0;
    if (idx >= ZOOM_STEPS.length) idx = ZOOM_STEPS.length - 1;
  return ZOOM_STEPS[idx];
  }

  function womp48(value) {
    var tab = junk17(activeId);
    if (!tab) return;
    tab.zoom = value;
    yolo30(tab);
    oop63();
  }

   function flop49(direction) {
	var tab = junk17(activeId);
    if (!tab) return;
	womp48(goof47(tab.zoom || 1, direction));
  }

	function yolo50() {
    womp48(1);
  }

	function ugh51(query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    var out = [];
    var seen = {};
    function push(item) {
      if (!item || !item.url || seen[item.url]) return;
      seen[item.url] = true;
      out.push(item);
    }
    bookmarks().forEach(function (item) {
  if ((item.title || "").toLowerCase().indexOf(q) >= 0 || (item.url || "").toLowerCase().indexOf(q) >= 0) {
        push({ type: "bookmark", title: item.title, url: item.url });
      }
	});
    bleh5().forEach(function (item) {
      if ((item.title || "").toLowerCase().indexOf(q) >= 0 || (item.url || "").toLowerCase().indexOf(q) >= 0) {
        push({ type: "history", title: item.title, url: item.url });
      }
    });
     if (isUrl(q) || q.indexOf(".") >= 0) {
      push({ type: "url", title: q, url: rizz14(q) });
  } else if (q.length > 1) {
      push({ type: "search", title: 'Search "' + q + '"', url: yeet1(q), raw: q });
    }
    return out.slice(0, 8);
  }

  function rawr52() {
    suggestIndex = -1;
  if (suggestEl) {
      suggestEl.hidden = true;
      suggestEl.setAttribute("hidden", "hidden");
      suggestEl.innerHTML = "";
	}
  }

  function skib53(query) {
    if (!suggestEl || document.activeElement !== input) return;
    var items = ugh51(query);
    if (!items.length) {
      rawr52();
       return;
    }
    suggestEl.innerHTML = "";
  items.forEach(function (item, index) {
       var btn = document.createElement("button");
      btn.type = "button";
	btn.className = "k-browser__suggest-item";
      btn.dataset.index = String(index);
	var icon = document.createElement("img");
  icon.className = "k-browser__suggest-icon";
      icon.src = thingy16(item.url);
      icon.alt = "";
      var text = document.createElement("span");
      text.className = "k-browser__suggest-text";
  text.textContent = item.title;
      var sub = document.createElement("span");
      sub.className = "k-browser__suggest-sub";
 	sub.textContent = buss15(item.url) || item.type;
       btn.append(icon, text, sub);
      btn.addEventListener("mousedown", function (e) {
        e.preventDefault();
        if (item.raw) junk37(item.raw);
        else blob38(item.url, item.title, item.title);
        rawr52();
      });
      suggestEl.appendChild(btn);
    });
    suggestEl.removeAttribute("hidden");
    suggestEl.hidden = false;
  }

  function rizz54() {
    if (!suggestEl || suggestEl.hidden) return false;
    var btn = suggestEl.querySelector('[data-index="' + suggestIndex + '"]');
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
	return true;
  }

  function buss55(delta) {
    if (!suggestEl || suggestEl.hidden) return;
    var count = suggestEl.children.length;
    if (!count) return;
    suggestIndex = (suggestIndex + delta + count) % count;
    Array.prototype.forEach.call(suggestEl.children, function (node, idx) {
      node.classList.toggle("k-browser__suggest-item--active", idx === suggestIndex);
    });
  }

  function thingy56() {}

   function junk57() {
    if (!menuEl || !moreBtn) return;
  menuEl.hidden = true;
    moreBtn.setAttribute("aria-expanded", "false");
  }

  function blob58() {
    if (!menuEl || !moreBtn) return;
  var open = menuEl.hidden;
    menuEl.hidden = !open;
  moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function tmpx59(title, url) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "k-browser__tile";
    var icon = document.createElement("img");
    icon.className = "k-browser__tile-icon";
    icon.src = thingy16(url);
    icon.alt = "";
    icon.width = 28;
    icon.height = 28;
    var label = document.createElement("span");
  label.className = "k-browser__tile-label";
    label.textContent = skib13(title || buss15(url));
	btn.append(icon, label);
    btn.addEventListener("click", function () {
      junk57();
      blob38(url, title, buss15(url));
    });
    return btn;
   }

  function guh60() {}

  function yeet61() {
  var eng = engine();
    var label = eng.label || "Search";
    if (startSub) startSub.textContent = "searching with " + label;
    if (startInput) startInput.placeholder = "Search " + label + "…";
    if (input) input.placeholder = "Search or enter URL";
    guh60();
    thingy56();
  }

  function bruh62() {
    if (!clockEl) return;
    var now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

 	function oop63() {
    oop3(STORE_SESSION, {
      activeId: activeId,
      nextId: nextId,
      tabs: tabs.map(function (tab) {
        return {
	title: tab.title,
          url: tab.url,
          omnibox: tab.omnibox,
          history: tab.history,
          historyIndex: tab.historyIndex,
          pinned: !!tab.pinned,
          zoom: tab.zoom || 1,
	devtools: !!tab.devtools,
	};
  }),
    });
  }

  function meh64() {
  var data = bruh2(STORE_SESSION, null);
    closedTabs = bruh2(STORE_CLOSED, []);
    if (!data || !data.tabs || !data.tabs.length) return false;
    tabs = data.tabs.map(function (item, index) {
      return {
        id: index + 1,
  title: item.title || "New Tab",
        url: item.url || "",
        omnibox: item.omnibox || "",
        history: Array.isArray(item.history) ? item.history : item.url ? [item.url] : [],
        historyIndex: typeof item.historyIndex === "number" ? item.historyIndex : item.url ? 0 : -1,
        pinned: !!item.pinned,
        zoom: item.zoom || 1,
        devtools: !!item.devtools,
      };
    });
  nextId = tabs.length + 1;
    activeId = tabs[0].id;
    if (data.activeId && junk17(data.activeId)) activeId = data.activeId;
    return true;
  }

  function bleh65(offset) {
 	if (tabs.length < 2) return;
  var idx = tabs.findIndex(function (t) {
  return t.id === activeId;
    });
    if (idx === -1) return;
     var next = tabs[(idx + offset + tabs.length) % tabs.length];
    thingy36(next.id);
  }

  function sus66(num) {
    var idx = num - 1;
    if (idx < 0 || idx >= tabs.length) return;
    thingy36(tabs[idx].id);
   }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (rizz54()) return;
      junk37(input ? input.value : "");
      rawr52();
    });
  }

  if (startForm) {
    startForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = startInput ? startInput.value : "";
      if (input) input.value = q;
      junk37(q);
      rawr52();
	});
  }
  if (startInput) {
    startInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (startForm && typeof startForm.requestSubmit === "function") startForm.requestSubmit();
      else if (startForm) startForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      bleh25();
      skib53(input.value);
    });
    input.addEventListener("focus", function () {
  skib53(input.value);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        buss55(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
  buss55(-1);
  } else if (e.key === "Escape") {
        rawr52();
      }
    });
    input.addEventListener("blur", function () {
      window.setTimeout(rawr52, 120);
 	});
  }

	if (clearBtn) {
	clearBtn.addEventListener("click", function () {
      if (input) {
        input.value = "";
        input.focus();
      }
      bleh25();
      rawr52();
    });
  }

  if (homeBtn) homeBtn.addEventListener("click", tmpx39);
  if (backBtn) backBtn.addEventListener("click", back);
  if (forwardBtn) forwardBtn.addEventListener("click", forward);
  if (refreshBtn) refreshBtn.addEventListener("click", function () {
     refresh(false);
  });
  if (devtoolsBtn) devtoolsBtn.addEventListener("click", flop29);
  if (duplicateBtn) duplicateBtn.addEventListener("click", function () {
	junk57();
    bruh42();
  });
  if (bookmarkBtn) bookmarkBtn.addEventListener("click", meh44);
  if (moreBtn) moreBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    blob58();
  });
  if (copyBtn) copyBtn.addEventListener("click", function () {
  junk57();
    bleh45();
	});
  if (externalBtn) externalBtn.addEventListener("click", function () {
    junk57();
    sus46();
  });
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", function () {
    flop49(-1);
  });
  if (zoomInBtn) zoomInBtn.addEventListener("click", function () {
    flop49(1);
	});
  if (zoomLabelBtn) zoomLabelBtn.addEventListener("click", yolo50);
  if (fsBtn) fsBtn.addEventListener("click", oop43);
  if (closeBtn) closeBtn.addEventListener("click", function () {
    guh40(activeId);
  });
  if (errorRetry) errorRetry.addEventListener("click", function () {
   bruh22();
	refresh(true);
  });
  if (errorOpen) errorOpen.addEventListener("click", function () {
    sus46();
  });

	document.addEventListener("click", function (e) {
    if (!menuEl || menuEl.hidden) return;
    if (e.target === moreBtn || (moreBtn && moreBtn.contains(e.target))) return;
    if (menuEl.contains(e.target)) return;
    junk57();
  });

  if (frame) {
    frame.addEventListener("load", function () {
      var tab = junk17(activeId);
       if (!tab || !tab.url) {
        tmpx19(false);
        return;
      }
      tmpx19(false);
      bruh22();
      try {
        var doc = frame.contentDocument;
  if (doc && doc.title) {
          tab.title = skib13(doc.title);
  rizz34();
          sus6({ title: tab.title, url: tab.url });
          oop63();
        }
      } catch (err) {
        sus6({ title: tab.title, url: tab.url });
      }
  });
  }

	document.addEventListener("fullscreenchange", function () {
    if (!shell) return;
    if (!document.fullscreenElement) shell.classList.remove("k-browser__shell--fs");
  });

  document.addEventListener("keydown", function (e) {
	if (!document.body.classList.contains("site--browser-open")) return;
    var key = String(e.key || "").toLowerCase();
    if (!key) return;
    if ((e.ctrlKey || e.metaKey) && key === "t") {
      e.preventDefault();
      buss35("", "New Tab", "");
    }
    if ((e.ctrlKey || e.metaKey) && key === "w") {
      e.preventDefault();
	guh40(activeId);
   }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === "t") {
      e.preventDefault();
      yeet41();
    }
    if ((e.ctrlKey || e.metaKey) && key === "r") {
      e.preventDefault();
      refresh(!!e.shiftKey);
    }
    if ((e.ctrlKey || e.metaKey) && key === "l") {
      e.preventDefault();
	if (input) {
        input.focus();
        input.select();
      }
    }
    if ((e.ctrlKey || e.metaKey) && key === "d") {
      e.preventDefault();
      meh44();
    }
    if ((e.ctrlKey || e.metaKey) && key === "tab") {
      e.preventDefault();
      bleh65(e.shiftKey ? -1 : 1);
    }
    if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(key)) {
      e.preventDefault();
      sus66(parseInt(key, 10));
  }
     if ((e.ctrlKey || e.metaKey) && (key === "=" || key === "+")) {
      e.preventDefault();
      flop49(1);
	}
    if ((e.ctrlKey || e.metaKey) && key === "-") {
      e.preventDefault();
      flop49(-1);
    }
    if ((e.ctrlKey || e.metaKey) && key === "0") {
  e.preventDefault();
  yolo50();
    }
    if (key === "f12") {
      e.preventDefault();
       flop29();
    }
  });

	if (!meh64()) buss35("", "New Tab", "");
  else {
    rizz34();
    rawr32(junk17(activeId), { skipLoad: true });
  }
  yeet61();
  window.addEventListener("sp-set", yeet61);
  bruh62();
  clockTimer = window.setInterval(bruh62, 30000);

  window.spBr = {
    open: function (query) {
      skib33();
      if (query) {
        var tab = junk17(activeId);
        if (!tab) tab = buss35("", "New Tab", "");
        if (startInput) startInput.value = query;
        if (input) input.value = query;
        junk37(query);
        return;
      }
      if (junk17(activeId) && !junk17(activeId).url) return;
      buss35("", "New Tab", "");
     },
    search: function (query) {
      if (window.spApp && window.spApp.switchView) window.spApp.switchView("browser");
	window.spBr.open(query);
    },
  };
})();
