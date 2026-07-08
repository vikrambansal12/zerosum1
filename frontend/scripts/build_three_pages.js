/**
 * Build DSS, Drone Rescue, and Schubeler collaboration pages
 * from live site data, matching the exact layout of dynotis.html
 */
const fs = require('fs');
const path = require('path');

const collabDir = path.join(__dirname, 'zerosumtechnologies.com', 'collaborations');

// ─── SHARED HEADER/NAV/FOOTER TEMPLATE ───────────────────────────────────────
function header() {
  return `<header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent" role="banner"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-16"><div class="flex items-center space-x-3"><a class="flex items-center space-x-3" aria-label="Zerosum Technologies - Home" href="../index.html"><div class="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap h-6 w-6 text-white" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg></div><div class="flex flex-col"><span class="text-lg font-bold text-white">Zerosum Technologies Pvt Ltd</span><span class="text-xs text-cyan-400 font-mono">Advanced UAV Solutions</span></div></a></div><nav class="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation"><div class="relative"><a class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="Navigate to home page" href="../index.html"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-4 w-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg><span>Home</span><span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span></a></div><div class="relative"><div class="relative"><button class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="View our strategic partnerships" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg><span>Collaborations</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-3 w-3 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg><span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span></button></div></div><div class="relative"><a class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="Contact us for collaboration" href="../contact.html"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail h-4 w-4"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg><span>Contact</span><span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span></a></div></nav><button class="md:hidden p-2 rounded-md text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label="Open mobile menu" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg></button></div></div></header>`;
}

function footer() {
  return `<footer class="bg-slate-900 text-white"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><div class="text-center mb-12" style="opacity:1;"><h3 class="text-2xl font-bold text-white">Collaborations</h3></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><div style="opacity:1;"><ul class="space-y-3"><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./skypower.html">Sky Power GmbH</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./schubeler.html">Schubeler</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./eureka-dynamics.html">Eureka Dynamics</a></li></ul></div><div style="opacity:1;"><ul class="space-y-3"><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./dss.html">Drone Show Software</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./dynotis.html">Dynotis</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./triad-rf.html">Triad RF Systems</a></li></ul></div><div style="opacity:1;"><ul class="space-y-3"><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./uav-navigation.html">UAV Navigation</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./drone-rescue.html">Drone Rescue Systems</a></li><li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./maxamps.html">MaxAmps</a></li></ul></div></div></div><div data-orientation="horizontal" role="none" class="shrink-0 h-[1px] w-full bg-slate-800"></div><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"><div class="text-slate-400 text-sm">&#169; 2025 Zerosum Technologies Pvt Ltd. All rights reserved.</div><div class="text-slate-400 text-sm">Advanced UAV Solutions: &#8226; UAV Testing &#8226; UAV Propulsion &#8226; Advanced Autopilots &#8226; UAV Safety &#8226; and more</div></div></div></footer>`;
}

