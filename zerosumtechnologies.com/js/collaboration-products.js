// Shared by all 9 collaboration pages (each includes this file with its own
// data-section="<slug>" attribute) and by index.html's homepage script. On
// load, fetches that section's admin-managed products and appends them as
// cards into the page's existing product grid, so the site still renders
// fine with all its original content if the backend isn't running.
(function () {
  // '' (relative/same-origin) when loaded through the backend's own
  // tunnel/host, which now also serves this static site (see server.js) --
  // keeps requests same-origin so no CORS preflight is needed for them.
  var API_BASE = (window.location.hostname.endsWith('.loca.lt') || window.location.port === '3001') ? '' : 'http://localhost:3001';
  var currentScript = document.currentScript;
  var section = currentScript ? currentScript.getAttribute('data-section') : null;
  if (!section) return;

  // When API_BASE is a localtunnel URL, a plain fetch() gets served an HTML
  // "you are about to visit..." warning page instead of JSON (localtunnel's
  // anti-abuse interstitial for real browser requests) -- this header tells
  // localtunnel to skip it and proxy the request straight through.
  function apiFetch(url, options) {
    options = options || {};
    options.headers = Object.assign({ 'Bypass-Tunnel-Reminder': 'true' }, options.headers || {});
    return fetch(url, options);
  }

  // Escapes product text before it's inserted via innerHTML in buildCard()
  // below, so a product name/description can't inject arbitrary HTML/script.
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // Each collaboration page has exactly one product grid with this class;
  // matched by exact className rather than a CSS selector to avoid having to
  // escape the colons in Tailwind's responsive-prefix class names (lg:grid-cols-2).
  function findProductGrid() {
    var divs = document.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].className === 'grid grid-cols-1 lg:grid-cols-2 gap-8') return divs[i];
    }
    return null;
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

    var isContain = (section === 'skypower' || section === 'dynotis' || section === 'uav-navigation');
    var objectClass = isContain ? 'object-contain bg-slate-50' : 'object-cover';
    var objectFit = isContain ? 'contain' : 'cover';
    var imageSrc = p.image ? '../' + p.image : '';
    var imageHtml = imageSrc
      ? '<img alt="' + escapeHtml(p.name) + '" loading="lazy" decoding="async" class="' + objectClass + '" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent;object-fit:' + objectFit + ';" src="' + imageSrc + '">'
      : '<div style="position:absolute;inset:0;background:#e2e8f0"></div>';

    var wrapper = document.createElement('div');
    wrapper.innerHTML =
      '<div style="opacity:1;"><div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">' +
        '<div class="relative h-80 bg-slate-50">' +
          imageHtml +
          (p.category ? '<div class="absolute top-4 right-4"><div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-white/90 text-slate-900">' + escapeHtml(p.category) + '</div></div>' : '') +
        '</div>' +
        '<div class="flex flex-col space-y-1.5 p-6"><h3 class="tracking-tight text-xl font-bold text-slate-900">' + escapeHtml(p.name) + '</h3><p class="text-sm text-slate-600">' + escapeHtml(p.description) + '</p></div>' +
        '<div class="p-6 pt-0 space-y-6">' +
          (specifications ? '<div><h4 class="font-semibold text-slate-900 mb-3">Key Specifications</h4>' + specifications + '</div>' : '') +
          featuresHtml +
          '<div data-orientation="horizontal" role="none" class="shrink-0 bg-border h-[1px] w-full"></div>' +
          '<div class="flex items-center justify-between"><div><p class="text-sm text-slate-600">Pricing</p><p class="font-bold text-lg text-slate-900">' + escapeHtml(p.price || 'Contact for pricing') + '</p></div><a href="../contact.html"><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">Request Quote</button></a></div>' +
        '</div>' +
        '</div></div>';
    return wrapper.firstElementChild;
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
      })
      .catch(function () {
        // Backend not reachable -- silently skip, static content still renders fine.
      });
  });
})();
