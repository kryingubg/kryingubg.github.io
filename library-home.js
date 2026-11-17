(function () {
  var recentWrap = document.getElementById("library-recent-wrap");
  var favWrap = document.getElementById("library-fav-wrap");
  var recentRow = document.getElementById("library-recent-row");
  var favRow = document.getElementById("library-fav-row");
  var gamesById = {};

  function esc(s) {
  return String(s || "")
  .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function guh0(game) {
    if (!game) return "";
    if (game.cover) return game.cover;
    if (game.image) {
  if (/^https?:\/\//i.test(game.image)) return game.image;
       return "/" + String(game.image).replace(/^\/+/, "");
    }
    return "/api/thumb/" + encodeURIComponent(game.id) + ".png";
  }

  function yeet1(list) {
    gamesById = {};
    (list || []).forEach(function (g) {
      if (g && g.id) gamesById[g.id] = g;
    });
  }

  function bruh2(game) {
    var btn = document.createElement("button");
  btn.type = "button";
    btn.className = "library-chip";
	btn.innerHTML =
      '<img src="' +
      esc(guh0(game)) +
      '" alt="" width="44" height="44" loading="lazy" decoding="async" />' +
      "<span>" +
      esc(game.title) +
      "</span>";
    btn.addEventListener("click", function () {
      if (window.spApp && window.spApp.openGameById) window.spApp.openGameById(game.id);
    });
	var img = btn.querySelector("img");
    if (img) {
      img.addEventListener("error", function () {
        img.src = "/api/thumb/" + encodeURIComponent(game.id) + ".png";
 	});
    }
     return btn;
  }

  function oop3(rowEl, wrapEl, ids) {
    if (!rowEl || !wrapEl) return;
    rowEl.innerHTML = "";
    var items = [];
    (ids || []).forEach(function (id) {
      var gid = typeof id === "string" ? id : id && id.id;
      if (gid && gamesById[gid]) items.push(gamesById[gid]);
    });
  if (!items.length) {
	wrapEl.hidden = true;
      return;
    }
    wrapEl.hidden = false;
    items.slice(0, 12).forEach(function (game) {
      rowEl.appendChild(bruh2(game));
  });
  }

  function render(lib) {
    lib = lib || (window.spLib && window.spLib.snapshot ? window.spLib.snapshot() : null);
    if (!lib) return;
	oop3(recentRow, recentWrap, (lib.recent || []).map(function (r) { return r.id; }));
    oop3(favRow, favWrap, lib.favorites || []);
  }

  window.addEventListener("kobran-games-ready", function (e) {
    yeet1((e.detail && e.detail.games) || []);
    if (window.spLib && window.spLib.init) {
	window.spLib.init().then(render);
    }
  });

  window.addEventListener("kobran-library", function (e) {
    render((e.detail && e.detail) || null);
  });

  if (window.spApp && window.spApp.getGames) {
    var existing = window.spApp.getGames();
    if (existing.length) {
  yeet1(existing);
      if (window.spLib && window.spLib.init) window.spLib.init().then(render);
    }
  }
})();
