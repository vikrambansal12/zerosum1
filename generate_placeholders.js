const fs = require('fs');
const path = require('path');

const images = [
  // DSS (Drone Show Software)
  {
    dir: 'dss',
    file: 'swarm-platform.svg',
    title: 'Swarm Platform',
    color: '#06b6d4', // cyan
    svg: `
      <!-- Swarm network grid -->
      <g opacity="0.3">
        <line x1="100" y1="100" x2="300" y2="100" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="300" y1="100" x2="500" y2="100" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="200" y1="200" x2="400" y2="200" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4,4"/>
        <line x1="100" y1="100" x2="200" y2="200" stroke="#06b6d4" stroke-width="2"/>
        <line x1="300" y1="100" x2="200" y2="200" stroke="#06b6d4" stroke-width="2"/>
        <line x1="300" y1="100" x2="400" y2="200" stroke="#06b6d4" stroke-width="2"/>
        <line x1="500" y1="100" x2="400" y2="200" stroke="#06b6d4" stroke-width="2"/>
      </g>
      <!-- Connected nodes (drones) -->
      <circle cx="100" cy="100" r="12" fill="#06b6d4" filter="url(#glow)"/>
      <circle cx="300" cy="100" r="12" fill="#06b6d4" filter="url(#glow)"/>
      <circle cx="500" cy="100" r="12" fill="#06b6d4" filter="url(#glow)"/>
      <circle cx="200" cy="200" r="12" fill="#3b82f6" filter="url(#glow)"/>
      <circle cx="400" cy="200" r="12" fill="#3b82f6" filter="url(#glow)"/>
      <!-- Inner symbols -->
      <path d="M96 100h8M300 96v8M496 100h8" stroke="#fff" stroke-width="2"/>
    `
  },
  {
    dir: 'dss',
    file: 'drone-designer.svg',
    title: '3D Drone Show Designer',
    color: '#3b82f6', // blue
    svg: `
      <!-- 3D path visualization -->
      <path d="M100 220 C 150 50, 250 50, 300 150 S 450 250, 500 80" fill="none" stroke="#3b82f6" stroke-width="4" filter="url(#glow)"/>
      <!-- Points along path -->
      <circle cx="100" cy="220" r="6" fill="#fff"/>
      <circle cx="178" cy="115" r="6" fill="#fff"/>
      <circle cx="260" cy="90" r="6" fill="#fff"/>
      <circle cx="300" cy="150" r="8" fill="#06b6d4" filter="url(#glow)"/>
      <circle cx="375" cy="210" r="6" fill="#fff"/>
      <circle cx="450" cy="165" r="6" fill="#fff"/>
      <circle cx="500" cy="80" r="6" fill="#fff"/>
      <!-- Coordinates/Axis lines -->
      <line x1="50" y1="250" x2="550" y2="250" stroke="#475569" stroke-width="2"/>
      <line x1="50" y1="250" x2="50" y2="50" stroke="#475569" stroke-width="2"/>
      <line x1="50" y1="250" x2="150" y2="150" stroke="#475569" stroke-width="2" stroke-dasharray="4,4"/>
    `
  },
  {
    dir: 'dss',
    file: 'flight-control.svg',
    title: 'Robust Safety Control',
    color: '#ef4444', // red
    svg: `
      <!-- Safety Geofence circle -->
      <circle cx="300" cy="140" r="90" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="8,4" filter="url(#glow)"/>
      <!-- Telemetry crosshairs -->
      <line x1="300" y1="30" x2="300" y2="250" stroke="#475569" stroke-width="1"/>
      <line x1="150" y1="140" x2="450" y2="140" stroke="#475569" stroke-width="1"/>
      <!-- Target Drone -->
      <g transform="translate(300, 140)">
        <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#ef4444" stroke-width="3"/>
        <line x1="-25" y1="0" x2="25" y2="0" stroke="#ef4444" stroke-width="2"/>
        <line x1="0" y1="-25" x2="0" y2="25" stroke="#ef4444" stroke-width="2"/>
        <!-- Shield overlay -->
        <path d="M-8 -5 L0 -10 L8 -5 L8 3 C8 7, 0 12, 0 12 C0 12, -8 7, -8 3 Z" fill="#ef4444" opacity="0.8"/>
      </g>
    `
  },
  {
    dir: 'dss',
    file: 'led.svg',
    title: 'LED Light Modules',
    color: '#a855f7', // purple
    svg: `
      <!-- Light rays -->
      <g opacity="0.6">
        <line x1="300" y1="130" x2="150" y2="50" stroke="#a855f7" stroke-width="3" filter="url(#glow)"/>
        <line x1="300" y1="130" x2="450" y2="50" stroke="#a855f7" stroke-width="3" filter="url(#glow)"/>
        <line x1="300" y1="130" x2="200" y2="220" stroke="#06b6d4" stroke-width="3" filter="url(#glow)"/>
        <line x1="300" y1="130" x2="400" y2="220" stroke="#06b6d4" stroke-width="3" filter="url(#glow)"/>
      </g>
      <!-- LED module -->
      <circle cx="300" cy="130" r="30" fill="#1e293b" stroke="#a855f7" stroke-width="4"/>
      <circle cx="300" cy="130" r="18" fill="#fff" filter="url(#glow)"/>
    `
  },

  // Eureka Dynamics (UAV Testing)
  {
    dir: 'eureka-dynamics',
    file: 'eurka-dynamics-test-flow.svg',
    title: 'UAV Test Stand Gyroscope',
    color: '#10b981', // emerald
    svg: `
      <!-- Outer gimbal ring -->
      <ellipse cx="300" cy="140" rx="110" ry="80" fill="none" stroke="#10b981" stroke-width="4" filter="url(#glow)"/>
      <!-- Inner gimbal ring -->
      <ellipse cx="300" cy="140" rx="80" ry="55" fill="none" stroke="#059669" stroke-width="3"/>
      <!-- Center pivot -->
      <circle cx="300" cy="140" r="15" fill="#334155" stroke="#10b981" stroke-width="2"/>
      <!-- Drone representation (quad outline) -->
      <line x1="240" y1="140" x2="360" y2="140" stroke="#fff" stroke-width="4"/>
      <line x1="300" y1="100" x2="300" y2="180" stroke="#fff" stroke-width="4"/>
      <!-- Propellers -->
      <ellipse cx="240" cy="140" rx="15" ry="5" fill="#64748b"/>
      <ellipse cx="360" cy="140" rx="15" ry="5" fill="#64748b"/>
      <ellipse cx="300" cy="100" rx="15" ry="5" fill="#64748b"/>
      <ellipse cx="300" cy="180" rx="15" ry="5" fill="#64748b"/>
    `
  },
  {
    dir: 'eureka-dynamics',
    file: 'stand-sizes.svg',
    title: 'Modular Test Stand Sizes',
    color: '#059669', // emerald dark
    svg: `
      <!-- Small stand outline -->
      <g transform="translate(120, 60)">
        <rect x="0" y="40" width="60" height="80" rx="5" fill="none" stroke="#10b981" stroke-width="2"/>
        <line x1="-10" y1="120" x2="70" y2="120" stroke="#10b981" stroke-width="3"/>
        <text x="30" y="30" fill="#94a3b8" font-size="12" text-anchor="middle">Nano</text>
      </g>
      <!-- Medium stand outline -->
      <g transform="translate(260, 40)">
        <rect x="0" y="30" width="80" height="110" rx="5" fill="none" stroke="#3b82f6" stroke-width="2"/>
        <line x1="-15" y1="140" x2="95" y2="140" stroke="#3b82f6" stroke-width="3"/>
        <text x="40" y="20" fill="#94a3b8" font-size="12" text-anchor="middle">Standard</text>
      </g>
      <!-- Large stand outline -->
      <g transform="translate(420, 20)">
        <rect x="0" y="20" width="100" height="140" rx="5" fill="none" stroke="#a855f7" stroke-width="2"/>
        <line x1="-20" y1="160" x2="120" y2="160" stroke="#a855f7" stroke-width="3"/>
        <text x="50" y="10" fill="#94a3b8" font-size="12" text-anchor="middle">Industrial</text>
      </g>
    `
  },
  {
    dir: 'eureka-dynamics',
    file: 'advanced-software.svg',
    title: 'Data Acquisition & Telemetry',
    color: '#2563eb', // blue
    svg: `
      <!-- Chart borders -->
      <rect x="100" y="60" width="400" height="130" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <!-- Grid lines -->
      <line x1="100" y1="92" x2="500" y2="92" stroke="#334155" stroke-width="1"/>
      <line x1="100" y1="125" x2="500" y2="125" stroke="#334155" stroke-width="1"/>
      <line x1="100" y1="158" x2="500" y2="158" stroke="#334155" stroke-width="1"/>
      <line x1="200" y1="60" x2="200" y2="190" stroke="#334155" stroke-width="1"/>
      <line x1="300" y1="60" x2="300" y2="190" stroke="#334155" stroke-width="1"/>
      <line x1="400" y1="60" x2="400" y2="190" stroke="#334155" stroke-width="1"/>
      <!-- Telemetry lines -->
      <path d="M100 150 L150 140 L200 160 L250 110 L300 120 L350 80 L400 90 L450 140 L500 130" fill="none" stroke="#10b981" stroke-width="3" filter="url(#glow)"/>
      <path d="M100 120 L150 125 L200 110 L250 130 L300 90 L350 100 L400 70 L450 85 L500 65" fill="none" stroke="#3b82f6" stroke-width="2"/>
      <!-- Data tags -->
      <text x="110" y="80" fill="#10b981" font-weight="bold" font-size="12">Thrust: 14.2 kgf</text>
      <text x="110" y="100" fill="#3b82f6" font-weight="bold" font-size="12">RPM: 8,420</text>
    `
  },

  // Schubeler (EDFs / Propulsion)
  {
    dir: 'schubeler',
    file: 'images2.svg',
    title: 'Electric Ducted Fans (EDF)',
    color: '#06b6d4', // cyan
    svg: `
      <!-- EDF shroud cylinder -->
      <rect x="180" y="70" width="240" height="140" rx="10" fill="none" stroke="#06b6d4" stroke-width="4" filter="url(#glow)"/>
      <rect x="200" y="75" width="200" height="130" rx="5" fill="none" stroke="#475569" stroke-width="2"/>
      <!-- Rotor spin outline -->
      <ellipse cx="300" cy="140" rx="35" ry="65" fill="none" stroke="#3b82f6" stroke-width="3"/>
      <!-- Spinner bullet center -->
      <path d="M250 140 C 250 110, 310 110, 310 140 S 250 170, 250 140 Z" fill="#64748b" stroke="#06b6d4" stroke-width="2"/>
      <!-- Rotor blades -->
      <line x1="300" y1="75" x2="300" y2="205" stroke="#fff" stroke-width="3"/>
      <line x1="260" y1="90" x2="340" y2="190" stroke="#fff" stroke-width="3"/>
      <line x1="260" y1="190" x2="340" y2="90" stroke="#fff" stroke-width="3"/>
    `
  },
  {
    dir: 'schubeler',
    file: 'aerospace.svg',
    title: 'Aerospace Propulsion Systems',
    color: '#3b82f6', // blue
    svg: `
      <!-- Carbon turbine outline -->
      <circle cx="300" cy="140" r="85" fill="none" stroke="#3b82f6" stroke-width="4" filter="url(#glow)"/>
      <circle cx="300" cy="140" r="75" fill="none" stroke="#475569" stroke-width="2"/>
      <!-- Inner stator guide vanes -->
      <g stroke="#64748b" stroke-width="2">
        <line x1="300" y1="140" x2="300" y2="55"/>
        <line x1="300" y1="140" x2="300" y2="225"/>
        <line x1="300" y1="140" x2="215" y2="140"/>
        <line x1="300" y1="140" x2="385" y2="140"/>
        <line x1="300" y1="140" x2="240" y2="80"/>
        <line x1="300" y1="140" x2="360" y2="200"/>
        <line x1="300" y1="140" x2="240" y2="200"/>
        <line x1="300" y1="140" x2="360" y2="80"/>
      </g>
      <!-- Center motor core -->
      <circle cx="300" cy="140" r="35" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
      <circle cx="300" cy="140" r="10" fill="#fff" filter="url(#glow)"/>
    `
  },
  {
    dir: 'schubeler',
    file: 'industrial.svg',
    title: 'Industrial Turbomachinery',
    color: '#64748b', // slate
    svg: `
      <!-- Turbomachinery casing -->
      <path d="M150 70 L450 70 L470 140 L450 210 L150 210 L130 140 Z" fill="none" stroke="#64748b" stroke-width="4" filter="url(#glow)"/>
      <!-- Air intake/outlet arrows -->
      <g stroke="#06b6d4" stroke-width="3" fill="none">
        <path d="M60 140 L110 140 M100 135 L110 140 L100 145"/>
        <path d="M490 140 L540 140 M530 135 L540 140 L530 145"/>
      </g>
      <!-- Turbine blades row -->
      <rect x="230" y="80" width="30" height="120" fill="#475569" stroke="#64748b"/>
      <rect x="340" y="80" width="30" height="120" fill="#475569" stroke="#64748b"/>
      <!-- Shaft -->
      <line x1="140" y1="140" x2="460" y2="140" stroke="#fff" stroke-width="6"/>
    `
  },

  // Drone Rescue Systems (UAV Safety)
  {
    dir: 'drone-rescue',
    file: 'drone-rescue-systems_sharing.svg',
    title: 'Autonomous Parachute Systems',
    color: '#f97316', // orange
    svg: `
      <!-- Deployed parachute canopy -->
      <path d="M200 110 C 200 40, 400 40, 400 110 Z" fill="#f97316" stroke="#ea580c" stroke-width="2" filter="url(#glow)"/>
      <path d="M200 110 Q 250 120, 300 110 Q 350 120, 400 110" fill="none" stroke="#ea580c" stroke-width="2"/>
      <!-- Parachute lines -->
      <g stroke="#cbd5e1" stroke-width="1.5">
        <line x1="200" y1="110" x2="300" y2="210"/>
        <line x1="240" y1="113" x2="300" y2="210"/>
        <line x1="280" y1="115" x2="300" y2="210"/>
        <line x1="320" y1="115" x2="300" y2="210"/>
        <line x1="360" y1="113" x2="300" y2="210"/>
        <line x1="400" y1="110" x2="300" y2="210"/>
      </g>
      <!-- Parachute canister launch payload -->
      <rect x="285" y="210" width="30" height="15" fill="#475569" stroke="#f97316" stroke-width="2"/>
    `
  },
  {
    dir: 'drone-rescue',
    file: 'multiple-models.svg',
    title: 'DRS Lightweight Models',
    color: '#ea580c', // orange dark
    svg: `
      <!-- Small model canister -->
      <g transform="translate(150, 60)">
        <rect x="0" y="30" width="45" height="90" rx="10" fill="#1e293b" stroke="#f97316" stroke-width="3"/>
        <path d="M0 45 L45 45 M0 95 L45 95" stroke="#f97316" stroke-width="1.5"/>
        <text x="22" y="140" fill="#94a3b8" font-size="11" text-anchor="middle">DRS-5 (290g)</text>
      </g>
      <!-- Medium model canister -->
      <g transform="translate(280, 40)">
        <rect x="0" y="20" width="55" height="110" rx="10" fill="#1e293b" stroke="#ea580c" stroke-width="3" filter="url(#glow)"/>
        <path d="M0 40 L55 40 M0 110 L55 110" stroke="#ea580c" stroke-width="1.5"/>
        <text x="27" y="160" fill="#94a3b8" font-size="11" text-anchor="middle">DRS-10 (450g)</text>
      </g>
      <!-- Large model canister -->
      <g transform="translate(410, 20)">
        <rect x="0" y="10" width="65" height="130" rx="10" fill="#1e293b" stroke="#c2410c" stroke-width="3"/>
        <path d="M0 35 L65 35 M0 125 L65 125" stroke="#c2410c" stroke-width="1.5"/>
        <text x="32" y="180" fill="#94a3b8" font-size="11" text-anchor="middle">DRS-25 (650g)</text>
      </g>
    `
  }
];

