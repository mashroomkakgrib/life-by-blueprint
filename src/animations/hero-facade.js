/** Future layer contract: { id, src, x, y, width, height, at, duration }.
 * Coordinates in ORIGINAL 1512 × 2450 pixels; at/duration in normalized [0,1].
 * No layers are created while disabled. Transparent PNGs must match the photograph.
 */
export function createFacadeSequence({ root, gsap, settings }) {
  const timeline = gsap.timeline({ paused: true });
  const elements = [];
  if (settings.enabled) {
    for (const layer of settings.layers) {
      const element = document.createElement('img');
      element.className = 'hero__facade-layer';
      element.dataset.layer = layer.id;
      element.alt = '';
      element.src = layer.src;
      Object.assign(element.style, {
        left: `${layer.x / 1512 * 100}%`, top: `${layer.y / 2450 * 100}%`,
        width: `${layer.width / 1512 * 100}%`, height: `${layer.height / 2450 * 100}%`,
      });
      root.querySelector('.hero__facade-layers').append(element);
      elements.push(element);
      timeline.to(element, { opacity: 1, duration: layer.duration, ease: 'none' }, layer.at);
    }
    timeline.to({}, { duration: 0 }, 1);
  }
  return { timeline, destroy() { timeline.kill(); elements.forEach(element => element.remove()); } };
}
