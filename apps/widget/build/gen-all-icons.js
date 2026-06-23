const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "..", "marketplace", "public");
const SVG_PATH = path.join(__dirname, "icon.svg");

// Icon-only version (just the green circle with $, no text, no background)
const iconOnlySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="256" fill="url(#g)"/>
  <text x="256" y="256" text-anchor="middle" dominant-baseline="central" font-size="320" font-weight="bold" fill="#000" font-family="system-ui, -apple-system, sans-serif">$</text>
</svg>`;

// OG image (1200x630) - dark bg with logo and tagline
const ogSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <circle cx="600" cy="240" r="120" fill="url(#g)"/>
  <text x="600" y="240" text-anchor="middle" dominant-baseline="central" font-size="150" font-weight="bold" fill="#000" font-family="system-ui, -apple-system, sans-serif">$</text>
  <text x="600" y="420" text-anchor="middle" font-size="64" font-weight="700" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">spincome</text>
  <text x="600" y="490" text-anchor="middle" font-size="28" font-weight="400" fill="rgba(255,255,255,0.5)" font-family="system-ui, -apple-system, sans-serif">Get paid to use Claude Code</text>
</svg>`;

app.whenReady().then(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  async function renderSVG(svg, width, height, filename) {
    const win = new BrowserWindow({ width, height, show: false, webPreferences: { offscreen: true } });
    await win.loadURL("data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"));
    await new Promise(r => setTimeout(r, 500));
    const img = await win.webContents.capturePage();
    const resized = img.resize({ width, height });
    fs.writeFileSync(path.join(OUT, filename), resized.toPNG());
    console.log("  " + filename + " (" + width + "x" + height + ")");
    win.close();
  }

  const fullSVG = fs.readFileSync(SVG_PATH, "utf8");

  console.log("Generating icons...");

  // Favicons
  await renderSVG(iconOnlySVG, 16, 16, "favicon-16x16.png");
  await renderSVG(iconOnlySVG, 32, 32, "favicon-32x32.png");
  await renderSVG(iconOnlySVG, 48, 48, "favicon-48x48.png");

  // Apple touch icon
  await renderSVG(fullSVG, 180, 180, "apple-touch-icon.png");

  // Android / PWA icons
  await renderSVG(fullSVG, 192, 192, "icon-192x192.png");
  await renderSVG(fullSVG, 512, 512, "icon-512x512.png");

  // Open Graph image (social sharing)
  await renderSVG(ogSVG, 1200, 630, "og-image.png");

  // General logo variants
  await renderSVG(fullSVG, 64, 64, "logo-64.png");
  await renderSVG(fullSVG, 128, 128, "logo-128.png");
  await renderSVG(fullSVG, 256, 256, "logo-256.png");

  // SVG versions
  fs.writeFileSync(path.join(OUT, "icon.svg"), iconOnlySVG);
  fs.writeFileSync(path.join(OUT, "logo.svg"), fullSVG);
  fs.writeFileSync(path.join(OUT, "og-image.svg"), ogSVG);

  console.log("Done! All icons in " + OUT);
  app.quit();
});
