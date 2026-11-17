(function () {
  var XHTML_NS = "http://www.w3.org/1999/xhtml";
  var root = document.querySelector("foreignObject").firstElementChild;
  var originalCreateElement = document.createElement.bind(document);
  var originalCreateElementNS = document.createElementNS.bind(document);
  Object.defineProperty(document, "head", {
    get: function () {
      return root.querySelector("head");
    },
    configurable: true,
  });
  Object.defineProperty(document, "body", {
    get: function () {
      return root.querySelector("body");
    },
    configurable: true,
  });
  Object.defineProperty(document, "documentElement", {
    get: function () {
      return root;
    },
    configurable: true,
  });
  document.createElement = function (tagName, options) {
    if (typeof tagName === "string") {
      return originalCreateElementNS(XHTML_NS, tagName, options);
    }
    return originalCreateElement(tagName, options);
  };
  document.createElementNS = function (namespaceURI, qualifiedName, options) {
    if (namespaceURI == null || namespaceURI === XHTML_NS) {
      return originalCreateElementNS(XHTML_NS, qualifiedName, options);
    }
    return originalCreateElementNS(namespaceURI, qualifiedName, options);
  };

  function pkgDir() {
    var p = String(location.pathname || "/");
    return p.replace(/[^/]+$/, "") || "/";
  }

  function abs(u) {
    u = String(u || "");
    if (!u || /^https?:\/\//i.test(u) || /^data:/i.test(u) || /^blob:/i.test(u) || /^\/\//.test(u)) return u;
    try {
      return new URL(u, location.origin + pkgDir()).href;
    } catch (e) {
      return u;
    }
  }

  function rePatch() {
    var boot = document.createElement("script");
    boot.textContent =
      "(function(){var XHTML_NS='http://www.w3.org/1999/xhtml';var root=document.querySelector('foreignObject').firstElementChild;var originalCreateElement=document.createElement.bind(document);var originalCreateElementNS=document.createElementNS.bind(document);Object.defineProperty(document,'head',{get:function(){return root.querySelector('head')},configurable:true});Object.defineProperty(document,'body',{get:function(){return root.querySelector('body')},configurable:true});Object.defineProperty(document,'documentElement',{get:function(){return root},configurable:true});document.createElement=function(tagName,options){if(typeof tagName==='string'){return originalCreateElementNS(XHTML_NS,tagName,options)}return originalCreateElement(tagName,options)};document.createElementNS=function(namespaceURI,qualifiedName,options){if(namespaceURI==null||namespaceURI===XHTML_NS){return originalCreateElementNS(XHTML_NS,qualifiedName,options)}return originalCreateElementNS(namespaceURI,qualifiedName,options)};})();";
    return boot;
  }

  function moveKids(from, to, runScripts) {
    var kids = Array.prototype.slice.call(from.childNodes || []);
    kids.forEach(function (node) {
      if (node.nodeType !== 1) {
        to.appendChild(document.importNode(node, true));
        return;
      }
      var tag = String(node.tagName || "").toLowerCase();
      if (tag === "script") {
        if (!runScripts) return;
        var s = document.createElement("script");
        s.async = false;
        Array.prototype.forEach.call(node.attributes || [], function (a) {
          if (a && a.name) {
            var v = a.value;
            if (a.name === "src") v = abs(v);
            s.setAttribute(a.name, v);
          }
        });
        if (node.textContent) s.textContent = node.textContent;
        to.appendChild(s);
        return;
      }
      if (tag === "link") {
        var l = document.createElement("link");
        Array.prototype.forEach.call(node.attributes || [], function (a) {
          if (a && a.name) {
            var v = a.value;
            if (a.name === "href") v = abs(v);
            l.setAttribute(a.name, v);
          }
        });
        to.appendChild(l);
        return;
      }
      var clone = document.createElement(tag);
      Array.prototype.forEach.call(node.attributes || [], function (a) {
        if (a && a.name) {
          var v = a.value;
          if ((a.name === "src" || a.name === "href" || a.name === "poster") && v) v = abs(v);
          clone.setAttribute(a.name, v);
        }
      });
      if (node.childNodes && node.childNodes.length) moveKids(node, clone, runScripts);
      else if (node.textContent && !/^(img|br|hr|meta|input|source|link)$/i.test(tag)) clone.textContent = node.textContent;
      to.appendChild(clone);
    });
  }

  fetch(abs("index.html") + "?boot=1")
    .then(function (r) {
      return r.text();
    })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var head = root.querySelector("head");
      var body = root.querySelector("body");
      while (head.firstChild) head.removeChild(head.firstChild);
      while (body.firstChild) body.removeChild(body.firstChild);
      head.appendChild(rePatch());
      var st = document.createElement("style");
      st.textContent = "html,body{margin:0;width:100%;height:100%;min-height:100%}foreignObject{overflow:auto}";
      head.appendChild(st);
      if (doc.documentElement && doc.documentElement.getAttribute("class")) {
        root.setAttribute("class", doc.documentElement.getAttribute("class"));
      }
      if (doc.head) moveKids(doc.head, head, true);
      if (doc.body) {
        if (doc.body.getAttribute("class")) body.setAttribute("class", doc.body.getAttribute("class"));
        Array.prototype.forEach.call(doc.body.attributes || [], function (a) {
          if (a && a.name && a.name !== "class") body.setAttribute(a.name, a.value);
        });
        moveKids(doc.body, body, true);
      }
      document.title = doc.title || "krying";
    })
    .catch(function (err) {
      var b = root.querySelector("body");
      b.textContent = "boot failed: " + (err && err.message ? err.message : err);
    });
})();
