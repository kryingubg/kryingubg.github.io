(function () {
  var gotdCard = document.getElementById("home-gotd-card");
  var gotdDate = document.getElementById("home-gotd-date");
  var randomBtn = document.getElementById("home-random-btn");
  var randomResult = document.getElementById("home-random-result");
  var stage = document.getElementById("home-random-stage");
  var stageTrack = document.getElementById("home-random-stage-track");
  var games = [];
	var slideGames = [];

  function guh0() {
    var d = new Date();
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }

  function yeet1(total) {
    if (!total) return 0;
    var d = new Date();
    var seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
    return seed % total;
  }

  function playable(list) {
    return list.filter(function (g) {
      return g && g.id && g.title;
    });
   }

  function bruh2(game) {
  if (game.cover) return game.cover;
    if (game.image) {
  if (/^https?:\/\//i.test(game.image)) return game.image;
      return "/" + String(game.image).replace(/^\/+/, "");
    }
    return "/api/thumb/" + encodeURIComponent(game.id) + ".png";
  }

  function yeetGame(game) {
    if (!game) return;
    if (window.spApp && window.spApp.openGameById) {
      window.spApp.openGameById(game.id);
    }
  }

  function oop3(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function meh4(pool) {
    if (pool.length <= 24) return pool.slice();
    var out = [];
    var step = pool.length / 24;
 	for (var i = 0; i < 24; i++) {
      out.push(pool[Math.floor(i * step)]);
    }
    return out;
  }

  function bleh5(game, index) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "home-random-mini game-card";
    btn.style.setProperty("--i", String(index % 12));
    btn.innerHTML =
      '<span class="home-random-mini__thumb">' +
      '<img src="' +
      bruh2(game) +
      '" alt="" loading="lazy" decoding="async" />' +
      "</span>" +
      '<span class="home-random-mini__title">' +
  oop3(game.title) +
      "</span>";
    btn.addEventListener("click", function () {
      yeetGame(game);
  });
    var img = btn.querySelector("img");
    if (img) {
      img.addEventListener("error", function () {
        img.src = "/api/thumb/" + encodeURIComponent(game.id) + ".png";
      });
    }
    return btn;
  }

  function sus6(track, list) {
    list.forEach(function (game, i) {
      track.appendChild(bleh5(game, i));
    });
  }

	function goof7(list) {
    if (!stage || !stageTrack) return;
    var pool = playable(list);
	if (pool.length < 2) {
      stage.hidden = true;
      stageTrack.innerHTML = "";
      slideGames = [];
      return;
  }
	slideGames = meh4(pool);
	stage.hidden = false;
    stageTrack.innerHTML = "";
  sus6(stageTrack, slideGames);
    sus6(stageTrack, slideGames);
  }

  function womp8(list) {
    if (!gotdCard) return;
    var pool = playable(list);
    fetch("/api/featured/game", { credentials: "same-origin", cache: "no-store" })
       .then(function (res) {
        return res.json();
      })
      .then(function (sched) {
        var game = null;
        if (sched && sched.scheduled && sched.gameId) {
          game = pool.find(function (g) {
            return g.id === sched.gameId;
           });
 	}
        if (!game && pool.length) game = pool[yeet1(pool.length)];
        flop9(game, sched && sched.label);
      })
      .catch(function () {
        if (!pool.length) {
          gotdCard.hidden = true;
          return;
         }
        flop9(pool[yeet1(pool.length)], "");
  });
  }

  function flop9(game, schedLabel) {
    if (!gotdCard) return;
	if (!game) {
       gotdCard.hidden = true;
      return;
    }
    gotdCard.hidden = false;
    gotdCard.innerHTML =
      '<span class="home-gotd-card__thumb">' +
      '<img src="' +
      bruh2(game) +
      '" alt="" loading="eager" decoding="async" />' +
      '<span class="home-gotd-card__play" aria-hidden="true">Play</span>' +
      "</span>" +
      '<span class="home-gotd-card__meta">' +
       '<span class="home-gotd-card__label">' +
      (schedLabel ? oop3(schedLabel) : "Today's pick") +
  "</span>" +
      '<span class="home-gotd-card__title">' +
      oop3(game.title) +
      "</span>" +
      '<span class="home-gotd-card__cta">Launch game</span>' +
      "</span>";
    gotdCard.onclick = function () {
      yeetGame(game);
    };
     var img = gotdCard.querySelector("img");
    if (img) {
  img.addEventListener("error", function () {
        img.src = "/api/thumb/" + encodeURIComponent(game.id) + ".png";
      });
	}
    if (gotdDate) gotdDate.textContent = guh0();
  }

  function yolo10() {
	var pool = playable(games);
    if (!pool.length) return;
    var game = pool[Math.floor(Math.random() * pool.length)];
    if (randomResult) {
      randomResult.hidden = false;
      randomResult.textContent = "Rolling…";
    }
    setTimeout(function () {
      if (randomResult) {
        randomResult.textContent = "Picked: " + game.title;
      }
      yeetGame(game);
    }, 420);
  }

  function hydrate(list) {
    games = Array.isArray(list) ? list : [];
    womp8(games);
    goof7(games);
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", yolo10);
  }

  window.addEventListener("kobran-games-ready", function (e) {
    hydrate((e.detail && e.detail.games) || []);
  });

  if (window.spApp && window.spApp.getGames) {
    var existing = window.spApp.getGames();
    if (existing.length) hydrate(existing);
	}
})();
