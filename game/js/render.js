const W = 1280, H = 800;
const stars = Array.from({ length: 155 }, (_, i) => ({
  x: (i * 811 + 149) % W, y: (i * 353 + 71) % H, r: .6 + (i % 4) * .42,
  phase: (i * 1.71) % 6, depth: .25 + (i % 7) / 10
}));
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
};
function background(ctx, world) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0b142b'); g.addColorStop(.55, '#080f21'); g.addColorStop(1, '#10142b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(640, 420, 40, 640, 420, 640);
  glow.addColorStop(0, '#33477b24'); glow.addColorStop(1, '#01040b00');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const t = world.elapsed;
  for (const s of stars) {
    const x = (s.x - t * 5 * s.depth + W) % W;
    const y = (s.y + Math.sin(t * .28 + s.phase) * 5 + H) % H;
    ctx.globalAlpha = .22 + .35 * (Math.sin(t * 1.4 + s.phase) + 1) / 2;
    ctx.fillStyle = '#bcd8ff'; ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#5b74ad0b'; ctx.lineWidth = 1;
  for (let x = 40; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 80; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  gate(ctx, 640, 126, t, world.collected / 12);
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, '#02061188'); edge.addColorStop(.18, '#02061100'); edge.addColorStop(.84, '#02061100'); edge.addColorStop(1, '#020611bb');
  ctx.fillStyle = edge; ctx.fillRect(0, 0, W, H);
}
function gate(ctx, x, y, t, progress) {
  ctx.save(); ctx.translate(x, y);
  ctx.globalAlpha = .52 + Math.sin(t * 2) * .08;
  ctx.shadowBlur = 28; ctx.shadowColor = '#68dfff'; ctx.strokeStyle = '#77dfff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 42 + Math.sin(t * 1.8) * 3, 22, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#748eff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, 27, 13, 0, t, t + Math.PI * 1.45); ctx.stroke();
  ctx.strokeStyle = '#a9f8ff'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.arc(0, 0, 31, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, progress))); ctx.stroke();
  ctx.fillStyle = '#a8f5ff'; ctx.font = '800 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('WARP GATE', 0, 39);
  ctx.restore();
}
function drawShard(ctx, s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.spin);
  ctx.shadowBlur = 18; ctx.shadowColor = '#8bfbff';
  const g = ctx.createLinearGradient(-12, -16, 12, 16); g.addColorStop(0, '#f4ffff'); g.addColorStop(.4, '#8ef7ff'); g.addColorStop(1, '#748aff');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(9, -3); ctx.lineTo(6, 12);
  ctx.lineTo(-3, 16); ctx.lineTo(-10, 3); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#e8ffffaa'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-2, -5, 2, 0, 6.3); ctx.fill(); ctx.restore();
}
function drawMine(ctx, m) {
  ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(m.spin * .42);
  ctx.shadowBlur = 18; ctx.shadowColor = '#fb4562';
  ctx.fillStyle = '#fb5465'; ctx.strokeStyle = '#ff9a98'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, r = i % 2 ? m.r * .78 : m.r * 1.23;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  const g = ctx.createRadialGradient(-5, -6, 1, 0, 0, m.r);
  g.addColorStop(0, '#24152a'); g.addColorStop(1, '#591a36');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, m.r * .63, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffb49a'; ctx.globalAlpha = .72; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, m.r * .37, .3, 4.9); ctx.stroke();
  ctx.restore();
}
function drawDrone(ctx, p, t) {
  if (p.invuln > 0 && Math.floor(t * 18) % 2) return;
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
  ctx.shadowBlur = 18; ctx.shadowColor = '#56d9ff';
  ctx.fillStyle = '#49c9e9'; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-13, -13);
  ctx.lineTo(-8, 0); ctx.lineTo(-13, 13); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#d4faff'; ctx.beginPath(); ctx.ellipse(4, 0, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(6, -1, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#516d9b'; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(-16, -10); ctx.lineTo(-12, -1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-7, 4); ctx.lineTo(-16, 10); ctx.lineTo(-12, 1); ctx.fill();
  ctx.restore();
}
function drawEffects(ctx, world) {
  const p = world.player;
  if (world.harpoon > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, world.harpoon * 6);
    ctx.shadowBlur = 15; ctx.shadowColor = '#a9fbff'; ctx.strokeStyle = '#d5ffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.angle) * 500, p.y + Math.sin(p.angle) * 500); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#6de9ff'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  for (const q of world.particles) {
    ctx.globalAlpha = Math.max(0, q.life / q.max); ctx.fillStyle = q.color;
    ctx.shadowBlur = 10; ctx.shadowColor = q.color; ctx.beginPath();
    ctx.arc(q.x, q.y, q.size * Math.max(.35, q.life / q.max), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  for (const label of world.labels) {
    ctx.globalAlpha = Math.min(1, label.life * 1.8); ctx.fillStyle = '#c6ffff';
    ctx.shadowBlur = 12; ctx.shadowColor = '#70faff'; ctx.textAlign = 'center';
    ctx.font = '900 20px system-ui'; ctx.fillText(label.text, label.x, label.y);
  }
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}
function card(ctx, x, y, w, label, value, color = '#eff8ff') {
  roundRect(ctx, x, y, w, 50, 11); ctx.fillStyle = '#080e20ce'; ctx.fill();
  ctx.strokeStyle = '#849acb33'; ctx.lineWidth = 1; ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#8091b6'; ctx.font = '800 9px system-ui';
  ctx.fillText(label, x + 13, y + 17);
  ctx.fillStyle = color; ctx.font = '800 19px system-ui'; ctx.fillText(value, x + 13, y + 39);
}
function hud(ctx, world, remaining) {
  card(ctx, 18, 16, 195, 'SALVAGE SCORE', world.score.toLocaleString(), '#c6efff');
  card(ctx, 224, 16, 210, 'STARSHARDS', world.collected + ' / 12', '#b7faff');
  card(ctx, 445, 16, 150, 'WAVE', String(world.wave).padStart(2, '0'), '#aabaff');
  const low = remaining < 16, clockColor = low ? '#ff8793' : '#eff8ff';
  card(ctx, 1090, 16, 172, 'GATE WINDOW', Math.ceil(remaining) + 's', clockColor);
  roundRect(ctx, 18, 744, 332, 42, 11); ctx.fillStyle = '#080e20d9'; ctx.fill();
  ctx.strokeStyle = '#849acb33'; ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#8091b6'; ctx.font = '800 9px system-ui'; ctx.fillText('DRONE HULL', 32, 761);
  ctx.fillStyle = '#edf7ff'; ctx.font = '800 13px system-ui'; ctx.fillText(world.player.hull + '%', 32, 778);
  roundRect(ctx, 92, 760, 240, 11, 6); ctx.fillStyle = '#26324d'; ctx.fill();
  const hull = world.player.hull / 100;
  if (hull > 0) { roundRect(ctx, 92, 760, 240 * hull, 11, 6); ctx.fillStyle = hull > .4 ? '#70e4ce' : '#ff7889'; ctx.fill(); }
  roundRect(ctx, 1054, 744, 208, 42, 11); ctx.fillStyle = '#080e20d9'; ctx.fill();
  ctx.strokeStyle = '#849acb33'; ctx.stroke(); ctx.textAlign = 'left';
  ctx.fillStyle = '#8091b6'; ctx.font = '800 9px system-ui'; ctx.fillText('HARPOON', 1068, 761);
  const ready = world.cooldown <= 0; ctx.fillStyle = ready ? '#8df3e0' : '#cad3e6';
  ctx.font = '800 13px system-ui'; ctx.fillText(ready ? 'READY' : world.cooldown.toFixed(1) + 's', 1068, 778);
  roundRect(ctx, 1133, 760, 116, 11, 6); ctx.fillStyle = '#26324d'; ctx.fill();
  const charge = 1 - world.cooldown / .55;
  roundRect(ctx, 1133, 760, 116 * Math.max(0, Math.min(1, charge)), 11, 6);
  ctx.fillStyle = ready ? '#8df3e0' : '#8ba8ff'; ctx.fill();
}
export function draw(ctx, world, state, stats) {
  const p = world.player;
  ctx.save();
  if (world.shake > 0) ctx.translate((Math.random() - .5) * world.shake * 24, (Math.random() - .5) * world.shake * 24);
  background(ctx, world);
  for (const shard of world.shards) if (shard.alive) drawShard(ctx, shard);
  for (const mine of world.mines) drawMine(ctx, mine);
  drawEffects(ctx, world); drawDrone(ctx, p, world.elapsed);
  ctx.restore();
  if (state === 'play' || state === 'pause') {
    hud(ctx, world, stats.remaining);
    ctx.textAlign = 'center'; ctx.fillStyle = '#8d9bbb'; ctx.globalAlpha = .8;
    ctx.font = '700 10px system-ui'; ctx.fillText('WASD / ARROWS MOVE  ·  MOUSE AIM  ·  CLICK / SPACE HARPOON  ·  P PAUSE', 640, 722);
    ctx.globalAlpha = 1;
  }
  if (state === 'pause') {
    ctx.fillStyle = '#03071466'; ctx.fillRect(0, 0, W, H);
  }
}
