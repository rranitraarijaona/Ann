/* ===== Personnalisation =====
   Change le prénom ici, ou ajoute ?nom=Prénom à l'adresse de la page */
const NAME = new URLSearchParams(location.search).get('nom') || 'Bryan';

const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const N = esc(NAME);

$('#name').textContent = NAME;
document.title = 'Joyeux Anniversaire ' + NAME;

const flame = $('#flame');
const glow = $('#glow');
const hint = $('#hint');
const blowBtn = $('#blowBtn');
const msgEl = $('#message');
let lit = true;

const COLORS = ['#ff6b81', '#ffb347', '#ffe66d', '#7bed9f', '#70a1ff', '#a29bfe', '#ff9ff3'];

/* ===== Message (apparition ligne par ligne) ===== */
function setMessage(lines) {
  msgEl.innerHTML = lines
    .map((l, i) => `<span class="line" style="animation-delay:${i * 0.45}s">${l}</span>`)
    .join('');
}

const MSG_LIT = [
  `Soit toujours heureux petit Tête en l'air <b>${N}</b> 🎊`,
  `Que ta journée ne soit remplie que de <b>sourires</b> et de bons moments 🎉😊`,
  `BISOUS 😙`
];
const MSG_OFF = [
  `🎉 Ton vœu est parti dans les étoiles, ${N}.`,
  `Que cette nouvelle année t'apporte <b>joie</b>, <b>santé</b> et <b>réussite</b> ! 🎂`
];
setMessage(MSG_LIT);

/* ===== Étoiles ===== */
const sc = $('#stars');
const sx = sc.getContext('2d');
let stars = [];

function sizeStars() {
  sc.width = innerWidth;
  sc.height = innerHeight;
  stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * sc.width,
    y: Math.random() * sc.height,
    r: Math.random() * 1.4 + 0.3,
    p: Math.random() * 6.28,
    s: Math.random() * 0.02 + 0.005
  }));
}

function drawStars() {
  sx.clearRect(0, 0, sc.width, sc.height);
  sx.fillStyle = '#fff';
  for (const s of stars) {
    s.p += s.s;
    sx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(s.p));
    sx.beginPath();
    sx.arc(s.x, s.y, s.r, 0, 6.28);
    sx.fill();
  }
  sx.globalAlpha = 1;
  requestAnimationFrame(drawStars);
}

/* ===== Confettis + feux d'artifice ===== */
const cc = $('#confetti');
const cx = cc.getContext('2d');
let parts = [];

function sizeConfetti() {
  cc.width = innerWidth;
  cc.height = innerHeight;
}

function confetti(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = Math.random() * 9 + 3;
    parts.push({
      k: 'c', x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 6,
      w: Math.random() * 8 + 4,
      h: Math.random() * 5 + 3,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[i % COLORS.length],
      life: 1
    });
  }
}

function firework(x, y) {
  const c = COLORS[Math.floor(Math.random() * COLORS.length)];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const v = Math.random() * 4 + 2;
    parts.push({ k: 'f', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, life: 1 });
  }
}

function loop() {
  cx.clearRect(0, 0, cc.width, cc.height);
  parts = parts.filter((p) => p.life > 0 && p.y < cc.height + 40);
  for (const p of parts) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.k === 'c') {
      p.vy += 0.25;
      p.vx *= 0.985;
      p.rot += p.vr;
      p.life -= 0.004;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.globalAlpha = Math.min(1, p.life * 2);
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    } else {
      p.vy += 0.05;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= 0.014;
      cx.globalAlpha = Math.max(0, p.life);
      cx.fillStyle = p.c;
      cx.beginPath();
      cx.arc(p.x, p.y, 2.2, 0, 6.28);
      cx.fill();
    }
  }
  cx.globalAlpha = 1;
  requestAnimationFrame(loop);
}

/* ===== Ballons ===== */
const balloonsBox = $('#balloons');

function balloon(ambient) {
  const b = document.createElement('div');
  b.className = 'balloon';
  b.style.left = Math.random() * 92 + '%';
  b.style.setProperty('--c', COLORS[Math.floor(Math.random() * COLORS.length)]);
  b.style.setProperty('--d', (ambient ? 14 + Math.random() * 10 : 6 + Math.random() * 5) + 's');
  b.style.setProperty('--delay', (ambient ? Math.random() * 12 : Math.random() * 1.2) + 's');
  b.style.setProperty('--iter', ambient ? 'infinite' : '1');
  if (!ambient) b.addEventListener('animationend', () => b.remove());
  balloonsBox.appendChild(b);
}

/* ===== Souffler / rallumer ===== */
function blow() {
  lit = false;
  flame.classList.add('off');
  glow.classList.add('off');
  blowBtn.textContent = '🔥 Rallumer la bougie';
  hint.textContent = 'Ton vœu va se réaliser 🌟';

  const top = $('#cake').getBoundingClientRect().top;
  confetti(innerWidth / 2, top, 170);
  for (let i = 0; i < 5; i++) {
    setTimeout(() => firework(
      innerWidth * (0.1 + Math.random() * 0.8),
      innerHeight * (0.08 + Math.random() * 0.3)
    ), i * 350);
  }
  for (let i = 0; i < 14; i++) balloon(false);
  setMessage(MSG_OFF);
  if (navigator.vibrate) navigator.vibrate(60);
}

function relight() {
  lit = true;
  flame.classList.remove('off');
  glow.classList.remove('off');
  blowBtn.textContent = '🕯️ Souffler la bougie';
  hint.textContent = 'Fais un vœu, puis souffle la bougie…';
  setMessage(MSG_LIT);
}

function toggleCandle() { lit ? blow() : relight(); }
blowBtn.addEventListener('click', toggleCandle);
$('#cake').addEventListener('click', toggleCandle);

/* ===== Mélodie "Joyeux anniversaire" (WebAudio) ===== */
const BEAT = 0.45;
const MELODY = [
  [262, .75], [262, .25], [294, 1], [262, 1], [349, 1], [330, 2],
  [262, .75], [262, .25], [294, 1], [262, 1], [392, 1], [349, 2],
  [262, .75], [262, .25], [523, 1], [440, 1], [349, 1], [330, 1], [294, 2],
  [466, .75], [466, .25], [440, 1], [349, 1], [392, 1], [349, 2]
];
let audio = null;
let playing = false;
let stopTimer = null;
const musicBtn = $('#musicBtn');

function stopMusic() {
  if (audio) { audio.close(); audio = null; }
  clearTimeout(stopTimer);
  playing = false;
  musicBtn.textContent = '🎵 Musique';
}

function playMusic() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audio = new AC();
  let t = audio.currentTime + 0.05;
  for (const [f, d] of MELODY) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    const len = d * BEAT;
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + len - 0.02);
    o.connect(g);
    g.connect(audio.destination);
    o.start(t);
    o.stop(t + len);
    t += len;
  }
  playing = true;
  musicBtn.textContent = '⏹ Arrêter';
  stopTimer = setTimeout(stopMusic, (t - audio.currentTime) * 1000 + 300);
}

musicBtn.addEventListener('click', () => (playing ? stopMusic() : playMusic()));

/* ===== Démarrage ===== */
addEventListener('resize', () => { sizeStars(); sizeConfetti(); });
sizeStars();
sizeConfetti();
drawStars();
loop();
for (let i = 0; i < 7; i++) balloon(true);

setTimeout(() => {
  confetti(innerWidth / 2, innerHeight * 0.3, 90);
  firework(innerWidth * 0.5, innerHeight * 0.2);
}, 700);