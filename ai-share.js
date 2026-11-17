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

  function postServer(messages) {
    var url = "/api/ai/chat";
    try {
      if (window.opener && window.opener.spBase && typeof window.opener.spBase.apiUrl === "function") {
        url = window.opener.spBase.apiUrl("/api/ai/chat") || url;
      } else if (window.spBase && typeof window.spBase.apiUrl === "function") {
        url = window.spBase.apiUrl("/api/ai/chat") || url;
      }
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

  function postBrowser(promptText) {
    return fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [{ role: "user", content: String(promptText || "").slice(0, 6000) }],
        temperature: 0.5,
      }),
    }).then(function (res) {
      return res.text().then(function (text) {
        var json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}
        return { ok: res.ok, status: res.status, data: { reply: extractReply(json, text), raw: text } };
      });
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
        text:
          q +
          "\n\nFresh screenshot of the user's shared tab/window/screen. Answer only from this frame. Keep it clear and direct.",
      },
      { type: "image_url", image_url: { url: shot } },
    ];

    function finish(text) {
      if (thinking && thinking.parentNode) thinking.parentNode.removeChild(thinking);
      addBubble("ai", text);
    }

    function fail(msg) {
      finish(msg || "something went wrong, report it to the website manager pls&ty :)");
    }

    postServer([{ role: "user", content: visionContent }])
      .then(function (pack) {
        if (pack.ok && pack.data && pack.data.reply) {
          finish(String(pack.data.reply));
          return null;
        }
        if (thinking) thinking.textContent = "scanning screen text…";
        return ocrFrame(shot).then(function (ocr) {
          var ocrPrompt =
            q +
            "\n\nOCR text from the shared screen (may be messy):\n" +
            (ocr || "(no readable text)") +
            "\n\nAnswer from that screen text. Be clear and direct.";
          return postServer([{ role: "user", content: ocrPrompt }]).then(function (pack2) {
            if (pack2.ok && pack2.data && pack2.data.reply) {
              finish(String(pack2.data.reply));
              return null;
            }
            if (thinking) thinking.textContent = "retrying from your network…";
            return postBrowser(ocrPrompt).then(function (pack3) {
              if (pack3.data && pack3.data.reply) {
                finish(String(pack3.data.reply));
                return;
              }
              if (pack3.status === 402 || pack3.status === 429) {
                fail("upstream busy — try again in a sec");
                return;
              }
              fail((pack.data && pack.data.error) || (pack2.data && pack2.data.error) || "");
            });
          });
        });
      })
      .catch(function () {
        fail("");
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
