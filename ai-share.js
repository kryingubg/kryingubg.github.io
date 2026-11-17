(function () {
  var MODEL_KEY = "kry-ai-model-v2";
  var MODELS = (window.spAiR && window.spAiR.models) || [
    { id: "auto" },
    { id: "gpt-6-luna" },
    { id: "claude-haiku-5-5" },
    { id: "deepseek-v4.1-flash" },
  ];
  var SHARE_MODELS = MODELS.map(function (m) {
    return m.id;
  }).filter(Boolean);
  var video = document.getElementById("share-video");
  var hostEl = document.getElementById("share-host");
  var labelEl = document.getElementById("share-label");
  var modelBtn = document.getElementById("share-model");
  var stopBtn = document.getElementById("share-stop");
  var solveBtn = document.getElementById("share-solve");
  var goBtn = document.getElementById("share-go");
  var form = document.getElementById("share-form");
  var input = document.getElementById("share-input");
  var chatEl = document.getElementById("share-chat");
  var waitEl = document.getElementById("share-wait");
  var emptyEl = document.getElementById("share-empty");
  var dragEl = document.getElementById("share-drag");
  var stream = null;
  var busy = false;
  var turns = 0;
  var dragOn = false;
  var dragOx = 0;
  var dragOy = 0;
  var model = SHARE_MODELS[0] || "auto";
  var ocrWorker = null;

  function hostWin() {
    try {
      if (window.parent && window.parent !== window) return window.parent;
    } catch (e) {}
    return window;
  }

  function findOpener() {
    try {
      if (window.opener && !window.opener.closed) return window.opener;
    } catch (e) {}
    try {
      var p = hostWin();
      if (p && p.opener && !p.opener.closed) return p.opener;
    } catch (e2) {}
    return null;
  }

  function loadModel() {
    try {
      var m = localStorage.getItem(MODEL_KEY);
      if (m && SHARE_MODELS.indexOf(m) !== -1) model = m;
      else model = SHARE_MODELS[0];
    } catch (e) {
      model = SHARE_MODELS[0];
    }
  }

  function saveModel() {
    try {
      localStorage.setItem(MODEL_KEY, model);
    } catch (e) {}
  }

  function modelId() {
    if (SHARE_MODELS.indexOf(model) === -1) model = SHARE_MODELS[0];
    return model;
  }

  function cycleModel() {
    var i = SHARE_MODELS.indexOf(modelId());
    model = SHARE_MODELS[(i + 1) % SHARE_MODELS.length];
    saveModel();
    paintModel();
  }

  function paintModel() {
    if (modelBtn) modelBtn.textContent = modelId();
  }

  function surfaceLabel(track) {
    var surface = "";
    try {
      surface = String((track && track.getSettings && track.getSettings().displaySurface) || "");
    } catch (e) {}
    if (surface === "monitor") return { host: "Full screen", label: "" };
    if (surface === "window") return { host: "App window", label: "" };
    if (surface === "browser") return { host: location.host || "Browser tab", label: "" };
    return { host: "Live share", label: "" };
  }

  function setReady(on) {
    if (waitEl) waitEl.hidden = !!on;
    if (emptyEl) emptyEl.hidden = !on || turns > 0;
    if (solveBtn) solveBtn.disabled = !on || busy;
    if (goBtn) goBtn.disabled = !on || busy;
    if (input) input.disabled = !on;
  }

  function addBubble(role, text, wait) {
    if (emptyEl) emptyEl.hidden = true;
    if (waitEl) waitEl.hidden = true;
    var el = document.createElement("div");
    el.className = "bubble bubble--" + role + (wait ? " bubble--wait" : "");
    el.textContent = text;
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  function stopShare() {
    if (stream) {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
    }
    stream = null;
    try {
      var op = findOpener();
      if (op) op.__kryShareStream = null;
    } catch (e2) {}
    if (video) {
      try {
        video.srcObject = null;
      } catch (e3) {}
    }
    try {
      hostWin().close();
    } catch (e4) {}
    try {
      window.close();
    } catch (e5) {}
  }

  function snap() {
    if (!video || !video.videoWidth) return "";
    var c = document.createElement("canvas");
    var w = video.videoWidth;
    var h = video.videoHeight;
    var max = 1024;
    var scale = Math.min(1, max / Math.max(w, h));
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    var ctx = c.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(video, 0, 0, c.width, c.height);
    try {
      return c.toDataURL("image/jpeg", 0.72);
    } catch (e) {
      return "";
    }
  }

  function parsePack(res) {
    return res.json().then(
      function (data) {
        return { ok: res.ok, status: res.status, data: data };
      },
      function () {
        return { ok: false, status: res.status, data: {} };
      }
    );
  }

  function extractReply(json, text) {
    if (json && json.choices && json.choices[0] && json.choices[0].message) {
      var msg = json.choices[0].message;
      var c = msg.content || msg.reasoning_content || "";
      if (Array.isArray(c)) {
        return c
          .map(function (p) {
            return typeof p === "string" ? p : (p && p.text) || "";
          })
          .join("")
          .trim();
      }
      return String(c || "").trim();
    }
    if (json && json.reply) return String(json.reply).trim();
    if (text && text.charAt(0) !== "{") return String(text).trim();
    return "";
  }

  function ocrFrame(dataUrl) {
    if (!window.Tesseract) return Promise.resolve("");
    var start = ocrWorker
      ? Promise.resolve(ocrWorker)
      : window.Tesseract.createWorker("eng").then(function (w) {
          ocrWorker = w;
          return w;
        });
    return start
      .then(function (w) {
        return w.recognize(dataUrl);
      })
      .then(function (res) {
        return String((res && res.data && res.data.text) || "").trim();
      })
      .catch(function () {
        return "";
      });
  }

  function canHitApi() {
    try {
      var op = findOpener();
      var base = "";
      if (op && op.spBase && typeof op.spBase.apiBase === "function") base = op.spBase.apiBase() || "";
      if (base) return true;
    } catch (e0) {}
    var h = String(location.hostname || "").toLowerCase();
    if (h === "localhost" || h === "127.0.0.1") return true;
    if (/eas-x\.com$/i.test(h) || /flashhub\.net$/i.test(h) || /onrender\.com$/i.test(h)) return true;
    if (String(location.protocol || "") === "http:" && !/\.github\.io$/i.test(h)) return true;
    return false;
  }

  function postServer(messages) {
    if (!canHitApi()) {
      return Promise.resolve({ ok: false, status: 0, data: { clientFallback: true } });
    }
    var url = "/api/ai/chat";
    try {
      var op = findOpener();
      if (op && op.spBase && typeof op.spBase.apiUrl === "function") url = op.spBase.apiUrl("/api/ai/chat") || url;
      else if (window.spBase && typeof window.spBase.apiUrl === "function") url = window.spBase.apiUrl("/api/ai/chat") || url;
    } catch (e) {}
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: String(url).indexOf("http") === 0 ? "omit" : "same-origin",
      body: JSON.stringify({
        provider: "krying",
        model: modelId(),
        share: true,
        messages: messages,
      }),
    }).then(parsePack);
  }

  function nap(ms) {
    return new Promise(function (ok) {
      setTimeout(ok, ms || 0);
    });
  }

  function trashBit(t) {
    var s = String(t || "").trim();
    if (!s) return true;
    if (s.length < 220 && /rate.?limit|too many|upstream busy|\b429\b|\b402\b|payment required|error code/i.test(s)) return true;
    if (/^error\b/i.test(s) && s.length < 140) return true;
    return false;
  }

  function postBrowser(promptText) {
    var tip = String(promptText || "").slice(0, 4500);
    var mods = ["openai-fast", "openai", "mistral", "deepseek"];
    var last = { ok: false, status: 0, data: {} };

    function one(url, body) {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/plain" },
        body: JSON.stringify(body),
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var json = null;
            try {
              json = JSON.parse(text);
            } catch (e) {}
            var reply = extractReply(json, text);
            if (res.ok && reply && !trashBit(reply)) {
              return { ok: true, status: 200, data: { reply: reply } };
            }
            last = { ok: false, status: res.status || 0, data: {} };
            if (res.status === 429 || res.status === 402) {
              return nap(1600).then(function () {
                return null;
              });
            }
            return null;
          });
        })
        .catch(function () {
          return null;
        });
    }

    var chain = Promise.resolve(null);
    mods.forEach(function (mod) {
      chain = chain.then(function (hit) {
        if (hit) return hit;
        return one("https://text.pollinations.ai/openai", {
          model: mod,
          messages: [{ role: "user", content: tip }],
          temperature: 0.45,
        });
      });
    });
    chain = chain.then(function (hit) {
      if (hit) return hit;
      return one("https://gen.pollinations.ai/v1/chat/completions", {
        model: "openai",
        messages: [{ role: "user", content: tip }],
        temperature: 0.45,
        max_tokens: 700,
      });
    });
    chain = chain.then(function (hit) {
      if (hit) return hit;
      var q = encodeURIComponent(tip.slice(0, 900));
      return fetch("https://text.pollinations.ai/" + q + "?model=openai-fast", {
        method: "GET",
        headers: { Accept: "text/plain, application/json" },
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var json = null;
            try {
              json = JSON.parse(text);
            } catch (e2) {}
            var reply = extractReply(json, text);
            if (res.ok && reply && !trashBit(reply)) return { ok: true, status: 200, data: { reply: reply } };
            last = { ok: false, status: res.status || 0, data: {} };
            return null;
          });
        })
        .catch(function () {
          return null;
        });
    });
    return chain.then(function (hit) {
      return hit || last;
    });
  }

  function ask(promptText) {
    if (busy || !stream) return;
    var shot = snap();
    if (!shot) {
      addBubble("ai", "wait for the share to wake up then ask again");
      return;
    }
    var q = String(promptText || "").trim() || "Read this screen. explain whats showing and help with it.";
    busy = true;
    setReady(true);
    turns += 1;
    addBubble("user", q);
    var thinking = addBubble("ai", "reading the share…", true);

    var visionContent = [
      {
        type: "text",
        text: q + "\n\nFresh screenshot of the shared screen. Answer only from this frame.",
      },
      { type: "image_url", image_url: { url: shot } },
    ];

    function finish(text) {
      if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);
      addBubble("ai", trashBit(text) ? "couldnt read that frame, try again in a sec" : text);
    }

    function fail() {
      finish("couldnt read that frame, try again in a sec");
    }

    function good(pack) {
      return !!(pack && pack.ok && pack.data && pack.data.reply && !trashBit(pack.data.reply));
    }

    function viaOcrBrowser() {
      if (thinking) thinking.textContent = "scanning screen text…";
      return ocrFrame(shot).then(function (ocr) {
        var ocrPrompt =
          q +
          "\n\nOCR from shared screen (messy ok):\n" +
          (ocr || "(no readable text)") +
          "\n\nAnswer from that. short and clear.";
        if (canHitApi()) {
          return postServer([{ role: "user", content: ocrPrompt }]).then(function (pack2) {
            if (good(pack2)) {
              finish(String(pack2.data.reply));
              return;
            }
            if (thinking) thinking.textContent = "retrying…";
            return postBrowser(ocrPrompt).then(function (pack3) {
              if (good(pack3)) finish(String(pack3.data.reply));
              else fail();
            });
          });
        }
        if (thinking) thinking.textContent = "reading text…";
        return postBrowser(ocrPrompt).then(function (pack3) {
          if (good(pack3)) finish(String(pack3.data.reply));
          else fail();
        });
      });
    }

    var start = canHitApi()
      ? postServer([{ role: "user", content: visionContent }]).then(function (pack) {
          if (good(pack)) {
            finish(String(pack.data.reply));
            return null;
          }
          return viaOcrBrowser();
        })
      : viaOcrBrowser();

    start
      .catch(function () {
        fail();
      })
      .finally(function () {
        busy = false;
        setReady(!!stream);
        if (input) input.focus();
      });
  }

  function attachStream(next) {
    if (!next) return false;
    stream = next;
    if (video) {
      video.srcObject = stream;
      video.play().catch(function () {});
    }
    var track = stream.getVideoTracks()[0];
    var info = surfaceLabel(track);
    if (hostEl) hostEl.textContent = info.host;
    if (labelEl) labelEl.textContent = info.label;
    setReady(true);
    if (track) {
      track.addEventListener("ended", function () {
        stopShare();
      });
    }
    return true;
  }

  function bootFromOpener() {
    try {
      var op = findOpener();
      if (op && op.__kryShareStream) return attachStream(op.__kryShareStream);
    } catch (e) {}
    return false;
  }

  function wireDrag() {
    if (!dragEl) return;
    dragEl.addEventListener("pointerdown", function (e) {
      dragOn = true;
      dragOx = e.screenX - (window.screenX || 0);
      dragOy = e.screenY - (window.screenY || 0);
      try {
        dragEl.setPointerCapture(e.pointerId);
      } catch (err) {}
      e.preventDefault();
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragOn) return;
      var w = hostWin();
      try {
        w.moveTo(Math.round(e.screenX - dragOx), Math.round(e.screenY - dragOy));
      } catch (err) {}
    });
    window.addEventListener("pointerup", function () {
      dragOn = false;
    });
  }

  function waitForShare() {
    if (bootFromOpener()) return;
    if (waitEl) {
      waitEl.hidden = false;
      waitEl.textContent = "waiting for your share…";
    }
    var n = 0;
    var iv = setInterval(function () {
      n += 1;
      if (stream || bootFromOpener()) {
        clearInterval(iv);
        return;
      }
      if (n > 80) {
        clearInterval(iv);
        if (!stream && waitEl) waitEl.textContent = "share didn’t land — hit Screenshare again";
      }
    }, 50);
  }

  window.__kryAttachShare = function (next) {
    if (!next) return false;
    return attachStream(next);
  };

  loadModel();
  paintModel();
  setReady(false);
  waitForShare();
  if (stopBtn) stopBtn.addEventListener("click", stopShare);
  if (solveBtn) {
    solveBtn.addEventListener("click", function () {
      ask("Read this screen");
    });
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input ? input.value.trim() : "";
      if (!q) return;
      if (input) input.value = "";
      ask(q);
    });
  }
  if (modelBtn) modelBtn.addEventListener("click", cycleModel);
  wireDrag();
  window.addEventListener("beforeunload", function () {
    if (stream) {
      stream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
    }
    if (ocrWorker && ocrWorker.terminate) {
      try {
        ocrWorker.terminate();
      } catch (e2) {}
    }
  });
  window.addEventListener("storage", function (e) {
    if (e.key === MODEL_KEY) {
      loadModel();
      paintModel();
    }
  });
})();
