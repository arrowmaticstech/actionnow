const { ipcRenderer } = require('electron');
const { Hands } = window;
const { computeFingers, classifyGesture, palmCenter } = window.Gestures;

if (typeof Hands === 'undefined') {
  console.error('MediaPipe Hands NOT loaded (window.Hands is undefined) - check the @mediapipe/hands CDN script in index.html');
} else {
  console.log('MediaPipe Hands loaded OK (window.Hands is defined)');
}

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- Drag functionality ---
const titleBar = document.querySelector('.title-bar');

let isDragging = false;

titleBar.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('settings-btn')) return;
  if (e.target.parentElement && e.target.parentElement.classList.contains('controls')) return;
  isDragging = true;
  ipcRenderer.send('start-drag', e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  ipcRenderer.send('dragging', e.clientX, e.clientY);
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    ipcRenderer.send('stop-drag');
  }
});

// --- Hand tracking state ---
let hands = null;
let mpStatus = 'init';
let lastPose = null;   // tracks pose transitions for click-once behaviour

// Poses that should fire exactly once when entered (not every frame)
const ONESHOT = new Set(['left_click', 'right_click', 'enable', 'disable', 'jump_left', 'jump_right']);

// Map a raw pose into the action the main process should perform
function poseToAction(pose) {
  if (pose === 'fist') return 'drag';            // close palm -> hold + move
  if (pose === 'open_palm') return 'move';       // open palm -> move cursor
  if (pose === 'thumbs_up') return 'enable';     // thumbs up -> turn control on
  if (pose === 'thumbs_down') return 'disable';  // thumbs down -> turn control off
  return pose;                                   // left_click / right_click / move
}

function onResults(results) {
  if (video.videoWidth && canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = '20px sans-serif';
    ctx.fillText('NO HAND', 12, 28);
    drawStatus();
    if (lastPose !== null) {
      ipcRenderer.send('gesture', { type: 'release' });
      lastPose = null;
    }
    return;
  }

  const landmarks = results.multiHandLandmarks[0];
  const pose = classifyGesture(landmarks);
  const c = palmCenter(landmarks);

  ctx.fillStyle = '#00ff66';
  ctx.font = '20px sans-serif';
  ctx.fillText('HAND: ' + pose, 12, 28);
  drawStatus();

  // draw landmarks
  const pts = results.multiHandLandmarks[0];
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],
    [0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20]
  ];
  ctx.beginPath();
  connections.forEach(([a,b]) => {
    const p1 = pts[a], p2 = pts[b];
    const x1 = (1 - p1.x) * canvas.width, y1 = p1.y * canvas.height;
    const x2 = (1 - p2.x) * canvas.width, y2 = p2.y * canvas.height;
    if (a === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x2, y2);
  });
  ctx.stroke();

  // Draw a marker at the palm center (the cursor steering point)
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.arc((1 - c.x) * canvas.width, c.y * canvas.height, 6, 0, Math.PI * 2);
  ctx.fill();

  let action;
  if (pose === 'finger_gun') {
    // Thumbs-up + pointing index: jump to the screen the finger points at
    const center = palmCenter(landmarks);
    const idxTip = landmarks[8];
    const pointLeft = (1 - idxTip.x) < (1 - center.x); // mirrored display space
    action = pointLeft ? 'jump_left' : 'jump_right';
  } else {
    action = poseToAction(pose);
  }

  // One-shot poses (clicks, enable/disable, screen jumps) fire once per entry;
  // move/drag stream every frame so the cursor follows the hand.
  if (ONESHOT.has(action)) {
    if (lastPose === action) {
      if (action === 'left_click' || action === 'right_click') {
        ipcRenderer.send('gesture', { type: 'move', x: c.x, y: c.y });
      }
      return;
    }
    ipcRenderer.send('gesture', { type: action, x: c.x, y: c.y });
    lastPose = action;
    return;
  }

  ipcRenderer.send('gesture', { type: action, x: c.x, y: c.y });
  lastPose = action;
}

function drawStatus() {
  ctx.fillStyle = '#88ddff';
  ctx.font = '12px sans-serif';
  ctx.fillText('MediaPipe: ' + mpStatus + ' | video ' + video.videoWidth + 'x' + video.videoHeight, 12, 46);
}

async function init() {
  window.log && window.log('MediaPipe: creating Hands...');
  const path = require('path');
  hands = new Hands({
    locateFile: (file) => path.join(__dirname, 'mediapipe', file),
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  hands.onResults(onResults);
  mpStatus = 'loading';
  window.log && window.log('MediaPipe: model loading from CDN...');

  video.addEventListener('resize', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });

  feedLoop();
}

async function feedLoop() {
  if (video.readyState >= 2) {
    try {
      await hands.send({ image: video });
      if (mpStatus === 'loading' || mpStatus === 'init') {
        mpStatus = 'ready';
        window.log && window.log('MediaPipe: READY (first frame processed)');
      }
    } catch (e) {
      const msg = 'error: ' + (e && e.message ? e.message : e);
      if (mpStatus !== msg) window.log && window.log('MediaPipe ' + msg);
      mpStatus = msg;
      console.error('MediaPipe send error:', e);
    }
  } else {
    const s = 'waiting for video (readyState=' + video.readyState + ')';
    if (mpStatus !== s) window.log && window.log('MediaPipe: ' + s);
    mpStatus = s;
  }
  requestAnimationFrame(feedLoop);
}

init();