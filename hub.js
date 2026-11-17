(function () {
  var SECTIONS = [
    {
      id: "core",
      title: "Core",
      items: [
        { id: "games-browser", name: "Category Games Browser", desc: "GN, Elite, Sea Bean, Seraph, 3kh0, all that", href: "/games/" },
        { id: "apps-proxies", name: "Apps & Proxies", desc: "ai, browsers, sandstone, proxied sites", href: "/apps/" },
        { id: "ultimate-game-stash", name: "Ultimate Game Stash", desc: "ugs single-file browser", href: "/ultimate-game-stash/" },
      ],
    },
    {
      id: "proxy",
      title: "Proxy",
      items: [
        { id: "sail-proxy", name: "Sail Proxy", desc: "scramjet browser with tabs", href: "/sail/" },
        { id: "sail-embed", name: "Sail Embed", desc: "proxied game embed frame", href: "/sail/embed/" },
        { id: "proxy-select", name: "Proxy Select", desc: "pick a proxy mode", href: "/proxy-select/" },
      ],
    },
    {
      id: "tools",
      title: "Tools",
      items: [
        { id: "minecraft-tools", name: "Minecraft Tools", desc: "tick calc, give, color gens", href: "/minecraft-tools/" },
        { id: "math-tools", name: "Math Tools", desc: "calculator utilities", href: "/tools/math-tools/" },
        { id: "refined-beta", name: "Refined Beta", desc: "custom minigames", href: "/refined-beta/" },
      ],
    },
    {
      id: "extra",
      title: "Extra",
      items: [
        { id: "vm-selector", name: "VM Selector", desc: "hyperbeam remote browser", href: "/vms/" },
      ],
    },
    {
      id: "info",
      title: "Info",
      items: [
        { id: "terms", name: "Terms of Service", desc: "the rules. boring but there", href: "/terms/" },
        { id: "privacy", name: "Privacy Policy", desc: "what we do with data", href: "/privacy-policy/" },
      ],
    },
  ];

  function hubSecOk(sectionId) {
    if (window.spCfg && window.spCfg.layoutVisible) {
      return window.spCfg.layoutVisible("hubSections", sectionId);
    }
    return true;
  }

  function hubItemOk(itemId) {
    if (window.spCfg && window.spCfg.layoutVisible) {
      return window.spCfg.layoutVisible("hubItems", itemId);
    }
    return true;
  }

  function resolveHref(href) {
    var raw = String(href || "").trim();
    if (!raw) return "#";
    if (/^https?:\/\//i.test(raw) || /^data:/i.test(raw) || /^mailto:/i.test(raw)) return raw;
    var cdn = window.spBase && window.spBase.isCdn && window.spBase.isCdn();
    if (!cdn) return raw;
    var rel = raw.replace(/^\/+/, "");
    if (rel.endsWith("/")) rel += "index.html";
    if (window.spBase && window.spBase.htmlUrl) return window.spBase.htmlUrl(rel);
    if (window.spBase && window.spBase.assetUrl) return window.spBase.assetUrl(rel);
    return rel;
  }

  function paintHub() {
    var root = document.getElementById("hub-grid");
    if (!root) return;
    root.innerHTML = "";
    var hasContent = false;
    SECTIONS.forEach(function (section) {
      if (!hubSecOk(section.id)) return;
      var visibleItems = section.items.filter(function (item) {
        return hubItemOk(item.id);
      });
      if (!visibleItems.length) return;
      hasContent = true;
      var block = document.createElement("div");
      block.className = "hub__section";
      var head = document.createElement("h3");
      head.className = "hub__section-title";
      head.textContent = section.title;
      block.appendChild(head);
      var grid = document.createElement("div");
      grid.className = "hub__grid";
      visibleItems.forEach(function (item) {
        var card = document.createElement("a");
        card.className = "hub__card";
        card.href = resolveHref(item.href);
        var title = document.createElement("span");
        title.className = "hub__card-title";
        title.textContent = item.name;
        card.appendChild(title);
        if (item.desc) {
          var desc = document.createElement("span");
          desc.className = "hub__card-desc";
          desc.textContent = item.desc;
          card.appendChild(desc);
        }
        grid.appendChild(card);
      });
      block.appendChild(grid);
      root.appendChild(block);
    });
    if (!hasContent) {
      root.innerHTML = '<p class="hub__empty">No hub links are visible right now.</p>';
    }
  }

  window.spHub = { render: paintHub, sections: SECTIONS };
  window.addEventListener("sp-cfg", paintHub);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paintHub);
  } else {
    paintHub();
  }
})();
