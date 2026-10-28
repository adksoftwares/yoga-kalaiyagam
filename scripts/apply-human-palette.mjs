import fs from 'fs';
import path from 'path';

const ROOT_DIR = 'd:/Yoga';

console.log('🎨 Applying Human Artisan Wellness Palette across all HTML, CSS and JS files...');

// 1. UPDATE style.css
const stylePath = path.join(ROOT_DIR, 'assets/css/style.css');
let styleCss = fs.readFileSync(stylePath, 'utf8');

const cssReplacements = [
  // Heading and text colors
  [/color:\s*#78350F;/g, 'color: #172A22;'],
  [/color:\s*#92400E;/g, 'color: #8A4128;'],
  [/color:\s*#047857;/g, 'color: #234A3B;'],
  [/color:\s*#064E3B;/g, 'color: #163227;'],
  [/color:\s*#D97706;/g, 'color: #A35438;'],
  [/color:\s*#B45309;/g, 'color: #8A4128;'],
  [/color:\s*#FEF3C7;/g, 'color: #E2BE7E;'],
  [/color:\s*#FBBF24;/g, 'color: #E2BE7E;'],
  [/color:\s*#F59E0B;/g, 'color: #C9A05C;'],
  
  // Backgrounds
  [/background:\s*#FEF3C7;/g, 'background: #F8EFEA;'],
  [/background:\s*#FFFBEB;/g, 'background: #FAF5EE;'],
  [/background:\s*#FDFBF7;/g, 'background: #FAF8F5;'],
  [/background:\s*#D1FAE5;/g, 'background: #EDF3F0;'],
  [/background:\s*#ECFDF5;/g, 'background: #F3F7F5;'],
  [/background:\s*#F0FDF4;/g, 'background: #F3F7F5;'],
  [/background:\s*#EFF6FF;/g, 'background: #EDF3F0;'],
  [/background:\s*#DBEAFE;/g, 'background: #DFEAE4;'],
  
  // Borders
  [/border:\s*1px solid #FDE68A;/g, 'border: 1px solid var(--border-subtle);'],
  [/border:\s*1\.5px solid #FDE68A;/g, 'border: 1.5px solid var(--border-subtle);'],
  [/border:\s*2px solid #FDE68A;/g, 'border: 1.5px solid var(--border-subtle);'],
  [/border-color:\s*#D97706;/g, 'border-color: var(--secondary);'],
  [/border-color:\s*#F59E0B;/g, 'border-color: var(--accent-gold);'],
  [/border-color:\s*#059669;/g, 'border-color: #C5D8CD;']
];

for (const [pattern, replacement] of cssReplacements) {
  styleCss = styleCss.replace(pattern, replacement);
}

fs.writeFileSync(stylePath, styleCss, 'utf8');
console.log('✅ style.css refreshed.');

// 2. UPDATE HTML FILES
const htmlFiles = [
  'about.html',
  'admin.html',
  'booking.html',
  'contact.html',
  'courses.html',
  'events.html',
  'index.html',
  'membership.html',
  'student-portal.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace colors
  html = html.replace(/color:\s*#78350F;/g, 'color: #172A22;');
  html = html.replace(/color:\s*#92400E;/g, 'color: #8A4128;');
  html = html.replace(/color:\s*#064E3B;/g, 'color: #163227;');
  html = html.replace(/color:\s*#047857;/g, 'color: #234A3B;');
  html = html.replace(/color:\s*#D97706;/g, 'color: #A35438;');
  html = html.replace(/color:\s*#B45309;/g, 'color: #8A4128;');
  html = html.replace(/color:\s*#FEF3C7;/g, 'color: #E2BE7E;');
  html = html.replace(/color:\s*#FBBF24;/g, 'color: #E2BE7E;');
  html = html.replace(/color:\s*#F59E0B;/g, 'color: #C9A05C;');
  html = html.replace(/color:#78350F;/g, 'color:#172A22;');
  html = html.replace(/color:#047857;/g, 'color:#234A3B;');
  html = html.replace(/color:#D97706;/g, 'color:#A35438;');
  html = html.replace(/color:#92400E;/g, 'color:#8A4128;');

  // Backgrounds
  html = html.replace(/background:\s*#FEF3C7;/g, 'background: #F8EFEA;');
  html = html.replace(/background:\s*#FFFBEB;/g, 'background: #FAF5EE;');
  html = html.replace(/background:\s*#FDFBF7;/g, 'background: #FAF8F5;');
  html = html.replace(/background:\s*#FFFDF8;/g, 'background: #FAF8F5;');
  html = html.replace(/background:\s*#D1FAE5;/g, 'background: #EDF3F0;');
  html = html.replace(/background:\s*#ECFDF5;/g, 'background: #F3F7F5;');
  html = html.replace(/background:\s*#F0FDF4;/g, 'background: #F3F7F5;');
  html = html.replace(/background:#D1FAE5;/g, 'background:#EDF3F0;');
  html = html.replace(/background:#FEF3C7;/g, 'background:#F8EFEA;');

  // Borders
  html = html.replace(/border:\s*1px solid #FDE68A;/g, 'border: 1px solid #E6DFD5;');
  html = html.replace(/border:\s*1\.5px solid #FDE68A;/g, 'border: 1.5px solid #E6DFD5;');
  html = html.replace(/border:\s*2px solid #FDE68A;/g, 'border: 1.5px solid #E6DFD5;');
  html = html.replace(/border-color:\s*#D97706;/g, 'border-color: #A35438;');
  html = html.replace(/border:\s*1px dashed #D97706;/g, 'border: 1.5px dashed #A35438;');
  html = html.replace(/border:\s*1\.5px dashed #D97706;/g, 'border: 1.5px dashed #A35438;');
  html = html.replace(/border-left:\s*4px solid #D97706;/g, 'border-left: 4px solid #A35438;');
  html = html.replace(/border:\s*2px solid #34D399;/g, 'border: 1.5px solid #C5D8CD;');
  html = html.replace(/border:\s*1px solid #A7F3D0;/g, 'border: 1px solid #C5D8CD;');
  html = html.replace(/border:\s*1\.5px solid #047857;/g, 'border: 1.5px solid #234A3B;');
  html = html.replace(/border-color:#F59E0B;/g, 'border-color:#C9A05C;');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${file} refreshed.`);
});

// 3. UPDATE JS TEMPLATES
const jsFiles = [
  'assets/js/gallery.js',
  'assets/js/admin.js',
  'assets/js/pranayama.js',
  'assets/js/pwa.js',
  'assets/js/student.js'
];

jsFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) return;

  let js = fs.readFileSync(filePath, 'utf8');

  js = js.replace(/color:\s*#78350F;/g, 'color: #172A22;')
         .replace(/color:#78350F;/g, 'color:#172A22;')
         .replace(/color:\s*#047857;/g, 'color: #234A3B;')
         .replace(/color:#047857;/g, 'color:#234A3B;')
         .replace(/color:\s*#D97706;/g, 'color: #A35438;')
         .replace(/color:#D97706;/g, 'color:#A35438;')
         .replace(/color:\s*#92400E;/g, 'color: #8A4128;')
         .replace(/color:\s*'#047857'/g, "'#234A3B'")
         .replace(/color:\s*'#D97706'/g, "'#A35438'")
         .replace(/background:\s*#FEF3C7;/g, 'background: #F8EFEA;')
         .replace(/background:#FEF3C7;/g, 'background:#F8EFEA;')
         .replace(/background:\s*#FFFDF8;/g, 'background: #FAF8F5;')
         .replace(/border:\s*1\.5px dashed #D97706;/g, 'border: 1.5px dashed #A35438;')
         .replace(/border-top:\s*4px solid #D97706;/g, 'border-top: 3px solid #A35438;')
         .replace(/rgba\(217,119,6,0\.06\)/g, 'rgba(163,84,56,0.06)')
         .replace(/border:\s*1px solid #FDE68A;/g, 'border: 1px solid #E6DFD5;')
         .replace(/border:1px solid #FDE68A;/g, 'border:1px solid #E6DFD5;')
         .replace(/'radial-gradient\(circle, #34D399, #047857\)'/g, "'radial-gradient(circle, #4E7D6A, #234A3B)'");

  fs.writeFileSync(filePath, js, 'utf8');
  console.log(`✅ ${file} template colors harmonized.`);
});

console.log('🎉 Human Artisan Palette completely unified!');
