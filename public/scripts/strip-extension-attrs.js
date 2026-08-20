// Strips attributes injected by browser extensions (e.g. "Bis" skin checker)
// that would otherwise cause false React hydration mismatches.
(function () {
  var EXT_ATTRS = [
    "bis_skin_checked",
    "data-skin-checked",
    "_processed",
    "data-extension",
    "data-lt-installed",
    "data-vendor",
    "bis_use",
    "data-dynamic-id",
  ];
  function clean() {
    if (!document.documentElement) return;
    var els = document.querySelectorAll("[" + EXT_ATTRS.join("], [") + "]");
    for (var i = 0; i < els.length; i++) {
      for (var j = 0; j < EXT_ATTRS.length; j++) {
        if (els[i].hasAttribute(EXT_ATTRS[j]))
          els[i].removeAttribute(EXT_ATTRS[j]);
      }
    }
  }
  if (document.readyState !== "loading") {
    clean();
  } else {
    document.addEventListener("DOMContentLoaded", clean);
  }
  // Extensions can inject attributes asynchronously AFTER the observer fires
  // but BEFORE React hydrates — repeated passes cover that race.
  setTimeout(clean, 100);
  setTimeout(clean, 500);
  setTimeout(clean, 1500);
  new MutationObserver(clean).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: EXT_ATTRS,
  });
})();
