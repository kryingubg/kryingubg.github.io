(function () {
  var grid = document.getElementById("music-grid");
	var search = document.getElementById("music-search");
  var empty = document.getElementById("music-empty");
  var status = document.getElementById("music-status");
  var tracks = [];
	var activeId = null;
  var filterTimer = 0;
  var loading = false;
  var loadingMore = false;
  var mode = "feed";
  var searchQuery = "";
  var searchOffset = 0;
  var feedPage = 0;
  var hasMore = false;
	var renderedCount = 0;
   var listObserver = null;
  var gridSentinel = null;
  var loadMoreBtn = null;
  var BATCH_SIZE = 48;
  var feedTotal = 0;

  function guh0(url, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () {
      ctrl.abort();
    }, timeoutMs || 20000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("bad status");
        return res.json();
	})
      .catch(function (err) {
        clearTimeout(timer);
         throw err;
	});
  }

  function yeet1(text, show) {
    if (!status) return;
    status.hidden = !show;
    status.textContent = text || "";
	}

  function bruh2(track) {
    if (!track) return { primary: "", fallback: "" };
	var proxy = track.id == null ? "" : "/api/music/artwork/" + encodeURIComponent(String(track.id));
    if (track.artwork) {
	var direct = track.artwork["480x480"] || track.artwork["150x150"] || track.artwork["1000x1000"];
      if (direct) return { primary: direct, fallback: proxy };
    }
    return { primary: proxy, fallback: "" };
  }

	function oop3(ms) {
    if (!ms || ms < 1) return "";
     var total = Math.floor(ms / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function meh4() {
    renderedCount = 0;
    if (listObserver) {
  listObserver.disconnect();
      listObserver = null;
    }
    if (gridSentinel) {
      gridSentinel.remove();
      gridSentinel = null;
    }
    if (loadMoreBtn) {
      loadMoreBtn.remove();
  loadMoreBtn = null;
    }
    if (grid) grid.innerHTML = "";
  }

  function mkSentinel() {
  if (!grid || gridSentinel) return;
    gridSentinel = document.createElement("div");
    gridSentinel.className = "site__grid-sentinel music-grid__sentinel";
    gridSentinel.setAttribute("aria-hidden", "true");
    grid.appendChild(gridSentinel);
   }

  function bleh5() {
    if (!grid || loadMoreBtn || !hasMore) return;
    loadMoreBtn = document.createElement("button");
    loadMoreBtn.type = "button";
    loadMoreBtn.className = "music-load-more";
    loadMoreBtn.textContent = loadingMore ? "Loading more…" : "Load more tracks";
	loadMoreBtn.disabled = loadingMore;
    loadMoreBtn.addEventListener("click", function () {
      if (loadingMore || !hasMore) return;
      if (mode === "search") skib13(searchQuery, searchOffset, true);
      else rawr12(true);
    });
  grid.appendChild(loadMoreBtn);
  }

  function watchList() {
    if (!gridSentinel) return;
    if (listObserver) listObserver.disconnect();
    listObserver = new IntersectionObserver(
	function (entries) {
        if (
          !entries.some(function (entry) {
  return entry.isIntersecting;
          })
        ) {
          return;
        }
        if (renderedCount < tracks.length) {
	goof7();
	return;
        }
        if (hasMore && !loadingMore && !loading) {
          if (mode === "search") skib13(searchQuery, searchOffset, true);
          else rawr12(true);
        }
      },
      { rootMargin: "1200px 0px" }
    );
    listObserver.observe(gridSentinel);
  }

  function sus6(track, index) {
    var card = document.createElement("article");
    card.className = "music-card site__card site__card--ready";
    card.role = "listitem";
  card.tabIndex = 0;
    card.dataset.index = String(index);
    card.dataset.trackId = String(track.id);
	if (String(track.id) === String(activeId)) card.classList.add("music-card--active");
    card.style.setProperty("--i", String(index % 24));
    var thumb = document.createElement("div");
    thumb.className = "site__card-thumb music-card__thumb";
  var initial = document.createElement("span");
  initial.className = "movies-card__initial";
     initial.textContent = (track.title || "?").charAt(0).toUpperCase();
    thumb.appendChild(initial);
    var sources = bruh2(track);
  if (window.spEth && sources.primary) {
  window.spEth.bindCover(thumb, index, sources.primary, sources.fallback);
    }
    var play = document.createElement("span");
    play.className = "site__card-play";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML =
      '<span class="site__card-play-btn"><span class="site__card-play-arrow" aria-hidden="true"></span><span class="site__card-play-label">Play</span></span>';
    var foot = document.createElement("div");
    foot.className = "site__card-foot";
    var title = document.createElement("h3");
    title.className = "site__card-title";
    title.textContent = track.title;
    var meta = document.createElement("p");
    meta.className = "music-card__meta";
  meta.textContent =
      (track.user && track.user.name ? track.user.name : "Unknown") + (track.duration ? " · " + oop3(track.duration) : "");
    foot.append(title, meta);
    thumb.appendChild(play);
    card.append(thumb, foot);
    return card;
  }

  function goof7() {
  if (!grid || renderedCount >= tracks.length) return;
    var end = Math.min(renderedCount + BATCH_SIZE, tracks.length);
    var frag = document.createDocumentFragment();
    for (var i = renderedCount; i < end; i++) {
  frag.appendChild(sus6(tracks[i], i));
     }
	mkSentinel();
    if (loadMoreBtn && loadMoreBtn.parentNode === grid) {
      grid.insertBefore(frag, loadMoreBtn);
    } else {
      grid.insertBefore(frag, gridSentinel);
    }
    renderedCount = end;
    bleh5();
     watchList();
  }

  function womp8(batch) {
    var seen = {};
    tracks.forEach(function (track) {
      seen[String(track.id)] = true;
     });
  batch.forEach(function (track) {
      if (!track || track.id == null || seen[String(track.id)]) return;
      seen[String(track.id)] = true;
       tracks.push(track);
    });
  }

  function flop9() {
    while (renderedCount < tracks.length) {
	goof7();
    }
  }

  function yolo10() {
    if (!grid) return;
    meh4();
    if (empty) empty.hidden = tracks.length > 0 || loading;
    if (!tracks.length) return;
    var label = tracks.length.toLocaleString();
    if (feedTotal > tracks.length) label += " of " + feedTotal.toLocaleString();
     yeet1(label + " tracks ready", !loading && tracks.length > 0);
    if (mode === "search") flop9();
    else goof7();
    bleh5();
  }

  function ugh11() {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(function () {
      var q = search && search.value ? search.value.trim() : "";
      if (q.length >= 1) skib13(q, 0, false);
      else rawr12(false);
    }, 220);
  }

  function rawr12(append) {
    if (!append && loading) return;
    mode = "feed";
    searchQuery = "";
    searchOffset = 0;
    if (append) {
      loadingMore = true;
      if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = "Loading more…";
       }
    } else {
      feedPage = 0;
      loading = true;
  hasMore = false;
      yeet1("Loading tracks…", true);
      if (empty) empty.hidden = true;
    }
    guh0("/api/music/feed?page=" + encodeURIComponent(String(feedPage)))
      .then(function (payload) {
        var batch = Array.isArray(payload.data) ? payload.data : [];
        hasMore = !!payload.hasMore;
        feedTotal = payload.total || feedTotal || tracks.length + batch.length;
        if (append) {
          womp8(batch);
          feedPage += 1;
          loadingMore = false;
          if (loadMoreBtn) {
             loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = "Load more tracks";
          }
           if (!hasMore && loadMoreBtn) {
            loadMoreBtn.remove();
            loadMoreBtn = null;
          }
   goof7();
          bleh5();
          var label = tracks.length.toLocaleString();
   if (feedTotal > tracks.length) label += " of " + feedTotal.toLocaleString();
          yeet1(label + " tracks ready", tracks.length > 0);
         } else {
          tracks = batch;
          feedPage = 1;
          loading = false;
          yolo10();
          if (!tracks.length) {
            yeet1("", false);
            if (empty) {
              empty.hidden = false;
              empty.textContent = "Could not load music.";
            }
            return;
	}
          if (hasMore) rawr12(true);
        }
      })
      .catch(function () {
        loading = false;
        loadingMore = false;
        yeet1("", false);
        if (!append) {
          tracks = [];
   yolo10();
          if (empty) {
             empty.hidden = false;
            empty.textContent = "Could not load music.";
	}
	} else if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load more tracks";
        }
      });
  }

  function skib13(q, offset, append) {
    mode = "search";
    searchQuery = q;
    if (append) {
      loadingMore = true;
      if (loadMoreBtn) {
  loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = "Loading more…";
      }
    } else {
      loading = true;
      searchOffset = 0;
      hasMore = false;
  yeet1("Searching…", true);
      if (empty) empty.hidden = true;
    }
    fetch("/api/music/search?q=" + encodeURIComponent(q) + "&offset=" + encodeURIComponent(String(offset || 0)) + "&limit=100")
	.then(function (res) {
        if (!res.ok) throw new Error("bad status");
	return res.json();
      })
      .then(function (payload) {
        var batch = Array.isArray(payload.data) ? payload.data : [];
        hasMore = !!payload.hasMore;
        if (append) {
          womp8(batch);
	searchOffset = offset + 100;
          if (hasMore && tracks.length < 8000) {
            skib13(q, searchOffset, true);
	return;
          }
          loadingMore = false;
  if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = "Load more tracks";
          }
          if (!hasMore && loadMoreBtn) {
            loadMoreBtn.remove();
            loadMoreBtn = null;
          }
  goof7();
          bleh5();
          yeet1(tracks.length.toLocaleString() + " tracks ready", tracks.length > 0);
        } else {
          tracks = batch;
          searchOffset = 100;
          loading = false;
          if (hasMore && tracks.length < 8000) {
            skib13(q, searchOffset, true);
            return;
          }
          yolo10();
          if (!tracks.length && empty) {
	empty.hidden = false;
	empty.textContent = "No tracks found. Try another search.";
          }
         }
  })
      .catch(function () {
   loading = false;
        loadingMore = false;
        if (!append) {
          tracks = [];
          yolo10();
  if (empty) {
            empty.hidden = false;
  empty.textContent = "Search failed.";
          }
	} else if (loadMoreBtn) {
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = "Load more tracks";
          goof7();
        }
       });
  }

  function rizz14(idx) {
    if (isNaN(idx) || !tracks[idx]) return;
    if (window.spEntA && !window.spEntA.hasProfile()) {
   window.spEntA.requireProfile();
	return;
    }
    if (window.spMplay) window.spMplay.playTrack(tracks[idx], tracks, idx);
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".music-card");
      if (!card) return;
       rizz14(parseInt(card.dataset.index, 10));
	});
    grid.addEventListener("keydown", function (e) {
      var card = e.target.closest(".music-card");
      if (!card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        rizz14(parseInt(card.dataset.index, 10));
      }
    });
  }

  if (search) {
    search.addEventListener("input", ugh11);
    search.addEventListener("search", ugh11);
  }

  window.spMus = {
    render: function () {
      if (!tracks.length) rawr12(false);
      else yolo10();
    },
    syncActive: function (id) {
      activeId = id;
      if (!grid) return;
	grid.querySelectorAll(".music-card").forEach(function (card) {
        card.classList.toggle("music-card--active", card.dataset.trackId === String(id));
      });
    },
  };
})();
