const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CONFIG_PATH   = path.join(os.homedir(), ".spincome", "config.json");
const LIFETIME_PATH = path.join(os.homedir(), ".spincome", "lifetime.json");
const SESSION_PATH  = path.join(os.homedir(), ".spincome", "session.json");
const AD_PATH       = path.join(os.homedir(), ".spincome", "current-ad.json");
const API_BASE      = "https://spincome-marketplace-git-main-spincome.vercel.app/api";

let tray;
let win;
let lastAdTimestamp = 0;
let autoOpenedByAd = false;
let autoHideTimer;

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return null; }
}

function getConfig() {
  return readJSON(CONFIG_PATH);
}

function createTrayIcon() {
  // Template image: macOS auto-colors it to match menu bar (black in light, white in dark)
  const iconPath = path.join(__dirname, "build", "tray-iconTemplate.png");
  if (fs.existsSync(iconPath)) {
    const img = nativeImage.createFromPath(iconPath);
    img.setTemplateImage(true);
    return img.resize({ width: 18, height: 18 });
  }
  // Fallback
  const img = nativeImage.createFromPath(
    path.join(__dirname, "build", "spincome.iconset", "icon_32x32.png")
  );
  return img.resize({ width: 18, height: 18 });
}

function createWindow() {
  const trayBounds = tray.getBounds();
  const display = screen.getPrimaryDisplay();
  const winW = 320;
  const winH = 620;

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
  autoOpenedByAd = false;
  clearTimeout(autoHideTimer);
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

ipcMain.handle("install-hook", () => {
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const hookCmd = "npx @brozarti/spincome hook";

  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, "utf8")); } catch {}
  }

  const hooks = settings.hooks ?? {};
  const postToolUse = hooks.PostToolUse ?? [];

  const alreadyInstalled = postToolUse.some(entry =>
    entry.hooks?.some(h => h.command === hookCmd)
  );

  if (!alreadyInstalled) {
    postToolUse.push({
      matcher: "",
      hooks: [{ type: "command", command: hookCmd }],
    });
    hooks.PostToolUse = postToolUse;
    settings.hooks = hooks;

    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  return alreadyInstalled ? "already" : "installed";
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

  // Watch for new ads -- auto-show widget when ad arrives
  try {
    fs.watch(AD_PATH, () => {
      setTimeout(() => {
        const ad = readJSON(AD_PATH);
        if (!ad || ad.timestamp <= lastAdTimestamp) return;
        lastAdTimestamp = ad.timestamp;

        // Notify the renderer to show the ad
        if (win) {
          win.webContents.send("new-ad", ad);
        }

        // Auto-show the widget briefly, then hide after 8 seconds
        autoOpenedByAd = true;
        clearTimeout(autoHideTimer);

        if (!win) {
          createWindow();
          win.once("ready-to-show", () => {
            win.show();
            win.webContents.send("new-ad", ad);
          });
        } else if (!win.isVisible()) {
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

        // Auto-minimize after 5 seconds of no new tool calls
        autoHideTimer = setTimeout(() => {
          if (autoOpenedByAd && win && win.isVisible()) {
            win.hide();
            autoOpenedByAd = false;
          }
        }, 5000);
      }, 150);
    });
  } catch {}

  setInterval(updateTrayTitle, 15000);
});

app.on("window-all-closed", (e) => e.preventDefault());
