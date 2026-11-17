import { AudioFX } from './audio.js';
import { InputState } from './input.js';
import { GameWorld } from './entities.js';
import { draw } from './render.js';

document.title = 'Starshard Salvage';
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
canvas.width = 1280; canvas.height = 800;
const input = new InputState(canvas), audio = new AudioFX();
let world = new GameWorld(), state = 'title', remaining = 90, finalScore = 0, best = 0;
try { best = Number(localStorage.getItem('starshard-best') || 0); } catch {}

function start() {
  input.consumeFire(); audio.unlock(); audio.click(); world.reset(); remaining = 90; finalScore = 0; state = 'play'; overlay.innerHTML = '';
}
function finish(result) {
  state = result;
  finalScore = result === 'win' ? world.score + Math.floor(remaining) * 25 : world.score;
  if (finalScore > best) { best = finalScore; try { localStorage.setItem('starshard-best', String(best)); } catch {} }
  if (result === 'win') audio.win(); else audio.loss();
  showPanel();
}
function showPanel() {
  if (state === 'play') { overlay.innerHTML = ''; return; }
  if (state === 'pause') {
    overlay.innerHTML = '<section class="panel"><div class="eyebrow">Flight suspended</div><h1>Paused</h1><p>Take a breath, pilot.</p><button data-action="resume">Resume</button><p class="small">Press P to continue</p></section>';
  } else if (state === 'title') {
    overlay.innerHTML = '<section class="panel"><div class="eyebrow">Deep space recovery division</div><h1>Starshard<br>Salvage</h1><p>Harpoon 12 drifting starshards to charge the warp gate. Keep clear of the void mines.</p><p class="controls">WASD / arrows move · Mouse aims · Click or Space harpoons</p><button data-action="start">Start Salvage</button><p class="small">Best score ' + best.toLocaleString() + ' · 90 seconds</p></section>';
  } else {
    const won = state === 'win';
    const headline = won ? 'Gate charged!' : 'Hull lost';
    const detail = won ? '12 shards secured · ' + Math.floor(remaining) + 's time bonus × 25 = ' + (Math.floor(remaining) * 25) : world.collected + ' of 12 shards recovered · Hull ' + world.player.hull + '%';
    overlay.innerHTML = '<section class="panel"><div class="eyebrow">' + (won ? 'Salvage complete' : 'Mission ended') + '</div><h1>' + headline + '</h1><p>' + detail + '</p><p><strong>Final score ' + finalScore.toLocaleString() + '</strong></p><button data-action="again">' + (won ? 'Play Again' : 'Try Again') + '</button><p class="small">Best score ' + best.toLocaleString() + ' · R restarts</p></section>';
  }
}
overlay.addEventListener('click', e => {
  const action = e.target.closest('button')?.dataset.action; if (!action) return;
  audio.unlock(); audio.click();
  if (action === 'start' || action === 'again') start();
  if (action === 'resume') { input.consumeFire(); state = 'play'; showPanel(); }
});
window.addEventListener('keydown', e => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === 'r') { start(); return; }
  if (key === 'p' && state === 'play') { input.consumeFire(); state = 'pause'; showPanel(); }
  else if (key === 'p' && state === 'pause') { input.consumeFire(); state = 'play'; showPanel(); }
});
function setupShot(kind) {
  if (!kind) return;
  world.reset();
  if (kind === 'play') { world.collected = 4; world.score = 400; world.wave = 2; world.elapsed = 27; world.player.hull = 75; remaining = 63; }
  if (kind === 'win') { world.collected = 12; world.score = 1200; world.player.hull = 50; remaining = 31; }
  if (kind === 'loss') { world.collected = 7; world.score = 700; world.player.hull = 0; remaining = 24; }
  for (const s of world.shards) s.alive = false;
  state = kind === 'play' ? 'play' : kind;
  if (state === 'play') overlay.innerHTML = ''; else finish(state);
}
const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'play' || shot === 'win' || shot === 'loss') setupShot(shot);
else showPanel();
let last = performance.now();
function frame(now) {
  const dt = Math.min(.04, (now - last) / 1000); last = now;
  if (state === 'play') {
    remaining = Math.max(0, remaining - dt);
    for (const event of world.update(dt, input)) {
      if (event === 'pickup') audio.pickup();
      if (event === 'hit') audio.hit();
    }
    if (world.collected >= 12) finish('win');
    else if (world.player.hull <= 0 || remaining <= 0) finish('loss');
  }
  draw(ctx, world, state, { remaining, finalScore, best });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
