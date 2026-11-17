const W = 1280, H = 800;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

export class GameWorld {
  constructor() { this.reset(); }
  reset() {
    this.player = { x: W / 2, y: H / 2, vx: 0, vy: 0, angle: 0, hull: 100, invuln: 0 };
    this.shards = []; this.mines = []; this.particles = []; this.labels = [];
    this.collected = 0; this.score = 0; this.elapsed = 0; this.cooldown = 0;
    this.harpoon = 0; this.shake = 0; this.wave = 1; this.events = [];
    for (let i = 0; i < 12; i++) this.spawnShard();
    for (let i = 0; i < 3; i++) this.spawnMine();
  }
  spawnShard() {
    const a = rand(0, Math.PI * 2), speed = rand(14, 34) + this.wave * 3;
    this.shards.push({ x: rand(70, W - 70), y: rand(80, H - 70),
      vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, spin: rand(0, 6), alive: true });
  }
  spawnMine() {
    let x, y, tries = 0;
    do { x = rand(45, W - 45); y = rand(70, H - 45); tries++; }
    while (tries < 30 && (x - this.player.x) ** 2 + (y - this.player.y) ** 2 < 210 ** 2);
    if ((x - this.player.x) ** 2 + (y - this.player.y) ** 2 < 210 ** 2) { x = this.player.x < W / 2 ? W - 60 : 60; y = this.player.y; }
    const a = rand(0, Math.PI * 2), s = rand(42, 60) + this.wave * 3;
    this.mines.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(17, 22), spin: rand(0, 6) });
  }
  fire(target) {
    if (this.cooldown > 0) return;
    this.cooldown = .55; this.harpoon = .22;
    this.player.angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const dx = Math.cos(this.player.angle), dy = Math.sin(this.player.angle);
    let best = null, bestAlong = Infinity;
    for (const shard of this.shards) {
      if (!shard.alive) continue;
      const rx = shard.x - this.player.x, ry = shard.y - this.player.y;
      const along = rx * dx + ry * dy, side = Math.abs(rx * dy - ry * dx);
      if (along > 24 && along < 500 && side < 25 && along < bestAlong) { best = shard; bestAlong = along; }
    }
    if (best) {
      best.alive = false; this.collected++; this.score += 100;
      this.burst(best.x, best.y, '#9ff8ff', 20);
      this.labels.push({ x: best.x, y: best.y, text: '+100', life: .9 });
      this.events.push('pickup');
      if (this.collected % 4 === 0) {
        this.wave = 1 + Math.floor(this.collected / 4);
        for (let i = 0; i < 2; i++) this.spawnMine();
        for (const s of this.shards) { s.vx *= 1.16; s.vy *= 1.16; }
      }
    }
  }
  burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), speed = rand(35, 190);
      this.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        life: rand(.25, .75), max: .75, color, size: rand(1.5, 4.5) });
    }
  }
  update(dt, input) {
    this.elapsed += dt; this.cooldown = Math.max(0, this.cooldown - dt);
    this.harpoon = Math.max(0, this.harpoon - dt); this.shake = Math.max(0, this.shake - dt);
    const move = input.movement(), p = this.player, speed = 235;
    p.vx = move.x * speed; p.vy = move.y * speed;
    p.x = clamp(p.x + p.vx * dt, 28, W - 28); p.y = clamp(p.y + p.vy * dt, 35, H - 30);
    p.invuln = Math.max(0, p.invuln - dt);
    if (input.consumeFire()) this.fire(input.mouse);
    if (move.x || move.y) {
      p.angle = Math.atan2(move.y, move.x);
      if (Math.random() < dt * 30) this.particles.push({ x: p.x - Math.cos(p.angle) * 18,
        y: p.y - Math.sin(p.angle) * 18, vx: -p.vx * .16 + rand(-14, 14),
        vy: -p.vy * .16 + rand(-14, 14), life: .24, max: .24, color: '#54c9ff', size: rand(2, 5) });
    }
    for (const s of this.shards) {
      if (!s.alive) continue; s.x += s.vx * dt; s.y += s.vy * dt; s.spin += dt;
      if (s.x < 30 || s.x > W - 30) s.vx *= -1;
      if (s.y < 50 || s.y > H - 30) s.vy *= -1;
      s.x = clamp(s.x, 30, W - 30); s.y = clamp(s.y, 50, H - 30);
    }
    for (const m of this.mines) {
      m.x += m.vx * dt; m.y += m.vy * dt; m.spin += dt;
      if (m.x < m.r || m.x > W - m.r) m.vx *= -1;
      if (m.y < 42 + m.r || m.y > H - m.r) m.vy *= -1;
      if (p.invuln <= 0 && dist2(p, m) < (m.r + 17) ** 2) {
        p.hull = Math.max(0, p.hull - 25); p.invuln = 1.05; this.shake = .32;
        this.burst(p.x, p.y, '#ff657d', 24); this.events.push('hit');
      }
    }
    this.particles = this.particles.filter(q => {
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .985; q.vy *= .985; q.life -= dt; return q.life > 0;
    });
    this.labels = this.labels.filter(label => { label.y -= 34 * dt; label.life -= dt; return label.life > 0; });
    const out = this.events.splice(0); return out;
  }
}
