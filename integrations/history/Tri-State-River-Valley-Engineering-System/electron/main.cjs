const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#020617',
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: isDev,
    },
  });

  win.once('ready-to-show', () => win.show());

  // The renderer uses local/open OSS GIS data paths. Block unexpected third-party
  // navigation so the portable build remains deterministic and offline-capable.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  if (isDev) {
    win.loadURL(process.env.PTDT_DEV_URL || 'http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const allowed = [
      'http://localhost:',
      'https://waterservices.usgs.gov/',
      'https://api.weather.gov/',
      'https://geodesy.noaa.gov/',
      'https://maps.indiana.edu/',
      'https://dnrmaps.dnr.in.gov/',
    ];
    const ok = details.url.startsWith('file://') || allowed.some((prefix) => details.url.startsWith(prefix));
    callback({ cancel: !ok });
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
