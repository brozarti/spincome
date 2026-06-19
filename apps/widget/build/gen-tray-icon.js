const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

app.whenReady().then(async () => {
  const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body { width: 44px; height: 44px; background: transparent; }
  svg { display: block; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="17" fill="none" stroke="white" stroke-width="2.5"/>
  <text x="22" y="22" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="700" fill="white" font-family="-apple-system, sans-serif">$</text>
</svg>
</body></html>`;

  const win = new BrowserWindow({
    width: 44, height: 44, show: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });

  await win.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
  await new Promise(r => setTimeout(r, 500));

  const img = await win.webContents.capturePage();
  const png = img.toPNG();

  fs.writeFileSync(path.join(__dirname, "tray-iconTemplate.png"), png);
  fs.writeFileSync(path.join(__dirname, "tray-iconTemplate@2x.png"), png);
  console.log("Tray template icons generated:", png.length, "bytes");

  win.close();
  app.quit();
});
