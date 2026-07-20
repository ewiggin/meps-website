class ProjectCard extends HTMLElement {
  connectedCallback() {
    const name        = this.getAttribute('name') || '';
    const description = this.getAttribute('description') || '';
    const stack       = this.getAttribute('stack') || '';
    const status      = this.getAttribute('status') || 'soon';
    const delay       = this.getAttribute('delay') || '0s';

    const isActive   = status === 'active';
    const badgeClass = isActive ? 'text-accent bg-accent/10' : 'text-muted bg-faint';
    const right      = stack
      ? `<p class="font-mono text-xs text-muted">${stack}</p>`
      : `<span class="cursor font-mono text-xs">_</span>`;

    this.innerHTML = `
      <div class="project-card bg-warm p-8 flex flex-col md:flex-row md:items-center gap-6 cursor-default fade-in"
           style="transition-delay:${delay}">
        <canvas class="gol-avatar shrink-0" width="56" height="56"
                style="display:block;border-radius:6px;"></canvas>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <span class="font-serif text-xl">${name}</span>
            <span class="font-mono text-xs ${badgeClass} px-2 py-0.5 rounded">${status}</span>
          </div>
          <p class="text-sm text-muted font-light leading-relaxed max-w-md">${description}</p>
        </div>
        <div class="shrink-0">
          ${right}
        </div>
      </div>
    `;

    this._startGoL();
  }

  _startGoL() {
    const canvas = this.querySelector('.gol-avatar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SIZE     = 8;
    const CELL     = 7;           // 8 × 7 = 56px — matches canvas size exactly
    const ACCENT   = [45, 90, 39];
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
      ctx.fillRect(0, 0, 56, 56);

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

customElements.define('project-card', ProjectCard);
