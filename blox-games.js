(function () {
  var bags = {
    blox: [],
    gn: [],
    elite: [],
    sea: [],
    ugs: [],
    seraph: [],
    ckv: [],
    hydra: [],
    ccported: [],
    googleclass: [],
    truffled: [],
    nowgg: [],
    alex: [],
    lupine: [],
    kh0: [],
    kh0lite: [],
  };

  function asArr(v) {
    return Array.isArray(v) ? v : [];
  }

  function slugIt(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function mkRow(name, img, url, tag) {
    if (!name || !url) return null;
    var id = (tag || "bx") + "-" + slugIt(name);
    return {
      id: id,
      title: name,
      path: url,
      image: img || "",
      cover: img || "",
      search: name + " " + id + " " + url,
    };
  }

  function grab(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("bad");
      return r.json();
    });
  }

  function loadBlox() {
    if (bags.blox.length) return Promise.resolve();
    return grab("/games/games.json")
      .catch(function () {
        return grab("games.json");
      })
      .then(function (d) {
        bags.blox = asArr(d)
          .map(function (g) {
            if (g && (g.path || g.url) && (g.title || g.name)) {
              return {
                id: g.id || "blox-" + slugIt(g.title || g.name),
                title: g.title || g.name,
                path: g.path || g.url,
                image: g.image || g.cover || g.img || "",
                cover: g.cover || g.image || g.img || "",
                search: g.search || (g.title || g.name) + " " + (g.path || g.url),
              };
            }
            return mkRow(g.name, g.img, g.url, "blox");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadGn() {
    if (bags.gn.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json")
      .then(function (d) {
        bags.gn = asArr(d)
          .filter(function (g) {
            return g.id !== -1 && g.name && !String(g.name).startsWith("[!]");
          })
          .map(function (g) {
            var cover = String(g.cover || "").replace("{COVER_URL}", "");
            return mkRow(
              g.name,
              "https://cdn.jsdelivr.net/gh/freebuisness/covers@main/" + cover,
              "/app-viewer/gn-math/?gn-id=" + g.id,
              "gn"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadElite() {
    if (bags.elite.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/games.json")
      .then(function (d) {
        bags.elite = asArr(d)
          .map(function (g) {
            return mkRow(
              g.title || "Unknown",
              "https://cdn.jsdelivr.net/gh/elite-gamez/elite-gamez.github.io@main/" + (g.image || ""),
              "/app-viewer/elite-gamez?url=" + encodeURIComponent(g.url || ""),
              "elite"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadSea() {
    if (bags.sea.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/sea-bean-unblocked/sde@main/zzz.json")
      .then(function (d) {
        bags.sea = asArr(d)
          .map(function (g) {
            var cover = String(g.cover || "").replace("{COVER_URL}/", "");
            var img = cover.indexOf("http") === 0 ? cover : "https://cdn.jsdelivr.net/gh/sea-bean-unblocked/Singlemile@main/Icon/" + cover;
            return mkRow(g.name || "Unknown", img, "/app-viewer/sea-bean?view=" + encodeURIComponent(g.id), "sea");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadUgs() {
    if (bags.ugs.length) return Promise.resolve();
    var repos = ["tharun9772/ugs-1", "tharun9772/ugs-2", "tharun9772/ugs-3"];
    var out = [];
    return Promise.all(
      repos.map(function (repo) {
        return grab("https://cdn.jsdelivr.net/gh/tharun9772/game-assets/api_generated/github/" + repo + "/file.json")
          .then(function (d) {
            asArr(d).forEach(function (f) {
              if (f.type === "file" && f.name && f.name.indexOf("cl") === 0 && /\.html$/i.test(f.name)) {
                out.push(
                  mkRow(
                    f.name.replace(/^cl/, "").replace(/\.html$/i, ""),
                    "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/5968517.png",
                    "/app-viewer/ugs-files?view=" + encodeURIComponent(f.name),
                    "ugs"
                  )
                );
              }
            });
          })
          .catch(function () {});
      })
    ).then(function () {
      bags.ugs = out.filter(Boolean);
    });
  }

  function loadSeraph() {
    if (bags.seraph.length) return Promise.resolve();
    var BASE = "https://cdn.jsdelivr.net/gh/a456pur/seraph@main/games/";
    return grab("https://cdn.jsdelivr.net/gh/DominumNetwork/dominum@main/src/assets/libraries/seraph/games.json")
      .then(function (d) {
        bags.seraph = asArr(d)
          .map(function (g) {
            var view = g.url ? String(g.url).replace(BASE, "") : "";
            return mkRow(g.name || "Unknown", g.img || "", "/app-viewer/seraph/?view=" + view, "seraph");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadCkv() {
    if (bags.ckv.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/carbonicality/ChickenKingsVault@main/games.json")
      .then(function (d) {
        bags.ckv = asArr(d)
          .map(function (g) {
            return mkRow(
              g.name || "Unknown",
              g.img ? "https://cdn.jsdelivr.net/gh/carbonicality/ChickenKingsVault@main/gameimages/" + g.img : "",
              "/app-viewer/chicken-kings-vault/?view=" + g.html,
              "ckv"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadHydra() {
    if (bags.hydra.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/Hydra-Network/hydra-assets@main/gmes.json")
      .then(function (d) {
        bags.hydra = asArr(d)
          .map(function (g) {
            return mkRow(
              g.title || "Unknown",
              g.thumb ? "https://cdn.jsdelivr.net/gh/Hydra-Network/hydra-assets@main/" + g.thumb : "",
              "/app-viewer/hydra-network/?view=" + g.file_name,
              "hydra"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadCc() {
    if (bags.ccported.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/ccported-stupid-game-lib.json")
      .then(function (d) {
        bags.ccported = asArr(d)
          .map(function (g) {
            if (!g || !g.base || !g.Id) return null;
            return mkRow(g.name || "Game " + g.Id, g.base + "/thumb.jpg", "/app-viewer/ccported/?view=" + g.Id, "cc");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadGc() {
    if (bags.googleclass.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/bloxcraft-st/google-class-files@main/assets/games.json")
      .then(function (d) {
        bags.googleclass = asArr(d)
          .map(function (g) {
            return mkRow(g.name || "Unknown", g.img || "", "/app-viewer/google-class/?view=" + encodeURIComponent(g.url || ""), "gc");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadTruf() {
    if (bags.truffled.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/js/json/g.json")
      .then(function (d) {
        bags.truffled = asArr(d && d.games)
          .map(function (g) {
            var thumb = String(g.thumbnail || "")
              .replace(/^\/+/, "")
              .replace(/^png\/games\//, "");
            var img = thumb ? "https://cdn.jsdelivr.net/gh/aukak/truffled@main/public/png/games/" + thumb : "";
            var url = g.url ? "/active/#https://truffled.lol/" + String(g.url).replace(/^\/+/, "") : "";
            return mkRow(g.name, img, url, "truf");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadNow() {
    if (bags.nowgg.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/nowgg.fun/games.json")
      .then(function (d) {
        bags.nowgg = asArr(d)
          .map(function (g) {
            if (!g.name || !g.url) return null;
            var raw = String(g.url).trim();
            var clean = raw.indexOf("http") === 0 ? raw : "https://" + raw;
            return mkRow(g.name, g.img || "", "/active/#" + clean, "now");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadAlex() {
    if (bags.alex.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/dskjfoisjfsjio/alexrsworld@latest/singlefilegames.json")
      .then(function (d) {
        bags.alex = asArr(d)
          .map(function (g) {
            return mkRow(g.title || "Unknown", g.img || "", "/app-viewer/alexr-world-s/?view=" + encodeURIComponent(g.title || ""), "alex");
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadLup() {
    if (bags.lupine.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/tharun9772/LupineVault@main/assets/games.json")
      .then(function (d) {
        bags.lupine = asArr(d)
          .map(function (g) {
            if (!g.name) return null;
            var enc = encodeURIComponent(g.name);
            return mkRow(
              g.name,
              "https://cdn.jsdelivr.net/gh/tharun9772/LupineVault@main/assets/images/games/tile/" + enc + ".png",
              "/app-viewer/LupineVault/?view=" + enc,
              "lup"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadKh0() {
    if (bags.kh0.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/3kh0/3kh0-assets.json")
      .then(function (d) {
        bags.kh0 = asArr(d)
          .map(function (name) {
            return mkRow(
              name,
              "https://raw.githack.com/tharun9772/3kh0-assets/main/" + name + "/splash.png",
              "/app-viewer/3kh0/?view=" + encodeURIComponent(name),
              "kh0"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function loadKh0Lite() {
    if (bags.kh0lite.length) return Promise.resolve();
    return grab("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/3kh0/3kh0-lite.json")
      .then(function (d) {
        bags.kh0lite = asArr(d)
          .map(function (g) {
            return mkRow(
              g.title || "Unknown",
              "https://raw.githack.com/3kh0/3kh0-lite/main/" + (g.imgSrc || ""),
              "/app-viewer/3kh0/lite/?view=" + encodeURIComponent(g.link || ""),
              "kh0l"
            );
          })
          .filter(Boolean);
      })
      .catch(function () {});
  }

  function mashAll() {
    var seen = {};
    var out = [];
    Object.keys(bags).forEach(function (k) {
      bags[k].forEach(function (g) {
        if (!g || !g.id || seen[g.id]) return;
        seen[g.id] = 1;
        out.push(g);
      });
    });
    return out;
  }

  function loadAll(onProg) {
    var jobs = [
      loadBlox,
      loadGn,
      loadElite,
      loadSea,
      loadUgs,
      loadSeraph,
      loadCkv,
      loadHydra,
      loadCc,
      loadGc,
      loadTruf,
      loadNow,
      loadAlex,
      loadLup,
      loadKh0,
      loadKh0Lite,
    ];
    var done = 0;
    return Promise.all(
      jobs.map(function (fn) {
        return Promise.resolve()
          .then(fn)
          .then(function () {
            done++;
            if (onProg) onProg(done / jobs.length);
          });
      })
    ).then(function () {
      return mashAll();
    });
  }

  window.spBloxGames = {
    loadAll: loadAll,
    mashAll: mashAll,
  };
})();
