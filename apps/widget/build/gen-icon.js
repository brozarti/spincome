const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");

const iconsetDir = path.join(__dirname, "spincome.iconset");

app.whenReady().then(async () => {
  if (!fs.existsSync(iconsetDir)) fs.mkdirSync(iconsetDir);

  const svgPath = path.join(__dirname, "icon.svg");
  const svgB64 = Buffer.from(fs.readFileSync(svgPath)).toString("base64");
  const url = "data:image/svg+xml;base64," + svgB64;

  const entries = [
    [16, "icon_16x16.png"], [32, "icon_16x16@2x.png"],
    [32, "icon_32x32.png"], [64, "icon_32x32@2x.png"],
    [128, "icon_128x128.png"], [256, "icon_128x128@2x.png"],
    [256, "icon_256x256.png"], [512, "icon_256x256@2x.png"],
    [512, "icon_512x512.png"], [1024, "icon_512x512@2x.png"],
  ];

  const win = new BrowserWindow({
    width: 1024, height: 1024, show: false,
    webPreferences: { offscreen: true },
  });
  await win.loadURL(url);
  await new Promise(r => setTimeout(r, 500));

  const full = await win.webContents.capturePage();

  for (const [size, name] of entries) {
    const resized = full.resize({ width: size, height: size });
    fs.writeFileSync(path.join(iconsetDir, name), resized.toPNG());
    console.log("  " + name);
  }

  win.close();
  console.log("Done. Run: iconutil -c icns spincome.iconset -o icon.icns");
  app.quit();
});
