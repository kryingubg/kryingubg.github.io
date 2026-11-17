(function () {
  var MODELS = (window.spAiR && window.spAiR.models) || [];
  var STORE = "kry-ai-chats-v2";
  var MODEL_KEY = "kry-ai-model-v2";
  var panel = document.getElementById("view-ai");
  var logEl = document.getElementById("ai-chat-log");
  var heroEl = document.getElementById("ai-hero");
  var inputEl = document.getElementById("ai-chat-input");
  var statusEl = document.getElementById("ai-chat-status");
  var recentEl = document.getElementById("ai-recent");
  var modelBtn = document.getElementById("ai-model-btn");
  var modelLabel = document.getElementById("ai-model-label");
  var modelMenu = document.getElementById("ai-model-menu");
  var backBtn = document.getElementById("ai-back");
  var newBtn = document.getElementById("ai-new-chat");
  var shareBtn = document.getElementById("ai-screenshare");
  var plusBtn = document.getElementById("ai-plus");
  var sendBtn = document.getElementById("ai-chat-send");
  var fileEl = document.getElementById("ai-file");
  var chats = [];
  var activeId = "";
  var messages = [];
  var model = "auto";
  var busy = false;
  var attachNote = "";
  var shareWin = null;
  var shareStream = null;

  function yeet() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE);
      chats = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(chats)) chats = [];
    } catch (e) {
      chats = [];
    }
    try {
      var m = localStorage.getItem(MODEL_KEY);
      if (m === "auto" || (m && MODELS.some(function (x) { return x.id === m; }))) model = m;
      else model = "auto";
    } catch (e) {
      model = "auto";
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE, JSON.stringify(chats.slice(0, 40)));
      localStorage.setItem(MODEL_KEY, model);
    } catch (e) {}
  }

  function titleOf(msgs) {
    var first = msgs && msgs[0] && msgs[0].content ? String(msgs[0].content) : "new chat";
    return first.replace(/\s+/g, " ").trim().slice(0, 42) || "new chat";
  }

  function fmtMeta(meta) {
    if (!meta) return "";
    var sec = ((Number(meta.elapsedMs) || 0) / 1000).toFixed(1);
    var ttft = ((Number(meta.ttftMs) || Number(meta.elapsedMs) || 0) / 1000).toFixed(1);
    var tok = Number(meta.tokens) || 0;
    return sec + "s · TTFT " + ttft + "s · " + tok + " tokens total";
  }

  function closeChat(id) {
    chats = chats.filter(function (c) {
      return c.id !== id;
    });
    saveStore();
    if (activeId === id) {
      if (chats.length) openChat(chats[0].id);
      else newChat();
      return;
    }
    paintRecent();
  }

  function paintRecent() {
    if (!recentEl) return;
    recentEl.innerHTML = "";
    chats.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "kry-ai__chip-row" + (c.id === activeId ? " kry-ai__chip-row--on" : "");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kry-ai__chip" + (c.id === activeId ? " kry-ai__chip--on" : "");
      btn.textContent = c.title || "chat";
      btn.addEventListener("click", function () {
        openChat(c.id);
      });
      var x = document.createElement("button");
      x.type = "button";
      x.className = "kry-ai__chip-x";
      x.setAttribute("aria-label", "Close chat");
      x.textContent = "×";
      x.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeChat(c.id);
      });
      row.appendChild(btn);
      row.appendChild(x);
      recentEl.appendChild(row);
    });
  }

  function setHero(on) {
    if (heroEl) heroEl.hidden = !on;
    if (logEl) {
      if (on) logEl.setAttribute("hidden", "");
      else logEl.removeAttribute("hidden");
    }
  }

  function mkUserBubble(text) {
    var row = document.createElement("div");
    row.className = "kry-ai__row kry-ai__row--user";
    var bubble = document.createElement("div");
    bubble.className = "kry-ai__bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    return row;
  }

  function mkAssistantCard(item, idx) {
    var wrap = document.createElement("div");
    wrap.className = "kry-ai__row kry-ai__row--assistant";
    var card = document.createElement("div");
    card.className = "kry-ai__card";

    var reasonText = String(item.reasoning || "").trim();
    if (reasonText) {
      var reason = document.createElement("button");
      reason.type = "button";
      reason.className = "kry-ai__reason";
      reason.setAttribute("aria-expanded", "false");
      reason.innerHTML =
        '<span class="kry-ai__reason-left"><span class="kry-ai__reason-ico" aria-hidden="true">💡</span> Reasoning</span><span class="kry-ai__reason-chev" aria-hidden="true">▾</span>';
      var reasonBody = document.createElement("div");
      reasonBody.className = "kry-ai__reason-body";
      reasonBody.hidden = true;
      reasonBody.textContent = reasonText;
      reason.addEventListener("click", function () {
        var open = reasonBody.hidden;
        reasonBody.hidden = !open;
        reason.setAttribute("aria-expanded", open ? "true" : "false");
        reason.classList.toggle("kry-ai__reason--open", open);
      });
      card.appendChild(reason);
      card.appendChild(reasonBody);
    }

    var bubble = document.createElement("div");
    bubble.className = "kry-ai__bubble kry-ai__bubble--assist";
    bubble.textContent = item.content || "";
    card.appendChild(bubble);

    var actions = document.createElement("div");
    actions.className = "kry-ai__actions";
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "kry-ai__icon-btn";
    copyBtn.title = "Copy";
    copyBtn.setAttribute("aria-label", "Copy");
    copyBtn.textContent = "⧉";
    copyBtn.addEventListener("click", function () {
      var t = String(item.content || "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).catch(function () {});
      }
      status("copied", true);
      setTimeout(function () {
        status("", false);
      }, 900);
    });
    var regenBtn = document.createElement("button");
    regenBtn.type = "button";
    regenBtn.className = "kry-ai__icon-btn";
    regenBtn.title = "Regenerate";
    regenBtn.setAttribute("aria-label", "Regenerate");
    regenBtn.textContent = "↺";
    regenBtn.addEventListener("click", function () {
      regenAt(idx);
    });
    actions.append(copyBtn, regenBtn);
    card.appendChild(actions);

    if (item.meta) {
      var meta = document.createElement("p");
      meta.className = "kry-ai__meta";
      meta.textContent = fmtMeta(item.meta);
      card.appendChild(meta);
    }

    wrap.appendChild(card);
    return wrap;
  }

  function paintLog() {
    if (!logEl) return;
    logEl.innerHTML = "";
    messages.forEach(function (m, idx) {
      if (m.role === "user") logEl.appendChild(mkUserBubble(m.content));
      else logEl.appendChild(mkAssistantCard(m, idx));
    });
    logEl.scrollTop = logEl.scrollHeight;
    setHero(!messages.length);
  }

  function syncActive() {
    if (!activeId) return;
    var hit = null;
    for (var i = 0; i < chats.length; i++) {
      if (chats[i].id === activeId) {
        hit = chats[i];
        break;
      }
    }
    if (!hit) {
      hit = { id: activeId, title: titleOf(messages), messages: messages.slice(), updated: Date.now() };
      chats.unshift(hit);
    } else {
      hit.messages = messages.slice();
      hit.title = titleOf(messages);
      hit.updated = Date.now();
    }
    chats.sort(function (a, b) {
      return (b.updated || 0) - (a.updated || 0);
    });
    saveStore();
    paintRecent();
  }

  function openChat(id) {
    var hit = null;
    for (var i = 0; i < chats.length; i++) {
      if (chats[i].id === id) {
        hit = chats[i];
        break;
      }
    }
    if (!hit) return;
    activeId = hit.id;
    messages = (hit.messages || []).slice();
    paintLog();
    paintRecent();
  }

  function newChat() {
    activeId = yeet();
    messages = [];
    attachNote = "";
    paintLog();
    paintRecent();
    if (inputEl) inputEl.focus();
  }

  function status(text, show) {
    if (!statusEl) return;
    statusEl.hidden = !show;
    statusEl.textContent = text || "";
  }

  function paintModelBtn() {
    if (modelLabel) modelLabel.textContent = model;
  }

  function paintModelMenu() {
    if (!modelMenu) return;
    modelMenu.innerHTML = "";
    var groups = {};
    MODELS.forEach(function (m) {
      if (!groups[m.group]) groups[m.group] = [];
      groups[m.group].push(m);
    });
    Object.keys(groups).forEach(function (g) {
      var head = document.createElement("p");
      head.className = "kry-ai__model-group";
      head.textContent = g;
      modelMenu.appendChild(head);
      groups[g].forEach(function (m) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kry-ai__model-item" + (m.id === model ? " kry-ai__model-item--on" : "");
        btn.textContent = m.label;
        btn.addEventListener("click", function () {
          model = m.id;
          paintModelBtn();
          paintModelMenu();
          saveStore();
          closeModel();
        });
        modelMenu.appendChild(btn);
      });
    });
  }

  function openModel() {
    if (!modelMenu || !modelBtn) return;
    paintModelMenu();
    modelMenu.hidden = false;
    modelBtn.setAttribute("aria-expanded", "true");
  }

  function closeModel() {
    if (!modelMenu || !modelBtn) return;
    modelMenu.hidden = true;
    modelBtn.setAttribute("aria-expanded", "false");
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

  function apiChat(payloadMsgs) {
    return fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "krying",
        model: model,
        messages: payloadMsgs.slice(-20).map(function (m) {
          return { role: m.role, content: m.content };
        }),
      }),
    }).then(function (res) {
      return res.json().then(
        function (data) {
          return { ok: res.ok, status: res.status, data: data };
        },
        function () {
          return { ok: false, status: res.status, data: { error: "bad response" } };
        }
      );
    });
  }

  function approxTok(msgs, reply) {
    var n = String(reply || "").length;
    (msgs || []).forEach(function (m) {
      n += String((m && m.content) || "").length;
    });
    return Math.max(1, Math.round(n / 4));
  }

  function browserChat(payloadMsgs) {
    var t0 = Date.now();
    var ttft = 0;
    return fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: payloadMsgs.slice(-12).map(function (m) {
          return { role: m.role, content: String(m.content || "").slice(0, 4000) };
        }),
        temperature: 0.7,
      }),
    }).then(function (res) {
      if (!ttft) ttft = Date.now() - t0;
      return res.text().then(function (text) {
        var json = null;
        try {
          json = JSON.parse(text);
        } catch (e) {}
        var reply = extractReply(json, text);
        var usage = json && json.usage ? json.usage : null;
        var tokens =
          (usage &&
            (Number(usage.total_tokens || 0) ||
              Number(usage.completion_tokens || 0) + Number(usage.prompt_tokens || 0))) ||
          approxTok(payloadMsgs, reply);
        return {
          ok: !!(res.ok && reply),
          status: res.status,
          data: {
            reply: reply || "",
            reasoning: "",
            meta: {
              backend: "browser-pollinations",
              elapsedMs: Date.now() - t0,
              ttftMs: ttft || Date.now() - t0,
              tokens: tokens,
            },
          },
        };
      });
    });
  }

  function runChat(payloadMsgs) {
    var cdn = window.spBase && window.spBase.isCdn && window.spBase.isCdn();
    if (cdn) return browserChat(payloadMsgs);
    return apiChat(payloadMsgs).then(function (out) {
      if (out.ok && out.data && out.data.reply) return out;
      if (out.status === 429 && out.data && !out.data.clientFallback) return out;
      return browserChat(payloadMsgs).then(function (fallback) {
        if (fallback.ok && fallback.data && fallback.data.reply) return fallback;
        return out;
      });
    });
  }

  function send() {
    if (busy || !inputEl) return;
    var text = inputEl.value.trim();
    if (!text && !attachNote) return;
    if (attachNote) {
      text = (text ? text + "\n\n" : "") + attachNote;
      attachNote = "";
    }
    if (!activeId) activeId = yeet();
    busy = true;
    if (sendBtn) sendBtn.disabled = true;
    status("thinking…", true);
    messages.push({ role: "user", content: text });
    paintLog();
    syncActive();
    inputEl.value = "";
    runChat(messages)
      .then(function (out) {
        if (!out.ok || !out.data || !out.data.reply) {
          messages.push({
            role: "assistant",
            content: "something went wrong, report it to the website manager pls&ty :)",
            reasoning: "",
            meta: null,
          });
        } else {
          messages.push({
            role: "assistant",
            content: String(out.data.reply),
            reasoning: String(out.data.reasoning || ""),
            meta: out.data.meta || null,
          });
        }
        paintLog();
        syncActive();
        status("", false);
      })
      .catch(function () {
        messages.push({
          role: "assistant",
          content: "something went wrong, report it to the website manager pls&ty :)",
          reasoning: "",
          meta: null,
        });
        paintLog();
        syncActive();
        status("", false);
      })
      .finally(function () {
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
      });
  }

  function regenAt(idx) {
    if (busy) return;
    if (!messages[idx] || messages[idx].role !== "assistant") return;
    var keep = messages.slice(0, idx);
    if (!keep.length || keep[keep.length - 1].role !== "user") return;
    busy = true;
    if (sendBtn) sendBtn.disabled = true;
    status("thinking…", true);
    messages = keep;
    paintLog();
    runChat(messages)
      .then(function (out) {
        if (!out.ok || !out.data || !out.data.reply) {
          messages.push({
            role: "assistant",
            content: "something went wrong, report it to the website manager pls&ty :)",
            reasoning: "",
            meta: null,
          });
        } else {
          messages.push({
            role: "assistant",
            content: String(out.data.reply),
            reasoning: String(out.data.reasoning || ""),
            meta: out.data.meta || null,
          });
        }
        paintLog();
        syncActive();
        status("", false);
      })
      .catch(function () {
        messages.push({
          role: "assistant",
          content: "something went wrong, report it to the website manager pls&ty :)",
          reasoning: "",
          meta: null,
        });
        paintLog();
        syncActive();
        status("", false);
      })
      .finally(function () {
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
      });
  }

  function killShareStream() {
    if (shareStream) {
      shareStream.getTracks().forEach(function (t) {
        try {
          t.stop();
        } catch (e) {}
      });
    }
    shareStream = null;
    try {
      window.__kryShareStream = null;
    } catch (e2) {}
  }

  function shareHref() {
    var href = "/ai-share.html?v=8&t=" + Date.now();
    try {
      href = new URL(href, window.location.origin).toString();
    } catch (e) {}
    return href;
  }

  function openSharePopup() {
    var href = shareHref();
    var w = 380;
    var h = 620;
    var left = Math.max(0, Math.round((window.screen.availWidth || 1400) - w - 28));
    var top = Math.max(40, Math.round(((window.screen.availHeight || 1000) - h) / 2));
    var feats =
      "popup=yes,width=" +
      w +
      ",height=" +
      h +
      ",left=" +
      left +
      ",top=" +
      top +
      ",menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes";
    shareWin = window.open(href, "kryAiShare", feats);
    if (shareWin) {
      try {
        shareWin.location.href = href;
      } catch (e) {}
    }
    return shareWin;
  }

  function pushShareToWin(win, stream) {
    if (!win || win.closed || !stream) return false;
    try {
      if (typeof win.__kryAttachShare === "function") {
        win.__kryAttachShare(stream);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function keepPushing(win, stream) {
    if (pushShareToWin(win, stream)) return;
    var n = 0;
    var iv = setInterval(function () {
      n += 1;
      if (pushShareToWin(win, stream) || n > 60) clearInterval(iv);
    }, 40);
  }

  function openShareAfterPick(stream) {
    killShareStream();
    shareStream = stream;
    window.__kryShareStream = stream;
    var track = stream.getVideoTracks()[0];
    if (track) {
      track.addEventListener("ended", function () {
        killShareStream();
        try {
          if (shareWin && !shareWin.closed) shareWin.close();
        } catch (e) {}
      });
    }

    function finish(win) {
      if (!win) {
        killShareStream();
        status("allow the popup so chat can float", true);
        setTimeout(function () {
          status("", false);
        }, 2400);
        return;
      }
      shareWin = win;
      keepPushing(win, stream);
      try {
        win.focus();
      } catch (e2) {}
      status("screenshare ready", true);
      setTimeout(function () {
        status("", false);
      }, 1200);
    }

    if (window.documentPictureInPicture && typeof window.documentPictureInPicture.requestWindow === "function") {
      window.documentPictureInPicture
        .requestWindow({ width: 380, height: 620 })
        .then(function (pip) {
          try {
            pip.document.documentElement.style.height = "100%";
            pip.document.body.style.cssText = "margin:0;height:100%;overflow:hidden;background:#07090c;";
            var frame = pip.document.createElement("iframe");
            frame.src = shareHref();
            frame.setAttribute("allow", "display-capture");
            frame.style.cssText = "border:0;width:100%;height:100%;display:block;";
            pip.document.body.appendChild(frame);
            frame.onload = function () {
              try {
                if (frame.contentWindow) keepPushing(frame.contentWindow, stream);
              } catch (e4) {}
            };
          } catch (e5) {}
          finish(pip);
        })
        .catch(function () {
          finish(openSharePopup());
        });
      return;
    }
    finish(openSharePopup());
  }

  function doShare() {
    try {
      if (shareWin && !shareWin.closed) {
        shareWin.focus();
        return;
      }
    } catch (e0) {}
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      status("screenshare not supported here", true);
      setTimeout(function () {
        status("", false);
      }, 1800);
      return;
    }
    status("pick what to share…", true);
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          frameRate: { ideal: 12, max: 20 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        monitorTypeSurfaces: "include",
      })
      .then(function (stream) {
        openShareAfterPick(stream);
      })
      .catch(function () {
        killShareStream();
        status("", false);
      });
  }

  function bootUi() {
    loadStore();
    paintModelBtn();
    paintModelMenu();
    if (chats.length) openChat(chats[0].id);
    else newChat();
  }

  function render() {
    if (!panel) return;
    bootUi();
  }

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (window.spApp && typeof window.spApp.flipVw === "function") window.spApp.flipVw("home");
      else if (window.spBase && window.spBase.setHash) window.spBase.setHash("home");
      else location.hash = "home";
    });
  }
  if (newBtn) newBtn.addEventListener("click", newChat);
  if (shareBtn) shareBtn.addEventListener("click", doShare);
  if (sendBtn) sendBtn.addEventListener("click", send);
  if (plusBtn && fileEl) {
    plusBtn.addEventListener("click", function () {
      fileEl.click();
    });
    fileEl.addEventListener("change", function () {
      var f = fileEl.files && fileEl.files[0];
      if (!f) return;
      if (f.type.indexOf("image/") === 0) {
        attachNote = "[attached image: " + f.name + "]";
        status("image ready for next ask", true);
      } else {
        var reader = new FileReader();
        reader.onload = function () {
          var txt = String(reader.result || "").slice(0, 6000);
          attachNote = "[attached file " + f.name + "]\n" + txt;
          status("file ready for next ask", true);
        };
        reader.readAsText(f);
      }
      fileEl.value = "";
      setTimeout(function () {
        status("", false);
      }, 1600);
    });
  }
  if (modelBtn) {
    modelBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (modelMenu && modelMenu.hidden) openModel();
      else closeModel();
    });
  }
  document.addEventListener("click", function (e) {
    if (!modelMenu || modelMenu.hidden) return;
    if (modelMenu.contains(e.target) || (modelBtn && modelBtn.contains(e.target))) return;
    closeModel();
  });
  if (inputEl) {
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  window.spAi = { render: render, send: send };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootUi);
  else bootUi();
})();
