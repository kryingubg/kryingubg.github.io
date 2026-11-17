(function () {
  var state = { user: null, authed: false, guest: true, ready: true };

  function emit() {
    window.dispatchEvent(
      new CustomEvent("sp-auth", { detail: { user: null, authed: false, guest: true } })
    );
  }

  function api(path, options) {
    options = options || {};
    return fetch(path, {
      method: options.method || "GET",
      credentials: "same-origin",
      headers: Object.assign({ "Content-Type": "application/json" }, options.headers || {}),
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
        if (!res.ok) {
          var err = new Error(data.error || "request_failed");
          err.code = data.error;
          err.status = res.status;
          throw err;
        }
        return data;
      });
      })
      .catch(function (err) {
      if (err && err.status) throw err;
      var net = new Error("network_error");
      net.code = "network_error";
      throw net;
    });
  }

  window.spAuth = {
    refresh: function () {
      return Promise.resolve({ authed: false, guest: true, user: null });
    },
    login: function () {
      return Promise.reject(Object.assign(new Error("accounts_disabled"), { code: "accounts_disabled" }));
    },
    logout: function () {
      return Promise.resolve();
    },
    register: function () {
      return Promise.reject(Object.assign(new Error("signup_closed"), { code: "signup_closed" }));
    },
    updateProfile: function () {
      return Promise.reject(Object.assign(new Error("closed"), { code: "closed" }));
    },
    getUser: function () {
      return null;
    },
    isLoggedIn: function () {
      return false;
    },
    isGuest: function () {
      return true;
    },
    ready: function () {
      return true;
    },
    whenReady: function () {
      return Promise.resolve(state);
    },
    hasGuestVisit: function () {
      return true;
    },
    setGuestMode: function () {},
    markGuestVisit: function () {},
    showGate: function () {},
    siteBooted: true,
    _api: api,
  };

  emit();
})();
