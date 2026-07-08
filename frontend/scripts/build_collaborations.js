const fs = require('fs');
const path = require('path');

const steps = {
  dss: '148',
  'eureka-dynamics': '185',
  schubeler: '187',
  'drone-rescue': '190'
};

const lucideIcons = {
  Zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap h-8 w-8 text-white"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>',
  Shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield h-8 w-8 text-white"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1-1z"></path></svg>',
  Settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-8 w-8 text-white"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  Gauge: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge h-8 w-8 text-white"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>',
  Target: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target h-8 w-8 text-white"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  Radar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radar h-8 w-8 text-white"><path d="M19.07 4.93a10 10 0 0 0-14.14 0M16.24 7.76a6 6 0 0 0-8.49 0"></path><circle cx="12" cy="12" r="2"></circle><path d="M12 2v20M2 12h20"></path></svg>',
  Wind: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind h-8 w-8 text-white"><path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2"></path></svg>',
  Cpu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu h-8 w-8 text-white"><rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M9 2v2M15 2v2M9 20v2M15 20v2M20 9h2M20 15h2M2 9h2M2 15h2"></path></svg>',
  Activity: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity h-8 w-8 text-white"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
  Eye: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-8 w-8 text-white"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  Plane: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plane h-8 w-8 text-white"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>',
  Camera: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera h-8 w-8 text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>',
  Search: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-8 w-8 text-white"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>'
};

