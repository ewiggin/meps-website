(function () {
  const canvas = document.getElementById('hero-grid');
  const ctx = canvas.getContext('2d');

  const CELL = 48;
  const ACCENT = [45, 90, 39];
  const BASE_LINE = 'rgba(180,175,165,0.45)';
  const DOT = 'rgba(160,155,145,0.6)';
  const GOL_INTERVAL = 120; // ms between generations

  let cols, rows, grid, nextGrid;
  let glowMap = [];
  let mouse = { x: -9999, y: -9999 };
  let lastGolTime = 0;

  function resize() {
    const section = canvas.parentElement;
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
    cols = Math.ceil(canvas.width / CELL) + 1;
    rows = Math.ceil(canvas.height / CELL) + 1;
    glowMap = new Float32Array(cols * rows);
    initGrid();
  }

  function initGrid() {
    grid = new Uint8Array(cols * rows);
    nextGrid = new Uint8Array(cols * rows);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < 0.28 ? 1 : 0;
    }
  }

  function idx(r, c) {
    // Toroidal wrapping — the universe loops on itself
    return ((r + rows) % rows) * cols + ((c + cols) % cols);
  }

  function stepGol() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            n += grid[idx(r + dr, c + dc)];
          }
        }
        const alive = grid[idx(r, c)];
        nextGrid[idx(r, c)] = alive
          ? (n === 2 || n === 3 ? 1 : 0)
          : (n === 3 ? 1 : 0);
      }
    }
    const tmp = grid; grid = nextGrid; nextGrid = tmp;
  }

  function draw(ts) {
    if (ts - lastGolTime > GOL_INTERVAL) {
      stepGol();
      lastGolTime = ts;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update mouse glow per intersection
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * CELL, cy = r * CELL;
        const dx = mouse.x - cx, dy = mouse.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = CELL * 3.5;
        const target = dist < radius ? Math.pow(1 - dist / radius, 2) : 0;
        const i = r * cols + c;
        glowMap[i] += (target - glowMap[i]) * 0.12;
      }
    }

    // Grid lines
    ctx.strokeStyle = BASE_LINE;
    ctx.lineWidth = 0.5;
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(canvas.width, r * CELL);
      ctx.stroke();
    }

    // GoL cells + mouse glow combined
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const alive = grid[i];
        const glow = glowMap[i];
        const alpha = Math.min((alive ? 0.28 : 0) + glow * 0.2, 0.52);
        if (alpha > 0.004) {
          ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha})`;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // Intersection dots
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const glow = glowMap[i];
        ctx.beginPath();
        ctx.arc(c * CELL, r * CELL, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0.05
          ? `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${Math.min(0.5 + glow * 0.5, 1)})`
          : DOT;
        ctx.fill();
      }
    }

    // Gradient fade toward the bottom so text stays readable
    const grad = ctx.createLinearGradient(0, canvas.height * 0.52, 0, canvas.height);
    grad.addColorStop(0, 'rgba(245,243,238,0)');
    grad.addColorStop(1, 'rgba(245,243,238,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  }

  canvas.parentElement.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / CELL);
    const r = Math.floor((e.clientY - rect.top) / CELL);
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r * cols + c] ^= 1;
    }
  });

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();
