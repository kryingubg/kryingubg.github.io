(function () {
  var SOURCES = [
    {
      id: "nova",
      label: "Nova",
      quality: "HD",
      movie: function (id) {
        return "https://vidsrc.sh/embed/movie/" + id;
      },
      tv: function (id, s, e) {
        return "https://vidsrc.sh/embed/tv/" + id + "/" + s + "/" + e;
      },
    },
    {
      id: "maze",
      label: "Maze",
      quality: "HD",
      movie: function (id) {
        return "https://vidlink.pro/movie/" + id;
      },
      tv: function (id, s, e) {
        return "https://vidlink.pro/tv/" + id + "/" + s + "/" + e;
      },
    },
    {
      id: "luci",
      label: "Luci",
      quality: "HD",
      movie: function (id) {
        return "https://vaplayer.ru/embed/movie/" + id;
      },
      tv: function (id, s, e) {
        return "https://vaplayer.ru/embed/tv/" + id + "/" + s + "/" + e;
      },
    },
    {
      id: "xero",
      label: "Xero",
      quality: "HD",
      movie: function (id) {
        return "https://vidrock.ru/movie/" + id;
      },
      tv: function (id, s, e) {
        return "https://vidrock.ru/tv/" + id + "/" + s + "/" + e;
      },
    },
    {
      id: "zara",
      label: "Zara",
      quality: "4K",
      movie: function (id) {
        return "https://cinesrc.st/embed/movie/" + id;
      },
      tv: function (id, s, e) {
        return "https://cinesrc.st/embed/tv/" + id + "?s=" + s + "&e=" + e;
      },
    },
    {
      id: "kira",
      label: "Kira",
      quality: "HD",
      movie: function (id) {
        return "https://vixsrc.to/movie/" + id + "/";
      },
      tv: function (id, s, e) {
        return "https://vixsrc.to/tv/" + id + "/" + s + "/" + e + "/";
      },
    },
  ];
  var WATCHLIST_KEY = "kry-nova-watchlist";
  var novaPage = "home";
  var novaProvider = "netflix";
  var novaGenre = "";
  var novaMood = "";
  var novaYear = "";
  var novaSort = "popular";
  var NOVA_MOODS = {
    feel: ["Comedy", "Family", "Romance", "Animation"],
    thrill: ["Thriller", "Horror", "Mystery", "Crime"],
    comfort: ["Drama", "Romance", "Family", "Comedy"],
    hype: ["Action", "Adventure", "Science Fiction", "Sci-Fi", "Fantasy"],
  };
  var NOVA_COLLECTIONS = [
    { id: 86311, label: "Marvel" },
    { id: 531241, label: "Spider-Verse" },
    { id: 9485, label: "Fast & Furious" },
  ];
  var collectionCache = {};
  var homeRowsStamp = 0;
  var movByCard = typeof WeakMap === "function" ? new WeakMap() : null;
  var CATALOG = [];
  var catalogReady = false;
  var catalogPage = 1;
  var catalogHasMore = true;
	var catalogLoading = false;
  var catalogPrefetching = false;
  var catalogTotal = 0;
  var filteredMovies = [];
  var renderedCount = 0;
  var listObserver = null;
	var gridSentinel = null;
  var BATCH_SIZE = 24;
  var STANDALONE_BATCH_SIZE = 18;
  var CATALOG_PAGE_SIZE = 80;
	var grid = document.getElementById("movies-grid");
	var rowsContainer = document.getElementById("movies-rows");
  var moviesCatalog = document.getElementById("movies-catalog");
  var empty = document.getElementById("movies-empty");
  var status = document.getElementById("movies-status");
  var player = document.getElementById("movies-player");
  var frame = document.getElementById("movies-player-frame");
	var playerTitle = document.getElementById("movies-player-title");
  var playerBack = document.getElementById("movies-player-back");
  var playerFs = document.getElementById("movies-player-fs");
  var playerControls = document.getElementById("movies-player-controls");
  var sourceSelect = document.getElementById("movies-source");
  var seasonSelect = document.getElementById("movies-season");
  var episodeSelect = document.getElementById("movies-episode");
  var seasonWrap = document.getElementById("movies-season-wrap");
  var episodeWrap = document.getElementById("movies-episode-wrap");
	var hero = document.getElementById("movies-hero") || document.querySelector("#ent-panel-movies .movies-hero");
  var heroTitle = document.querySelector("#ent-panel-movies .movies-hero__title");
  var heroMeta = document.getElementById("movies-hero-meta");
  var heroDesc = document.querySelector("#ent-panel-movies .movies-hero__desc");
   var heroPlay = document.getElementById("movies-hero-play");
  var heroInfo = document.getElementById("movies-hero-info");
  var heroEyebrow = document.getElementById("movies-hero-eyebrow");
  var moviesPanel = document.getElementById("ent-panel-movies");
  var infoRoot = document.getElementById("movies-info");
  var infoBackdrop = document.getElementById("movies-info-backdrop");
  var infoClose = document.getElementById("movies-info-close");
  var infoMedia = document.getElementById("movies-info-media");
  var infoKind = document.getElementById("movies-info-kind");
  var infoTitle = document.getElementById("movies-info-title");
  var infoMeta = document.getElementById("movies-info-meta");
	var infoTagline = document.getElementById("movies-info-tagline");
  var infoOverview = document.getElementById("movies-info-overview");
  var infoGenres = document.getElementById("movies-info-genres");
  var infoPlay = document.getElementById("movies-info-play");
  var infoMovie = null;
  var infoReq = 0;
  var filterTimer = 0;
  var searchMode = false;
  var searchPage = 1;
  var searchLoading = false;
  var searchQuery = "";
  var searchHasMore = false;
  var activeMovie = null;
	var activeSeason = 1;
   var activeEpisode = 1;
  var activeSource = 0;
  var seasonMeta = [];
  var featuredMovie = null;
  var featuredReq = 0;
  var nfThumbSeq = 0;
  var WATCH_HISTORY_KEY = "kobran-ent-watch-history";
  var tvHydrating = false;
  var playerSlot = null;

  function guh0() {
    if (!player || player.__overlayMounted || !buss35()) return;
    playerSlot = document.createComment("movies-player-slot");
    if (player.parentNode) player.parentNode.insertBefore(playerSlot, player);
    document.body.appendChild(player);
    player.__overlayMounted = true;
  }

  function yeet1() {
    if (!player || !player.__overlayMounted || !playerSlot || !playerSlot.parentNode) return;
    playerSlot.parentNode.insertBefore(player, playerSlot);
    playerSlot.remove();
    playerSlot = null;
    player.__overlayMounted = false;
  }

  function bruh2() {
  return !!(window.spEntA && window.spEntA.hasProfile());
  }

   function oop3() {
    if (bruh2()) return true;
    if (window.spEntA) window.spEntA.requireProfile();
     return false;
  }

  function meh4(movie) {
    return !!(movie && String(movie.type || "").toLowerCase() === "tv");
  }

  function bleh5() {
    try {
      var raw = localStorage.getItem(WATCH_HISTORY_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
  return [];
    }
  }

  function sus6(list) {
	try {
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(list || []));
    } catch (e) {}
  }

  function goof7(movie) {
    if (!movie || movie.id == null) return;
    var key = thingy36(movie);
    var next = bleh5().filter(function (row) {
      return row && row.key && row.key !== key;
    });
    next.unshift({
      key: key,
      at: Date.now(),
      movie: {
        id: movie.id,
        type: movie.type || "movie",
        title: movie.title || "",
        year: movie.year || "",
        poster: movie.poster || "",
        backdrop: movie.backdrop || "",
 	},
    });
    sus6(next.slice(0, 120));
	}

  function womp8() {
    var history = bleh5();
	if (!history.length) return [];
    var out = [];
    for (var i = 0; i < history.length; i++) {
      var row = history[i];
      if (!row || !row.key) continue;
      var movie = junk37(row.key) || row.movie || null;
      if (!movie || movie.id == null) continue;
      if (!movie.type) movie.type = "movie";
      out.push(movie);
      if (out.length >= 60) break;
    }
    return out;
  }

  function flop9(movie) {
     if (!movie) return;
     var key = thingy36(movie);
    var card =
      (grid && grid.querySelector('[data-thingy36="' + key + '"]')) ||
      (rowsContainer && rowsContainer.querySelector('[data-thingy36="' + key + '"]'));
    if (!card) return;
    var thumb = card.querySelector(".nf-card__thumb, .movies-card__thumb");
    if (!thumb) return;
    thumb.__thumbLoaded = false;
    thumb.classList.remove("site__card-thumb--has-img");
    var oldImg = thumb.querySelector(".site__card-img");
	if (oldImg) oldImg.remove();
    var sources = bleh45(movie, false);
    if (sources.primary && window.spEth && typeof window.spEth.bindCover === "function") {
	window.spEth.bindCover(thumb, nfThumbSeq++, sources.primary, sources.fallback, {
        width: 220,
        height: 330,
        sizes: "160px",
        eager: true,
      });
      return;
    }
    if (!sources.primary) return;
    var img = document.createElement("img");
    img.className = "site__card-img";
    img.alt = "";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.src = sources.primary;
    img.addEventListener(
      "load",
      function () {
        thumb.classList.add("site__card-thumb--has-img");
        var dead = thumb.querySelector(".movies-card__initial");
        if (dead) dead.remove();
      },
      { once: true }
    );
    img.addEventListener(
      "error",
      function () {
        if (sources.fallback && img.src !== sources.fallback) {
          img.src = sources.fallback;
          return;
        }
        if (img.parentNode) img.remove();
      },
      { once: false }
    );
    thumb.insertBefore(img, thumb.firstChild);
  }

  function yolo10(items) {
    if (tvHydrating || !Array.isArray(items) || !items.length) return;
    tvHydrating = true;
    var pool = items.slice(0, 8);
    Promise.all(
      pool.map(function (movie) {
        return lookupMovie(movie.id, movie.type || "movie")
          .then(function (data) {
            if (!data || Number(data.id) !== Number(movie.id)) return false;
            var changed = false;
            if (data.poster && data.poster !== movie.poster) {
  movie.poster = data.poster;
              changed = true;
            }
            if (data.backdrop && data.backdrop !== movie.backdrop) {
              movie.backdrop = data.backdrop;
              changed = true;
            }
	if (data.title && data.title !== movie.title) movie.title = data.title;
            if (data.year && data.year !== movie.year) movie.year = data.year;
	return changed;
  })
          .catch(function () {
            return false;
          });
      })
     )
      .then(function (changedFlags) {
        if (!changedFlags.some(Boolean)) return;
        pool.forEach(function (movie, idx) {
          if (changedFlags[idx]) flop9(movie);
        });
       })
       .finally(function () {
        tvHydrating = false;
      });
  }

   function ugh11() {
    return SOURCES[activeSource] || SOURCES[0];
  }

  function rawr12(movie, season, episode) {
    var id = encodeURIComponent(String(movie.id));
    var src = ugh11();
    if (movie.type === "tv") {
      return src.tv(id, season || 1, episode || 1);
    }
    return src.movie(id);
  }

  function skib13() {
    if (!sourceSelect) return;
    sourceSelect.innerHTML = "";
    SOURCES.forEach(function (src, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nova-server" + (idx === activeSource ? " nova-server--on" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", idx === activeSource ? "true" : "false");
      btn.dataset.source = String(idx);
      btn.innerHTML =
        '<span class="nova-server__ico" aria-hidden="true">☰</span><span class="nova-server__name">' +
        src.label +
        '</span><span class="nova-server__q">' +
        (src.quality || "HD") +
        "</span>";
      btn.addEventListener("click", function () {
        activeSource = idx;
        skib13();
        junk17();
      });
      sourceSelect.appendChild(btn);
    });
  }

  function rizz14() {
    if (!seasonSelect) return;
    seasonSelect.innerHTML = "";
    var list = seasonMeta.length
      ? seasonMeta
      : [{ season: 1, episodes: 30 }];
    list.forEach(function (row) {
      var opt = document.createElement("option");
      opt.value = String(row.season);
  opt.textContent = "S" + row.season;
      if (row.season === activeSeason) opt.selected = true;
      seasonSelect.appendChild(opt);
    });
  }

  function buss15(season) {
    var found = seasonMeta.find(function (row) {
	return row.season === season;
    });
    return found && found.episodes ? found.episodes : 30;
   }

  function thingy16() {
    if (!episodeSelect) return;
    episodeSelect.innerHTML = "";
    var count = Math.max(1, buss15(activeSeason));
    if (activeEpisode > count) activeEpisode = 1;
    for (var i = 1; i <= count; i++) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = "E" + i;
      if (i === activeEpisode) opt.selected = true;
      episodeSelect.appendChild(opt);
    }
  }

   function junk17() {
    if (!frame || !activeMovie) return;
    frame.src = rawr12(activeMovie, activeSeason, activeEpisode);
  }

  function blob18(movie) {
    seasonMeta = [];
    activeSeason = 1;
    activeEpisode = 1;
	rizz14();
    thingy16();
     return fetchJsonTimeout(movApi("/api/movies/tv/" + encodeURIComponent(String(movie.id))), 8000)
      .catch(function () {
        var key = tmdbKey();
        if (!key) throw new Error("no_tv");
        return fetchJsonTimeout(
          "https://api.themoviedb.org/3/tv/" +
            encodeURIComponent(String(movie.id)) +
            "?api_key=" +
            encodeURIComponent(key),
          8000
        ).then(function (payload) {
          var seasons = Array.isArray(payload.seasons) ? payload.seasons : [];
          return {
            seasons: seasons
              .map(function (row) {
                return {
                  season: Number(row.season_number) || 0,
                  episodes: Math.max(1, Number(row.episode_count) || 1),
                };
              })
              .filter(function (row) {
                return row.season > 0;
              }),
          };
        });
      })
      .then(function (payload) {
        var seasons = Array.isArray(payload.seasons) ? payload.seasons : [];
        if (seasons.length) {
	seasonMeta = seasons
	.map(function (row) {
              return {
                season: Number(row.season) || 1,
                episodes: Math.max(1, Number(row.episodes) || 1),
  };
            })
	.filter(function (row) {
              return row.season > 0;
            });
          if (!seasonMeta.length) seasonMeta = [{ season: 1, episodes: 30 }];
          activeSeason = seasonMeta[0].season;
          activeEpisode = 1;
          rizz14();
          thingy16();
        }
      })
      .catch(function () {});
  }

  function tmpx19() {
    bruh42();
    if (player) {
      player.hidden = true;
      if (frame) frame.src = "about:blank";
      if (playerControls) playerControls.hidden = true;
    }
    activeMovie = null;
    document.documentElement.classList.remove("player-open");
    document.body.classList.remove("movies-player-open");
    document.body.classList.remove("movies-info-open");
    yeet1();
    bleh25(true);
    meh24();
  }

  function playMov(movie) {
  if (!player || !frame || !movie) return;
    if (!oop3()) return;
    goof7(movie);
    activeMovie = movie;
    activeSource = 0;
    activeSeason = 1;
    activeEpisode = 1;
    var title = movie.title || (movie.type === "tv" ? "TV Show" : "Movie") + " " + movie.id;
    if (playerTitle) playerTitle.textContent = title;
    skib13();
    if (playerControls) playerControls.hidden = false;
    var isTv = movie.type === "tv";
  if (seasonWrap) seasonWrap.hidden = !isTv;
	if (episodeWrap) episodeWrap.hidden = !isTv;
  if (isTv) {
      rizz14();
       thingy16();
      blob18(movie);
     }
    player.hidden = false;
	bruh42();
    guh0();
    bleh25(false);
    document.documentElement.classList.add("player-open");
  document.body.classList.add("movies-player-open");
    junk17();
    if (playerBack) playerBack.focus();
  }

  function killPlayer() {
    if (!player || !frame) return;
    tmpx19();
   }

   function guh20(id) {
    var hit = CATALOG.find(function (item) {
      return Number(item.id) === id;
    });
    if (hit && hit.type) return hit.type;
    var fromFiltered = filteredMovies.find(function (item) {
      return Number(item.id) === id;
    });
    if (fromFiltered && fromFiltered.type) return fromFiltered.type;
    return "";
  }

  function yeet21(raw) {
    var id = parseInt(String(raw || "").trim(), 10);
    if (!id || id < 1) return;
    var type = guh20(id) || "movie";
    lookupMovie(id, type)
      .then(function (item) {
        if (item && item.id) playMov(item);
        else playMov({ id: id, title: "TMDB #" + id, type: type });
      })
      .catch(function () {
        playMov({ id: id, title: "TMDB #" + id, type: type });
      });
  }

  if (seasonSelect) {
    seasonSelect.addEventListener("change", function () {
      activeSeason = parseInt(seasonSelect.value, 10) || 1;
      activeEpisode = 1;
      thingy16();
  junk17();
    });
  }
  if (episodeSelect) {
    episodeSelect.addEventListener("change", function () {
      activeEpisode = parseInt(episodeSelect.value, 10) || 1;
  junk17();
	});
  }

	function hueId(id) {
    var s = String(id);
 	var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }

   function bruh22() {
    if (buss35()) return document.getElementById("movies-search");
	return document.getElementById("movies-search-embedded");
  }

  function oop23() {
    var input = bruh22();
    return input && input.value ? input.value.trim() : "";
  }

  function meh24() {
    if (!buss35()) return;
    var searching = searchMode || searchLoading || !!oop23();
	if (hero) hero.hidden = searching || !featuredMovie;
    if (rowsContainer) rowsContainer.hidden = searching;
  }

  function bleh25(show) {
    if (!buss35()) return;
    var hide = !show;
    var home = document.getElementById("nova-home");
    var explore = document.getElementById("nova-explore");
    if (hero) hero.hidden = hide || searchMode || novaPage !== "home" || !featuredMovie;
    if (rowsContainer) rowsContainer.hidden = hide || novaPage !== "home";
    if (home) home.hidden = hide || (novaPage !== "home" && !searchMode);
    if (explore) explore.hidden = hide || (novaPage !== "discover" && novaPage !== "movies" && !searchMode);
    if (moviesCatalog) {
      moviesCatalog.hidden = hide ? true : !(novaPage === "discover" || novaPage === "movies" || searchMode) || filteredMovies.length === 0;
    }
    if (empty && hide) empty.hidden = true;
  }

  function sus26(q) {
    return /^\d+$/.test(q);
  }

  function goof27(text, show) {
  if (!status) return;
    status.hidden = !show;
    status.textContent = text || "";
  }

	function womp28() {
     goof27("", false);
  }

  function flop29(movie) {
    if (!movie) return "";
    if (movie.backdrop) return "https://image.tmdb.org/t/p/w1280/" + String(movie.backdrop).replace(/^\/+/, "");
    if (movie.poster) return "https://image.tmdb.org/t/p/w1280/" + String(movie.poster).replace(/^\/+/, "");
    return "";
  }

  function yolo30(list) {
	if (!Array.isArray(list) || !list.length) return null;
    var withBits = list.filter(function (movie) {
      return movie && !meh4(movie) && (movie.overview || movie.backdrop || movie.poster);
    });
    var pool = (withBits.length ? withBits : list.filter(function (m) { return m && !meh4(m); })).slice(0, 60);
    if (!pool.length) pool = list.slice(0, 40);
    if (!pool.length) return list[0] || null;
    var juicy = pool.filter(function (movie) {
      return movie.overview && String(movie.overview).length > 40;
    });
    var pickFrom = juicy.length >= 4 ? juicy : pool;
     return pickFrom[Math.floor(Math.random() * pickFrom.length)] || pool[0] || null;
  }

  function ugh31(movie) {
    if (!movie || !hero) return;
    featuredMovie = movie;
    if (heroEyebrow) heroEyebrow.textContent = movie.type === "tv" ? "Featured Series" : "Featured Movie";
    if (heroTitle) heroTitle.textContent = String(movie.title || "Featured");
    if (heroMeta) heroMeta.textContent = blob38(movie);
    var blurb = tmpx39(movie);
    if (heroDesc) heroDesc.textContent = blurb || "pulling the real write-up…";
    var tags = document.getElementById("movies-hero-tags");
    if (tags) {
      tags.innerHTML = "";
      var bits = (movie.genres || []).slice(0, 2);
      if (!bits.length) bits = [movie.type === "tv" ? "Series" : "Movie"];
      bits.forEach(function (g) {
        var pill = document.createElement("span");
        pill.className = "nova-hero__tag";
        pill.textContent = g;
        tags.appendChild(pill);
      });
      if (movie.year) {
        var y = document.createElement("span");
        y.className = "nova-hero__tag";
        y.textContent = String(movie.year);
        tags.appendChild(y);
      }
    }
    var score = document.getElementById("movies-hero-score");
    if (score) {
      var v = Number(movie.vote || movie.match || 0);
      if (v > 10) v = v / 10;
      score.textContent = v ? v.toFixed(1) : "—";
    }
    var poster = document.getElementById("movies-hero-poster");
    if (poster) {
      var p = movie.poster
        ? "https://image.tmdb.org/t/p/w500/" + String(movie.poster).replace(/^\/+/, "")
        : flop29(movie);
      poster.style.backgroundImage = p ? "url('" + String(p).replace(/'/g, "%27") + "')" : "";
    }
    var bg = flop29(movie);
    hero.style.backgroundImage = bg ? "url('" + bg.replace(/'/g, "%27") + "')" : "";
    if (bg) guh40(bg);
    if (!searchMode && !activeMovie && novaPage === "home") hero.hidden = false;
  }

  function rawr32(movie) {
    if (!movie) return;
    ugh31(movie);
  featuredReq += 1;
    var req = featuredReq;
    lookupMovie(movie.id, movie.type === "tv" ? "tv" : "movie")
      .then(function (data) {
        if (req !== featuredReq) return;
        if (!data || Number(data.id) !== Number(movie.id)) return;
  ugh31(yeet41(movie, data));
      })
      .catch(function () {
        if (req !== featuredReq) return;
        if (heroDesc && !tmpx39(movie)) {
          heroDesc.textContent = String(movie.title || "This title") + " is ready to play.";
        }
      });
  }

  function skib33(minutes) {
    var mins = parseInt(minutes, 10) || 0;
     if (mins < 1) return "";
	var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h && m) return h + "h " + m + "m";
    if (h) return h + "h";
    return m + "m";
  }

  function rizz34(text, max) {
    var raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
	if (raw.length <= max) return raw;
    return raw.slice(0, max).replace(/\s+\S*$/, "") + "…";
  }

  function buss35() {
    if (document.body.classList.contains("ent-standalone-movies")) return true;
    try {
      return (window.location.hash || "").toLowerCase() === "#movies";
    } catch (e) {
      return false;
    }
  }

  function thingy36(movie) {
    return String(movie.type || "movie") + ":" + movie.id;
  }

  function junk37(key) {
    if (!key) return null;
    var hit = filteredMovies.find(function (movie) {
	return thingy36(movie) === key;
    });
    if (hit) return hit;
    return (
  CATALOG.find(function (movie) {
	return thingy36(movie) === key;
  }) || null
    );
	}

  function blob38(movie) {
    if (!movie) return "";
    var parts = [];
    if (movie.match) parts.push(String(movie.match) + "% Match");
    else if (movie.vote) parts.push(String(Math.round(Number(movie.vote) * 10)) + "% Match");
    if (movie.year) parts.push(String(movie.year));
    var runtime = skib33(movie.runtime);
    if (runtime) parts.push(runtime);
    if (movie.certification) parts.push(String(movie.certification));
    else parts.push(movie.type === "tv" ? "TV-MA" : "PG-13");
    return parts.join("  •  ");
  }

  function tmpx39(movie) {
  if (!movie) return "";
	var raw = String(movie.overview || "").replace(/\s+/g, " ").trim();
    if (!raw) return "";
    if (raw.length <= 560) return raw;
    var cut = raw.slice(0, 560);
    var stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    if (stop > 220) return cut.slice(0, stop + 1).trim();
     return rizz34(raw, 520);
  }

   function guh40(url) {
    if (!moviesPanel) return;
    moviesPanel.style.removeProperty("--nf-backdrop");
  }

  function yeet41(base, data) {
	if (!base || !data) return base || data;
    if (data.title) base.title = data.title;
    if (data.year) base.year = data.year;
    if (data.poster) base.poster = data.poster;
    if (data.backdrop) base.backdrop = data.backdrop;
    if (typeof data.overview === "string" && data.overview.trim()) base.overview = data.overview.trim();
    if (data.runtime) base.runtime = data.runtime;
    if (data.type) base.type = data.type;
    if (data.tagline) base.tagline = data.tagline;
    if (data.vote) base.vote = data.vote;
    if (data.match) base.match = data.match;
    if (data.certification) base.certification = data.certification;
	if (Array.isArray(data.genres) && data.genres.length) base.genres = data.genres.slice();
     if (Array.isArray(data.cast) && data.cast.length) base.cast = data.cast.slice();
    return base;
  }

  function bruh42() {
    infoMovie = null;
	if (infoRoot) infoRoot.hidden = true;
    document.body.classList.remove("movies-info-open");
	}

  function oop43(movie) {
    if (!movie) return;
    infoMovie = movie;
  if (infoKind) infoKind.textContent = movie.type === "tv" ? "TV Series" : "Movie";
    if (infoTitle) infoTitle.textContent = movie.title || "Untitled";
    if (infoMeta) {
      infoMeta.innerHTML = "";
      var metaText = blob38(movie);
  if (metaText) {
        var bits = metaText.split("  •  ");
        bits.forEach(function (bit, idx) {
          if (idx) {
            var sep = document.createElement("span");
            sep.className = "movies-info__dot";
            sep.textContent = "•";
  infoMeta.appendChild(sep);
          }
          var span = document.createElement("span");
          if (/Match$/i.test(bit)) span.className = "movies-info__match";
          else if (/^(G|PG|PG-13|R|NC-17|TV-[\w-]+)$/i.test(bit)) span.className = "movies-info__rating";
  span.textContent = bit;
          infoMeta.appendChild(span);
	});
       }
    }
    if (infoTagline) {
      var tag = String(movie.tagline || "").trim();
	infoTagline.hidden = !tag;
       infoTagline.textContent = tag;
    }
    if (infoOverview) infoOverview.textContent = tmpx39(movie) || "No summary available yet.";
    if (infoGenres) {
      infoGenres.innerHTML = "";
      (movie.genres || []).forEach(function (name) {
        var chip = document.createElement("span");
        chip.className = "movies-info__chip";
	chip.textContent = name;
        infoGenres.appendChild(chip);
      });
    }
    var castEl = document.getElementById("movies-info-cast");
    if (castEl) {
      var cast = Array.isArray(movie.cast) ? movie.cast.filter(Boolean) : [];
      castEl.hidden = !cast.length;
	castEl.textContent = cast.length ? "Starring: " + cast.join(", ") : "";
    }
    if (infoMedia) {
      var bg = flop29(movie);
      infoMedia.style.backgroundImage = bg
        ? "linear-gradient(180deg, rgba(8,0,2,.15) 0%, rgba(8,0,2,.92) 100%), url('" + bg.replace(/'/g, "%27") + "')"
        : "linear-gradient(180deg, #2a0608, #0a0102)";
	if (bg) guh40(bg);
    }
  }

  function meh44(movie) {
    if (!movie) return;
    if (!infoRoot) infoRoot = document.getElementById("movies-info");
    if (!infoRoot) return;
  if (!oop3()) return;
    if (infoRoot.parentNode !== document.body) {
	document.body.appendChild(infoRoot);
    }
    infoReq += 1;
    var req = infoReq;
    var view = {
      id: movie.id,
      title: movie.title || "",
      year: movie.year || "",
      poster: movie.poster || "",
       backdrop: movie.backdrop || "",
  overview: "",
      runtime: movie.runtime || 0,
      type: movie.type === "tv" ? "tv" : "movie",
	genres: Array.isArray(movie.genres) ? movie.genres.slice() : [],
      tagline: movie.tagline || "",
      vote: movie.vote || 0,
  match: movie.match || 0,
	certification: movie.certification || "",
       cast: Array.isArray(movie.cast) ? movie.cast.slice() : [],
    };
    if (movie.overview) view.overview = String(movie.overview);
    oop43(view);
    infoRoot.hidden = false;
    document.body.classList.add("movies-info-open");
    if (!view.overview && infoOverview) infoOverview.textContent = "Loading summary…";
    skib13();
    lookupMovie(movie.id, view.type)
      .then(function (data) {
        if (req !== infoReq) return;
        if (!data || Number(data.id) !== Number(movie.id)) return;
        oop43(yeet41(view, data));
       })
      .catch(function () {
        if (req !== infoReq) return;
        if (infoOverview && !String(view.overview || "").trim()) {
          infoOverview.textContent = "No summary available yet.";
        }
      });
  }

  function movApi(path) {
    return window.spBase && window.spBase.apiUrl ? window.spBase.apiUrl(path) : path;
  }

  function pagesMode() {
    try {
      if (window.spBase && typeof window.spBase.isPages === "function" && window.spBase.isPages()) return true;
      if (window.spBase && typeof window.spBase.isCdn === "function" && window.spBase.isCdn()) return true;
      var h = String(location.hostname || "");
      return /\.github\.io$/i.test(h) || /jsdelivr\.net$/i.test(h) || /unpkg\.com$/i.test(h);
    } catch (e) {
      return false;
    }
  }

  function hasApiBase() {
    try {
      var b = window.spBase && typeof window.spBase.apiBase === "function" ? window.spBase.apiBase() : "";
      return !!(b && String(b).trim());
    } catch (e) {
      return false;
    }
  }

  function tmdbKey() {
    try {
      if (window.__KRYING_TMDB__) return String(window.__KRYING_TMDB__);
      var meta = document.querySelector('meta[name="krying-tmdb"]');
      if (meta && meta.content) return String(meta.content);
    } catch (e) {}
    return "";
  }

  function fetchJsonTimeout(url, ms) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () {
      try {
        if (ctrl) ctrl.abort();
      } catch (e) {}
    }, ms || 10000);
    var opts = { cache: "no-store" };
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts)
      .then(function (res) {
        if (!res.ok) throw new Error("bad");
        return res.json();
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  function mapTmdbDetail(payload, typeHint) {
    if (!payload || !payload.id) return null;
    var isTv = typeHint === "tv" || (!!payload.name && !payload.title);
    var vote = typeof payload.vote_average === "number" ? Math.round(payload.vote_average * 10) / 10 : 0;
    var genres = Array.isArray(payload.genres)
      ? payload.genres
          .map(function (g) {
            return g && g.name ? String(g.name) : "";
          })
          .filter(Boolean)
          .slice(0, 5)
      : [];
    var cast = [];
    try {
      cast = (payload.credits && Array.isArray(payload.credits.cast) ? payload.credits.cast : [])
        .slice(0, 4)
        .map(function (p) {
          return p && p.name ? String(p.name) : "";
        })
        .filter(Boolean);
    } catch (e) {}
    return {
      id: payload.id,
      title: isTv ? payload.name || payload.title || "TV" : payload.title || payload.name || "Movie",
      year: isTv
        ? payload.first_air_date
          ? String(payload.first_air_date).slice(0, 4)
          : ""
        : payload.release_date
          ? String(payload.release_date).slice(0, 4)
          : "",
      poster: payload.poster_path ? String(payload.poster_path).replace(/^\/+/, "") : "",
      backdrop: payload.backdrop_path ? String(payload.backdrop_path).replace(/^\/+/, "") : "",
      overview: payload.overview || "",
      runtime: isTv
        ? Array.isArray(payload.episode_run_time) && payload.episode_run_time[0]
          ? payload.episode_run_time[0]
          : 0
        : payload.runtime || 0,
      type: isTv ? "tv" : "movie",
      genres: genres,
      tagline: payload.tagline || "",
      vote: vote,
      match: vote ? Math.round(vote * 10) : 0,
      certification: "",
      cast: cast,
    };
  }

  function lookupViaTmdb(id, typeHint) {
    var key = tmdbKey();
    if (!key) return Promise.reject(new Error("no_tmdb"));
    var kind = typeHint === "tv" ? "tv" : "movie";
    var url =
      "https://api.themoviedb.org/3/" +
      kind +
      "/" +
      encodeURIComponent(String(id)) +
      "?api_key=" +
      encodeURIComponent(key) +
      "&append_to_response=credits";
    return fetchJsonTimeout(url, 10000).then(function (payload) {
      var mapped = mapTmdbDetail(payload, kind);
      if (mapped) return mapped;
      if (kind === "movie") return lookupViaTmdb(id, "tv");
      throw new Error("empty");
    });
  }

  function lookupMovie(id, typeHint) {
    var path =
      "/api/movies/lookup/" +
      encodeURIComponent(String(id)) +
      "?type=" +
      encodeURIComponent(typeHint === "tv" ? "tv" : "movie") +
      "&t=" +
      encodeURIComponent(String(Date.now()));
    return fetchJsonTimeout(movApi(path), 8000).catch(function () {
      return lookupViaTmdb(id, typeHint);
    });
  }

  function bleh45(movie, hiRes) {
  if (!movie || movie.id == null) return { primary: "", fallback: "", tiny: "" };
    var type = movie.type === "tv" ? "tv" : "movie";
    var proxy = hasApiBase() ? movApi("/api/movies/poster/" + type + "/" + encodeURIComponent(String(movie.id))) : "";
    var posterPath = movie.poster ? String(movie.poster).replace(/^\/+/, "") : "";
    var backdropPath = movie.backdrop ? String(movie.backdrop).replace(/^\/+/, "") : "";
    if (/^https?:\/\//i.test(posterPath)) {
      return { primary: posterPath, fallback: proxy || posterPath, tiny: posterPath };
    }
    if (hiRes && backdropPath) {
      return {
  primary: "https://image.tmdb.org/t/p/w780/" + backdropPath,
        fallback: posterPath ? "https://image.tmdb.org/t/p/w500/" + posterPath : proxy,
        tiny: proxy || (posterPath ? "https://image.tmdb.org/t/p/w185/" + posterPath : ""),
       };
  }
    if (posterPath) {
      return {
        primary: "https://image.tmdb.org/t/p/w342/" + posterPath,
        fallback: proxy || "https://image.tmdb.org/t/p/w500/" + posterPath,
        tiny: "https://image.tmdb.org/t/p/w185/" + posterPath,
	};
  }
     return { primary: proxy, fallback: proxy, tiny: proxy };
	}

  function sus46() {
    if (rowsContainer) rowsContainer.innerHTML = "";
  }

  function goof47() {
    renderedCount = 0;
     if (listObserver) {
      listObserver.disconnect();
      listObserver = null;
    }
    if (gridSentinel) {
      gridSentinel.remove();
       gridSentinel = null;
    }
    if (grid) grid.innerHTML = "";
    sus46();
  }

  function mkSentinel() {
    if (!grid || gridSentinel) return;
    gridSentinel = document.createElement("div");
    gridSentinel.className = "site__grid-sentinel";
  gridSentinel.setAttribute("aria-hidden", "true");
    grid.appendChild(gridSentinel);
  }

	function womp48() {
    while (renderedCount < filteredMovies.length) {
      rizz54();
    }
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
        if (renderedCount < filteredMovies.length) {
          rizz54();
          return;
        }
        if (searchMode && searchHasMore && !searchLoading && searchQuery) {
          yeet61(searchQuery, searchPage + 1, true);
          return;
        }
        if (!searchMode && catalogHasMore && !catalogLoading) {
          meh64(true);
        }
      },
      { rootMargin: buss35() ? "240px 0px" : "400px 0px" }
    );
    listObserver.observe(gridSentinel);
  }

  function flop49(movie, index, options) {
    options = options || {};
    var standalone = buss35();
   var locked = standalone && !bruh2();
    var card = document.createElement("article");
    card.className = standalone ? "nf-card movies-card" : "movies-card site__card site__card--ready";
    if (locked) card.classList.add("nf-card--locked");
    card.role = "listitem";
    card.tabIndex = 0;
     card.dataset.index = String(index);
    card.dataset.thingy36 = thingy36(movie);
    card.dataset.movId = String(movie.id || "");
    card.dataset.movType = movie.type === "tv" ? "tv" : "movie";
    card.setAttribute("aria-label", movie.title || "Title");
    card.__mov = movie;
    if (movByCard) movByCard.set(card, movie);
    card.style.setProperty("--i", String(index % 24));
    var thumb = document.createElement("div");
    thumb.className = "site__card-thumb movies-card__thumb nf-card__thumb";
    if (options.portrait) thumb.classList.add("nf-card__thumb--portrait");
    thumb.style.setProperty("--hue", String(hueId(movie.id)));
    var initial = document.createElement("span");
	initial.className = "movies-card__initial";
    initial.textContent = (movie.title || "?").charAt(0).toUpperCase();
  thumb.appendChild(initial);
    if (movie.type === "tv") {
      var badge = document.createElement("span");
       badge.className = "movies-card__badge";
	badge.textContent = "TV";
      thumb.appendChild(badge);
  }
    var sources = bleh45(movie, false);
    if (sources.primary && window.spEth && typeof window.spEth.bindCover === "function") {
      window.spEth.bindCover(thumb, index, sources.primary, sources.fallback || sources.tiny, {
        width: options.portrait ? 220 : 320,
        height: options.portrait ? 330 : 200,
        sizes: options.portrait ? "160px" : "240px",
        eager: index < 18,
      });
      if (!movie.poster && !movie.__picPull) {
        movie.__picPull = 1;
        lookupMovie(movie.id, movie.type === "tv" ? "tv" : "movie")
          .then(function (data) {
            if (!data || !data.poster) return;
            movie.poster = data.poster;
            if (data.backdrop) movie.backdrop = data.backdrop;
            flop9(movie);
          })
          .catch(function () {});
      }
    } else if (sources.primary) {
      var imgFallback = document.createElement("img");
      imgFallback.className = "site__card-img";
      imgFallback.alt = "";
      imgFallback.loading = index < 24 ? "eager" : "lazy";
      imgFallback.decoding = "async";
      imgFallback.referrerPolicy = "no-referrer";
      var tries = [sources.primary, sources.fallback, sources.tiny].filter(function (u, i, arr) {
        return u && arr.indexOf(u) === i;
      });
      var tryAt = 0;
      imgFallback.src = tries[0];
      imgFallback.addEventListener(
        "load",
        function () {
          thumb.classList.add("site__card-thumb--has-img");
          var dead = thumb.querySelector(".movies-card__initial");
          if (dead) dead.remove();
        },
        { once: true }
      );
      imgFallback.addEventListener(
        "error",
        function () {
          tryAt += 1;
          if (tryAt < tries.length) {
            imgFallback.src = tries[tryAt];
            return;
          }
          if (!movie.__picPull) {
            movie.__picPull = 1;
            movie.poster = "";
            lookupMovie(movie.id, movie.type === "tv" ? "tv" : "movie")
              .then(function (data) {
                if (!data || !data.poster) return;
                movie.poster = data.poster;
                if (data.backdrop) movie.backdrop = data.backdrop;
                var next = bleh45(movie, false);
                if (next.fallback) imgFallback.src = next.fallback;
                else if (next.primary) imgFallback.src = next.primary;
              })
              .catch(function () {});
            return;
          }
          if (imgFallback.parentNode) imgFallback.remove();
        },
        { once: false }
      );
      thumb.insertBefore(imgFallback, thumb.firstChild);
    } else {
      movie.__picPull = 1;
      lookupMovie(movie.id, movie.type === "tv" ? "tv" : "movie")
        .then(function (data) {
          if (!data || !data.poster) return;
          movie.poster = data.poster;
          flop9(movie);
        })
        .catch(function () {});
    }
    if (options.progress) {
	var progress = document.createElement("div");
      progress.className = "nf-card__progress";
  var fill = document.createElement("span");
      fill.style.width = String(18 + (hueId(movie.id) % 62)) + "%";
      progress.appendChild(fill);
      thumb.appendChild(progress);
    }
	if (options.recent) {
      var recent = document.createElement("span");
      recent.className = "nf-card__recent";
      recent.textContent = "Recently Added";
	thumb.appendChild(recent);
    }
    if (options.rank) {
      var rank = document.createElement("span");
      rank.className = "nova-card__rank";
      rank.textContent = "#" + options.rank;
      thumb.appendChild(rank);
    } else if (options.top10 && index % 3 === 0) {
      var top = document.createElement("span");
      top.className = "nf-card__top10";
      top.textContent = "TOP 10";
      thumb.appendChild(top);
    }
    var vote = Number(movie.vote || 0);
    if (vote > 0) {
      var star = document.createElement("span");
      star.className = "nova-card__vote";
      star.textContent = "★ " + (vote > 10 ? (vote / 10).toFixed(1) : vote.toFixed(1));
      thumb.appendChild(star);
    }
    if (movie.overview) {
      var blurb = document.createElement("span");
      blurb.className = "nova-card__blurb";
      blurb.textContent = rizz34(String(movie.overview), 90);
      thumb.appendChild(blurb);
    }
    if (standalone) {
      var hoverName = document.createElement("span");
      hoverName.className = "nf-card__hover-title";
      hoverName.textContent = movie.title || "Untitled";
      thumb.appendChild(hoverName);
      var footS = document.createElement("div");
      footS.className = "nova-card__foot";
      var titleS = document.createElement("h3");
      titleS.className = "nova-card__title";
      titleS.textContent = movie.title || "Untitled";
      var metaS = document.createElement("p");
      metaS.className = "nova-card__meta";
      metaS.innerHTML =
        (movie.year ? "<span>" + String(movie.year).replace(/[^\d]/g, "").slice(0, 4) + "</span>" : "") +
        ' <span class="nova-card__lang">EN</span>';
      footS.append(titleS, metaS);
      card.append(thumb, footS);
      return card;
    }
    var play = document.createElement("span");
    play.className = "site__card-play";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML =
      '<span class="site__card-play-btn"><span class="site__card-play-arrow" aria-hidden="true"></span><span class="site__card-play-label">Watch</span></span>';
    var foot = document.createElement("div");
    foot.className = "site__card-foot nova-card__foot";
    var title = document.createElement("h3");
    title.className = "site__card-title nova-card__title";
    title.textContent = movie.title;
    var meta = document.createElement("p");
    meta.className = "movies-card__meta nova-card__meta";
    meta.innerHTML =
      (movie.year ? "<span>" + String(movie.year).replace(/[^\d]/g, "").slice(0, 4) + "</span>" : "") +
      ' <span class="nova-card__lang">EN</span>';
    foot.append(title, meta);
    thumb.appendChild(play);
    card.append(thumb, foot);
    return card;
  }

  function yolo50(title, items, options) {
    if (!items.length) return null;
    options = options || {};
    var section = document.createElement("section");
    section.className = "nf-row nova-row";
    var head = document.createElement("div");
    head.className = "nf-row__head nova-row__head";
    var heading = document.createElement("h4");
    heading.className = "nf-row__title nova-row__title";
    if (options.htmlTitle) heading.innerHTML = options.htmlTitle;
    else heading.textContent = title;
    head.appendChild(heading);
    if (options.providerTabs) {
      var tabs = document.createElement("div");
      tabs.className = "nova-provider-tabs";
      ["netflix", "disney", "apple"].forEach(function (id) {
        var t = document.createElement("button");
        t.type = "button";
        t.className = "nova-provider-tab" + (novaProvider === id ? " nova-provider-tab--on" : "");
        t.dataset.prov = id;
        t.textContent = id === "netflix" ? "Netflix" : id === "disney" ? "Disney+" : "Apple TV+";
        t.addEventListener("click", function () {
          novaProvider = id;
          var box = rowsContainer;
          if (!box) return;
          var old = box.querySelector(".nova-row--trend");
          var pool = filteredMovies.filter(function (m) {
            return !meh4(m);
          });
          if (!pool.length) pool = filteredMovies.slice();
          var trend = providerSlice(pool, novaProvider);
          var trendSec = yolo50("Trending on " + providerLabel(novaProvider), trend, {
            portrait: true,
            providerTabs: true,
            htmlTitle: 'Trending on <span class="nova-row__pink">' + providerLabel(novaProvider) + "</span>",
          });
          if (trendSec) trendSec.classList.add("nova-row--trend");
          if (old && trendSec) old.replaceWith(trendSec);
          else if (trendSec) box.appendChild(trendSec);
        });
        tabs.appendChild(t);
      });
      head.appendChild(tabs);
    }
    var wrap = document.createElement("div");
    wrap.className = "nova-row__rail";
    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "nova-rail-btn nova-rail-btn--prev";
    prev.setAttribute("aria-label", "Previous");
    prev.textContent = "‹";
    var next = document.createElement("button");
    next.type = "button";
    next.className = "nova-rail-btn nova-rail-btn--next";
    next.setAttribute("aria-label", "Next");
    next.textContent = "›";
    var track = document.createElement("div");
    track.className = "nf-row__track movies-grid nova-row__track";
    track.setAttribute("role", "list");
    items.forEach(function (movie, idx) {
      track.appendChild(
        flop49(movie, idx, {
          portrait: options.portrait !== false,
          progress: !!options.progress,
          recent: !!options.recent,
          top10: !!options.top10,
          rank: options.top10 ? idx + 1 : 0,
        })
      );
    });
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -520, behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      track.scrollBy({ left: 520, behavior: "smooth" });
    });
    wrap.append(prev, track, next);
    section.append(head, wrap);
    return section;
  }

  function ugh51() {
    var section = document.createElement("section");
    section.className = "nf-row nova-row";
    var head = document.createElement("div");
    head.className = "nf-row__head";
    var heading = document.createElement("h4");
    heading.className = "nf-row__title nova-row__title";
    heading.textContent = "Continue Watching";
    head.appendChild(heading);
    var body = document.createElement("p");
    body.className = "nf-row__empty nf-row__empty-text";
    body.textContent = "Nothing yet. Watch something";
    section.append(head, body);
    return section;
  }

  function loadWatchlist() {
    try {
      var raw = localStorage.getItem(WATCHLIST_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveWatchlist(list) {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify((list || []).slice(0, 200)));
    } catch (e) {}
  }

  function toggleWatchlist(movie) {
    if (!movie || movie.id == null) return;
    var key = thingy36(movie);
    var list = loadWatchlist();
    var hit = list.findIndex(function (row) {
      return row && row.key === key;
    });
    if (hit >= 0) list.splice(hit, 1);
    else {
      list.unshift({
        key: key,
        at: Date.now(),
        movie: {
          id: movie.id,
          type: movie.type || "movie",
          title: movie.title || "",
          year: movie.year || "",
          poster: movie.poster || "",
          backdrop: movie.backdrop || "",
          vote: movie.vote || 0,
          overview: movie.overview || "",
          genres: movie.genres || [],
        },
      });
    }
    saveWatchlist(list);
  }

  function providerSlice(list, provider) {
    var pool = (list || []).slice();
    if (!pool.length) return [];
    var bump = provider === "disney" ? 17 : provider === "apple" ? 41 : 3;
    var spin = provider === "disney" ? 13 : provider === "apple" ? 29 : 0;
    pool.sort(function (a, b) {
      var aa = (Number(a.id) * bump + spin * 97) % 10007;
      var bb = (Number(b.id) * bump + spin * 97) % 10007;
      return aa - bb;
    });
    if (spin) {
      var cut = spin % pool.length;
      pool = pool.slice(cut).concat(pool.slice(0, cut));
    }
    return pool.slice(0, 18);
  }

  function providerLabel(id) {
    return id === "disney" ? "Disney+" : id === "apple" ? "Apple TV+" : "Netflix";
  }

  function pullCollection(row) {
    if (!row || !row.id) return Promise.resolve(null);
    if (collectionCache[row.id]) return Promise.resolve(collectionCache[row.id]);
    return fetchJsonTimeout(movApi("/api/movies/collection/" + encodeURIComponent(String(row.id))), 8000)
      .catch(function () {
        var key = tmdbKey();
        if (!key) throw new Error("no_col");
        return fetchJsonTimeout(
          "https://api.themoviedb.org/3/collection/" +
            encodeURIComponent(String(row.id)) +
            "?api_key=" +
            encodeURIComponent(key),
          8000
        ).then(function (payload) {
          var parts = Array.isArray(payload.parts) ? payload.parts : [];
          return {
            title: payload.name || row.label || "Collection",
            data: parts
              .map(function (item) {
                return mapTmdbDetail(item, "movie");
              })
              .filter(Boolean),
          };
        });
      })
      .then(function (payload) {
        var data = Array.isArray(payload.data) ? payload.data : [];
        var pack = {
          title: payload.title || row.label || "Collection",
          data: data,
        };
        collectionCache[row.id] = pack;
        return pack;
      })
      .catch(function () {
        return null;
      });
  }

  function rawr52() {
    if (!rowsContainer) return;
    var stamp = ++homeRowsStamp;
    rowsContainer.innerHTML = "";
    var pool = filteredMovies.filter(function (m) {
      return !meh4(m);
    });
    if (!pool.length) pool = filteredMovies.slice();
    var top = pool.slice(0, 10);
    var topSec = yolo50("Top 10", top, {
      portrait: true,
      top10: true,
      htmlTitle: 'Top 10 <span class="nova-row__pink">Trending Today</span>',
    });
    if (topSec) rowsContainer.appendChild(topSec);
    var trend = providerSlice(pool, novaProvider);
    var trendSec = yolo50("Trending on " + providerLabel(novaProvider), trend, {
      portrait: true,
      providerTabs: true,
      htmlTitle: 'Trending on <span class="nova-row__pink">' + providerLabel(novaProvider) + "</span>",
    });
    if (trendSec) {
      trendSec.classList.add("nova-row--trend");
      rowsContainer.appendChild(trendSec);
    }
    NOVA_COLLECTIONS.forEach(function (row) {
      pullCollection(row).then(function (pack) {
        if (stamp !== homeRowsStamp) return;
        if (!pack || !pack.data || !pack.data.length || !rowsContainer) return;
        if (novaPage !== "home" || searchMode) return;
        var sec = yolo50(pack.title, pack.data, {
          portrait: true,
          htmlTitle: pack.title + ' <span class="nova-row__pink">Collection</span>',
        });
        if (sec) rowsContainer.appendChild(sec);
      });
    });
  }

  function applyNovaFilters(list) {
    var out = (list || []).slice();
    if (novaPage === "tv" || novaPage === "movies") {
      out = out.filter(function (m) {
        return novaPage === "tv" ? meh4(m) : !meh4(m);
      });
    }
    if (novaGenre) {
      var want = String(novaGenre).toLowerCase();
      var hit = out.filter(function (m) {
        return (m.genres || []).some(function (g) {
          return String(g).toLowerCase() === want;
        });
      });
      if (hit.length) out = hit;
      else {
        out = out.filter(function (m) {
          return (m.genres || []).length > 0;
        });
        out = out.filter(function (m) {
          return (m.genres || []).some(function (g) {
            return String(g).toLowerCase().indexOf(want) !== -1 || want.indexOf(String(g).toLowerCase()) !== -1;
          });
        });
      }
    }
    if (novaMood && NOVA_MOODS[novaMood]) {
      var moodWant = NOVA_MOODS[novaMood].map(function (g) {
        return String(g).toLowerCase();
      });
      var moodHit = out.filter(function (m) {
        return (m.genres || []).some(function (g) {
          return moodWant.indexOf(String(g).toLowerCase()) !== -1;
        });
      });
      if (moodHit.length) out = moodHit;
    }
    if (novaYear) {
      var yearHit = out.filter(function (m) {
        return String(m.year || "") === String(novaYear);
      });
      if (yearHit.length) out = yearHit;
    }
    if (novaSort === "new") {
      out.sort(function (a, b) {
        return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
      });
    } else if (novaSort === "title") {
      out.sort(function (a, b) {
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
    } else {
      out.sort(function (a, b) {
        return (Number(b.vote) || 0) - (Number(a.vote) || 0);
      });
    }
    return out;
  }

  function fillNovaFilters() {
    var gEl = document.getElementById("nova-filter-genre");
    var yEl = document.getElementById("nova-filter-year");
    if (!gEl || gEl.options.length > 1) return;
    var genres = {};
    var years = {};
    [
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Documentary",
      "Drama",
      "Family",
      "Fantasy",
      "Horror",
      "Mystery",
      "Romance",
      "Sci-Fi",
      "Thriller",
      "War",
      "Western",
    ].forEach(function (g) {
      genres[g] = true;
    });
    CATALOG.forEach(function (m) {
      (m.genres || []).forEach(function (g) {
        if (g && isNaN(Number(g))) genres[String(g)] = true;
      });
      if (m.year) years[String(m.year)] = true;
    });
    Object.keys(genres)
      .sort()
      .forEach(function (g) {
        var o = document.createElement("option");
        o.value = g;
        o.textContent = g;
        gEl.appendChild(o);
      });
    Object.keys(years)
      .sort(function (a, b) {
        return Number(b) - Number(a);
      })
      .slice(0, 40)
      .forEach(function (y) {
        var o = document.createElement("option");
        o.value = y;
        o.textContent = y;
        if (yEl) yEl.appendChild(o);
      });
  }

  function yeet91() {
    novaGenre = "";
    novaMood = "";
    novaYear = "";
    novaSort = "popular";
    var g = document.getElementById("nova-filter-genre");
    var m = document.getElementById("nova-filter-mood");
    var y = document.getElementById("nova-filter-year");
    var s = document.getElementById("nova-filter-sort");
    if (g) g.value = "";
    if (m) m.value = "";
    if (y) y.value = "";
    if (s) s.value = "popular";
  }

  function setNovaPage(page, keepFilters) {
    if (page === "watchlist") page = "home";
    novaPage = page || "home";
    if (!keepFilters) yeet91();
    document.querySelectorAll(".nova-nav__link").forEach(function (btn) {
      btn.classList.toggle("nova-nav__link--on", btn.getAttribute("data-nova-page") === novaPage);
    });
    var exploreTitle = document.querySelector(".nova-explore__title");
    if (exploreTitle) {
      exploreTitle.innerHTML =
        novaPage === "tv"
          ? "Explore <span>TV Shows</span>"
          : novaPage === "discover"
            ? "Explore <span>Everything</span>"
            : "Explore <span>Movies</span>";
    }
    searchMode = false;
    if (empty) {
      empty.hidden = true;
      empty.textContent = "nothing matched.";
    }
    if (novaPage === "discover" || novaPage === "tv") {
      var pool =
        novaPage === "tv"
          ? CATALOG.filter(function (m) {
              return meh4(m);
            })
          : novaPage === "discover"
            ? CATALOG.slice()
            : CATALOG.filter(function (m) {
                return !meh4(m);
              });
      filteredMovies = applyNovaFilters(pool);
      if (!filteredMovies.length && (novaGenre || novaYear) && pool.length) {
        novaGenre = "";
        novaYear = "";
        var gEl = document.getElementById("nova-filter-genre");
        var yEl = document.getElementById("nova-filter-year");
        if (gEl) gEl.value = "";
        if (yEl) yEl.value = "";
        filteredMovies = applyNovaFilters(pool);
      }
      renderedCount = 0;
      if (listObserver) {
        listObserver.disconnect();
        listObserver = null;
      }
      gridSentinel = null;
      if (grid) grid.innerHTML = "";
      fillNovaFilters();
      if (hero) hero.hidden = true;
      var homeEl = document.getElementById("nova-home");
      var exploreEl = document.getElementById("nova-explore");
      if (homeEl) homeEl.hidden = true;
      if (exploreEl) exploreEl.hidden = false;
      if (moviesCatalog) moviesCatalog.hidden = false;
      if (rowsContainer) rowsContainer.innerHTML = "";
      if (!filteredMovies.length) {
        if (empty) {
          empty.hidden = false;
          empty.textContent = catalogLoading ? "loading…" : "nothing matched.";
        }
        return;
      }
      rizz54();
      return;
    }
    filteredMovies = CATALOG.slice();
    bleh25(true);
    skib53();
  }

  function skib53() {
    if (!rowsContainer && !grid) return;
    if (empty) empty.hidden = true;
    if (!filteredMovies.length) {
      if (rowsContainer) rowsContainer.innerHTML = "";
      if (moviesCatalog) moviesCatalog.hidden = true;
      if (hero) hero.hidden = true;
      if (empty && !catalogLoading) {
        empty.hidden = false;
        empty.textContent = "nothing matched.";
      }
      goof27(catalogLoading ? "Loading titles…" : "", catalogLoading);
      return;
    }
    fillNovaFilters();
    if (!searchMode && novaPage === "home" && (!featuredMovie || filteredMovies.indexOf(featuredMovie) === -1)) {
      rawr32(yolo30(filteredMovies));
    }
    womp28();
    meh24();
    var showRows = !searchMode && novaPage === "home";
    var showGrid = searchMode || novaPage === "discover" || novaPage === "tv" || novaPage === "movies";
    if (showRows) rawr52();
    else if (rowsContainer && (searchMode || novaPage !== "home")) rowsContainer.innerHTML = "";
    if (moviesCatalog) moviesCatalog.hidden = !showGrid;
    var home = document.getElementById("nova-home");
    var explore = document.getElementById("nova-explore");
    if (searchMode) {
      if (home) home.hidden = true;
      if (explore) explore.hidden = false;
      if (hero) hero.hidden = true;
      if (rowsContainer) rowsContainer.hidden = true;
    } else {
      if (home) home.hidden = !showRows && novaPage !== "home";
      if (explore) explore.hidden = !showGrid;
      if (novaPage === "home" && home) home.hidden = false;
      if (novaPage === "home" && explore) explore.hidden = true;
      if (showGrid && hero) hero.hidden = true;
      if (novaPage === "home" && featuredMovie && hero) hero.hidden = false;
      if (rowsContainer) rowsContainer.hidden = !showRows;
    }
    if (showGrid) {
      renderedCount = 0;
      if (listObserver) {
        listObserver.disconnect();
        listObserver = null;
      }
      gridSentinel = null;
      if (grid) grid.innerHTML = "";
      rizz54();
    }
  }

	function rizz54() {
    if (!grid || renderedCount >= filteredMovies.length) return;
    var batchSize = buss35() ? STANDALONE_BATCH_SIZE : BATCH_SIZE;
     var end = Math.min(renderedCount + batchSize, filteredMovies.length);
    var frag = document.createDocumentFragment();
  var newThumbs = [];
    for (var i = renderedCount; i < end; i++) {
	var card = flop49(filteredMovies[i], i);
      frag.appendChild(card);
      if (buss35()) {
        var thumb = card.querySelector(".nf-card__thumb, .movies-card__thumb");
  if (thumb) newThumbs.push(thumb);
   }
    }
    mkSentinel();
    grid.insertBefore(frag, gridSentinel);
  renderedCount = end;
	if (buss35() && window.spEth && window.spEth.kickVisible) {
      window.spEth.kickVisible(newThumbs);
    }
    watchList();
  }

	function buss55() {
    if (buss35() && rowsContainer && !searchMode && novaPage === "home") {
      goof47();
      nfThumbSeq = 0;
      skib53();
      return;
    }
    if (!grid) return;
    goof47();
    if (empty) empty.hidden = filteredMovies.length > 0 || searchLoading || catalogLoading;
    if (!filteredMovies.length) {
      goof27(catalogLoading ? "Loading titles…" : "", catalogLoading);
      if (searchMode) {
        var homeX = document.getElementById("nova-home");
        var exploreX = document.getElementById("nova-explore");
        if (homeX) homeX.hidden = true;
        if (exploreX) exploreX.hidden = false;
        if (moviesCatalog) moviesCatalog.hidden = true;
        if (hero) hero.hidden = true;
      }
      return;
    }
    womp28();
    meh24();
    if (searchMode) {
      var homeY = document.getElementById("nova-home");
      var exploreY = document.getElementById("nova-explore");
      if (homeY) homeY.hidden = true;
      if (exploreY) exploreY.hidden = false;
      if (moviesCatalog) moviesCatalog.hidden = false;
      if (hero) hero.hidden = true;
      if (rowsContainer) rowsContainer.hidden = true;
    }
    rizz54();
  }

  function thingy56(append) {
    if (oop23()) return;
    filteredMovies = CATALOG.slice();
     womp28();
     if (buss35() && rowsContainer) {
       if (!append || renderedCount === 0) {
        buss55();
      } else if (renderedCount < filteredMovies.length) {
        rizz54();
      } else {
        watchList();
      }
      return;
    }
    if (!append || renderedCount === 0) {
      buss55();
    } else if (renderedCount < filteredMovies.length) {
      rizz54();
	} else {
	watchList();
    }
     junk57();
  }

	function junk57() {
    if (buss35()) return;
    if (catalogPrefetching || !catalogHasMore || catalogLoading || oop23()) return;
 	catalogPrefetching = true;
    function step() {
      if (!catalogHasMore || catalogLoading || oop23()) {
        catalogPrefetching = false;
        return;
      }
	meh64(true).then(function () {
        if (catalogHasMore) {
	setTimeout(step, 80);
        } else {
          catalogPrefetching = false;
        }
      });
    }
     step();
  }

  function blob58(batch) {
    var seen = {};
	filteredMovies.forEach(function (movie) {
      seen[String(movie.type || "movie") + ":" + movie.id] = true;
  });
    batch.forEach(function (movie) {
      if (!movie || movie.id == null) return;
	var key = String(movie.type || "movie") + ":" + movie.id;
      if (seen[key]) return;
      seen[key] = true;
	filteredMovies.push(movie);
    });
  }

  function tmpx59(batch) {
    var seen = {};
    CATALOG.forEach(function (movie) {
      seen[String(movie.type || "movie") + ":" + movie.id] = true;
    });
    batch.forEach(function (movie) {
      if (!movie || movie.id == null) return;
      var key = String(movie.type || "movie") + ":" + movie.id;
      if (seen[key]) return;
      seen[key] = true;
	CATALOG.push(movie);
  });
  }

  function guh60(q) {
    var needle = q.toLowerCase();
  if (sus26(q)) {
  var id = parseInt(q, 10);
      var hit = CATALOG.filter(function (movie) {
        return movie.id === id;
      });
      if (hit.length) return hit;
      return [{ id: id, title: "TMDB #" + id, year: "", poster: "", type: "movie" }];
	}
    return CATALOG.filter(function (movie) {
      if (!movie) return false;
      return (
        String(movie.title || "")
          .toLowerCase()
          .indexOf(needle) !== -1 ||
        String(movie.id).indexOf(needle) !== -1 ||
        String(movie.year || "").indexOf(needle) !== -1
      );
    });
  }

  function yeet61(q, page, append) {
    if (!append) {
      searchLoading = true;
      searchMode = true;
      searchQuery = q;
      searchPage = 1;
      filteredMovies = [];
      goof27("Searching…", true);
      if (empty) empty.hidden = true;
      var homeEl = document.getElementById("nova-home");
      var exploreEl = document.getElementById("nova-explore");
      var slot = document.getElementById("nova-searchbar");
      if (homeEl) homeEl.hidden = true;
      if (exploreEl) exploreEl.hidden = false;
      if (slot) slot.classList.add("nova-search-slot--open");
      if (moviesCatalog) moviesCatalog.hidden = false;
      if (hero) hero.hidden = true;
      if (rowsContainer) rowsContainer.hidden = true;
      meh24();
      goof47();
    }
    fetchJsonTimeout(
      movApi("/api/movies/search?q=" + encodeURIComponent(q) + "&page=" + encodeURIComponent(String(page))),
      8000
    )
      .catch(function () {
        var key = tmdbKey();
        if (!key) throw new Error("no_search");
        return fetchJsonTimeout(
          "https://api.themoviedb.org/3/search/multi?api_key=" +
            encodeURIComponent(key) +
            "&query=" +
            encodeURIComponent(q) +
            "&page=" +
            encodeURIComponent(String(page)) +
            "&include_adult=false",
          8000
        ).then(function (payload) {
          var results = Array.isArray(payload.results) ? payload.results : [];
          return {
            data: results
              .map(function (item) {
                if (!item || (item.media_type !== "movie" && item.media_type !== "tv")) return null;
                return mapTmdbDetail(item, item.media_type);
              })
              .filter(Boolean),
            hasMore: Number(payload.page || 1) < Number(payload.total_pages || 1),
          };
        });
      })
      .then(function (payload) {
        if (searchQuery !== q) return;
        var batch = Array.isArray(payload.data) ? payload.data : [];
        if (!batch.length && !append) batch = guh60(q);
        if (append) blob58(batch);
        else {
          filteredMovies = [];
          blob58(batch);
        }
        searchHasMore = !!payload.hasMore;
        searchPage = page;
        searchLoading = false;
        goof27("", false);
        if (append) {
          rizz54();
          meh24();
        } else {
          buss55();
          meh24();
        }
        if (!filteredMovies.length && empty) {
          empty.hidden = false;
          empty.textContent = "nothing matched.";
        }
      })
      .catch(function () {
        if (searchQuery !== q) return;
        if (!append) {
          filteredMovies = guh60(q);
          searchLoading = false;
          goof27("", false);
          buss55();
          meh24();
        } else {
          searchLoading = false;
          searchHasMore = false;
        }
        if (!filteredMovies.length && empty) {
          empty.hidden = false;
          empty.textContent = "nothing matched.";
        }
      });
  }

  function bruh62() {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(function () {
      var q = oop23();
      meh24();
      if (!q) {
        searchMode = false;
        searchQuery = "";
        searchHasMore = false;
        filteredMovies = CATALOG.slice();
        goof27("", false);
        if (empty) empty.hidden = true;
        setNovaPage(novaPage === "tv" || novaPage === "discover" ? novaPage : "home", true);
        return;
      }
      yeet61(q, 1, false);
    }, 220);
  }

   function oop63(input) {
  if (!input) return;
    input.addEventListener("input", bruh62);
    input.addEventListener("search", bruh62);
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var q = oop23();
      if (sus26(q)) {
	e.preventDefault();
        yeet21(q);
      }
    });
  }

  function meh64(append) {
    if (catalogLoading) return Promise.resolve();
    if (!append) {
      catalogPage = 1;
      catalogHasMore = true;
      CATALOG = [];
      catalogReady = false;
      filteredMovies = [];
      goof47();
      goof27("Loading titles…", true);
    }
    if (!catalogHasMore) return Promise.resolve();
    if (pagesMode() || !hasApiBase()) {
      catalogLoading = true;
      return multiLoadCatalog().then(function (merged) {
        if (!append) CATALOG = [];
        tmpx59(merged || []);
        catalogHasMore = false;
        catalogReady = true;
        catalogLoading = false;
        catalogTotal = CATALOG.length;
        thingy56(append);
      });
    }
	catalogLoading = true;
    return fetchJsonTimeout(
      movApi(
        "/api/movies/catalog?page=" +
          encodeURIComponent(String(catalogPage)) +
          "&limit=" +
          encodeURIComponent(String(CATALOG_PAGE_SIZE))
      ),
      10000
    )
      .then(function (payload) {
        var batch = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
        catalogHasMore = payload.hasMore != null ? !!payload.hasMore : false;
        catalogTotal = payload.total || CATALOG.length + batch.length;
        tmpx59(batch);
        catalogPage += 1;
        catalogReady = true;
  catalogLoading = false;
        thingy56(append);
      })
      .catch(function () {
        catalogLoading = false;
        if (!CATALOG.length) {
          return Promise.all([
            fetch("movies-catalog.json")
              .then(function (res) {
                return res.ok ? res.json() : [];
              })
              .catch(function () {
                return [];
              }),
            fetch("tv-catalog.json")
              .then(function (res) {
                return res.ok ? res.json() : [];
              })
              .catch(function () {
                return [];
              }),
          ]).then(function (chunks) {
            var movies = Array.isArray(chunks[0]) ? chunks[0] : [];
            var tv = Array.isArray(chunks[1]) ? chunks[1] : [];
            tv.forEach(function (row) {
              if (row && !row.type) row.type = "tv";
            });
            CATALOG = movies.concat(tv);
            catalogReady = true;
            catalogHasMore = false;
            catalogTotal = CATALOG.length;
            thingy56(false);
          });
        }
      })
      .catch(function () {
        if (empty) {
           empty.hidden = false;
	empty.textContent = "Movie catalog failed to load.";
        }
      });
  }

   function bleh65() {
    if (catalogReady && CATALOG.length && !oop23()) {
      filteredMovies = CATALOG.slice();
  buss55();
      junk57();
       return Promise.resolve();
    }
  return meh64(false);
  }

  function sus66(card) {
    if (!card) return;
    if (!bruh2()) {
      oop3();
      return;
    }
    if (card.classList.contains("nf-card--locked")) {
      card.classList.remove("nf-card--locked");
    }
    var movie = (movByCard && movByCard.get(card)) || card.__mov || null;
    if (!movie) {
      var key = card.dataset.thingy36;
      movie = key ? junk37(key) : null;
    }
    if (!movie && card.dataset.movId) {
      var wantId = Number(card.dataset.movId);
      var wantType = card.dataset.movType === "tv" ? "tv" : "movie";
      movie =
        CATALOG.find(function (m) {
          return Number(m.id) === wantId && (m.type === "tv" ? "tv" : "movie") === wantType;
        }) || {
          id: wantId,
          type: wantType,
          title: card.getAttribute("aria-label") || "Title",
          year: "",
          poster: "",
          backdrop: "",
        };
    }
    if (movie) meh44(movie);
  }

  function goof67(container) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var card = e.target.closest(".movies-card");
      if (!card) return;
	sus66(card);
    });
    container.addEventListener("keydown", function (e) {
      var card = e.target.closest(".movies-card");
      if (!card) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sus66(card);
      }
    });
  }

  goof67(grid);
  goof67(rowsContainer);

  var scrollKickTimer = 0;
  window.addEventListener(
    "scroll",
  function () {
      if (!buss35() || !grid) return;
      clearTimeout(scrollKickTimer);
      scrollKickTimer = setTimeout(function () {
        if (!window.spEth || !window.spEth.kickVisible) return;
  var pending = [];
        grid.querySelectorAll(".nf-card__thumb, .movies-card__thumb").forEach(function (thumb) {
          if (thumb.__thumbStart) pending.push(thumb);
  });
        if (pending.length) window.spEth.kickVisible(pending);
      }, 80);
  },
    { passive: true }
  );

  window.addEventListener("sp-auth", function () {
    if (!buss35()) return;
    if (filteredMovies.length) buss55();
  });

  window.addEventListener("pageshow", function () {
    if (!buss35()) return;
     tmpx19();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
	if (!buss35()) return;
  if (activeMovie) return;
     if (player && !player.hidden) tmpx19();
  });

	oop63(document.getElementById("movies-search"));
  oop63(document.getElementById("movies-search-embedded"));

  if (playerBack) playerBack.addEventListener("click", killPlayer);

  if (playerFs) {
    playerFs.addEventListener("click", function () {
      toggleFs();
    });
   }

  if (heroPlay) {
    heroPlay.addEventListener("click", function () {
      if (featuredMovie) playMov(featuredMovie);
    });
  }
  if (heroInfo) {
    heroInfo.addEventListener("click", function () {
      if (featuredMovie) meh44(featuredMovie);
    });
	}

  if (infoBackdrop) infoBackdrop.addEventListener("click", bruh42);
  if (infoClose) infoClose.addEventListener("click", bruh42);
  if (infoPlay) {
    infoPlay.addEventListener("click", function () {
      if (infoMovie) playMov(infoMovie);
  });
	}
  function toggleFs() {
    var wrap = document.querySelector(".movies-player__frame-wrap");
    var el = wrap || frame;
    if (!el) return;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  }

  function nextServer() {
    if (!activeMovie || !SOURCES.length) return;
    activeSource = (activeSource + 1) % SOURCES.length;
    skib13();
    junk17();
  }

  function bumpEpisode(dir) {
    if (!activeMovie || activeMovie.type !== "tv") return;
    var max = buss15(activeSeason);
    var next = activeEpisode + dir;
    if (next < 1 || next > max) return;
    activeEpisode = next;
    if (episodeSelect) episodeSelect.value = String(activeEpisode);
    junk17();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (infoRoot && !infoRoot.hidden) bruh42();
      return;
    }
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target && e.target.isContentEditable)) return;
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      var slot = document.getElementById("nova-searchbar");
      var toggle = document.getElementById("nova-search-toggle");
      var inp = document.getElementById("movies-search") || document.getElementById("movies-search-embedded");
      if (slot) slot.classList.add("nova-search-slot--open");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      if (inp) {
        inp.focus();
        try {
          inp.select();
        } catch (err) {}
      }
      return;
    }
    if (!player || player.hidden || !activeMovie) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === "f") {
      e.preventDefault();
      toggleFs();
    } else if (k === "s") {
      e.preventDefault();
      nextServer();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      bumpEpisode(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      bumpEpisode(1);
    }
  });

  document.querySelectorAll(".nova-nav__link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setNovaPage(btn.getAttribute("data-nova-page") || "home", false);
    });
  });

  var searchToggle = document.getElementById("nova-search-toggle");
  var searchBar = document.getElementById("nova-searchbar");
  if (searchToggle && searchBar) {
    searchToggle.addEventListener("click", function () {
      var open = searchBar.classList.toggle("nova-search-slot--open");
      searchToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var inp = document.getElementById("movies-search");
        if (inp) {
          inp.focus();
          try {
            inp.select();
          } catch (e) {}
        }
      }
    });
  }

  ["nova-filter-genre", "nova-filter-mood", "nova-filter-year", "nova-filter-sort"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", function () {
      if (id === "nova-filter-genre") novaGenre = el.value;
      if (id === "nova-filter-mood") novaMood = el.value;
      if (id === "nova-filter-year") novaYear = el.value;
      if (id === "nova-filter-sort") novaSort = el.value || "popular";
      if (novaPage === "tv") setNovaPage("tv", true);
      else if (novaPage === "movies") setNovaPage("movies", true);
      else setNovaPage("discover", true);
    });
  });

  function multiLoadCatalog() {
    function pull(url, mapType) {
      var abs = url.indexOf("/api/") === 0 ? movApi(url) : url;
      return fetchJsonTimeout(abs, 10000)
        .then(function (payload) {
          var batch = Array.isArray(payload)
            ? payload
            : payload && Array.isArray(payload.data)
              ? payload.data
              : [];
          return batch.map(function (item) {
            if (!item) return item;
            if (mapType && !item.type) item.type = mapType;
            return item;
          });
        })
        .catch(function () {
          return [];
        });
    }
    function pullTmdbFeed(mapType) {
      var key = tmdbKey();
      if (!key) return Promise.resolve([]);
      var path = mapType === "tv" ? "tv/popular" : mapType === "movie" ? "movie/popular" : "trending/all/day";
      return fetchJsonTimeout(
        "https://api.themoviedb.org/3/" + path + "?api_key=" + encodeURIComponent(key) + "&page=1",
        10000
      )
        .then(function (payload) {
          var results = Array.isArray(payload.results) ? payload.results : [];
          return results
            .map(function (item) {
              var kind = mapType || item.media_type || "movie";
              if (kind !== "movie" && kind !== "tv") return null;
              var mapped = mapTmdbDetail(item, kind);
              if (mapped && mapType) mapped.type = mapType;
              return mapped;
            })
            .filter(Boolean);
        })
        .catch(function () {
          return [];
        });
    }
    var jobs = [pullTmdbFeed(""), pullTmdbFeed("movie"), pullTmdbFeed("tv")];
    if (!pagesMode()) {
      jobs.push(pull("movies-catalog.json", "movie"), pull("tv-catalog.json", "tv"));
    }
    if (hasApiBase() && !pagesMode()) {
      jobs.unshift(pull("/api/movies/feed", ""));
    }
    return Promise.all(jobs).then(function (chunks) {
      var seen = {};
      var merged = [];
      chunks.forEach(function (batch) {
        (batch || []).forEach(function (movie) {
          if (!movie || movie.id == null) return;
          if (!movie.type) movie.type = "movie";
          var key = String(movie.type) + ":" + movie.id;
          if (seen[key]) {
            var old = seen[key];
            if ((!old.overview && movie.overview) || (!old.backdrop && movie.backdrop) || (!old.poster && movie.poster))
              yeet41(old, movie);
            return;
          }
          seen[key] = movie;
          merged.push(movie);
        });
      });
      return merged;
    });
  }

  window.spMov = {
    render: function () {
      tmpx19();
      bleh65();
      if (rowsContainer && buss35()) buss55();
    },
    play: playMov,
    close: killPlayer,
  };

  tmpx19();
  skib13();
  goof27("Loading titles…", true);
  catalogLoading = true;
  multiLoadCatalog()
    .then(function (merged) {
      if (merged.length) {
        CATALOG = merged;
        catalogReady = true;
        catalogHasMore = true;
        catalogPage = 2;
        filteredMovies = CATALOG.slice();
        catalogTotal = CATALOG.length;
        catalogLoading = false;
        thingy56(false);
        return;
      }
      catalogLoading = false;
      return meh64(false);
    })
    .catch(function () {
      catalogLoading = false;
      return bleh65();
    })
    .finally(function () {
      catalogLoading = false;
      goof27("", false);
      if (buss35()) setNovaPage(novaPage === "tv" ? "tv" : novaPage === "discover" ? "discover" : "home");
    });
})();
