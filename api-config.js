(function () {
  var host = "";
  var proto = "https:";
  try {
    host = String(location.hostname || "");
    proto = String(location.protocol || "https:");
  } catch (e) {
    return;
  }
  if (/\.github\.io$/i.test(host)) {
    if (proto === "http:") {
      window.__KRYING_API__ = "http://vps5.eas-x.com:13050";
    } else {
      window.__KRYING_API__ = "";
    }
  }
  window.__KRYING_TMDB__ = window.__KRYING_TMDB__ || "603b3a029ec4f3222d788b8de4945dba";
})();