const svgTemplateHead = (title, color) => `
<svg width="600" height="320" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </radialGradient>
    <!-- Glow filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background -->
  <rect width="600" height="320" fill="url(#bgGrad)"/>
  
  <!-- Subtle Grid Pattern Overlay -->
  <g opacity="0.08" stroke="#94a3b8" stroke-width="1">
    <line x1="50" y1="0" x2="50" y2="320"/>
    <line x1="100" y1="0" x2="100" y2="320"/>
    <line x1="150" y1="0" x2="150" y2="320"/>
    <line x1="200" y1="0" x2="200" y2="320"/>
    <line x1="250" y1="0" x2="250" y2="320"/>
    <line x1="300" y1="0" x2="300" y2="320"/>
    <line x1="350" y1="0" x2="350" y2="320"/>
    <line x1="400" y1="0" x2="400" y2="320"/>
    <line x1="450" y1="0" x2="450" y2="320"/>
    <line x1="500" y1="0" x2="500" y2="320"/>
    <line x1="550" y1="0" x2="550" y2="320"/>
    
    <line x1="0" y1="40" x2="600" y2="40"/>
    <line x1="0" y1="80" x2="600" y2="80"/>
    <line x1="0" y1="120" x2="600" y2="120"/>
    <line x1="0" y1="160" x2="600" y2="160"/>
    <line x1="0" y1="200" x2="600" y2="200"/>
    <line x1="0" y1="240" x2="600" y2="240"/>
    <line x1="0" y1="280" x2="600" y2="280"/>
  </g>
`;

const svgTemplateFoot = (title, color) => `
  <!-- Title Badge overlay -->
  <rect x="20" y="260" width="560" height="40" rx="8" fill="#1e293b" opacity="0.9" stroke="${color}" stroke-width="1.5"/>
  <text x="300" y="285" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="1" text-anchor="middle">
    ${title.toUpperCase()}
  </text>
</svg>
`;

function generate() {
  const rootDir = __dirname;
  images.forEach(img => {
    const fullSvg = svgTemplateHead(img.title, img.color) + img.svg + svgTemplateFoot(img.title, img.color);
    const destDir = path.join(rootDir, 'zerosumtechnologies.com', 'images', 'collaborations', img.dir);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, img.file);
    fs.writeFileSync(destPath, fullSvg.trim(), 'utf8');
    console.log(`Generated illustration: ${destPath}`);
  });
}

generate();
console.log("All vector illustration placeholders created!");
