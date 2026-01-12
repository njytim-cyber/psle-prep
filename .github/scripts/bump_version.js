const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '../../package.json');
const indexPath = path.join(__dirname, '../../index.html');

// 1. Read package.json
const pkg = require(packagePath);
const oldVersion = pkg.version;

// 2. Increment Patch Version
const parts = oldVersion.split('.').map(Number);
parts[2]++; // Increment patch
const newVersion = parts.join('.');

console.log(`Bumping version: ${oldVersion} -> ${newVersion}`);

// 3. Write package.json
pkg.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

// 4. Update index.html
let html = fs.readFileSync(indexPath, 'utf8');
const versionRegex = /Version \d+\.\d+\.\d+/;

if (versionRegex.test(html)) {
    html = html.replace(versionRegex, `Version ${newVersion}`);
    fs.writeFileSync(indexPath, html);
    console.log(`Updated index.html with Version ${newVersion}`);
} else {
    console.error('Could not find version string in index.html');
    process.exit(1);
}
