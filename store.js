window.spBag = (function () {
  function guh0(path) {
    if (/^https?:\/\//i.test(path)) return path;
    if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
      return "http://localhost:" + (window.__KOBRAN_PORT || "3080") + path;
    }
    return path;
  }

  function api(path, options) {
    options = options || {};
    return fetch(guh0(path), {
      method: options.method || "GET",
      headers: Object.assign({ "Content-Type": "application/json" }, options.headers || {}),
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok) {
              var err = new Error((data && data.error) || "Request failed");
              err.status = res.status;
              throw err;
            }
            return data;
          });
      })
      .catch(function (err) {
        if (err && err.status) throw err;
        var net = new Error("network_error");
        net.cause = err;
        throw net;
      });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function yeet1(game) {
    return [game.id, game.title, game.file, game.path]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  return {
    fmtDate: fmtDate,
    yeet1: yeet1,
    _api: api,
    getGames: function () {
      return api("/api/games");
    },
    getAnnouncements: function () {
      return api("/api/announcements");
    },
    getChangelog: function () {
      return api("/api/changelog");
    },
  };
})();
