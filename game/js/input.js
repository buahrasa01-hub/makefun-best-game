export class InputState {
  constructor(canvas) {
    this.keys = new Set(); this.mouse = { x: 640, y: 400 };
    this.fireQueued = false; this.pointerDown = false;
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
      if (!e.repeat && (k === ' ' || k === 'enter')) this.fireQueued = true;
      this.keys.add(k);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this.pointerDown = false; });
    canvas.addEventListener('pointermove', e => this.setMouse(e, canvas));
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0) return; this.setMouse(e, canvas); this.pointerDown = true; this.fireQueued = true;
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener('pointerup', () => this.pointerDown = false);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  setMouse(e, canvas) {
    const r = canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) * 1280 / r.width;
    this.mouse.y = (e.clientY - r.top) * 800 / r.height;
  }
  axis(positive, negative, arrowPositive, arrowNegative) {
    return (this.keys.has(positive) || this.keys.has(arrowPositive) ? 1 : 0) -
      (this.keys.has(negative) || this.keys.has(arrowNegative) ? 1 : 0);
  }
  movement() {
    let x = this.axis('d','a','arrowright','arrowleft');
    let y = this.axis('s','w','arrowdown','arrowup');
    const len = Math.hypot(x,y) || 1; return { x: x / len, y: y / len };
  }
  consumeFire() { const fired = this.fireQueued; this.fireQueued = false; return fired; }
  pressed(key) { return this.keys.has(key); }
}
