const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "..", "marketplace", "public");

const iconOnlySVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
  <circle cx="256" cy="256" r="256" fill="url(#g)"/>
  <text x="256" y="256" text-anchor="middle" dominant-baseline="central" font-size="320" font-weight="bold" fill="#000" font-family="system-ui, -apple-system, sans-serif">$</text>
</svg>`;

const fullLogoSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
  <rect width="1024" height="1024" rx="220" fill="#0a0a0a"/>
  <circle cx="512" cy="480" r="320" fill="url(#g)"/>
  <text x="512" y="480" text-anchor="middle" dominant-baseline="central" font-size="380" font-weight="bold" fill="#000" font-family="system-ui, -apple-system, sans-serif">$</text>
  <text x="512" y="920" text-anchor="middle" font-size="100" font-weight="600" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" opacity="0.9">spincome</text>
</svg>`;

const ogSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs>
  <circle cx="600" cy="240" r="120" fill="url(#g)"/>
  <text x="600" y="240" text-anchor="middle" dominant-baseline="central" font-size="150" font-weight="bold" fill="#000" font-family="system-ui, -apple-system, sans-serif">$</text>
  <text x="600" y="420" text-anchor="middle" font-size="64" font-weight="700" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">spincome</text>
  <text x="600" y="490" text-anchor="middle" font-size="28" font-weight="400" fill="rgba(255,255,255,0.5)" font-family="system-ui, -apple-system, sans-serif">Get paid to use Claude Code</text>
</svg>`;

async function renderAndSave(svg, renderSize, outputSize, filename) {
  const win = new BrowserWindow({
    width: renderSize, height: renderSize, show: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });
  const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:${renderSize}px;height:${renderSize}px;background:transparent;display:flex;align-items:center;justify-content:center;}</style></head><body>${svg}</body></html>`;
  await win.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
  await new Promise(r => setTimeout(r, 600));
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(OUT, filename), img.resize({ width: outputSize, height: outputSize }).toPNG());
  console.log("  " + filename + " (" + outputSize + "x" + outputSize + ")");
  win.close();
}

async function renderRect(svg, w, h, filename) {
  const win = new BrowserWindow({
    width: w, height: h, show: false,
    webPreferences: { offscreen: true },
  });
  const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:${w}px;height:${h}px;background:#0a0a0a;}</style></head><body>${svg}</body></html>`;
  await win.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
  await new Promise(r => setTimeout(r, 600));
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(OUT, filename), img.resize({ width: w, height: h }).toPNG());
  console.log("  " + filename + " (" + w + "x" + h + ")");
  win.close();
}

app.whenReady().then(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  console.log("Generating icons...");

  // Favicons (icon only - green circle with $)
  await renderAndSave(iconOnlySVG, 512, 16, "favicon-16x16.png");
  await renderAndSave(iconOnlySVG, 512, 32, "favicon-32x32.png");
  await renderAndSave(iconOnlySVG, 512, 48, "favicon-48x48.png");

  // Apple touch icon (full logo)
  await renderAndSave(fullLogoSVG, 512, 180, "apple-touch-icon.png");

  // PWA icons (full logo)
  await renderAndSave(fullLogoSVG, 512, 192, "icon-192x192.png");
  await renderAndSave(fullLogoSVG, 512, 512, "icon-512x512.png");

  // General logo sizes
  await renderAndSave(fullLogoSVG, 512, 64, "logo-64.png");
  await renderAndSave(fullLogoSVG, 512, 128, "logo-128.png");
  await renderAndSave(fullLogoSVG, 512, 256, "logo-256.png");

  // Icon only in various sizes
  await renderAndSave(iconOnlySVG, 512, 64, "icon-64.png");
  await renderAndSave(iconOnlySVG, 512, 128, "icon-128.png");
  await renderAndSave(iconOnlySVG, 512, 256, "icon-256.png");

  // OG image
  await renderRect(ogSVG, 1200, 630, "og-image.png");

  // Save SVGs
  fs.writeFileSync(path.join(OUT, "icon.svg"), iconOnlySVG);
  fs.writeFileSync(path.join(OUT, "logo.svg"), fullLogoSVG);

  console.log("Done!");
  app.quit();
});
