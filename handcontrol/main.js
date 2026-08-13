const { app, BrowserWindow, ipcMain, screen: electronScreen } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { mouse, Button, Point, screen: nutScreen } = require('@nut-tree-fork/nut-js');

const LOG_FILE = path.join(__dirname, 'app-debug.log');
fs.writeFileSync(LOG_FILE, '=== app-debug.log started ' + new Date().toISOString() + ' ===\n');

function flog(msg) {
  try { fs.appendFileSync(LOG_FILE, msg + '\n'); } catch (e) {}
}

let win;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

ipcMain.on('log', (e, msg) => flog('[renderer] ' + msg));

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 480,
    height: 740,
    frame: false,
    transparent: false,
    backgroundColor: '#000000',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hiddenInset',
  });
  win.setOpacity(0.96);

  win.loadFile('index.html');

  // Open DevTools in a separate detached window for debugging
  win.webContents.openDevTools({ mode: 'detach' });

  // --- Window control IPC ---
  ipcMain.on('minimize', () => win.minimize());
  ipcMain.on('maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('close', () => win.close());

  ipcMain.on('set-always-on-top', (e, val) => {
    win.setAlwaysOnTop(val);
  });

  // --- Drag handling ---
  // We forward drag gestures from renderer via IPC
  ipcMain.on('start-drag', (e, x, y) => {
    isDragging = true;
    dragOffsetX = x;
    dragOffsetY = y;
  });
  ipcMain.on('dragging', (e, mx, my) => {
    if (isDragging) {
      win.setPosition(mx - dragOffsetX, my - dragOffsetY);
    }
  });
  ipcMain.on('stop-drag', () => {
    isDragging = false;
  });

  // --- Device selection (renderer handles enumeration) ---
  ipcMain.on('set-webcam', (event, camId) => {
    console.log('Setting webcam to:', camId);
    // Renderer will handle switching stream
  });

  ipcMain.on('set-mic', (event, micId) => {
    console.log('Setting mic to:', micId);
  });

  ipcMain.on('set-output', (event, outId) => {
    console.log('Setting output to:', outId);
  });

  ipcMain.on('test-audio', () => {
    console.log('Testing audio...');
  });

  // --- Gesture -> mouse control (nut-js, in-process = fast) ---
  let dragging = false;
  let lastX = null, lastY = null;
  let SW = 0, SH = 0;
  let controlEnabled = true; // default ON; toggled by thumbs up / thumbs down
  const SMOOTH = 0.5; // 0 = raw, 1 = fully smoothed

  async function ensureScreen() {
    if (!SW) { SW = await nutScreen.width(); SH = await nutScreen.height(); }
  }

  async function moveCursor(nx, ny) {
    await ensureScreen();
    // Mirror X so moving your hand right moves the cursor right (like a mirror)
    let px = (1 - nx) * SW;
    let py = ny * SH;
    if (lastX !== null) {
      px = lastX + (px - lastX) * SMOOTH;
      py = lastY + (py - lastY) * SMOOTH;
    }
    lastX = px; lastY = py;
    await mouse.move(new Point(Math.round(px), Math.round(py)));
  }

  function jumpScreen(dir) {
    const displays = electronScreen.getAllDisplays();
    if (displays.length < 2) return;
    const cur = electronScreen.getCursorScreenPoint();
    let current = displays.find(d =>
      cur.x >= d.bounds.x && cur.x < d.bounds.x + d.bounds.width &&
      cur.y >= d.bounds.y && cur.y < d.bounds.y + d.bounds.height) || displays[0];
    let target = displays.find(d =>
      dir === 'left' ? d.bounds.x < current.bounds.x : d.bounds.x > current.bounds.x);
    if (!target) target = displays.find(d => d !== current);
    if (target) {
      mouse.move(new Point(
        Math.round(target.bounds.x + target.bounds.width / 2),
        Math.round(target.bounds.y + target.bounds.height / 2)
      ));
    }
  }

  ipcMain.on('gesture', async (event, data) => {
    const { type, x, y } = data;
    try {
      if (type === 'enable') { controlEnabled = true; return; }
      if (type === 'disable') { controlEnabled = false; return; }
      if (!controlEnabled) return; // control is off (thumbs down)

      if (type === 'move') {
        if (dragging) { await mouse.releaseButton(Button.LEFT); dragging = false; }
        if (typeof x === 'number') await moveCursor(x, y);
      } else if (type === 'drag') {
        if (!dragging) { await mouse.pressButton(Button.LEFT); dragging = true; }
        if (typeof x === 'number') await moveCursor(x, y);
      } else if (type === 'left_click') {
        if (dragging) { await mouse.releaseButton(Button.LEFT); dragging = false; }
        if (typeof x === 'number') await moveCursor(x, y);
        await mouse.click(Button.LEFT);
      } else if (type === 'right_click') {
        if (dragging) { await mouse.releaseButton(Button.LEFT); dragging = false; }
        if (typeof x === 'number') await moveCursor(x, y);
        await mouse.click(Button.RIGHT);
      } else if (type === 'jump_left') {
        jumpScreen('left');
      } else if (type === 'jump_right') {
        jumpScreen('right');
      } else if (type === 'release') {
        if (dragging) { await mouse.releaseButton(Button.LEFT); dragging = false; }
        lastX = lastY = null;
      }
    } catch (e) {
      console.error('Gesture handling error:', e.message);
    }
  });
});