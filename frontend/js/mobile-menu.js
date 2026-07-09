// Fixes the mobile hamburger button, which has no click handler and no menu
// panel at all in the mirrored markup -- the original site's mobile nav was
// built dynamically in React and the static mirror only ever captured its
// closed state (same root cause as header-dropdown.js's desktop dropdown
// fix). Adds a working slide-down panel with Home/Collaborations/Contact,
// on every page that has the button.
(function () {
  var partners = [
    { name: 'Sky Power GmbH', slug: 'skypower' },
    { name: 'Schubeler', slug: 'schubeler' },
    { name: 'Eureka Dynamics', slug: 'eureka-dynamics' },
    { name: 'Dynotis', slug: 'dynotis' },
    { name: 'UAV Navigation', slug: 'uav-navigation' },
    { name: 'Drone Show Software', slug: 'dss' },
    { name: 'Drone Rescue Systems', slug: 'drone-rescue' },
    { name: 'Triad RF Systems', slug: 'triad-rf' },
    { name: 'MaxAmps', slug: 'maxamps' }
  ];

  // Collaboration pages live one folder deeper than the homepage/contact
  // page, so the relative link prefix depends on where this script runs.
  var inCollabFolder = location.pathname.indexOf('/collaborations/') !== -1;
  var rootPrefix = inCollabFolder ? '../' : './';
  var collabPrefix = inCollabFolder ? './' : './collaborations/';

  var MENU_ICON = '<line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line>';
  var CLOSE_ICON = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';

  function init() {
    var toggleBtn = document.querySelector('button[aria-label="Open mobile menu"]');
    if (!toggleBtn) return;
    var header = toggleBtn.closest('header');
    if (!header) return;

    var panel = document.createElement('div');
    panel.id = 'mobile-nav-panel';
    panel.setAttribute('role', 'menu');
    panel.style.cssText = 'display:none;background:#0f172a;border-top:1px solid rgba(255,255,255,0.1);padding:8px 16px 16px;';
    panel.innerHTML =
      '<a href="' + rootPrefix + 'index.html" role="menuitem" style="display:block;padding:12px 8px;color:#cbd5e1;font-size:15px;font-weight:500;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);">Home</a>' +
      '<div style="padding:12px 8px 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Collaborations</div>' +
      partners.map(function (p) {
        return '<a href="' + collabPrefix + p.slug + '.html" role="menuitem" style="display:block;padding:10px 8px 10px 16px;color:#cbd5e1;font-size:14px;text-decoration:none;">' + p.name + '</a>';
      }).join('') +
      '<a href="' + rootPrefix + 'contact.html" role="menuitem" style="display:block;padding:12px 8px;margin-top:8px;color:#cbd5e1;font-size:15px;font-weight:500;text-decoration:none;border-top:1px solid rgba(255,255,255,0.06);">Contact</a>';
    header.appendChild(panel);

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('mouseenter', function () { link.style.color = '#22d3ee'; });
      link.addEventListener('mouseleave', function () { link.style.color = '#cbd5e1'; });
      link.addEventListener('click', function () { setOpen(false); });
    });

    var open = false;
    function setOpen(next) {
      open = next;
      panel.style.display = open ? 'block' : 'none';
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var svg = toggleBtn.querySelector('svg');
      if (svg) svg.innerHTML = open ? CLOSE_ICON : MENU_ICON;
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!open);
    });
    document.addEventListener('click', function (e) {
      if (open && !header.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