// Extracted baseline layout structure from dynotis.html
function getTemplate() {
  return `<!DOCTYPE html>
<html lang="en" class="__variable_f367f3 __variable_3c557b">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
  <link rel="preload" href="../next/static/media/bb3ef058b751a6ad-s.p.woff2" as="font" type="font/woff2">
  <link rel="preload" href="../next/static/media/e4af272ccee01ff0-s.p.woff2" as="font" type="font/woff2">
  <link rel="stylesheet" href="../next/static/css/a59f94c511d0a383.css" data-precedence="next">
  <link rel="preload" href="../next/static/chunks/webpack-f5d82e57742b8297.js" as="script" fetchpriority="low">
  <link rel="preload" href="../../www.googletagmanager.com/gtag/js_id_G-J6N2SY9Z28.js" as="script">
  <link rel="canonical" href="../../www.zerosumtechnologies.com/4159442405">
  <meta name="format-detection" content="telephone=no">
  <link rel="icon" href="../favicon.ico.html" sizes="any">
  <link rel="icon" href="../favicon.svg.html" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png.html">
  <title>{{pageTitle}}</title>
  <meta name="description" content="{{pageDescription}}">
  <link rel="author" href="../../www.zerosumtechnologies.com/4159442405">
  <meta name="author" content="Zerosum Technologies">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#0F172A">
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0F172A">
  <meta name="creator" content="Zerosum Technologies">
  <meta name="publisher" content="Zerosum Technologies">
  <meta name="robots" content="index, follow">
  <meta name="category" content="technology">
</head>
<body class="__className_f367f3 antialiased">
  <div class="min-h-screen bg-slate-50">
    <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent" role="banner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <a class="flex items-center space-x-3" aria-label="Zerosum Technologies - Home" href="../index.html">
              <div class="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap h-6 w-6 text-white" aria-hidden="true">
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="text-lg font-bold text-white">Zerosum Technologies Pvt Ltd</span>
                <span class="text-xs text-cyan-400 font-mono">Advanced UAV Solutions</span>
              </div>
            </a>
          </div>
          <nav class="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <div class="relative">
              <a class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="Navigate to home page" href="../index.html">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-4 w-4">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span>Home</span>
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
            <div class="relative">
              <button class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="View our strategic partnerships" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-4 w-4">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Collaborations</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-3 w-3 transition-transform duration-200">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>
            <div class="relative">
              <a class="text-slate-300 hover:text-cyan-400 font-medium transition-colors duration-300 relative group flex items-center space-x-2" aria-label="Contact us for collaboration" href="../contact.html">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail h-4 w-4">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span>Contact</span>
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </nav>
          <button class="md:hidden p-2 rounded-md text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label="Open mobile menu" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <section class="pt-24 pb-12 bg-gradient-to-br {{colorClass}}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style="opacity:1;">
          <a class="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors" href="../index.html">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left h-4 w-4 mr-2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>Back to Home
          </a>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div class="flex items-center space-x-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-lg">
                  <img alt="{{companyName}} logo" loading="lazy" width="48" height="48" decoding="async" class="object-contain" style="color:transparent" src="../{{logo}}">
                </div>
                <div>
                  <div class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 bg-white/20 text-white border border-white/30 mb-2">{{category}}</div>
                  <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">{{companyName}}</h1>
                  {{parentCompanyLabel}}
                  <h2 class="text-xl md:text-2xl text-white/90 font-medium">{{title}}</h2>
                </div>
              </div>
              <div class="ml-2">
                <p class="text-xl text-white/90 max-w-4xl leading-relaxed">{{subtitle}}</p>
              </div>
            </div>
            <div class="lg:block hidden" style="opacity:1;">
              <div class="relative h-96 rounded-xl overflow-hidden shadow-2xl">
                <img alt="Hero Image" loading="lazy" decoding="async" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="../{{heroImage}}">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Highlights Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {{highlightsHTML}}
        </div>
      </div>
    </section>

    <!-- Products / Detail Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16" style="opacity:1;">
          <h2 class="text-4xl font-bold text-slate-900 mb-6">{{sectionProductsTitle}} <span class="{{textPrimaryClass}}">{{sectionProductsSubtitleSpan}}</span></h2>
          <p class="text-xl text-slate-600 max-w-3xl mx-auto">{{sectionProductsSubtitle}}</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {{productsHTML}}
        </div>
      </div>
    </section>

    {{applicationsSectionHTML}}

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center mb-12" style="opacity:1;">
          <h3 class="text-4xl md:text-5xl font-bold text-white mb-6">{{ctaTitle}}</h3>
          <p class="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">{{ctaDescription}}</p>
        </div>
        <div style="opacity:1;">
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="../contact.html">
              <button class="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-11 rounded-md group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail mr-3 h-5 w-5 group-hover:scale-110 transition-transform">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>{{ctaButtonText}}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </a>
            <a href="{{websiteUrl}}" target="_blank" rel="noopener noreferrer" aria-label="Visit {{companyName}} official website (opens in new tab)">
              <button class="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background h-11 rounded-md group border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 backdrop-blur-sm px-8 py-4 text-lg font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link mr-3 h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>{{websiteText}}
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>

    <footer class="bg-slate-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center mb-12" style="opacity:1;">
          <h3 class="text-2xl font-bold text-white">Collaborations</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div style="opacity:1;">
            <ul class="space-y-3">
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./skypower.html">Sky Power GmbH</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./schubeler.html">Schubeler</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./eureka-dynamics.html">Eureka Dynamics</a></li>
            </ul>
          </div>
          <div style="opacity:1;">
            <ul class="space-y-3">
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./dss.html">Drone Show Software</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./dynotis.html">Dynotis</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./triad-rf.html">Triad RF Systems</a></li>
            </ul>
          </div>
          <div style="opacity:1;">
            <ul class="space-y-3">
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./uav-navigation.html">UAV Navigation</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./drone-rescue.html">Drone Rescue Systems</a></li>
              <li><a class="text-slate-300 hover:text-cyan-400 transition-colors duration-200 text-sm block" href="./maxamps.html">MaxAmps</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div data-orientation="horizontal" role="none" class="shrink-0 h-[1px] w-full bg-slate-800"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-slate-400 text-sm">&#169; 2025 Zerosum Technologies Pvt Ltd. All rights reserved.</div>
          <div class="text-slate-400 text-sm">Advanced UAV Solutions: &#8226; UAV Testing &#8226; UAV Propulsion &#8226; Advanced Autopilots &#8226; UAV Safety &#8226; and more</div>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function findImageOnDisk(basePath, defaultRelPath) {
  // Resolve base folder and check if file exists
  const absPath = path.join(basePath, 'zerosumtechnologies.com', defaultRelPath);
  if (fs.existsSync(absPath)) {
    return defaultRelPath;
  }
  
  // File missing, search directory for matches with other extensions
  const dir = path.dirname(absPath);
  if (!fs.existsSync(dir)) {
    return defaultRelPath; // fallback to default
  }
  
  const base = path.basename(absPath, path.extname(absPath));
  const files = fs.readdirSync(dir);
  const matchedFile = files.find(f => f.startsWith(base));
  if (matchedFile) {
    const parentDir = path.dirname(defaultRelPath);
    return path.join(parentDir, matchedFile).replace(/\\/g, '/');
  }
  
  return defaultRelPath;
}

function extractJSON(content) {
  let cleaned = content;
  cleaned = cleaned.split('\\\\\\\"').join('__LITERAL_QUOTE__');
  cleaned = cleaned.split('\\"').join('"');
  cleaned = cleaned.split('__LITERAL_QUOTE__').join('\\"');

  const searchStr = '{"data":{"id":';
  const startIdx = cleaned.indexOf(searchStr);
  if (startIdx === -1) return null;
  
  let braces = 0;
  let jsonStr = "";
  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];
    jsonStr += char;
    if (char === '{') braces++;
    if (char === '}') {
      braces--;
      if (braces === 0) break;
    }
  }
  
  try {
    const obj = JSON.parse(jsonStr);
    return obj.data;
  } catch (e) {
    console.error("JSON parsing error:", e.message);
    return null;
  }
}

function buildPage(data, rootDir) {
  let template = getTemplate();

  // Basic tags
  template = template.replace(/\{\{pageTitle\}\}/g, `${data.companyName} Collaboration | Zerosum Technologies`);
  template = template.replace(/\{\{pageDescription\}\}/g, data.subtitle || "");
  template = template.replace(/\{\{companyName\}\}/g, data.companyName);
  
  const logoRel = data.logo.startsWith('/') ? data.logo.slice(1) : data.logo;
  const logoPath = findImageOnDisk(rootDir, logoRel);
  template = template.replace(/\{\{logo\}\}/g, logoPath);
  
  template = template.replace(/\{\{category\}\}/g, data.category || "Collaboration");
  template = template.replace(/\{\{title\}\}/g, data.title || "");
  template = template.replace(/\{\{subtitle\}\}/g, data.subtitle || "");
  
  const heroRel = data['hero-image'] ? (data['hero-image'].startsWith('/') ? data['hero-image'].slice(1) : data['hero-image']) : "";
  const heroPath = findImageOnDisk(rootDir, heroRel);
  template = template.replace(/\{\{heroImage\}\}/g, heroPath);
  
  // Parent label if present
  if (data.parentCompanyName) {
    template = template.replace(/\{\{parentCompanyLabel\}\}/g, `<p class="text-lg text-white/80 font-medium mb-1">(${data.parentCompanyName})</p>`);
  } else {
    template = template.replace(/\{\{parentCompanyLabel\}\}/g, '');
  }

  // Theme colors mapping
  const primaryTheme = data.theme?.primary || 'cyan';
  const secondaryTheme = data.theme?.secondary || 'blue';
  
  // Dynamic gradient classes
  let colorClass = `from-${primaryTheme}-900 via-${secondaryTheme}-800 to-${primaryTheme}-900`;
  if (primaryTheme === 'cyan') {
    colorClass = 'from-slate-900 via-slate-800 to-slate-900';
  }
  template = template.replace(/\{\{colorClass\}\}/g, colorClass);
  template = template.replace(/\{\{textPrimaryClass\}\}/g, `text-${primaryTheme}-600`);

  // Build highlights
  let highlightsHTML = "";
  if (data.partnershipHighlights && data.partnershipHighlights.length) {
    data.partnershipHighlights.forEach(hl => {
      const iconSVG = lucideIcons[hl.icon] || lucideIcons.Zap;
      highlightsHTML += `
          <div style="opacity:1;">
            <div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div class="p-6 text-center">
                <div class="bg-gradient-to-r from-${primaryTheme}-500 to-${secondaryTheme}-600 p-3 rounded-lg inline-block mb-4">
                  ${iconSVG}
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-3">${hl.title}</h3>
                <p class="text-slate-600 leading-relaxed">${hl.description}</p>
              </div>
            </div>
          </div>`;
    });
  }
  template = template.replace(/\{\{highlightsHTML\}\}/g, highlightsHTML);

  // Products headers
  const sectionTitle = data.sectionTitles?.products || "Our Solutions";
  const sectionSub = data.sectionTitles?.productsSubtitle || "";
  
  // Split title if long, or highlight second word
  const titleWords = sectionTitle.split(' ');
  const titleSpan = titleWords.pop();
  const titleBase = titleWords.join(' ');
  
  template = template.replace(/\{\{sectionProductsTitle\}\}/g, titleBase);
  template = template.replace(/\{\{sectionProductsSubtitleSpan\}\}/g, titleSpan);
  template = template.replace(/\{\{sectionProductsSubtitle\}\}/g, sectionSub);

  // Build products
  let productsHTML = "";
  if (data.products && data.products.length) {
    data.products.forEach(p => {
      let specsHTML = "";
      if (p.specifications && p.specifications.length && p.specifications.some(s => s.trim().length > 0)) {
        specsHTML = `
              <div>
                <h4 class="font-semibold text-slate-900 mb-3">Key Specifications</h4>
                <ul class="space-y-1">
                  ${p.specifications.filter(s => s.trim().length > 0).map(s => `
                    <li class="text-sm text-slate-600 flex items-center">
                      <div class="w-1.5 h-1.5 bg-${primaryTheme}-500 rounded-full mr-3 flex-shrink-0"></div>
                      ${s}
                    </li>`).join('')}
                </ul>
              </div>`;
      }

      let featuresHTML = "";
      if (p.features && p.features.length) {
        featuresHTML = `
              <div>
                <h4 class="font-semibold text-slate-900 mb-3">Features</h4>
                <div class="flex flex-wrap gap-2">
                  ${p.features.map(f => `
                    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                      ${f}
                    </div>`).join('')}
                </div>
              </div>`;
      }

      // Map the product image extension to SVG illustration we generated
      let pImage = p.image.startsWith('/') ? p.image.slice(1) : p.image;
      const parsedPath = path.parse(pImage);
      const svgRelPath = path.join(parsedPath.dir, parsedPath.name + '.svg').replace(/\\/g, '/');
      const finalProductImg = findImageOnDisk(rootDir, svgRelPath);

      productsHTML += `
          <div style="opacity:1;">
            <div class="rounded-lg bg-card text-card-foreground h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div class="relative h-80">
                <img alt="${p.name}" loading="lazy" decoding="async" class="object-cover" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="../${finalProductImg}">
                <div class="absolute top-4 right-4">
                  <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-white/90 text-slate-900">
                    ${p.category || "Solution"}
                  </div>
                </div>
              </div>
              <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="tracking-tight text-xl font-bold text-slate-900">${p.name}</h3>
                <p class="text-sm text-slate-600">${p.description}</p>
              </div>
              <div class="p-6 pt-0 space-y-6">
                ${specsHTML}
                ${featuresHTML}
                <div data-orientation="horizontal" role="none" class="shrink-0 bg-border h-[1px] w-full"></div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-slate-600">Pricing</p>
                    <p class="font-bold text-lg text-slate-900">${p.price || "Contact for pricing"}</p>
                  </div>
                  <a href="../contact.html">
                    <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gradient-to-r from-${primaryTheme}-600 to-${secondaryTheme}-600 hover:from-${primaryTheme}-700 hover:to-${secondaryTheme}-700">
                      Request Quote
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>`;
    });
  }
  template = template.replace(/\{\{productsHTML\}\}/g, productsHTML);

  // Build applications section if exists
  let applicationsSectionHTML = "";
  if (data.applications && data.applications.length) {
    const appTitle = data.sectionTitles?.applications || "Technology Applications";
    const appSub = data.sectionTitles?.applicationsSubtitle || "";
    
    // Split title if long, or highlight second word
    const appTitleWords = appTitle.split(' ');
    const appTitleSpan = appTitleWords.pop();
    const appTitleBase = appTitleWords.join(' ');
    
    let cardsHTML = "";
    data.applications.forEach(app => {
      const iconSVG = lucideIcons[app.icon] || lucideIcons.Settings;
      cardsHTML += `
          <div class="rounded-lg bg-card text-card-foreground text-center border-0 shadow-lg">
            <div class="p-6">
              <div class="bg-gradient-to-r ${app.color || `from-${primaryTheme}-500 to-${secondaryTheme}-600`} p-3 rounded-lg inline-block mb-4">
                ${iconSVG}
              </div>
              <h4 class="text-xl font-bold text-slate-900 mb-3">${app.title}</h4>
              <p class="text-slate-600">${app.description}</p>
            </div>
          </div>`;
    });

    applicationsSectionHTML = `
    <!-- Applications Section -->
    <section class="py-16 bg-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12" style="opacity:1;">
          <h3 class="text-3xl font-bold text-slate-900 mb-4">${appTitleBase} <span class="text-${primaryTheme}-600">${appTitleSpan}</span></h3>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">${appSub}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${cardsHTML}
        </div>
      </div>
    </section>`;
  }
  template = template.replace(/\{\{applicationsSectionHTML\}\}/g, applicationsSectionHTML);

  // CTA Section
  const cta = data.contactCta || {};
  template = template.replace(/\{\{ctaTitle\}\}/g, cta.title || "Ready to collaborate?");
  template = template.replace(/\{\{ctaDescription\}\}/g, cta.description || "");
  template = template.replace(/\{\{ctaButtonText\}\}/g, cta.buttonText || "Contact Us");
  template = template.replace(/\{\{websiteUrl\}\}/g, data.websiteUrl || "#");
  template = template.replace(/\{\{websiteText\}\}/g, data.websiteText || "Visit Website");

  return template;
}

function compile() {
  const rootDir = __dirname;
  
  Object.keys(steps).forEach(key => {
    const step = steps[key];
    const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\${step}\\content.md`;
    
    let rawContent = "";
    try {
      rawContent = fs.readFileSync(directPath, 'utf8');
    } catch(e) {
      console.log(`Could not read ${directPath}`);
      return;
    }

    const data = extractJSON(rawContent);
    if (!data) {
      console.error(`Could not parse JSON data for collaboration: ${key}`);
      return;
    }

    console.log(`Compiling collaboration page: ${key} (${data.companyName})...`);
    const compiledHtml = buildPage(data, rootDir);
    
    const outputPath = path.join(rootDir, 'zerosumtechnologies.com', 'collaborations', `${key}.html`);
    fs.writeFileSync(outputPath, compiledHtml, 'utf8');
    console.log(`Successfully compiled and wrote ${outputPath}`);
  });
}

compile();
console.log("All compilation tasks complete!");