function iconSvg(name, classes) {
  const icons = {
    Zap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>`,
    Shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
    Settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    Gauge: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>`,
    Award: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>`,
    Plane: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2 18 1 16 1 14.5 2.5L11 6 2.8 4.2l-2 2L9 10.5 6 13.5 1.5 12 0 13.5l3 3L6 19.5l3-3 1.5 3 1.5-1.5-1.2-4.5 3-3 4.5 8.2z"></path></svg>`,
    Camera: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,
    Search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    Radar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"></path><path d="M4 6h.01"></path><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"></path><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"></path><path d="M12 18h.01"></path><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"></path><circle cx="12" cy="12" r="2"></circle><path d="m13.41 10.59 5.66-5.66"></path></svg>`,
  };
  return icons[name] || icons['Zap'];
}

function highlightCard(h, color) {
  return `<div style="opacity:1;"><div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"><div class="p-6 text-center"><div class="bg-gradient-to-r ${color} p-3 rounded-lg inline-block mb-4">${iconSvg(h.icon, 'h-8 w-8 text-white')}</div><h3 class="text-xl font-bold text-slate-900 mb-3">${h.title}</h3><p class="text-slate-600 leading-relaxed">${h.description}</p></div></div></div>`;
}

function productCard(p, color) {
  const specsHtml = p.specifications && p.specifications.length > 0
    ? `<div><h4 class="font-semibold text-slate-900 mb-3">Key Specifications</h4><ul class="space-y-1">${p.specifications.filter(s => s).map(s => `<li class="text-sm text-slate-600 flex items-center"><div class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>${s}</li>`).join('')}</ul></div>`
    : '';
  const featuresHtml = p.features && p.features.length > 0
    ? `<div><h4 class="font-semibold text-slate-900 mb-3">Features</h4><div class="flex flex-wrap gap-2">${p.features.map(f => `<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">${f}</div>`).join('')}</div></div>`
    : '';
  const imgSrc = p.image.replace('/images/', '../images/');
  const imgExt = imgSrc.split('.').pop().toLowerCase();
  return `<div style="opacity:1;"><div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"><div class="relative h-80"><img alt="${p.name}" loading="lazy" decoding="async" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent;object-fit:cover;" src="${imgSrc}"><div class="absolute top-4 right-4"><div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-white/90 text-slate-900">${p.category}</div></div></div><div class="flex flex-col space-y-1.5 p-6"><h3 class="tracking-tight text-xl font-bold text-slate-900">${p.name}</h3><p class="text-sm text-slate-600">${p.description}</p></div><div class="p-6 pt-0 space-y-6">${specsHtml}${featuresHtml}<div data-orientation="horizontal" role="none" class="shrink-0 bg-border h-[1px] w-full"></div><div class="flex items-center justify-between"><div><p class="text-sm text-slate-600">Pricing</p><p class="font-bold text-lg text-slate-900">${p.price}</p></div><a href="../contact.html"><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r ${color}">Request Quote</button></a></div></div></div></div>`;
}

function applicationCard(app) {
  return `<div style="opacity:1;"><div class="rounded-lg text-card-foreground border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-gradient-to-br ${app.color} p-8 text-white"><div class="mb-4">${iconSvg(app.icon, 'h-10 w-10 text-white')}</div><h3 class="text-xl font-bold mb-3">${app.title}</h3><p class="text-white/90 leading-relaxed">${app.description}</p></div></div>`;
}

function buildPage(data, theme) {
  const gradientFrom = theme.gradient;
  const primaryColor = theme.primary;
  const secondaryColor = theme.secondary;
  const btnColor = `from-${primaryColor}-600 to-${secondaryColor}-600 hover:from-${primaryColor}-700 hover:to-${secondaryColor}-700 text-white`;

  const logoSrc = data.logo.replace('/images/', '../images/');
  const heroSrc = data['hero-image'] ? data['hero-image'].replace('/images/', '../images/') : '';

  const highlightCards = (data.partnershipHighlights || []).map(h => highlightCard(h, `from-${primaryColor}-500 to-${secondaryColor}-600`)).join('');
  const productCards = (data.products || []).map(p => productCard(p, btnColor)).join('');
  const appCards = (data.applications || []).map(app => applicationCard(app)).join('');

  const parentCompany = data.parentCompanyName ? `<p class="text-lg text-white/80 font-medium mb-1">(${data.parentCompanyName})</p>` : '';

  const sectionTitles = data.sectionTitles || {};
  const productsTitle = sectionTitles.products || 'Products';
  const productsSubtitle = sectionTitles.productsSubtitle || '';
  const appsTitle = sectionTitles.applications || 'Applications';
  const appsSubtitle = sectionTitles.applicationsSubtitle || '';

  const titleParts = productsTitle.split(' ');
  const lastWord = titleParts.pop();
  const firstWords = titleParts.join(' ');

  return `<html lang="en" class="__variable_f367f3 __variable_3c557b">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
<link rel="preload" href="../next/static/media/bb3ef058b751a6ad-s.p.woff2" as="font" type="font/woff2">
<link rel="preload" href="../next/static/media/e4af272ccee01ff0-s.p.woff2" as="font" type="font/woff2">
<link rel="stylesheet" href="../next/static/css/a59f94c511d0a383.css" data-precedence="next">
<link rel="canonical" href="https://www.zerosumtechnologies.com">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="../favicon.ico.html" sizes="any">
<link rel="icon" href="../favicon.svg.html" type="image/svg+xml">
<link rel="apple-touch-icon" href="../apple-touch-icon.png.html">
<title>${data.companyName} Collaboration | ${data.category} | Zerosum Technologies | Zerosum Technologies</title>
<meta name="description" content="Partnership with ${data.companyName} - ${data.subtitle}">
<link rel="author" href="https://www.zerosumtechnologies.com">
<meta name="author" content="Zerosum Technologies">
<link rel="manifest" href="../manifest.json">
<meta name="keywords" content="UAV systems India,drone engines India,aerospace engineering India,drone shows India,Skypower UAV engines India,DSS drone software India,Dynotis testing equipment,UAV Navigation autopilot India,drone testing equipment India,commercial drones India,agricultural drones India,defense UAV systems,drone safety systems India,thrust testing India,electric propulsion India,VTOL aircraft India,autonomous drones India,UAV engine suppliers,drone manufacturers India,aviation technology India">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#0F172A">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0F172A">
<meta name="creator" content="Zerosum Technologies">
<meta name="publisher" content="Zerosum Technologies">
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1">
<meta name="category" content="technology">
<meta property="og:title" content="Zerosum Technologies | Advanced UAV Solutions">
<meta property="og:description" content="Leading technology company in India specializing in aerospace engineering, UAV systems, drone show software, and advanced control systems.">
<meta property="og:url" content="https://www.zerosumtechnologies.com">
<meta property="og:site_name" content="Zerosum Technologies">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="next-size-adjust">
</head>
<body class="__className_f367f3 antialiased">
<div class="min-h-screen bg-slate-50">
${header()}

<!-- HERO SECTION -->
<section class="pt-24 pb-12 bg-gradient-to-br ${gradientFrom}">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div style="opacity:1;">
<a class="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors" href="../index.html">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left h-4 w-4 mr-2"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
Back to Home
</a>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
<div>
<div class="flex items-center space-x-4 mb-6">
<div class="bg-white p-4 rounded-xl shadow-lg">
<img alt="${data.companyName} logo" loading="lazy" width="48" height="48" decoding="async" class="object-contain" style="color:transparent" src="${logoSrc}">
</div>
<div>
<div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-white/20 text-white border border-white/30 mb-2">${data.category}</div>
<h1 class="text-4xl md:text-5xl font-bold text-white mb-2">${data.companyName}</h1>
${parentCompany}
<h2 class="text-xl md:text-2xl text-white/90 font-medium">${data.title}</h2>
</div>
</div>
<div class="ml-2">
<p class="text-xl text-white/90 max-w-4xl leading-relaxed">${data.subtitle}</p>
</div>
</div>
${heroSrc ? `<div class="lg:block hidden" style="opacity:1;"><div class="relative h-96 rounded-xl overflow-hidden"><img alt="Hero Image" loading="lazy" decoding="async" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent;object-fit:cover;" src="${heroSrc}"></div></div>` : ''}
</div>
</div>
</div>
</section>

<!-- PARTNERSHIP HIGHLIGHTS -->
<section class="py-16">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
${highlightCards}
</div>
</div>
</section>

<!-- PRODUCTS SECTION -->
<section class="py-16 bg-white">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="text-center mb-16" style="opacity:1;">
<h2 class="text-4xl font-bold text-slate-900 mb-6">${firstWords} <span class="text-${primaryColor}-600">${lastWord}</span></h2>
<p class="text-xl text-slate-600 max-w-3xl mx-auto">${productsSubtitle}</p>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
${productCards}
</div>
</div>
</section>

<!-- APPLICATIONS SECTION -->
<section class="py-16 bg-slate-50">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="text-center mb-16" style="opacity:1;">
<h2 class="text-4xl font-bold text-slate-900 mb-6">${appsTitle}</h2>
<p class="text-xl text-slate-600 max-w-3xl mx-auto">${appsSubtitle}</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
${appCards}
</div>
</div>
</section>

<!-- CTA SECTION -->
<section class="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-${primaryColor}-600/10 to-${secondaryColor}-600/10"></div>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
<div class="text-center mb-12" style="opacity:1;">
<h3 class="text-4xl md:text-5xl font-bold text-white mb-6">${data.contactCta ? data.contactCta.title : 'Contact Us'}</h3>
<p class="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">${data.contactCta ? data.contactCta.description : ''}</p>
</div>
<div style="opacity:1;">
<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
<a href="../contact.html">
<button class="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-11 rounded-md group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail mr-3 h-5 w-5 group-hover:scale-110 transition-transform"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
${data.contactCta ? data.contactCta.buttonText : 'Contact Us'}
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
</button>
</a>
<a href="${data.websiteUrl}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${data.companyName} official website (opens in new tab)">
<button class="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background h-11 rounded-md group border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 backdrop-blur-sm px-8 py-4 text-lg font-semibold">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link mr-3 h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
${data.websiteText || 'Visit Website'}
</button>
</a>
</div>
</div>
</div>
</section>

${footer()}
</div>
</body>
</html>`;
}

// ─── PAGE DATA ────────────────────────────────────────────────────────────────

const dssData = {
  id: "dss",
  companyName: "Drone Show Software",
  parentCompanyName: "SPH Engineering",
  logo: "/images/collaborations/dss/logo.png",
  "hero-image": "/images/collaborations/dss/featured-product.jpg",
  title: "Leading Global Drone Show Software",
  subtitle: "Drone show services powered by our strategic partnership with SPH Engineering's Drone Show Software, bringing spectacular aerial entertainment to India. From concept to execution, we deliver turnkey aerial entertainment solutions for Indian festivals, Bollywood events, corporate marketing campaigns, weddings, and special celebrations using the world's most trusted drone show platform.",
  category: "Drone Show",
  badge: "Drone Show Software",
  websiteUrl: "https://www.droneshowsoftware.com",
  websiteText: "Visit DSS Website",
  contactCta: {
    title: "Ready to Launch Your Drone Show Business?",
    description: "Contact our drone show specialists to learn how our DSS partnership can help you create spectacular aerial displays for marketing, celebrations, and community events.",
    buttonText: "Contact Drone Show Team"
  },
  partnershipHighlights: [
    { icon: "Zap", title: "Turnkey Event Solutions", description: "Complete end-to-end drone show services from initial concept design to live event execution and post-production analysis." },
    { icon: "Shield", title: "Industry-Leading Safety", description: "Provide Safe Drone Operations with advanced software protection, proven experienced pilots, and comprehensive understanding of Civil Aviation Restrictions." },
    { icon: "Settings", title: "Custom Choreography", description: "Bespoke aerial choreography tailored to your brand, message, and event requirements using advanced 3D design tools." }
  ],
  products: [
    {
      id: "swarm-coordination-platform",
      name: "Flight Path and Light Coordination",
      description: "Advanced autonomous software platform for coordinating large-scale drone groups with real-time synchronization",
      image: "/images/collaborations/dss/swarm-platform.png",
      specifications: [],
      features: ["5000+ drone support", "Autonomous real-time coordination", "Enterprise-grade reliability"],
      price: "Enterprise",
      category: "Software Platform",
      featured: true
    },
    {
      id: "drone-show-designer",
      name: "Drone Show Designer",
      description: "Intuitive 3D design software for creating spectacular drone light shows",
      image: "/images/collaborations/dss/drone-designer.jpg",
      specifications: ["3D visualization engine", "Music synchronization", "Timeline editing tools", "Cloud collaboration platform", "Multi-format export support"],
      features: ["Blender Plugin", "Path Viewer", "2D/3D visualization"],
      price: "Contact for pricing",
      category: "Design Software",
      featured: false
    },
    {
      id: "robust-safety",
      name: "Robust Safety",
      description: "Robust software which guides you to safe drone operations",
      image: "/images/collaborations/dss/flight-control.jpg",
      specifications: ["", "Important logs display", "Emergency landing protocols", "Remote monitoring capabilities", "Real-time safety alerts"],
      features: ["Pre Validation of Drone IMU/GPS/etc", "In flight, constant monitoring and alerts", "Soft and Hard Fence", "Emergency landing secondary channel support"],
      price: "Contact for pricing",
      category: "Safety Software",
      featured: false
    },
    {
      id: "led-light-modules",
      name: "LED Light Modules",
      description: "High-brightness, programmable LED modules for spectacular light shows",
      image: "/images/collaborations/dss/led.gif",
      specifications: [],
      features: ["RGB + White LEDs", "10,000+ lumens", "Stands Airspeed upto 5m/s", "Wireless control"],
      price: "$450",
      category: "Hardware",
      featured: false
    }
  ],
  applications: [
    { icon: "Zap", title: "Marketing & Branding", description: "Create unforgettable brand experiences and promotional campaigns with spectacular aerial displays for Indian brands, Bollywood premieres, product launches, and corporate events across major Indian cities.", color: "from-cyan-500 to-blue-600" },
    { icon: "Settings", title: "Public Celebrations", description: "Transform festivals, holidays, and community events with synchronized drone shows that bring people together.", color: "from-purple-500 to-pink-600" },
    { icon: "Radar", title: "Sporting Events", description: "Enhance sporting events and ceremonies with precision aerial choreography and real-time audience engagement.", color: "from-emerald-500 to-teal-600" }
  ],
  sectionTitles: {
    products: "Drone Show Software",
    productsSubtitle: "The world's most extensively tested all-in-one solution for creating spectacular drone light shows, trusted by Guinness World Record holders worldwide.",
    applications: "Business Applications",
    applicationsSubtitle: "Transform any event into an unforgettable experience with professional drone light shows for marketing, celebrations, and entertainment."
  }
};

const droneRescueData = {
  id: "drone-rescue",
  companyName: "Drone Rescue Systems",
  logo: "/images/collaborations/drone-rescue/logo.jpeg",
  "hero-image": "/images/collaborations/drone-rescue/featured-product.jpeg",
  title: "Autonomous Parachute Safety Systems",
  subtitle: "Revolutionary lightweight autonomous parachute systems for drone safety and recovery now available in India. Based in Graz, Austria, Drone Rescue Systems provides smart, non-pyrotechnical safety solutions weighing only 290-650g, certified by the European Space Agency and designed to protect valuable drone assets during critical missions including Indian defense, commercial, and agricultural operations.",
  category: "UAV Safety",
  badge: "Safety & Recovery",
  websiteUrl: "https://dronerescue.com/",
  websiteText: "Visit Drone Rescue Website",
  contactCta: {
    title: "Ready to Secure Your Drone Operations?",
    description: "Contact our safety specialists to learn how Drone Rescue Systems can protect your valuable drone assets with autonomous parachute recovery solutions.",
    buttonText: "Contact Safety Team"
  },
  partnershipHighlights: [
    { icon: "Shield", title: "Autonomous Safety", description: "Smart, autonomous parachute deployment system providing reliable autonomous drone protection without pyrotechnical components." },
    { icon: "Zap", title: "Lightweight Design", description: "Ultra-lightweight system (290-650g) with easy installation across various drone platforms and interfaces." },
    { icon: "Award", title: "Certified Solution", description: "European Space Agency certified and ASTM F3322 compliant safety system with proven reliability." }
  ],
  products: [
    {
      id: "drs-parachute-system",
      name: "DRS Autonomous Parachute System",
      description: "Lightweight, smart, autonomous and non-pyrotechnical parachute system for saving multicopters during emergency situations",
      image: "/images/collaborations/drone-rescue/drone-rescue-systems_sharing.jpg",
      specifications: [],
      features: ["Autonomous deployment and activation", "Non-pyrotechnical design", "Simple Installation and Reuseable System", "Lighweight and Reusable Design"],
      price: "Contact for pricing",
      category: "Safety Systems",
      featured: true
    },
    {
      id: "recovery-parachute",
      name: "Multiple Models",
      description: "Specially designed parachute optimized for drone sizes and models",
      image: "/images/collaborations/drone-rescue/multiple-models.png",
      specifications: [],
      features: ["Offers parachute safety systems for drones ranging from 2-250 kg across multiple product lines", "Provides both generic solutions for various drone types (VTOL, Fixed Wing, Rotor Wing)", "Specialized solutions for specific drone models like DJI, Acecore, and Freefly Systems", "Systems weigh only 253g-680g and are tested according to ASTM-F3322-18 standards"],
      price: "Contact for pricing",
      category: "Recovery Hardware",
      featured: false
    }
  ],
  applications: [
    { icon: "Plane", title: "Commercial Delivery", description: "Protecting valuable cargo and drone assets during delivery operations and commercial missions across Indian cities including e-commerce, medical supply, and last-mile delivery applications.", color: "from-orange-500 to-red-600" },
    { icon: "Camera", title: "Cinematography", description: "Ensuring safety of expensive camera equipment and drones during professional filming and photography.", color: "from-purple-500 to-pink-600" },
    { icon: "Search", title: "Inspection & Surveying", description: "Providing safety backup for critical infrastructure inspection and surveying operations.", color: "from-blue-500 to-indigo-600" }
  ],
  sectionTitles: {
    products: "Parachute Safety Systems",
    productsSubtitle: "Lightweight, autonomous, and non-pyrotechnical parachute systems designed to protect valuable drone assets when safety matters.",
    applications: "Safety Applications",
    applicationsSubtitle: "Comprehensive drone protection solutions for commercial delivery, cinematography, and inspection operations."
  }
};

const schubelerData = {
  id: "schubeler",
  companyName: "Schubeler",
  logo: "/images/collaborations/schubeler/logo.png",
  "hero-image": "/images/collaborations/schubeler/featured-product.png",
  title: "Electric Propulsion Systems",
  subtitle: "Leading manufacturer of innovative electric propulsion systems dedicated to aerospace applications and electric turbomachinery for industrial use. Our strategic partnership with Schubeler delivers cutting-edge electric propulsion technologies that represent the future of clean, efficient, and high-performance aerospace propulsion solutions.",
  category: "UAV Propulsion",
  badge: "Electric Propulsion Systems",
  websiteUrl: "https://www.schubeler.com",
  websiteText: "Visit Schubeler Website",
  contactCta: {
    title: "Ready to Electrify Your Propulsion Systems?",
    description: "Contact our electric propulsion specialists to learn how our Schubeler partnership can deliver innovative electric propulsion solutions for your aerospace and industrial applications.",
    buttonText: "Contact Electric Propulsion Team"
  },
  partnershipHighlights: [
    { icon: "Zap", title: "Electric Innovation", description: "Cutting-edge electric propulsion systems representing the future of clean, efficient, low noise aerospace technology." },
    { icon: "Gauge", title: "Performance Excellence", description: "Electric Ducted Fans (EDFs) have compact size, making them suitable for a variety of applications." },
    { icon: "Settings", title: "Dual Applications", description: "Advanced solutions for both aerospace applications and industrial electric turbomachinery systems." }
  ],
  products: [
    {
      id: "electric-ducted-fans",
      name: "Electric Ducted Fans (EDFs)",
      description: "Compact high-performance electric ducted fans designed for aerospace applications with superior efficiency and reduced noise signature.",
      image: "/images/collaborations/schubeler/images2.jpg",
      specifications: ["Compact design with high thrust-to-weight ratio", "Low noise operation compared to open propellers", "High efficiency electric motor integration", "Multiple diameter options available", "Temperature-resistant materials"],
      features: ["Reduced noise signature", "Compact form factor", "High thrust density", "Aerospace-grade construction"],
      price: "Contact for pricing",
      category: "Electric Ducted Fans",
      featured: true
    },
    {
      id: "aerospace-propulsion-systems",
      name: "Aerospace Propulsion Systems",
      description: "Complete electric propulsion systems for next-generation aerospace vehicles including VTOL and UAV platforms.",
      image: "/images/collaborations/schubeler/aerospace.png",
      specifications: [],
      features: ["Propulsion systems of choice for drones and ground-effect vehicles", "Light-weight electric solutions delivering high thrust and speed", "HST Fans with Fully Integrated Motors", "Adaptable as per customer aircraft requirements"],
      price: "Contact for pricing",
      category: "Aerospace Systems",
      featured: true
    },
    {
      id: "industrial-turbomachinery",
      name: "Industrial Electric Turbomachinery",
      description: "Electric turbomachinery solutions for demanding industrial applications requiring high performance and reliability.",
      image: "/images/collaborations/schubeler/industrial.jpg",
      specifications: ["Industrial-grade electric motors", "High-temperature operation capability", "Variable speed control systems", "Maintenance-friendly design", "Energy efficient operation"],
      features: ["Variable speed operation", "Energy efficient design", "Low maintenance requirements", "Industrial grade reliability"],
      price: "Contact for pricing",
      category: "Industrial Systems",
      featured: false
    }
  ],
  applications: [
    { icon: "Plane", title: "Aerospace Applications", description: "Electric propulsion systems for next-generation aerospace vehicles, VTOL aircraft, and unmanned aerial systems.", color: "from-purple-500 to-blue-600" },
    { icon: "Settings", title: "Industrial Turbomachinery", description: "Electric turbomachinery solutions for demanding industrial applications and processes.", color: "from-blue-500 to-indigo-600" },
    { icon: "Zap", title: "Clean Technology", description: "Environmentally friendly electric propulsion solutions for sustainable aerospace and industrial operations.", color: "from-green-500 to-teal-600" }
  ],
  sectionTitles: {
    products: "Electric Propulsion Solutions",
    productsSubtitle: "Innovative electric propulsion systems designed for aerospace applications and industrial turbomachinery with superior efficiency and performance.",
    applications: "Technology Applications",
    applicationsSubtitle: "Advanced electric propulsion technology serving aerospace, industrial, and clean technology applications."
  }
};

// ─── BUILD ────────────────────────────────────────────────────────────────────

const pages = [
  {
    data: dssData,
    theme: { primary: "cyan", secondary: "blue", gradient: "from-slate-800 via-slate-700 to-slate-800" },
    file: "dss.html"
  },
  {
    data: droneRescueData,
    theme: { primary: "orange", secondary: "red", gradient: "from-orange-800 via-red-700 to-orange-800" },
    file: "drone-rescue.html"
  },
  {
    data: schubelerData,
    theme: { primary: "purple", secondary: "blue", gradient: "from-slate-800 via-slate-700 to-slate-800" },
    file: "schubeler.html"
  }
];

pages.forEach(({ data, theme, file }) => {
  const html = buildPage(data, theme);
  const outPath = path.join(collabDir, file);
  fs.writeFileSync(outPath, html, 'utf8');
  const lines = html.split('\n').length;
  console.log(`✅ Built ${file} (${lines} lines)`);
});

console.log('\nAll 3 pages built successfully!');
