class ProjectCard extends HTMLElement {
  connectedCallback() {
    const name        = this.getAttribute('name') || '';
    const description = this.getAttribute('description') || '';
    const stack       = this.getAttribute('stack') || '';
    const status      = this.getAttribute('status') || 'soon';
    const label       = this.getAttribute('label') || status;
    const delay       = this.getAttribute('delay') || '0s';
    const color       = this.getAttribute('color') || '#2d5a27';
    const href        = this.getAttribute('href');
    const icon        = this.getAttribute('icon') || name.slice(0, 2);

    const isActive   = status === 'active';
    const badgeClass = isActive ? '' : 'text-muted bg-faint';
    const badgeStyle = isActive ? `color:${color};background:${hexToRgba(color, 0.1)}` : '';
    const tag        = href ? 'a' : 'div';
    const footer     = stack
      ? `<p class="font-mono text-xs text-muted pt-4">${stack}</p>`
      : href
        ? `<p class="font-mono text-xs pt-4" style="color:${color}">→</p>`
        : isActive
        ? ''
        : `<p class="font-mono text-xs pt-4"><span class="cursor">_</span></p>`;

    this.innerHTML = `
      <${tag} ${href ? `href="${href}"` : ''} class="infra-card project-card bg-warm p-8 h-full flex flex-col ${href ? 'cursor-pointer' : 'cursor-default'} fade-in"
           style="transition-delay:${delay};border-top:2px solid ${color};--pc:${color}">
        <div class="flex items-center justify-between mb-6">
          <span class="project-icon shrink-0 font-mono text-sm flex items-center justify-center"
                aria-hidden="true"
                style="width:40px;height:40px;border-radius:6px;color:${color};background:${hexToRgba(color, 0.1)};border:1px solid ${hexToRgba(color, 0.25)};letter-spacing:-0.02em">${icon}</span>
          <span class="font-mono text-xs ${badgeClass} px-2 py-0.5 rounded" style="${badgeStyle}">${label}</span>
        </div>
        <p class="font-serif text-2xl mb-4 infra-title" style="color:${color}">${name}</p>
        <p class="text-sm text-muted font-light leading-relaxed">${description}</p>
        <div class="mt-auto">${footer}</div>
      </${tag}>
    `;
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
