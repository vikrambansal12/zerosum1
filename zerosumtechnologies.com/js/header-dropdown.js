// Fixes the "Collaborations" nav button, which has no dropdown menu at all
// in the mirrored markup -- the original site built it dynamically in React
// and the static mirror only ever captured its closed state. This adds a
// working dropdown listing all 9 partner pages, on every page that has the
// button (homepage, contact page, and each collaboration page itself).
(function () {
  var partners = [
    { name: 'Sky Power GmbH', slug: 'skypower' },
    { name: 'Schubeler', slug: 'schubeler' },
    { name: 'Eureka Dynamics', slug: 'eureka-dynamics' },
    { name: 'Drone Show Software', slug: 'dss' },
    { name: 'Dynotis', slug: 'dynotis' },
    { name: 'Triad RF Systems', slug: 'triad-rf' },
    { name: 'UAV Navigation', slug: 'uav-navigation' },
    { name: 'Drone Rescue Systems', slug: 'drone-rescue' },
    { name: 'MaxAmps', slug: 'maxamps' }
  ];

  // Collaboration pages live one folder deeper than the homepage/contact
  // page, so the relative link prefix depends on where this script runs.
  var inCollabFolder = location.pathname.indexOf('/collaborations/') !== -1;
  var prefix = inCollabFolder ? '../collaborations/' : './collaborations/';

  function init() {
    var toggleBtn = document.querySelector('button[aria-label="View our strategic partnerships"]');
    if (!toggleBtn) return;
    var wrapper = toggleBtn.parentElement;
    if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';

    var menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.style.cssText = 'display:none;position:absolute;top:100%;left:0;margin-top:10px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.4);min-width:230px;padding:8px;z-index:100;';
    menu.innerHTML = partners.map(function (p) {
      return '<a href="' + prefix + p.slug + '.html" role="menuitem" ' +
        'style="display:block;padding:9px 14px;border-radius:6px;color:#cbd5e1;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap;transition:background-color .15s ease,color .15s ease;">' +
        p.name + '</a>';
    }).join('');
    wrapper.appendChild(menu);

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('mouseenter', function () { link.style.backgroundColor = 'rgba(34,211,238,0.12)'; link.style.color = '#22d3ee'; });
      link.addEventListener('mouseleave', function () { link.style.backgroundColor = 'transparent'; link.style.color = '#cbd5e1'; });
    });

    var open = false;
    function setOpen(next) {
      open = next;
      menu.style.display = open ? 'block' : 'none';
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!open);
    });
    document.addEventListener('click', function (e) {
      if (open && !wrapper.contains(e.target)) setOpen(false);
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
