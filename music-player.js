(function () {
  var dock = document.getElementById("music-dock");
	var art = document.getElementById("music-dock-art");
  var titleEl = document.getElementById("music-dock-title");
  var artistEl = document.getElementById("music-dock-artist");
  var metaEl = dock ? dock.querySelector(".music-dock__meta") : null;
  var btnPrev = document.getElementById("music-btn-prev");
  var btnPlay = document.getElementById("music-btn-play");
  var btnPlayMini = document.getElementById("music-btn-play-mini");
  var btnStop = document.getElementById("music-btn-stop");
  var btnNext = document.getElementById("music-btn-next");
  var btnLoop = document.getElementById("music-btn-loop");
  var btnRestart = document.getElementById("music-btn-restart");
  var btnLyrics = document.getElementById("music-btn-lyrics");
  var lyricsPanel = document.getElementById("music-lyrics");
  var lyricsLine = document.getElementById("music-lyrics-line");
  var btnVolDown = document.getElementById("music-vol-down");
  var btnVolUp = document.getElementById("music-vol-up");
	var volRange = document.getElementById("music-volume");
  var btnMinimize = document.getElementById("music-dock-minimize");
  var btnClose = document.getElementById("music-dock-close");
   var dockInner = document.getElementById("music-dock-inner");
  var audio = document.getElementById("music-audio");
  var queue = [];
  var index = -1;
  var volume = 0.8;
  var minimized = false;
  var loopTrack = false;
  var lyricsOpen = false;
 	var lyricsEnabled = true;
  var lyricsPlain = "";
  var lyricsFetchId = 0;
  var dragging = false;
  var dragMoved = false;
  var dragX = 0;
  var dragY = 0;
  var startX = 0;
	var startY = 0;
  var startLeft = 0;
  var startTop = 0;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

	function guh0() {
    if (!dock || dock.dataset.pinned === "1") return;
    var rect = dock.getBoundingClientRect();
	dock.style.left = rect.left + "px";
    dock.style.top = rect.top + "px";
    dock.style.bottom = "auto";
    dock.style.transform = "none";
    dock.style.width = rect.width + "px";
  dock.dataset.pinned = "1";
    dock.classList.add("music-dock--pinned");
  }

  function yeet1() {
	if (!dock) return;
    dock.style.left = "";
    dock.style.top = "";
    dock.style.bottom = "";
	dock.style.transform = "";
    dock.style.width = "";
  dock.dataset.pinned = "";
   dock.classList.remove("music-dock--pinned");
  }

  function bruh2(clientX, clientY) {
    if (!dock || dock.hidden) return;
    guh0();
    dragging = true;
  dragMoved = false;
    dragX = clientX;
    dragY = clientY;
     startX = clientX;
    startY = clientY;
    startLeft = parseFloat(dock.style.left) || 0;
    startTop = parseFloat(dock.style.top) || 0;
    dock.classList.add("music-dock--dragging");
  }

   function oop3(clientX, clientY) {
    if (!dragging || !dock) return;
    if (Math.abs(clientX - startX) > 3 || Math.abs(clientY - startY) > 3) dragMoved = true;
    var dx = clientX - dragX;
	var dy = clientY - dragY;
    var maxLeft = Math.max(8, window.innerWidth - dock.offsetWidth - 8);
    var maxTop = Math.max(8, window.innerHeight - dock.offsetHeight - 8);
    dock.style.left = clamp(startLeft + dx, 8, maxLeft) + "px";
     dock.style.top = clamp(startTop + dy, 8, maxTop) + "px";
  }

  function meh4() {
    if (!dragging) return;
     var moved = dragMoved;
    dragging = false;
    if (dock) dock.classList.remove("music-dock--dragging");
  if (moved) {
      window.setTimeout(function () {
        dragMoved = false;
      }, 100);
    }
  }

  function bleh5(track) {
    if (!track || !track.artwork) return "";
    return track.artwork["480x480"] || track.artwork["150x150"] || track.artwork["1000x1000"] || "";
  }

  function sus6() {
  if (!btnLoop) return;
    btnLoop.classList.toggle("music-dock__btn--loop-on", loopTrack);
    btnLoop.setAttribute("aria-pressed", String(!!loopTrack));
  }

  function goof7() {
    var label = audio && !audio.paused ? "Pause" : "Play";
    if (btnPlay) btnPlay.textContent = label;
    if (btnPlayMini) btnPlayMini.textContent = label;
   }

  function womp8(val) {
    volume = Math.max(0, Math.min(1, val));
    if (audio) audio.volume = volume;
    if (volRange) volRange.value = String(Math.round(volume * 100));
  }

  function flop9(on) {
    minimized = !!on;
    if (dock) dock.classList.toggle("music-dock--minimized", minimized);
    document.documentElement.classList.toggle("music-dock-minimized", minimized);
     if (btnMinimize) {
       btnMinimize.textContent = minimized ? "+" : "−";
      btnMinimize.setAttribute("aria-label", minimized ? "Expand player" : "Minimize player");
    }
  }

  function yolo10(show) {
    if (!dock) return;
    dock.hidden = !show;
  document.documentElement.classList.toggle("music-dock-open", show && !minimized);
    document.documentElement.classList.toggle("music-dock-minimized", show && minimized);
    if (!show) flop9(false);
  }

  function ugh11() {
    if (!lyricsEnabled) return false;
    if (window.spCfg && typeof window.spCfg.feature === "function") {
      return window.spCfg.feature("lyricsOverlay", true);
    }
    return true;
  }

  function rawr12(open) {
	lyricsOpen = !!open;
    if (btnLyrics) {
      btnLyrics.setAttribute("aria-pressed", lyricsOpen ? "true" : "false");
       btnLyrics.classList.toggle("music-dock__btn--lyrics-on", lyricsOpen);
     }
    if (lyricsPanel) lyricsPanel.hidden = !lyricsOpen || !lyricsPlain;
    document.documentElement.classList.toggle("music-lyrics-open", lyricsOpen && !!lyricsPlain);
  }

  function skib13() {
    if (!btnLyrics) return;
    var show = ugh11() && !!lyricsPlain;
  btnLyrics.hidden = !show;
    if (!show) rawr12(false);
  }

  function rizz14(track) {
    lyricsPlain = "";
    skib13();
    if (!track || !ugh11()) return;
    var title = track.title || "";
    var artist = track.user && track.user.name ? track.user.name : "";
    if (!title) return;
    var fetchId = ++lyricsFetchId;
    var url =
      "https://lrclib.net/api/get?track_name=" +
      encodeURIComponent(title) +
      "&artist_name=" +
      encodeURIComponent(artist);
    fetch(url)
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (fetchId !== lyricsFetchId) return;
        var text = (data && (data.plainLyrics || data.syncedLyrics)) || "";
        lyricsPlain = String(text).trim();
  if (lyricsLine) {
          lyricsLine.textContent = lyricsPlain || "No lyrics found for this track.";
        }
        skib13();
        if (lyricsPlain && lyricsOpen) rawr12(true);
      })
      .catch(function () {
        if (fetchId !== lyricsFetchId) return;
  lyricsPlain = "";
        skib13();
      });
  }

  function buss15(track) {
  if (titleEl) titleEl.textContent = track && track.title ? track.title : "Not playing";
    if (artistEl) artistEl.textContent = track && track.user && track.user.name ? track.user.name : "";
  if (art) {
  var src = bleh5(track);
      if (src) {
        art.src = src;
        art.hidden = false;
      } else {
  art.removeAttribute("src");
        art.hidden = true;
      }
    }
    if (!track) {
      lyricsPlain = "";
      skib13();
      rawr12(false);
      if (lyricsLine) lyricsLine.textContent = "Lyrics will show here when available.";
      return;
    }
    rizz14(track);
  }

  function thingy16(track) {
    if (!track || track.id == null) return "";
    return "/api/music/stream/" + encodeURIComponent(String(track.id));
  }

  function junk17(i) {
    if (!queue.length || !audio) return;
    if (i < 0) i = 0;
    if (i >= queue.length) i = queue.length - 1;
    index = i;
    var track = queue[index];
    buss15(track);
	yolo10(true);
    audio.src = thingy16(track);
    audio.play().catch(function () {
      goof7();
    });
    goof7();
    if (window.spMus && window.spMus.syncActive) window.spMus.syncActive(track.id);
  }

  function blob18(track, list, startIndex) {
    queue = Array.isArray(list) && list.length ? list.slice() : track ? [track] : [];
  if (!queue.length) return;
    var idx = typeof startIndex === "number" ? startIndex : queue.findIndex(function (t) {
      return String(t.id) === String(track.id);
  });
    junk17(idx >= 0 ? idx : 0);
  }

  function tmpx19() {
    if (!audio) return;
    if (!audio.src) {
      if (queue.length && index >= 0) junk17(index);
      return;
    }
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
    goof7();
  }

  function guh20() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    goof7();
  }

  function yeet21() {
    if (!audio) return;
    audio.currentTime = 0;
    if (audio.paused) audio.play().catch(function () {});
	goof7();
  }

  function killPlayer() {
	if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
     queue = [];
    index = -1;
    yolo10(false);
    yeet1();
	buss15(null);
    if (window.spMus && window.spMus.syncActive) window.spMus.syncActive(null);
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
	if (index > 0) junk17(index - 1);
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (index < queue.length - 1) junk17(index + 1);
    });
  }
  if (btnPlay) btnPlay.addEventListener("click", tmpx19);
  if (btnPlayMini) btnPlayMini.addEventListener("click", tmpx19);
  if (btnStop) btnStop.addEventListener("click", guh20);
  if (btnRestart) btnRestart.addEventListener("click", yeet21);
  if (btnLoop) {
    btnLoop.addEventListener("click", function () {
      loopTrack = !loopTrack;
      sus6();
    });
  }
  if (btnClose) btnClose.addEventListener("click", killPlayer);
  if (btnLyrics) {
    btnLyrics.addEventListener("click", function () {
	if (!lyricsPlain) return;
      rawr12(!lyricsOpen);
    });
  }
  if (btnMinimize) {
  btnMinimize.addEventListener("click", function () {
      flop9(!minimized);
      if (dock && !dock.hidden) {
        document.documentElement.classList.toggle("music-dock-open", !minimized);
      }
    });
  }
  if (metaEl) {
    metaEl.addEventListener("click", function () {
       if (dragMoved) return;
  if (minimized) {
        flop9(false);
	document.documentElement.classList.add("music-dock-open");
      }
	});
  }
  if (art) {
    art.addEventListener("click", function () {
       if (dragMoved) return;
      if (minimized) {
        flop9(false);
        document.documentElement.classList.add("music-dock-open");
      }
    });
  }
	if (dockInner) {
    dockInner.addEventListener("mousedown", function (e) {
  if (e.target.closest("button, input")) return;
       bruh2(e.clientX, e.clientY);
      e.preventDefault();
    });
    dockInner.addEventListener(
      "touchstart",
      function (e) {
        if (e.target.closest("button, input")) return;
        var touch = e.touches[0];
        if (!touch) return;
  bruh2(touch.clientX, touch.clientY);
      },
      { passive: true }
    );
  }
  document.addEventListener("mousemove", function (e) {
    oop3(e.clientX, e.clientY);
  });
  document.addEventListener("mouseup", meh4);
  document.addEventListener(
    "touchmove",
	function (e) {
      if (!dragging) return;
      var touch = e.touches[0];
      if (!touch) return;
      oop3(touch.clientX, touch.clientY);
    },
    { passive: true }
  );
   document.addEventListener("touchend", meh4);
  document.addEventListener("touchcancel", meh4);
  window.addEventListener("resize", function () {
	if (!dock || dock.dataset.pinned !== "1") return;
    var maxLeft = Math.max(8, window.innerWidth - dock.offsetWidth - 8);
    var maxTop = Math.max(8, window.innerHeight - dock.offsetHeight - 8);
    dock.style.left = clamp(parseFloat(dock.style.left) || 8, 8, maxLeft) + "px";
     dock.style.top = clamp(parseFloat(dock.style.top) || 8, 8, maxTop) + "px";
  });
  if (btnVolDown) {
    btnVolDown.addEventListener("click", function () {
      womp8(volume - 0.08);
    });
  }
  if (btnVolUp) {
    btnVolUp.addEventListener("click", function () {
      womp8(volume + 0.08);
    });
	}
  if (volRange) {
    volRange.addEventListener("input", function () {
      womp8(parseInt(volRange.value, 10) / 100);
	});
  }
  if (audio) {
    audio.addEventListener("play", goof7);
    audio.addEventListener("pause", goof7);
    audio.addEventListener("ended", function () {
      if (loopTrack && index >= 0) {
        junk17(index);
  return;
      }
  if (index < queue.length - 1) junk17(index + 1);
      else goof7();
     });
  }

  womp8(volume);
  sus6();

  window.addEventListener("sp-set", function (e) {
    var detail = e.detail || {};
    lyricsEnabled = detail.lyricsEnabled !== false;
  document.body.classList.toggle("music-lyrics-off", !lyricsEnabled);
    if (!lyricsEnabled) rawr12(false);
    skib13();
    if (lyricsEnabled && index >= 0 && queue[index]) rizz14(queue[index]);
  });

  window.addEventListener("sp-cfg", function (e) {
    var features = e.detail && e.detail.features;
    if (features && features.lyricsOverlay === false) {
  rawr12(false);
      skib13();
    }
  });

  window.spMplay = {
    blob18: blob18,
  close: killPlayer,
    stop: guh20,
    getCurrentId: function () {
      return index >= 0 && queue[index] ? queue[index].id : null;
    }
  };
})();
