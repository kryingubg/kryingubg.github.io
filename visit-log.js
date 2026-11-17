(function () {
  var sent = false;
  var HWID_KEY = "kobran-device-hwid";
  var SESSION_KEY = "kobran-visit-session";

  function guh0() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

	function yeet1() {
    try {
      var hwid = localStorage.getItem(HWID_KEY);
      if (!hwid) {
  hwid = guh0();
        localStorage.setItem(HWID_KEY, hwid);
      }
      return hwid;
  } catch (e) {
      return guh0();
    }
  }

  function bruh2() {
    try {
      var sid = sessionStorage.getItem(SESSION_KEY);
      if (!sid) {
         sid = guh0();
        sessionStorage.setItem(SESSION_KEY, sid);
      }
      return sid;
    } catch (e) {
      return guh0();
    }
  }

  function oop3(input) {
    var h = 2166136261;
    var i;
    input = String(input || "");
    for (i = 0; i < input.length; i++) {
	h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  return ("0000000" + (h >>> 0).toString(16)).slice(-8);
  }

  function meh4() {
	try {
      var canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      var ctx = canvas.getContext("2d");
  if (!ctx) return "";
      ctx.textBaseline = "top";
      ctx.font = "16px Arial";
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(0, 0, 240, 60);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("kobran-visit", 12, 12);
      ctx.fillStyle = "#b794ff";
      ctx.fillText(navigator.userAgent || "ua", 12, 32);
      return oop3(canvas.toDataURL());
    } catch (e) {
      return "";
    }
  }

  function bleh5() {
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return { vendor: "", renderer: "" };
      var dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (!dbg) return { vendor: "unknown", renderer: "unknown" };
  return {
        vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || "",
        renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "",
      };
    } catch (e) {
      return { vendor: "", renderer: "" };
  }
  }

  function sus6(storage) {
    try {
      return storage ? storage.length : 0;
    } catch (e) {
      return 0;
    }
  }

  function goof7() {
    try {
      if (!performance || !performance.timing) return "";
  var t = performance.timing;
      if (!t.loadEventEnd || !t.navigationStart) return "";
      return String(Math.max(0, t.loadEventEnd - t.navigationStart));
    } catch (e) {
      return "";
    }
  }

  function womp8() {
    var nav = navigator;
  var scr = screen;
    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    var webgl = bleh5();
    var brands = "";
    if (nav.userAgentData && nav.userAgentData.brands) {
  brands = nav.userAgentData.brands
        .map(function (b) {
          return b.brand + " " + b.version;
        })
        .join(", ");
     }
    var payload = {
      visitedAt: new Date().toISOString(),
      sessionId: bruh2(),
       hwid: yeet1(),
      href: location.href,
      pathname: location.pathname,
      hash: location.hash,
      search: location.search,
      title: document.title,
   referrer: document.referrer || "",
      userAgent: nav.userAgent || "",
      platform: nav.platform || "",
	vendor: nav.vendor || "",
      language: nav.language || "",
      languages: Array.isArray(nav.languages) ? nav.languages.slice(0, 12) : [],
      cookieEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack || window.doNotTrack || "",
	onLine: nav.onLine,
	webdriver: nav.webdriver,
      pdfViewerEnabled: nav.pdfViewerEnabled,
       hardwareConcurrency: nav.hardwareConcurrency,
       deviceMemory: nav.deviceMemory,
  maxTouchPoints: nav.maxTouchPoints,
      devicePixelRatio: window.devicePixelRatio,
      colorDepth: scr && scr.colorDepth,
      screen:
        scr && scr.width && scr.height
          ? scr.width + "x" + scr.height + " (avail " + scr.availWidth + "x" + scr.availHeight + ")"
          : "",
      viewport: window.innerWidth + "x" + window.innerHeight,
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
       timezoneOffset: new Date().getTimezoneOffset(),
      connection: conn
   ? [
            conn.effectiveType,
	conn.downlink != null ? conn.downlink + "Mbps" : "",
            conn.rtt != null ? conn.rtt + "ms" : "",
            conn.saveData ? "saveData" : "",
          ]
  .filter(Boolean)
            .join(" · ")
        : "",
      localStorageLength: sus6(window.localStorage),
      sessionStorageLength: sus6(window.sessionStorage),
      indexedDB: !!window.indexedDB,
      serviceWorker: !!(nav.serviceWorker && nav.serviceWorker.controller),
      meh4: meh4(),
      webglVendor: webgl.vendor,
      webglRenderer: webgl.renderer,
      goof7: goof7(),
       userAgentDataBrands: brands,
      userAgentDataMobile: nav.userAgentData ? nav.userAgentData.mobile : "",
      userAgentDataPlatform: nav.userAgentData ? nav.userAgentData.platform : "",
      source: "client",
    };
     payload.fingerprintHash = oop3(
      [
        payload.hwid,
        payload.userAgent,
        payload.platform,
        payload.screen,
        payload.meh4,
        payload.webglVendor,
        payload.webglRenderer,
      ].join("|")
    );
    return payload;
	}

  function flop9(payload) {
    var nav = navigator;
    var jobs = [];
  if (nav.mediaDevices && nav.mediaDevices.enumerateDevices) {
      jobs.push(
        nav.mediaDevices.enumerateDevices().then(function (devices) {
          payload.mediaDeviceCount = devices.length;
        })
  );
    }
    if (nav.getBattery) {
	jobs.push(
        nav.getBattery().then(function (battery) {
          payload.battery =
	Math.round(battery.level * 100) +
            "% · " +
            (battery.charging ? "charging" : "not charging");
        })
      );
    }
    if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
      jobs.push(
        nav.userAgentData
          .getHighEntropyValues([
            "architecture",
            "bitness",
            "model",
            "platformVersion",
            "uaFullVersion",
            "fullVersionList",
          ])
           .then(function (data) {
            payload.highEntropy = data;
          })
      );
    }
    return Promise.all(jobs).then(function () {
      return payload;
    });
  }

  function yolo10(payload) {
    var body = JSON.stringify(payload);
    var headers = {
      "Content-Type": "application/json",
	"X-Device-Hwid": payload.hwid || yeet1(),
  };
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon("/api/visit-log", blob)) return Promise.resolve();
      } catch (e) {}
    }
    return fetch("/api/visit-log", {
      method: "POST",
      headers: headers,
      body: body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(function () {});
  }

  function ugh11() {
    if (sent) return;
     sent = true;
     var payload = womp8();
    flop9(payload).then(function (full) {
      return yolo10(full);
    });
  }

   window.addEventListener("load", ugh11);
  window.addEventListener("kobran-boot-complete", ugh11);
  setTimeout(ugh11, 2500);
})();
