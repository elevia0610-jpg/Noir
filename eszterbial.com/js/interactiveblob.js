// ─── INTERACTIVE SMILEY BLOB ──────────────────────────────────────────────────
// Smiley stays BEHIND the text in z-order.
// Hover is detected purely via mousemove + getBoundingClientRect,
// so overlapping elements (WEB / brand / DESIGNER text) never block it.

(function () {
  'use strict';

  var clamp = function(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  // ── Catmull-Rom → closed cubic bezier ───────────────────────────────────────
  function catmullPath(pts, tension) {
    tension = tension !== undefined ? tension : 0.40;
    var n = pts.length;
    var d = 'M ' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n];
      var p1 = pts[i];
      var p2 = pts[(i + 1) % n];
      var p3 = pts[(i + 2) % n];
      var cp1x = p1.x + (p2.x - p0.x) * tension;
      var cp1y = p1.y + (p2.y - p0.y) * tension;
      var cp2x = p2.x - (p3.x - p1.x) * tension;
      var cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ' C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ', '
                 + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ', '
                 + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
    return d + ' Z';
  }

  // ── Open catmull-rom (smile) ─────────────────────────────────────────────────
  function catmullOpen(pts, tension) {
    tension = tension !== undefined ? tension : 0.40;
    if (pts.length < 2) return '';
    var n = pts.length;
    var d = 'M ' + pts[0].x.toFixed(2) + ' ' + pts[0].y.toFixed(2);
    for (var i = 0; i < n - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[Math.min(n - 1, i + 2)];
      var cp1x = p1.x + (p2.x - p0.x) * tension;
      var cp1y = p1.y + (p2.y - p0.y) * tension;
      var cp2x = p2.x - (p3.x - p1.x) * tension;
      var cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ' C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ', '
                 + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ', '
                 + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
    }
    return d;
  }

  // ── Pill shape ───────────────────────────────────────────────────────────────
  function makePill(cx, cy, w, h) {
    var pts = [], steps = 16;
    for (var i = 0; i < steps; i++) {
      var t  = (i / steps) * Math.PI * 2;
      var ct = Math.cos(t), st = Math.sin(t);
      var px = (ct < 0 ? -1 : 1) * Math.pow(Math.abs(ct), 0.5)  * w;
      var py = (st < 0 ? -1 : 1) * Math.pow(Math.abs(st), 0.55) * h;
      pts.push({ x: cx + px, y: cy + py });
    }
    return pts;
  }

  // ── Geometry ─────────────────────────────────────────────────────────────────
  var VW = 400, VH = 400, CCX = 200, CCY = 200, RING_R = 152;
  var RING_N = 24, SMILE_N = 9;

  function baseRingPts() {
    return Array.from({ length: RING_N }, function(_, i) {
      var a = (i / RING_N) * Math.PI * 2 - Math.PI / 2;
      return { x: CCX + Math.cos(a) * RING_R, y: CCY + Math.sin(a) * RING_R };
    });
  }
  function baseSmilePts() {
    var r = 80, cy2 = CCY + 8;
    return Array.from({ length: SMILE_N }, function(_, i) {
      var t   = i / (SMILE_N - 1);
      // 30deg → 150deg sweeps through 90deg = bottom of circle = smile
      var rad = ((30 + t * 120) * Math.PI) / 180;
      return { x: CCX + Math.cos(rad) * r, y: cy2 + Math.sin(rad) * r };
    });
  }

  // ── Springs ──────────────────────────────────────────────────────────────────
  function makeSprings(pts) {
    return pts.map(function(p) {
      return { bx: p.x, by: p.y, x: p.x, y: p.y, vx: 0, vy: 0 };
    });
  }
  function stepSprings(springs, targets, stiff, damp) {
    springs.forEach(function(sp, i) {
      sp.vx = sp.vx * damp + (targets[i].x - sp.x) * stiff;
      sp.vy = sp.vy * damp + (targets[i].y - sp.y) * stiff;
      sp.x += sp.vx;
      sp.y += sp.vy;
    });
  }
  function getPts(springs) {
    return springs.map(function(s) { return { x: s.x, y: s.y }; });
  }

  var ringSprings  = makeSprings(baseRingPts());
  var smileSprings = makeSprings(baseSmilePts());
  var eyeLSprings  = makeSprings(makePill(165, 168, 14, 24));
  var eyeRSprings  = makeSprings(makePill(235, 168, 14, 24));
  var curlSprings  = makeSprings([{x:124,y:116},{x:113,y:105},{x:118,y:93}]);

  var STIFF_HOVER = 0.14, DAMP_HOVER = 0.68;
  var STIFF_IDLE  = 0.08, DAMP_IDLE  = 0.72;

  // ── Idle waves ───────────────────────────────────────────────────────────────
  function makeWaves(n) {
    return Array.from({ length: n }, function(_, i) {
      return {
        phase:    (i / n) * Math.PI * 2,
        freq:     0.45 + Math.random() * 0.55,
        amp:      3.5  + Math.random() * 5.0,
        ampPhase: Math.random() * Math.PI * 2
      };
    });
  }
  var ringWaves  = makeWaves(RING_N);
  var smileWaves = makeWaves(SMILE_N);
  var eyeLWaves  = makeWaves(16);
  var eyeRWaves  = makeWaves(16);
  var curlWaves  = makeWaves(3);

  // ── State ────────────────────────────────────────────────────────────────────
  var isHovering = false;
  var svgMouseX  = CCX, svgMouseY = CCY;
  var time = 0;

  // ── Displacement ─────────────────────────────────────────────────────────────
  function hoverDisplace(bx, by, strength) {
    var mx = svgMouseX - CCX, my = svgMouseY - CCY;
    var cursorDist = Math.sqrt(mx * mx + my * my) + 0.001;
    var dx = svgMouseX - bx, dy = svgMouseY - by;
    var dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
    var influence = Math.exp(-dist / 130) * clamp(cursorDist / 60, 0, 1);
    return {
      x: bx + (dx / dist) * influence * 38 * strength,
      y: by + (dy / dist) * influence * 38 * strength
    };
  }
  function idleDisplace(bx, by, wave, t) {
    var dx = bx - CCX, dy = by - CCY;
    var len = Math.sqrt(dx * dx + dy * dy) + 0.001;
    var ampMod = 1 + 0.4 * Math.sin(t * 0.25 + wave.ampPhase);
    var disp   = Math.sin(t * wave.freq + wave.phase) * wave.amp * ampMod;
    return { x: bx + (dx / len) * disp, y: by + (dy / len) * disp };
  }
  function computeTargets(springs, waves, strength) {
    return springs.map(function(sp, i) {
      return isHovering
        ? hoverDisplace(sp.bx, sp.by, strength)
        : idleDisplace(sp.bx, sp.by, waves[i], time);
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    var smileyEl    = document.getElementById('smiley');
    var outerRingEl = document.getElementById('outerRing');
    var smileEl     = document.getElementById('smile');
    var eyeLeftEl   = document.getElementById('eyeLeft');
    var eyeRightEl  = document.getElementById('eyeRight');
    var curlEl      = document.getElementById('curl');

    if (!smileyEl || !outerRingEl || !smileEl || !eyeLeftEl || !eyeRightEl || !curlEl) {
      requestAnimationFrame(init);
      return;
    }

    var customCursor = document.querySelector('.custom-cursor');

    // ── KEY FIX: hover via rect check on mousemove ───────────────────────────
    // getBoundingClientRect() reads the SVG's actual position in the viewport,
    // completely independent of which DOM element is on top at that pixel.
    // No mouseenter/mouseleave needed — those get swallowed by overlapping text.
    document.addEventListener('mousemove', function(e) {
      var r = smileyEl.getBoundingClientRect();

      // Update SVG-space mouse coords
      svgMouseX = ((e.clientX - r.left) / r.width)  * VW;
      svgMouseY = ((e.clientY - r.top)  / r.height) * VH;

      // Is the real cursor pixel inside the smiley's bounding box?
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top  && e.clientY <= r.bottom;

      if (inside !== isHovering) {
        isHovering = inside;
        if (customCursor) {
          customCursor.classList.toggle('hovering', inside);
        }
      }
    });

    // ── Animation loop ───────────────────────────────────────────────────────
    function animate() {
      time += 0.018;
      var stiff = isHovering ? STIFF_HOVER : STIFF_IDLE;
      var damp  = isHovering ? DAMP_HOVER  : DAMP_IDLE;

      stepSprings(ringSprings,  computeTargets(ringSprings,  ringWaves,  1.00), stiff,        damp);
      outerRingEl.setAttribute('d', catmullPath(getPts(ringSprings), 0.40));

      stepSprings(smileSprings, computeTargets(smileSprings, smileWaves, 0.85), stiff * 1.10, damp);
      smileEl.setAttribute('d', catmullOpen(getPts(smileSprings), 0.42));

      stepSprings(eyeLSprings,  computeTargets(eyeLSprings,  eyeLWaves,  0.75), stiff * 1.20, damp);
      eyeLeftEl.setAttribute('d', catmullPath(getPts(eyeLSprings), 0.38));

      stepSprings(eyeRSprings,  computeTargets(eyeRSprings,  eyeRWaves,  0.75), stiff * 1.20, damp);
      eyeRightEl.setAttribute('d', catmullPath(getPts(eyeRSprings), 0.38));

      stepSprings(curlSprings,  computeTargets(curlSprings,  curlWaves,  0.70), stiff,        damp);
      var c = curlSprings;
      curlEl.setAttribute('d',
        'M '  + c[0].x.toFixed(2) + ' ' + c[0].y.toFixed(2) +
        ' Q ' + c[1].x.toFixed(2) + ' ' + c[1].y.toFixed(2) +
        ' '   + c[2].x.toFixed(2) + ' ' + c[2].y.toFixed(2)
      );

      requestAnimationFrame(animate);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();