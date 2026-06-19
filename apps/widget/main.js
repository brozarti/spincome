const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CONFIG_PATH   = path.join(os.homedir(), ".spincome", "config.json");
const LIFETIME_PATH = path.join(os.homedir(), ".spincome", "lifetime.json");
const SESSION_PATH  = path.join(os.homedir(), ".spincome", "session.json");
const API_BASE      = "https://spincome-marketplace-git-main-spincome.vercel.app/api";

let tray;
let win;

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return null; }
}

function getConfig() {
  return readJSON(CONFIG_PATH);
}

function createTrayIcon() {
  // Use the pre-rendered PNG from the iconset (32x32 for retina, displayed at 16x16)
  const iconPath = path.join(__dirname, "build", "spincome.iconset", "icon_32x32.png");
  if (fs.existsSync(iconPath)) {
    const img = nativeImage.createFromPath(iconPath);
    img.setTemplateImage(false);
    return img.resize({ width: 18, height: 18 });
  }
  // Fallback if iconset not found
  const img = nativeImage.createFromBuffer(Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="#10b981"/>
      <text x="18" y="18" text-anchor="middle" dominant-baseline="central" font-size="20" font-weight="bold" fill="#000" font-family="sans-serif">$</text>
    </svg>`
  ));
  img.setTemplateImage(false);
  return img.resize({ width: 18, height: 18 });
}

function createWindow() {
  const trayBounds = tray.getBounds();
  const display = screen.getPrimaryDisplay();
  const winW = 320;
  const winH = 400;

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - winW / 2);
  const y = trayBounds.y + trayBounds.height + 4;

  win = new BrowserWindow({
    width: winW,
    height: winH,
    x: Math.max(0, Math.min(x, display.workAreaSize.width - winW)),
    y,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: true,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("widget.html");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.on("blur", () => win.hide());
}

function toggleWindow() {
  if (!win) {
    createWindow();
    win.once("ready-to-show", () => win.show());
    return;
  }
  if (win.isVisible()) {
    win.hide();
  } else {
    const trayBounds = tray.getBounds();
    const winW = 320;
    const x = Math.round(trayBounds.x + trayBounds.width / 2 - winW / 2);
    const y = trayBounds.y + trayBounds.height + 4;
    const display = screen.getPrimaryDisplay();
    win.setPosition(
      Math.max(0, Math.min(x, display.workAreaSize.width - winW)),
      y
    );
    win.show();
  }
}

async function fetchServerData(devKey) {
  try {
    const res = await fetch(`${API_BASE}/developers/me`, {
      headers: { "X-Developer-Key": devKey },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function updateTrayTitle() {
  const config = getConfig();
  if (!config?.developerKey) {
    tray.setTitle(" setup", { fontType: "monospacedDigit" });
    return;
  }

  const lifetime = readJSON(LIFETIME_PATH);
  const cents = lifetime?.totalCents ?? 0;
  const dollars = (cents / 100000).toFixed(2);
  tray.setTitle(` $${dollars}`, { fontType: "monospacedDigit" });
}

// IPC: renderer asks for server data
ipcMain.handle("get-server-data", async () => {
  const config = getConfig();
  if (!config?.developerKey) return null;
  return await fetchServerData(config.developerKey);
});

ipcMain.handle("get-config", () => getConfig());

ipcMain.handle("get-local-data", () => {
  return {
    session: readJSON(SESSION_PATH),
    lifetime: readJSON(LIFETIME_PATH),
  };
});

ipcMain.handle("save-config", (_, config) => {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  updateTrayTitle();
  return true;
});

ipcMain.on("quit-app", () => app.quit());

app.dock?.hide();

app.whenReady().then(() => {
  tray = new Tray(createTrayIcon());
  tray.setToolTip("spincome");
  updateTrayTitle();
  tray.on("click", toggleWindow);

  // Watch files for tray title updates
  [LIFETIME_PATH, SESSION_PATH].forEach(p => {
    try { fs.watch(p, () => setTimeout(updateTrayTitle, 200)); } catch {}
  });

  setInterval(updateTrayTitle, 15000);
});

app.on("window-all-closed", (e) => e.preventDefault());
