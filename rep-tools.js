(function () {
  var view = document.getElementById("view-rep-tools");
  var launcher = document.getElementById("rep-launcher");
  var panel = document.getElementById("rep-panel");
  var openBtn = document.getElementById("rep-choose-finders");
  var backBtn = document.getElementById("rep-back");
  var grid = document.getElementById("rep-grid");
  var status = document.getElementById("rep-status");
  var empty = document.getElementById("rep-empty");
  var search = document.getElementById("rep-search");
  var catSel = document.getElementById("rep-cat");
  var detail = document.getElementById("rep-detail");
  var detailBack = document.getElementById("rep-detail-back");
  var detailMedia = document.getElementById("rep-detail-media");
  var detailTag = document.getElementById("rep-detail-tag");
  var detailTitle = document.getElementById("rep-detail-title");
  var detailPrice = document.getElementById("rep-detail-price");
  var detailMeta = document.getElementById("rep-detail-meta");
  var detailActions = document.getElementById("rep-detail-actions");
  var detailCopy = document.getElementById("rep-detail-copy");
  var detailFacts = document.getElementById("rep-detail-facts");
  var detailRelated = document.getElementById("rep-detail-related");
  var detailRelatedCount = document.getElementById("rep-detail-related-count");
  var detailRelatedGrid = document.getElementById("rep-detail-related-grid");
  var items = [];
  var cats = [];
  var page = 1;
  var hasMore = false;
  var loading = false;
  var loaded = false;
  var timer = 0;
  var activeItem = null;
  var agentIndex = 0;
  var AGENT_MAP = [
    ["weidian", "Weidian"],
    ["kakobuy", "Kakobuy"],
    ["lovegobuy", "Lovegobuy"],
    ["litbuy", "Litbuy"],
    ["joyagoo", "Joyagoo"],
    ["oopbuy", "Oopbuy"],
    ["hipobuy", "Hipobuy"],
  ];

  function alone() {
    try {
      return (
        document.body.classList.contains("rep-standalone") ||
        (window.location.hash || "").toLowerCase() === "#rep"
      );
    } catch (e) {
      return false;
    }
  }

  function show(msg, on) {
    if (!status) return;
    status.hidden = !on;
    status.textContent = msg || "";
  }

  function chooser(open) {
    if (launcher) launcher.hidden = !open;
    if (panel) panel.hidden = open;
    if (view) {
      view.classList.toggle("rep-mode-chooser", open);
      view.classList.toggle("rep-mode-finders", !open);
    }
    if (open) closeDetail();
  }

  function openFinders() {
    var href =
      window.spBase && window.spBase.pageHash
        ? window.spBase.pageHash("rep")
        : location.pathname + location.search + "#rep";
    var win = window.open(href, "_blank");
    if (!win) {
      if (window.spBase && window.spBase.setHash) window.spBase.setHash("rep");
      else location.hash = "rep";
      enterFinders();
    }
  }

  function backHome() {
    if (alone()) {
      var href =
        window.spBase && window.spBase.pageHash
          ? window.spBase.pageHash("rep-tools")
          : location.pathname + location.search + "#rep-tools";
      window.location.assign(href);
      return;
    }
    chooser(true);
    if (window.spBase && window.spBase.setHash) window.spBase.setHash("rep-tools");
  }

  function fillCats() {
    if (!catSel) return;
    var cur = catSel.value;
    catSel.innerHTML = '<option value="">All categories</option>';
    cats.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      catSel.appendChild(o);
    });
    if (cur) catSel.value = cur;
  }

  function agentLinks(item) {
    var out = [];
    AGENT_MAP.forEach(function (pair) {
      var href = item && item.links && item.links[pair[0]];
      if (!href) return;
      out.push({ key: pair[0], label: pair[1], href: href });
    });
    return out;
  }

  function rawLink(item) {
    var links = agentLinks(item);
    if (!links.length) return "";
    var prefer = links.find(function (l) {
      return l.key === "weidian";
    });
    return (prefer || links[0]).href;
  }

  function coverCandidates(item) {
    var out = [];
    var seen = Object.create(null);
    function push(src) {
      var raw = String(src || "").trim();
      if (!raw || seen[raw]) return;
      seen[raw] = 1;
      out.push(raw);
    }
    if (item && item.image && /^https?:\/\//i.test(item.image)) {
      push(item.image);
    }
    return out;
  }

  function bindCover(media, item, imgClass) {
    var list = coverCandidates(item);
    media.innerHTML = "";
    var mark = document.createElement("span");
    mark.className = imgClass === "rep-detail__media" ? "rep-detail__media-mark" : "rep-card__mark";
    mark.textContent = (item.name || "?").charAt(0).toUpperCase();
    media.appendChild(mark);
    if (!list.length) {
      media.classList.add("rep-card__media--empty");
      return;
    }
    var img = document.createElement("img");
    if (imgClass !== "rep-detail__media") img.className = "rep-card__img";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    var i = 0;
    function use(src) {
      img.src = src;
    }
    img.addEventListener("error", function () {
      i += 1;
      if (i < list.length) {
        use(list[i]);
        return;
      }
      media.classList.add("rep-card__media--empty");
      if (img.parentNode) img.remove();
    });
    img.addEventListener(
      "load",
      function () {
        media.classList.remove("rep-card__media--empty");
        if (mark.parentNode) mark.remove();
      },
      { once: true }
    );
    media.appendChild(img);
    use(list[0]);
  }

  function relatedFor(item) {
    if (!item) return [];
    var id = item.id;
    var cat = String(item.category || "").toLowerCase();
    var brand = String(item.brand || "").toLowerCase();
    var token = String(item.name || "")
      .toLowerCase()
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 2;
      })
      .slice(0, 2);
    var scored = items
      .filter(function (row) {
        return row && row.id !== id;
      })
      .map(function (row) {
        var score = 0;
        if (cat && String(row.category || "").toLowerCase() === cat) score += 4;
        if (brand && String(row.brand || "").toLowerCase() === brand) score += 5;
        var name = String(row.name || "").toLowerCase();
        token.forEach(function (t) {
          if (name.indexOf(t) !== -1) score += 2;
        });
        return { row: row, score: score };
      })
      .filter(function (x) {
        return x.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    return scored.slice(0, 16).map(function (x) {
      return x.row;
    });
  }

  function setFacts(item, agents) {
    if (!detailFacts) return;
    detailFacts.innerHTML = "";
    function add(k, v) {
      if (!v) return;
      var dt = document.createElement("dt");
      dt.textContent = k;
      var dd = document.createElement("dd");
      dd.textContent = v;
      detailFacts.append(dt, dd);
    }
    add("Category", item.category || "");
    add("Price", item.priceUsd || item.priceRmb || "");
    add("Brand", item.brand || "");
    add("Quality", item.quality || "");
    add(
      "Agents",
      agents.length
        ? agents
            .map(function (a) {
              return a.label;
            })
            .join(" · ")
        : ""
    );
  }

  function paintActions(item) {
    if (!detailActions) return;
    detailActions.innerHTML = "";
    var agents = agentLinks(item);
    if (!agents.length) return agents;
    if (agentIndex >= agents.length) agentIndex = 0;
    var primary = agents[agentIndex];
    var buy = document.createElement("a");
    buy.className = "rep-detail__buy";
    buy.href = primary.href;
    buy.target = "_blank";
    buy.rel = "noopener noreferrer";
    buy.textContent = "Buy on " + primary.label + " →";
    detailActions.appendChild(buy);
    if (agents.length > 1) {
      var sw = document.createElement("button");
      sw.type = "button";
      sw.className = "rep-detail__agent";
      sw.textContent = "Switch agent";
      sw.addEventListener("click", function () {
        agentIndex = (agentIndex + 1) % agents.length;
        paintActions(item);
      });
      detailActions.appendChild(sw);
    }
    return agents;
  }

  function paintRelated(item) {
    if (!detailRelated || !detailRelatedGrid) return;
    var related = relatedFor(item);
    detailRelatedGrid.innerHTML = "";
    if (!related.length) {
      detailRelated.hidden = true;
      return;
    }
    detailRelated.hidden = false;
    if (detailRelatedCount) detailRelatedCount.textContent = related.length + " finds";
    related.forEach(function (row) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rep-detail__related-card" + (activeItem && activeItem.id === row.id ? " rep-detail__related-card--on" : "");
      btn.setAttribute("role", "listitem");
      var thumb = document.createElement("div");
      thumb.className = "rep-detail__related-thumb";
      bindCover(thumb, row, "rep-card__media");
      var name = document.createElement("span");
      name.className = "rep-detail__related-name";
      name.textContent = row.name || "Item";
      btn.append(thumb, name);
      btn.addEventListener("click", function () {
        openDetail(row);
      });
      detailRelatedGrid.appendChild(btn);
    });
  }

  function openDetail(item) {
    if (!item || !detail || !panel) return;
    activeItem = item;
    agentIndex = 0;
    if (panel) panel.classList.add("rep-panel--detail");
    detail.hidden = false;
    if (detailTag) {
      if (item.category) {
        detailTag.hidden = false;
        detailTag.textContent = item.category;
      } else {
        detailTag.hidden = true;
        detailTag.textContent = "";
      }
    }
    if (detailTitle) detailTitle.textContent = item.name || "Item";
    if (detailPrice) detailPrice.textContent = item.priceUsd || item.priceRmb || "—";
    if (detailMeta) {
      var bits = [];
      if (item.category) bits.push("Category: " + item.category);
      if (item.brand) bits.push("Brand: " + item.brand);
      if (item.quality) bits.push(item.quality);
      detailMeta.textContent = bits.join("  ·  ");
    }
    if (detailMedia) bindCover(detailMedia, item, "rep-detail__media");
    var agents = paintActions(item) || [];
    setFacts(item, agents);
    paintRelated(item);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {}
  }

  function closeDetail() {
    activeItem = null;
    if (detail) detail.hidden = true;
    if (panel) panel.classList.remove("rep-panel--detail");
  }

  function card(item) {
    var el = document.createElement("article");
    el.className = "rep-card";
    el.setAttribute("role", "listitem");
    el.tabIndex = 0;
    var media = document.createElement("div");
    media.className = "rep-card__media";
    bindCover(media, item, "rep-card__media");
    var top = document.createElement("div");
    top.className = "rep-card__top";
    if (item.category) {
      var cat = document.createElement("span");
      cat.className = "rep-card__cat";
      cat.textContent = item.category;
      top.appendChild(cat);
    }
    var title = document.createElement("h3");
    title.className = "rep-card__title";
    title.textContent = item.name || "Item";
    var meta = document.createElement("p");
    meta.className = "rep-card__meta";
    var bits = [];
    if (item.brand) bits.push(item.brand);
    if (item.priceUsd) bits.push(item.priceUsd);
    else if (item.priceRmb) bits.push(item.priceRmb);
    if (item.quality) bits.push(item.quality);
    meta.textContent = bits.join(" · ") || " ";
    el.append(media, top, title, meta);
    el.addEventListener("click", function () {
      openDetail(item);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDetail(item);
      }
    });
    return el;
  }

  function paint(batch, append) {
    if (!grid) return;
    if (!append) grid.innerHTML = "";
    (batch || []).forEach(function (item) {
      grid.appendChild(card(item));
    });
    if (empty) empty.hidden = items.length > 0 || loading;
  }

  function load(reset) {
    if (loading) return;
    if (reset) {
      page = 1;
      items = [];
      if (grid) grid.innerHTML = "";
      closeDetail();
    }
    loading = true;
    show(page === 1 ? "Loading finds…" : "Loading more…", true);
    if (empty) empty.hidden = true;
    var q = search && search.value ? search.value.trim().toLowerCase() : "";
    var cat = catSel ? catSel.value : "";
    var limit = 96;
    var staticUrl =
      window.spBase && window.spBase.assetUrl
        ? window.spBase.assetUrl("rep-catalog.json")
        : "rep-catalog.json";
    var apiUrl =
      "/api/rep/catalog?page=" +
      encodeURIComponent(String(page)) +
      "&limit=" +
      limit +
      (q ? "&q=" + encodeURIComponent(q) : "") +
      (cat ? "&cat=" + encodeURIComponent(cat) : "");
    var onCdn = window.spBase && window.spBase.isCdn && window.spBase.isCdn();
    var req = onCdn
      ? fetch(staticUrl, { cache: "no-store" }).then(function (res) {
          if (!res.ok) throw new Error("bad");
          return res.json();
        })
      : fetch(apiUrl)
          .then(function (res) {
            if (!res.ok) throw new Error("bad");
            return res.json();
          })
          .catch(function () {
            return fetch(staticUrl, { cache: "no-store" }).then(function (res) {
              if (!res.ok) throw new Error("bad");
              return res.json();
            });
          });
    req
      .then(function (payload) {
        var list = Array.isArray(payload.data) ? payload.data.slice() : [];
        if (Array.isArray(payload.categories) && payload.categories.length) {
          cats = payload.categories;
          fillCats();
        } else if (!cats.length) {
          var seen = {};
          list.forEach(function (it) {
            var c = String(it.category || "").trim();
            if (c && !seen[c]) {
              seen[c] = 1;
              cats.push(c);
            }
          });
          cats.sort();
          fillCats();
        }
        if (cat) {
          list = list.filter(function (it) {
            return String(it.category || "").toLowerCase() === String(cat).toLowerCase();
          });
        }
        if (q) {
          list = list.filter(function (it) {
            return (
              String(it.name || "")
                .toLowerCase()
                .indexOf(q) !== -1 ||
              String(it.brand || "")
                .toLowerCase()
                .indexOf(q) !== -1 ||
              String(it.category || "")
                .toLowerCase()
                .indexOf(q) !== -1
            );
          });
        }
        var start = (page - 1) * limit;
        var batch = list.slice(start, start + limit);
        if (reset) items = batch;
        else items = items.concat(batch);
        hasMore = start + limit < list.length;
        loaded = true;
        paint(batch, !reset);
        show(items.length ? items.length + " finds" : "", !!items.length);
        if (!items.length) {
          show("", false);
          if (empty) {
            empty.hidden = false;
            empty.textContent = "nothing matched.";
          }
        }
      })
      .catch(function () {
        show("failed to load finds.", true);
        if (empty && !items.length) {
          empty.hidden = false;
          empty.textContent = "failed to load finds.";
        }
      })
      .finally(function () {
        loading = false;
      });
  }

  function enterFinders() {
    chooser(false);
    if (!loaded || alone()) load(true);
  }

  if (openBtn) {
    openBtn.addEventListener("click", function () {
      openFinders();
    });
  }
  if (backBtn) backBtn.addEventListener("click", backHome);
  if (detailBack) {
    detailBack.addEventListener("click", function () {
      closeDetail();
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {}
    });
  }
  if (detailCopy) {
    detailCopy.addEventListener("click", function () {
      var href = rawLink(activeItem);
      if (!href) return;
      var done = function () {
        detailCopy.textContent = "Copied";
        setTimeout(function () {
          detailCopy.textContent = "Copy raw link";
        }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(href).then(done).catch(function () {
          window.prompt("Copy link", href);
        });
      } else {
        window.prompt("Copy link", href);
      }
    });
  }
  if (search) {
    search.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        load(true);
      }, 90);
    });
  }
  if (catSel) {
    catSel.addEventListener("change", function () {
      load(true);
    });
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!panel || panel.hidden || panel.classList.contains("rep-panel--detail") || !hasMore || loading) return;
      if (window.innerHeight + window.scrollY < document.body.offsetHeight - 900) return;
      page += 1;
      load(false);
    },
    { passive: true }
  );

  window.spRep = {
    open: function (mode) {
      if (mode === "finders" || alone()) enterFinders();
      else chooser(true);
    },
    render: function () {
      if (alone()) enterFinders();
      else chooser(true);
    },
  };

  if (alone()) enterFinders();
  else chooser(true);
})();
