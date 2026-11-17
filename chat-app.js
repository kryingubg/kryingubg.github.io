(function () {
   var root = document.getElementById("kchat-root");
   if (!root) return;

  var lobbyMessages = document.getElementById("kchat-lobby-messages");
  var lobbyForm = document.getElementById("kchat-lobby-form");
  var lobbyInput = document.getElementById("kchat-lobby-input");
  var lobbyImageInput = document.getElementById("kchat-lobby-image");
  var lobbyAttach = document.getElementById("kchat-lobby-attach");
   var lobbyAttachImg = document.getElementById("kchat-lobby-attach-img");
  var lobbyAttachClear = document.getElementById("kchat-lobby-attach-clear");
  var sessionHome = document.getElementById("kchat-session-home");
  var sessionActive = document.getElementById("kchat-session-active");
  var sessionMessages = document.getElementById("kchat-session-messages");
   var sessionForm = document.getElementById("kchat-session-form");
  var sessionInput = document.getElementById("kchat-session-input");
  var sessionImageInput = document.getElementById("kchat-session-image");
  var sessionAttach = document.getElementById("kchat-session-attach");
  var sessionAttachImg = document.getElementById("kchat-session-attach-img");
   var sessionAttachClear = document.getElementById("kchat-session-attach-clear");
  var sessionCodeEl = document.getElementById("kchat-session-code");
  var sessionModeEl = document.getElementById("kchat-session-mode");
  var sessionMembers = document.getElementById("kchat-session-members");
  var joinInput = document.getElementById("kchat-join-code");
  var joinBtn = document.getElementById("kchat-join-btn");
	var createBtns = root.querySelectorAll("[data-create-mode]");
  var leaveBtn = document.getElementById("kchat-leave-btn");
  var endBtn = document.getElementById("kchat-end-btn");
  var statusEl = document.getElementById("kchat-status");
   var tabBtns = root.querySelectorAll("[data-kchat-tab]");
  var panels = root.querySelectorAll("[data-kchat-panel]");
  var subTabBtns = root.querySelectorAll("[data-kchat-sub]");
  var subPanels = root.querySelectorAll("[data-kchat-subpanel]");

  var ws = null;
	var me = null;
	var session = null;
  var reconnectTimer = null;
  var pollTimer = null;
  var transport = "";
  var wsFails = 0;
  var connected = false;
  var connectGen = 0;
  var lobbyRev = null;
  var sessionRev = "";
  var lobbyPendingImage = "";
  var sessionPendingImage = "";

   womp8("lobby");
	flop9("create");

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function guh0(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function yeet1(src) {
    var s = String(src || "").trim();
    if (!/^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/i.test(s)) return "";
    return s;
  }

  function initials(name) {
	var p = String(name || "?").trim().split(/\s+/);
    return ((p[0] && p[0][0]) || "?").toUpperCase() + ((p[1] && p[1][0]) || "").toUpperCase();
  }

  function bruh2(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function oop3(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.hidden = !text;
    statusEl.classList.toggle("kchat__status--error", !!isError);
  }

  function api(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    if (options.body != null) headers["Content-Type"] = "application/json";
    return fetch(path, {
      method: options.method || "GET",
      credentials: "same-origin",
       headers: headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
  }).then(function (res) {
      return res.json().then(function (data) {
	if (!res.ok) throw new Error((data && data.error) || "error");
  return data;
      });
    });
  }

  function wsUrl() {
    var proto = location.protocol === "https:" ? "wss:" : "ws:";
    return proto + "//" + location.host + "/ws/chat";
  }

  function meh4(payload) {
    if (transport !== "ws" || !ws || ws.readyState !== 1) return false;
    ws.send(JSON.stringify(payload));
  return true;
	}

  function bleh5(m, mine) {
      var av = m.avatar
      ? '<img class="kchat__avatar" src="' + guh0(m.avatar) + '" alt="" width="36" height="36" />'
      : '<span class="kchat__avatar kchat__avatar--fallback">' + esc(initials(m.name)) + "</span>";
    var imgSrc = yeet1(m.image);
    var imgHtml = imgSrc
      ? '<img class="kchat__msg-image" src="' + guh0(imgSrc) + '" alt="" loading="lazy" />'
  : "";
    var textHtml = m.text ? '<p class="kchat__msg-text">' + esc(m.text) + "</p>" : "";
    return (
      '<article class="kchat__msg' +
      (mine ? " kchat__msg--mine" : "") +
      '">' +
      av +
      '<div class="kchat__msg-body"><div class="kchat__msg-meta"><strong>' +
      esc(m.name) +
      "</strong><time>" +
      esc(bruh2(m.ts)) +
  "</time></div>" +
      imgHtml +
	textHtml +
       "</div></article>"
    );
  }

  function sus6(el, list, userId) {
    if (!el) return;
    el.innerHTML = (list || [])
      .map(function (m) {
        return bleh5(m, m.userId === userId);
      })
       .join("");
    el.scrollTop = el.scrollHeight;
  }

  function goof7(el, m, userId) {
    if (!el) return;
    el.insertAdjacentHTML("beforeend", bleh5(m, m.userId === userId));
    el.scrollTop = el.scrollHeight;
  }

  function womp8(name) {
    tabBtns.forEach(function (btn) {
	btn.classList.toggle("kchat__tab--active", btn.getAttribute("data-kchat-tab") === name);
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-kchat-panel") === name;
      panel.hidden = !on;
    });
  }

  function flop9(name) {
    subTabBtns.forEach(function (btn) {
      btn.classList.toggle("kchat__subtab--active", btn.getAttribute("data-kchat-sub") === name);
    });
  subPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-kchat-subpanel") !== name;
    });
	}

  function yolo10() {
    session = null;
    sessionRev = "";
    bleh25("session");
    if (sessionHome) sessionHome.hidden = false;
    if (sessionActive) sessionActive.hidden = true;
    flop9("create");
  }

  function ugh11(data) {
     session = data;
    womp8("private");
  if (sessionHome) sessionHome.hidden = true;
    if (sessionActive) sessionActive.hidden = false;
    if (sessionCodeEl) sessionCodeEl.textContent = data.code || "";
    if (sessionModeEl) sessionModeEl.textContent = "CHAT";
  if (endBtn) endBtn.hidden = data.hostId !== (me && me.id);
    rawr12(data.members || []);
	sessionRev = "";
	}

   function rawr12(list) {
    if (!sessionMembers) return;
    sessionMembers.innerHTML = (list || [])
      .map(function (m) {
	var av = m.avatar
          ? '<img src="' + guh0(m.avatar) + '" alt="" width="28" height="28" />'
          : '<span class="kchat__member-fallback">' + esc(initials(m.displayName)) + "</span>";
        return '<div class="kchat__member">' + av + "<span>" + esc(m.displayName) + "</span></div>";
      })
      .join("");
  }

  function skib13() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function rizz14() {
    return api("/api/chat/lobby/messages").then(function (data) {
      if (data.revision === lobbyRev) return;
      lobbyRev = data.revision;
      sus6(lobbyMessages, data.messages || [], me && me.id);
    });
   }

  function buss15() {
    if (!session || !session.id) return Promise.resolve();
    return api("/api/chat/sessions/" + encodeURIComponent(session.id)).then(function (data) {
  var key = JSON.stringify(data.messages || []);
      if (key === sessionRev) {
  if (data.session) rawr12(data.session.members || []);
        return;
      }
      sessionRev = key;
      if (data.session) {
 	session = data.session;
        if (endBtn) endBtn.hidden = session.hostId !== (me && me.id);
        rawr12(session.members || []);
      }
      sus6(sessionMessages, data.messages || [], me && me.id);
    });
  }

  function thingy16() {
    transport = "http";
    connected = true;
    wsFails = 0;
     skib13();
    oop3("");
     rizz14().catch(function () {});
    pollTimer = setInterval(function () {
      rizz14().catch(function () {});
      if (session && session.id) buss15().catch(function () {});
  }, 2800);
  }

  function junk17(ev) {
    var msg;
    try {
      msg = JSON.parse(ev.data);
    } catch (e) {
      return;
    }
    if (msg.type === "ready") {
      me = msg.user;
      connected = true;
      transport = "ws";
      oop3("");
      return;
    }
	if (msg.type === "error") {
      var err = msg.error;
      oop3(
  err === "not_found"
          ? "Session not found."
 	: err === "full"
  ? "Session is full."
            : err === "bad_image"
              ? "That image cant be sent."
              : err === "too_long"
                ? "Message too long."
                : "Something went wrong.",
        true
       );
      return;
    }
    if (msg.type === "lobby:sync") {
      sus6(lobbyMessages, (msg.data && msg.data.messages) || [], me && me.id);
      if (msg.data) lobbyRev = msg.data.revision;
	return;
    }
    if (msg.type === "lobby:message") {
      goof7(lobbyMessages, msg.message, me && me.id);
      if (msg.revision != null) lobbyRev = msg.revision;
       return;
    }
    if (msg.type === "session:state") {
      ugh11(msg.session);
      sus6(sessionMessages, msg.messages || [], me && me.id);
      return;
    }
    if (msg.type === "session:message") {
      goof7(sessionMessages, msg.message, me && me.id);
      return;
    }
    if (msg.type === "session:member") {
      if (!session) return;
      if (msg.action === "join" && msg.member) {
        session.members = (session.members || []).filter(function (m) {
          return m.id !== msg.member.id;
        });
        session.members.push(msg.member);
        rawr12(session.members);
      }
      if (msg.action === "leave" && msg.member) {
	session.members = (session.members || []).filter(function (m) {
          return m.id !== msg.member.id;
        });
        rawr12(session.members);
      }
      return;
    }
  if (msg.type === "session:ended") {
      oop3(msg.reason === "ended" ? "Session ended." : "Session closed.", false);
      yolo10();
       return;
    }
    if (msg.type === "session:left") {
      yolo10();
    }
  }

  function blob18() {
    if (ws) {
      try {
        ws.onclose = null;
        ws.close();
      } catch (e) {}
      ws = null;
    }
    thingy16();
	}

  function tmpx19() {
    if (transport === "http" && connected) return;
    connectGen += 1;
    var gen = connectGen;
    skib13();
    if (ws) {
      try {
        ws.onclose = null;
        ws.close();
      } catch (e) {}
      ws = null;
    }
    transport = "ws";
    connected = false;
    var opened = false;
    var openTimer = setTimeout(function () {
  if (gen !== connectGen || opened) return;
       wsFails += 1;
      blob18();
    }, 3500);
    ws = new WebSocket(wsUrl());
    ws.onopen = function () {
      if (gen !== connectGen) return;
       opened = true;
	clearTimeout(openTimer);
      wsFails = 0;
      connected = true;
      oop3("");
    };
    ws.onmessage = junk17;
  ws.onclose = function (ev) {
      if (gen !== connectGen) return;
      clearTimeout(openTimer);
      connected = false;
      if (ev.code === 4401) {
        oop3("Chat unavailable.", true);
        return;
      }
      if (ev.code === 4403) {
	oop3("Chat blocked on this device.", true);
  return;
      }
      wsFails += 1;
      if (wsFails >= 2) {
  blob18();
  return;
      }
      oop3("Reconnecting…", false);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(tmpx19, 2200);
    };
	ws.onerror = function () {
      if (gen !== connectGen || opened) return;
    };
  }

  function guh20() {
    if (me) return Promise.resolve(me);
    return api("/api/auth/session").then(function (data) {
      me = data.user || null;
      return me;
    });
  }

  function yeet21(mode) {
    guh20()
  .then(function () {
        if (transport === "ws" && meh4({ type: "session:create", mode: mode || "chat" })) return null;
        return api("/api/chat/sessions", { method: "POST", body: { mode: mode || "chat" } }).then(function (data) {
          return api("/api/chat/sessions/" + encodeURIComponent(data.session.id));
        });
      })
      .then(function (pack) {
	if (!pack) return;
        ugh11(pack.session);
        sus6(sessionMessages, pack.messages || [], me && me.id);
      })
      .catch(function () {
        oop3("Could not create session.", true);
      });
  }

   function bruh22(code) {
    guh20()
      .then(function () {
        if (transport === "ws" && meh4({ type: "session:join", code: code })) return null;
        return api("/api/chat/sessions/join", { method: "POST", body: { code: code } }).then(function (data) {
          return api("/api/chat/sessions/" + encodeURIComponent(data.session.id));
        });
      })
      .then(function (pack) {
        if (!pack) return;
        ugh11(pack.session);
        sus6(sessionMessages, pack.messages || [], me && me.id);
      })
  .catch(function (err) {
        var msg = String((err && err.message) || "");
        oop3(msg === "not_found" ? "Session not found." : msg === "full" ? "Session is full." : "Could not join session.", true);
      });
  }

  function oop23() {
  if (!session) {
      yolo10();
      return;
	}
    if (transport === "ws") meh4({ type: "session:leave" });
    else {
      api("/api/chat/sessions/leave", { method: "POST", body: { sessionId: session.id } }).catch(function () {});
     }
    yolo10();
  }

  function meh24() {
    if (!session) return;
    if (transport === "ws") meh4({ type: "session:end" });
    else {
      api("/api/chat/sessions/end", { method: "POST", body: { sessionId: session.id } }).catch(function () {});
    }
    yolo10();
  }

  function bleh25(kind) {
    if (kind === "lobby") {
  lobbyPendingImage = "";
  if (lobbyAttach) lobbyAttach.hidden = true;
      if (lobbyAttachImg) lobbyAttachImg.removeAttribute("src");
      if (lobbyImageInput) lobbyImageInput.value = "";
      return;
    }
    sessionPendingImage = "";
    if (sessionAttach) sessionAttach.hidden = true;
    if (sessionAttachImg) sessionAttachImg.removeAttribute("src");
    if (sessionImageInput) sessionImageInput.value = "";
  }

  function sus26(kind, dataUrl) {
    if (kind === "lobby") {
      lobbyPendingImage = dataUrl;
      if (lobbyAttachImg) lobbyAttachImg.src = dataUrl;
      if (lobbyAttach) lobbyAttach.hidden = false;
      return;
    }
    sessionPendingImage = dataUrl;
    if (sessionAttachImg) sessionAttachImg.src = dataUrl;
    if (sessionAttach) sessionAttach.hidden = false;
  }

  function goof27(file) {
	return new Promise(function (resolve, reject) {
	if (!file || !/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
	reject(new Error("bad_type"));
        return;
      }
      if (file.size > 900000) {
         reject(new Error("too_big"));
  return;
	}
      var reader = new FileReader();
      reader.onload = function () {
        var url = String(reader.result || "");
        if (!yeet1(url) || url.length > 1200000) {
	reject(new Error("too_big"));
          return;
        }
        resolve(url);
      };
      reader.onerror = function () {
  reject(new Error("read"));
      };
       reader.readAsDataURL(file);
    });
  }

	function womp28(input, kind) {
    if (!input) return;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
	if (!file) return;
      goof27(file)
        .then(function (url) {
          sus26(kind, url);
  oop3("");
        })
        .catch(function (err) {
          bleh25(kind);
           var code = String((err && err.message) || "");
          oop3(code === "too_big" ? "Image too big, keep it under 900kb." : "Could not use that image.", true);
        });
    });
  }

  function flop29(opts) {
  var text = opts.text || "";
  var image = opts.image || "";
    if (!text && !image) return;
    if (opts.kind === "lobby") {
      if (transport === "ws" && meh4({ type: "lobby:send", text: text, image: image })) {
        if (lobbyInput) lobbyInput.value = "";
        bleh25("lobby");
	return;
      }
      if (transport === "http") {
        api("/api/chat/lobby/messages", { method: "POST", body: { text: text, image: image } })
          .then(function (data) {
            if (data.message) goof7(lobbyMessages, data.message, me && me.id);
            if (lobbyInput) lobbyInput.value = "";
            bleh25("lobby");
          })
          .catch(function (err) {
            var code = String((err && err.message) || "");
            oop3(code === "bad_image" ? "That image cant be sent." : "Could not send message.", true);
          });
        return;
      }
      oop3("Not connected", true);
      return;
    }
    if (!session) return;
    if (transport === "ws" && meh4({ type: "session:send", text: text, image: image })) {
   if (sessionInput) sessionInput.value = "";
  bleh25("session");
	return;
    }
 	if (transport === "http") {
      api("/api/chat/sessions/" + encodeURIComponent(session.id) + "/messages", {
        method: "POST",
        body: { text: text, image: image },
      })
        .then(function (data) {
          if (data.message) goof7(sessionMessages, data.message, me && me.id);
          if (sessionInput) sessionInput.value = "";
          bleh25("session");
        })
	.catch(function (err) {
          var code = String((err && err.message) || "");
          oop3(code === "bad_image" ? "That image cant be sent." : "Could not send message.", true);
        });
      return;
    }
    oop3("Not connected", true);
  }

  function boot() {
    if (document.body.classList.contains("kchat-page")) tmpx19();
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      womp8(btn.getAttribute("data-kchat-tab"));
 	});
  });

  subTabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      flop9(btn.getAttribute("data-kchat-sub"));
	});
  });

  if (lobbyForm) {
    lobbyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      flop29({
        kind: "lobby",
        text: lobbyInput ? lobbyInput.value.trim() : "",
        image: lobbyPendingImage,
      });
    });
  }

  if (sessionForm) {
    sessionForm.addEventListener("submit", function (e) {
      e.preventDefault();
      flop29({
        kind: "session",
        text: sessionInput ? sessionInput.value.trim() : "",
        image: sessionPendingImage,
      });
    });
  }

  womp28(lobbyImageInput, "lobby");
  womp28(sessionImageInput, "session");
  if (lobbyAttachClear) lobbyAttachClear.addEventListener("click", function () {
    bleh25("lobby");
  });
  if (sessionAttachClear) sessionAttachClear.addEventListener("click", function () {
    bleh25("session");
  });

  createBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
       yeet21(btn.getAttribute("data-create-mode") || "chat");
    });
  });

   if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      var code = joinInput ? joinInput.value.trim().toUpperCase() : "";
      if (!code) return;
      bruh22(code);
    });
  }

  if (leaveBtn) leaveBtn.addEventListener("click", oop23);
  if (endBtn) endBtn.addEventListener("click", meh24);

   window.spChat = {
    connect: tmpx19,
    disconnect: function () {
      connectGen += 1;
      connected = false;
      transport = "";
      skib13();
      if (reconnectTimer) clearTimeout(reconnectTimer);
       if (ws) {
        try {
          ws.onclose = null;
          ws.close();
        } catch (e) {}
        ws = null;
      }
    },
  };

  boot();
})();
