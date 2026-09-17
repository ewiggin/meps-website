class ProjectCard extends HTMLElement {
  connectedCallback() {
    const name        = this.getAttribute('name') || '';
    const description = this.getAttribute('description') || '';
    const stack       = this.getAttribute('stack') || '';
    const status      = this.getAttribute('status') || 'soon';
    const delay       = this.getAttribute('delay') || '0s';
    const color       = this.getAttribute('color') || '#2d5a27';

    const isActive   = status === 'active';
    const badgeClass = isActive ? '' : 'text-muted bg-faint';
    const badgeStyle = isActive ? `color:${color};background:${hexToRgba(color, 0.1)}` : '';
    const footer     = stack
      ? `<p class="font-mono text-xs text-muted pt-4">${stack}</p>`
      : isActive
        ? ''
        : `<p class="font-mono text-xs pt-4"><span class="cursor">_</span></p>`;

    this.innerHTML = `
      <div class="infra-card project-card bg-warm p-8 h-full flex flex-col cursor-default fade-in"
           style="transition-delay:${delay};border-top:2px solid ${color};--pc:${color}">
        <div class="flex items-center justify-between mb-6">
          <canvas class="gol-avatar shrink-0" width="40" height="40"
                  style="display:block;border-radius:6px;"></canvas>
          <span class="font-mono text-xs ${badgeClass} px-2 py-0.5 rounded" style="${badgeStyle}">${status}</span>
        </div>
        <p class="font-serif text-2xl mb-4 infra-title" style="color:${color}">${name}</p>
        <p class="text-sm text-muted font-light leading-relaxed">${description}</p>
        <div class="mt-auto">${footer}</div>
      </div>
    `;

    this._accentRgb = hexToRgb(color);
    this._startGoL();
  }

  _startGoL() {
    const canvas = this.querySelector('.gol-avatar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SIZE     = 8;
    const CELL     = canvas.width / SIZE;   // fills the canvas exactly, whatever its size
    const ACCENT   = this._accentRgb || [45, 90, 39];
    const INTERVAL = 1000 / 6;   // ~6 generations per second

    let grid = new Uint8Array(SIZE * SIZE);
    let next = new Uint8Array(SIZE * SIZE);
    let last = 0;

    // Random seed, unique per card instance
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < 0.35 ? 1 : 0;
    }

    const idx = (r, c) => ((r + SIZE) % SIZE) * SIZE + ((c + SIZE) % SIZE);

    const step = () => {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          let n = 0;
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++)
              if (dr || dc) n += grid[idx(r + dr, c + dc)];
          const alive = grid[idx(r, c)];
          next[idx(r, c)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        }
      }
      [grid, next] = [next, grid];
    };

    const draw = (ts) => {
      if (ts - last > INTERVAL) { step(); last = ts; }

      // Background
      ctx.fillStyle = '#f5f3ee';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(180,175,165,0.55)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE * CELL); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE * CELL, i * CELL); ctx.stroke();
      }

      // Live cells
      ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.72)`;
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (grid[idx(r, c)])
            ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

customElements.define('project-card', ProjectCard);
