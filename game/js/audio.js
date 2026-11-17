export class AudioFX {
  constructor() { this.ctx = null; this.enabled = true; }
  unlock() {
    if (!this.enabled) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { this.enabled = false; return; }
    if (!this.ctx) this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq, duration, type = 'sine', gain = 0.06, endFreq = freq) {
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), amp = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), now + duration);
    amp.gain.setValueAtTime(gain, now); amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(amp); amp.connect(this.ctx.destination); osc.start(now); osc.stop(now + duration);
  }
  pickup() { this.tone(540, .12, 'triangle', .045, 1040); setTimeout(() => this.tone(860, .13, 'sine', .035, 1320), 65); }
  hit() { this.tone(150, .28, 'sawtooth', .07, 48); }
  click() { this.tone(440, .07, 'sine', .025, 660); }
  win() { this.tone(392, .5, 'triangle', .07, 784); setTimeout(() => this.tone(587, .55, 'triangle', .06, 1174), 150); setTimeout(() => this.tone(784, .8, 'sine', .05, 1176), 300); }
  loss() { this.tone(280, .65, 'triangle', .06, 75); }
}
