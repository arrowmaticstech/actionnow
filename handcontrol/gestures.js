(function (root) {
  function computeFingers(landmarks) {
    const tips = [4, 8, 12, 16, 20];
    const pips = [3, 6, 10, 14, 18];
    const fingers = { thumb: false, index: false, middle: false, ring: false, pinky: false };
    for (let i = 1; i <= 4; i++) {
      const tip = landmarks[tips[i]];
      const pip = landmarks[pips[i]];
      if (tip.y < pip.y) {
        fingers[['index', 'middle', 'ring', 'pinky'][i - 1]] = true;
      }
    }
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    if (thumbTip.x > thumbIP.x) fingers.thumb = true;
    return fingers;
  }

  // Returns one of: left_click, right_click, fist, open_palm, thumbs_up,
  // thumbs_down, finger_gun, move
  function classifyGesture(landmarks) {
    const f = computeFingers(landmarks);
    const { index, middle, ring, pinky } = f;
    const t = landmarks;
    const d = (a, b) => Math.hypot(t[a].x - t[b].x, t[a].y - t[b].y);
    const handSize = d(0, 9); // wrist -> middle-finger MCP, used as a scale reference

    // Thumb is "extended" when its tip is well away from the wrist
    const thumbExtended = d(0, 4) > handSize * 0.6;
    // Thumbs up: tip clearly above the thumb IP joint; thumbs down: clearly below
    const thumbUp = thumbExtended && t[4].y < t[3].y - handSize * 0.04;
    const thumbDown = thumbExtended && t[4].y > t[3].y + handSize * 0.04;

    const folded = !index && !middle && !ring && !pinky;

    if (folded) {
      if (thumbUp) return 'thumbs_up';
      if (thumbDown) return 'thumbs_down';
      return 'fist';
    }
    // Finger gun: thumb extended + only the index finger up
    if (thumbExtended && index && !middle && !ring && !pinky) return 'finger_gun';
    if (index && !middle && !ring && !pinky) return 'left_click';   // 1 finger -> left click
    if (index && middle && !ring && !pinky) return 'right_click';   // 2 fingers -> right click
    return 'move';                                                 // open palm / other -> move
  }

  // Stable point to steer the cursor: center of the palm (wrist + 4 MCP joints)
  function palmCenter(landmarks) {
    const ids = [0, 5, 9, 13, 17];
    let x = 0, y = 0;
    for (const i of ids) { x += landmarks[i].x; y += landmarks[i].y; }
    return { x: x / ids.length, y: y / ids.length };
  }

  const api = { computeFingers, classifyGesture, palmCenter };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Gestures = api;
})(typeof window !== 'undefined' ? window : globalThis);
