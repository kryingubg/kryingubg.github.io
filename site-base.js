(function () {
  function hostName() {
    try {
      return String(location.hostname || "");
    } catch (e) {
      return "";
    }
  }

  function pkgVer() {
    try {
      var m = String(location.pathname || "").match(/krying@([^/?#]+)/i);
      if (m) return m[1];
      m = String(location.pathname || "").match(/\/npm\/krying@([^/?#]+)/i);
      if (m) return m[1];
    } catch (e) {}
    return "";
  }

  function isGcs() {
    return /storage\.googleapis\.com$/i.test(hostName());
  }

  function isPages() {
    return /\.github\.io$/i.test(hostName());
  }

  function isCdn() {
    try {
      var host = hostName();
      if (/unpkg\.com$/i.test(host) || /jsdelivr\.net$/i.test(host) || isGcs() || isPages()) return true;
      if (/\/krying@/i.test(String(location.pathname || ""))) return true;
    } catch (e) {}
    return false;
  }

  function pkgBase() {
    try {
      var path = String(location.pathname || "/");
      var host = hostName();
      path = path.replace(/\/(?:index\.svg|index\.html|study\.html)$/i, "/");
      var m = path.match(/^(.*?\/(?:npm\/)?krying(?:@[^/?#]+)?\/)/i);
      if (m) return m[1];
      if (/unpkg\.com$/i.test(host) || /jsdelivr\.net$/i.test(host)) {
        m = path.match(/^(\/gh\/[^/]+\/[^/@]+(?:@[^/]+)?\/)/i);
        if (m) return m[1];
        m = path.match(/^(\/(?:npm\/)?[^/]+(?:@[^/]+)?\/)/i);
        if (m) return m[1];
      }
      if (isGcs()) {
        m = path.match(/^(\/[^/]+\/)/);
        if (m) return m[1];
      }
      if (isPages()) {
        var user = host.split(".")[0].toLowerCase();
        m = path.match(/^\/([^/]+)\//);
        if (m && String(m[1]).toLowerCase() !== user.toLowerCase() + ".github.io") {
          if (path.indexOf("/" + m[1] + "/") === 0 && !/\/(?:index|study)\.html$/i.test("/" + m[1])) {
            return "/" + m[1] + "/";
          }
        }
        if (/\/(?:index|study)\.html$/i.test(path)) return path.replace(/(?:index|study)\.html$/i, "");
        if (path.endsWith("/")) return path;
        var slash = path.lastIndexOf("/");
        return slash >= 0 ? path.slice(0, slash + 1) : "/";
      }
      if (/\/(?:index|study)\.html$/i.test(path)) return path.replace(/(?:index|study)\.html$/i, "");
      if (path.endsWith("/")) return path;
      var slash2 = path.lastIndexOf("/");
      return slash2 >= 0 ? path.slice(0, slash2 + 1) : "/";
    } catch (e) {
      return "/";
    }
  }

  function assetBase() {
    try {
      var host = hostName();
      var path = String(location.pathname || "/");
      if (/jsdelivr\.net$/i.test(host) && /^\/gh\//i.test(path)) {
        return "https://cdn.jsdelivr.net" + pkgBase();
      }
      var ver = pkgVer() || "latest";
      if (/unpkg\.com$/i.test(host) || /jsdelivr\.net$/i.test(host)) {
        return "https://cdn.jsdelivr.net/npm/krying@" + ver + "/";
      }
    } catch (e) {}
    return pkgBase();
  }

  function assetUrl(raw) {
    var rel = String(raw || "").trim();
    if (!rel) return "";
    if (/^https?:\/\//i.test(rel) || /^data:/i.test(rel) || /^blob:/i.test(rel)) return rel;
    if (rel.charAt(0) === "/") rel = rel.slice(1);
    if (/^assets\/thumbs\//i.test(rel)) {
      var local = /^(localhost|127\.0\.0\.1)$/i.test(hostName());
      if (!local) return "https://cdn.jsdelivr.net/npm/krying@1.0.4/" + rel;
    }
    return assetBase() + rel;
  }

  function htmlUrl(raw) {
    var url = assetUrl(raw);
    if (!url) return url;
    try {
      if (/jsdelivr\.net$/i.test(hostName()) && /\.html(?:[?#]|$)/i.test(url)) {
        return url.replace(/^https:\/\/cdn\.jsdelivr\.net\/npm\//i, "https://unpkg.com/");
      }
    } catch (e) {}
    return url;
  }

  function apiBase() {
    try {
      if (window.__KRYING_API__) return String(window.__KRYING_API__).replace(/\/$/, "");
      var meta = document.querySelector('meta[name="krying-api"]');
      if (meta && meta.content) return String(meta.content).replace(/\/$/, "");
    } catch (e) {}
    if (!(isPages() || isCdn())) return "";
    return "";
  }

  function apiUrl(path) {
    var p = String(path || "");
    if (!p) return apiBase() || "";
    if (/^https?:\/\//i.test(p)) return p;
    if (p.charAt(0) !== "/") p = "/" + p;
    var b = apiBase();
    return b ? b + p : p;
  }

  function patchFetch() {
    if (typeof window.fetch !== "function") return;
    if (window.__KRYING_FETCH_PATCHED) return;
    window.__KRYING_FETCH_PATCHED = 1;
    var orig = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var base = apiBase();
      var rewrote = false;
      try {
        if (base) {
          if (typeof input === "string") {
            if (input.charAt(0) === "/" && input.indexOf("/api/") === 0) {
              input = base + input;
              rewrote = true;
            }
          } else if (input && typeof Request !== "undefined" && input instanceof Request) {
            var u = String(input.url || "");
            if (u.indexOf(location.origin + "/api/") === 0) {
              input = new Request(base + u.slice(location.origin.length), input);
              rewrote = true;
            }
          }
        }
      } catch (e) {}
      if (rewrote) {
        init = init ? Object.assign({}, init) : {};
        if (!init.credentials || init.credentials === "same-origin") init.credentials = "omit";
      }
      return orig(input, init);
    };
  }

  try {
    patchFetch();
  } catch (e3) {}

  function pageHash(hash) {
    var h = String(hash || "").replace(/^#/, "");
    var path = String(location.pathname || "/");
    var entry = isPages() ? "index.html" : /jsdelivr\.net$/i.test(hostName()) ? "index.svg" : "index.html";
    if (!path || path === "/") path = pkgBase() + entry;
    else if (path.endsWith("/")) path = path + entry;
    else if (/\/(?:index|study)\.html$/i.test(path) && /jsdelivr\.net$/i.test(hostName())) {
      path = path.replace(/\/(?:index|study)\.html$/i, "/index.svg");
    }
    return path + (location.search || "") + (h ? "#" + h : "");
  }

  function setHash(hash) {
    var next = pageHash(hash);
    try {
      history.replaceState(null, "", next);
    } catch (e) {
      try {
        location.hash = String(hash || "").replace(/^#/, "");
      } catch (e2) {}
    }
  }

  window.spBase = {
    pkgVer: pkgVer,
    isCdn: isCdn,
    isGcs: isGcs,
    isPages: isPages,
    pkgBase: pkgBase,
    assetBase: assetBase,
    assetUrl: assetUrl,
    htmlUrl: htmlUrl,
    apiBase: apiBase,
    apiUrl: apiUrl,
    pageHash: pageHash,
    setHash: setHash,
  };
})();
