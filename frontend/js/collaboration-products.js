// Shared by all 9 collaboration pages (each includes this file with its own
// data-section="<slug>" attribute) and by index.html's homepage script. On
// load, fetches that section's admin-managed products and appends them as
// cards into the page's existing product grid, so the site still renders
// fine with all its original content if the backend isn't running.
(function () {
  // '' (relative/same-origin) when loaded through the backend's own
  // tunnel/host, which now also serves this static site (see server.js) --
  // keeps requests same-origin so no CORS preflight is needed for them.
  // TODO: once the backend is deployed somewhere with persistent storage
// (Render/Railway/Fly.io/a VPS -- NOT Vercel, which can't run this stateful
// Express+SQLite backend), set this to that backend's real URL.
var PRODUCTION_API_BASE = 'https://api.zerosumtechnologies.com';
var API_BASE = (window.location.hostname.endsWith('.loca.lt') || window.location.port === '3001')
  ? ''
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : PRODUCTION_API_BASE;
  var currentScript = document.currentScript;
  var section = currentScript ? currentScript.getAttribute('data-section') : null;
  if (!section) return;

  // When API_BASE is a localtunnel URL, a plain fetch() gets served an HTML
  // "you are about to visit..." warning page instead of JSON (localtunnel's
  // anti-abuse interstitial for real browser requests) -- this header tells
  // localtunnel to skip it and proxy the request straight through. Only add
  // it when actually talking to a tunnel: it's a non-simple header, so
  // sending it unconditionally forces every production request through a
  // CORS preflight for no reason.
  function apiFetch(url, options) {
    options = options || {};
    if (window.location.hostname.endsWith('.loca.lt')) {
      options.headers = Object.assign({ 'Bypass-Tunnel-Reminder': 'true' }, options.headers || {});
    }
    return fetch(url, options);
  }

  // Escapes product text before it's inserted via innerHTML in buildCard()
  // below, so a product name/description can't inject arbitrary HTML/script.
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // Each collaboration page has exactly one product grid, marked with this
  // id. Previously matched by an exact className string instead, which any
  // HTML-rewriting intermediary (a data-saving compression proxy, a future
  // minifier) could silently break with no error -- the products would just
  // never appear. An id is far less likely to be touched by that kind of
  // rewrite, and even so, it fails the same way (returns null) rather than
  // matching the wrong element.
  function findProductGrid() {
    return document.getElementById('product-grid');
  }

  function buildCard(p) {
    var specifications = (p.specifications && p.specifications.length)
      ? '<ul class="space-y-2">' + p.specifications.map(function (s) {
          return '<li class="flex items-start text-sm text-slate-600"><div class="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>' + escapeHtml(s) + '</li>';
        }).join('') + '</ul>'
      : '';

    var featuresHtml = (p.features && p.features.length)
      ? '<div><h4 class="font-semibold text-slate-900 mb-3">Features</h4><div class="flex flex-wrap gap-2">' +
        p.features.map(function (f) {
          return '<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">' + escapeHtml(f) + '</div>';
        }).join('') + '</div></div>'
      : '';

    var isContain = (section === 'skypower' || section === 'dynotis' || section === 'uav-navigation' || section === 'drone-rescue' || section === 'eureka-dynamics' || section === 'dss');
    var objectClass = isContain ? 'object-contain bg-slate-50' : 'object-cover';
    var objectFit = isContain ? 'contain' : 'cover';
    var images = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
    var imageHtml;
    if (!images.length) {
      imageHtml = '<div style="position:absolute;inset:0;background:#e2e8f0"></div>';
    } else if (images.length === 1) {
      imageHtml = '<img alt="' + escapeHtml(p.name) + '" loading="lazy" decoding="async" class="' + objectClass + '" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent;object-fit:' + objectFit + ';" src="../' + escapeHtml(images[0]) + '">';
    } else {
      // Multiple images: stack them and crossfade on an interval (see the
      // gallery-slide script at the bottom of buildCard) rather than a static image.
      imageHtml = '<div class="gallery-slider">' + images.map(function (img, idx) {
        return '<img alt="' + escapeHtml(p.name) + ' photo ' + (idx + 1) + '" loading="lazy" decoding="async" class="gallery-slide ' + objectClass + '" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent;object-fit:' + objectFit + ';opacity:' + (idx === 0 ? '1' : '0') + ';transition:opacity 1s ease;" src="../' + escapeHtml(img) + '">';
      }).join('') + '</div>';
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML =
      '<div style="opacity:1;height:100%;"><div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">' +
        '<div class="relative h-80 bg-slate-50">' +
          imageHtml +
          (p.category ? '<div class="absolute top-4 right-4"><div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-white/90 text-slate-900">' + escapeHtml(p.category) + '</div></div>' : '') +
        '</div>' +
        '<div class="flex flex-col space-y-1.5 p-6"><h3 class="tracking-tight text-xl font-bold text-slate-900">' + escapeHtml(p.name) + '</h3><p class="text-sm text-slate-600">' + escapeHtml(p.description) + '</p></div>' +
        '<div class="p-6 pt-0 flex-1 flex flex-col">' +
          '<div class="space-y-6">' +
            (specifications ? '<div><h4 class="font-semibold text-slate-900 mb-3">Key Specifications</h4>' + specifications + '</div>' : '') +
            featuresHtml +
          '</div>' +
        '</div>' +
        '</div></div>';
    return wrapper.firstElementChild;
  }

  // Auto-cycles every multi-image product card's stacked <img> slides via an
  // opacity crossfade, the same technique used for the FFT-GYRO banner.
  function startGallerySliders(root) {
    root.querySelectorAll('.gallery-slider').forEach(function (slider) {
      var slides = slider.querySelectorAll('.gallery-slide');
      if (slides.length < 2) return;
      var current = 0;
      setInterval(function () {
        slides[current].style.opacity = '0';
        current = (current + 1) % slides.length;
        slides[current].style.opacity = '1';
      }, 3000);
    });
  }

  window.addEventListener('load', function () {
    apiFetch(API_BASE + '/api/products?section=' + encodeURIComponent(section))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.success || !data.products || !data.products.length) return;
        var grid = findProductGrid();
        if (!grid) return;
        data.products.forEach(function (p) {
          grid.appendChild(buildCard(p));
        });
        startGallerySliders(grid);
      })
      .catch(function () {
        // Backend not reachable -- silently skip, static content still renders fine.
      });
  });
})();
