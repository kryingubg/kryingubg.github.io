(function () {
  var dock = document.getElementById("more-dock");
  var track = document.getElementById("more-nav-track");
  var links = track ? track.querySelectorAll(".more-dock__link[data-more]") : [];
  var panels = document.querySelectorAll(".more-panel__view");
  var gate = document.getElementById("more-gate");
  var layout = document.getElementById("more-layout");
  var gateEnter = document.getElementById("more-gate-enter");
  var glider = null;
  var activePanel = "home";

  function guh0() {
    if (!track || glider) return;
    glider = document.createElement("span");
    glider.className = "more-dock__glider";
    glider.setAttribute("aria-hidden", "true");
    track.appendChild(glider);
  var active = track.querySelector(".more-dock__link--active");
    if (active) yeet1(active);
  }

  function yeet1(btn) {
    if (!glider || !btn || !track) return;
    var trackRect = track.getBoundingClientRect();
    var rect = btn.getBoundingClientRect();
  glider.style.width = rect.width + "px";
    glider.style.height = rect.height + "px";
    glider.style.transform = "translate(" + (rect.left - trackRect.left) + "px," + (rect.top - trackRect.top) + "px)";
    glider.style.opacity = "1";
  }

  var viewMore = document.getElementById("view-more");

  function bruh2() {
    if (gate) gate.hidden = false;
     if (layout) layout.hidden = true;
    if (viewMore) viewMore.classList.add("view-more--gate");
  }

   function oop3() {
    if (gate) gate.hidden = true;
    if (layout) layout.hidden = false;
  if (viewMore) viewMore.classList.remove("view-more--gate");
    meh4("home");
    requestAnimationFrame(function () {
      var active = track && track.querySelector(".more-dock__link--active");
      if (active) yeet1(active);
    });
   }

  function meh4(name) {
    activePanel = name || "home";
    links.forEach(function (link) {
      var on = link.getAttribute("data-more") === activePanel;
      link.classList.toggle("more-dock__link--active", on);
	if (on) yeet1(link);
    });
    panels.forEach(function (panel) {
      var id = panel.id.replace("more-panel-", "");
      panel.hidden = id !== activePanel;
	});
    if (activePanel === "api" && window.spApi) window.spApi.render();
  }

	function open(panel) {
    guh0();
    oop3();
    if (panel && panel !== "home") meh4(panel);
  }

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      meh4(link.getAttribute("data-more"));
    });
  });

  if (gateEnter) gateEnter.addEventListener("click", oop3);

  window.addEventListener("resize", function () {
    var active = track && track.querySelector(".more-dock__link--active");
    if (active) yeet1(active);
  });

  window.spMore = { open: open, meh4: meh4, enter: oop3 };

  if (layout && layout.hidden) oop3();

  if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", guh0);
  } else {
    guh0();
  }
})();
