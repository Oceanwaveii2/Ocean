/* Board card-position jump probe — paste into DevTools Console on the real
   art-equation-studio.html page (in a split-view board with a few cards),
   then run boardJumpProbe.click(), boardJumpProbe.marquee(), or
   boardJumpProbe.zoom() and read the logged output.

   This exists because static code review could not reproduce the reported
   click/marquee/zoom "cards jump" bug (see chat), so the fastest path to a
   fix is capturing exactly what changes, in the actual browser where it
   happens — this cannot be faked or guessed from outside a live page. */
window.boardJumpProbe = (() => {
  function snapshot(label) {
    const board = window.activeBoard ? activeBoard() : null;
    const rows = (board ? board.items : []).map(item => {
      const el = document.querySelector(`[data-board-item="${item.id}"]`);
      return {
        id: item.id,
        model_x: item.x, model_y: item.y,
        dom_left: el ? el.style.left : null,
        dom_top: el ? el.style.top : null,
        rect: el ? (({x,y}) => ({x: Math.round(x), y: Math.round(y)}))(el.getBoundingClientRect()) : null
      };
    });
    console.log(`[boardJumpProbe] ${label}`, {
      zoom: board?.zoom, panX: board?.panX, panY: board?.panY,
      gpuPreview: window.boardGpuPreviewOn, webgpuReady: !!window.boardWebGpu
    }, rows);
    return rows;
  }

  function diff(before, after, label) {
    before.forEach((b, i) => {
      const a = after[i];
      if (!a) return;
      if (b.model_x !== a.model_x || b.model_y !== a.model_y) {
        console.warn(`[boardJumpProbe] ${label}: item ${b.id} MODEL moved`, b, '->', a);
      }
      if (JSON.stringify(b.rect) !== JSON.stringify(a.rect)) {
        console.warn(`[boardJumpProbe] ${label}: item ${b.id} SCREEN rect changed`, b.rect, '->', a.rect);
      }
    });
  }

  return {
    // Run this, then click empty board space yourself, then run snapshotAfterClick().
    before: null,
    start(label) { this.before = snapshot(`before ${label}`); },
    after(label) { diff(this.before, snapshot(`after ${label}`), label); },

    // Or drive it programmatically:
    click(x = 400, y = 300) {
      this.start('plain click');
      const wrap = document.getElementById('board-canvas-wrap');
      const opts = { bubbles: true, clientX: x, clientY: y, button: 0, pointerId: 1 };
      wrap.dispatchEvent(new PointerEvent('pointerdown', opts));
      wrap.dispatchEvent(new PointerEvent('pointerup', opts));
      requestAnimationFrame(() => this.after('plain click'));
    },
    zoom(deltaY = -100, x = 400, y = 300) {
      this.start('zoom');
      const wrap = document.getElementById('board-canvas-wrap');
      wrap.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: x, clientY: y, deltaY }));
      requestAnimationFrame(() => this.after('zoom'));
    }
  };
})();
console.log('boardJumpProbe loaded. Try: boardJumpProbe.click()  or  boardJumpProbe.zoom()');
