import { constructionAssets } from './construction-assets.js';

export function initConstruction({ root, gsap, ScrollTrigger, settings }) {
  if (!root) throw new Error('Не найдена секция: construction');
  const scene = root.querySelector('.construction__scene');
  const container = root.querySelector('.construction__parts');
  let disposed = false;
  let context;
  const sortTriggers = () => ScrollTrigger.sort();
  ScrollTrigger.addEventListener('refreshInit', sortTriggers);
  const cleanup = () => {
    disposed = true;
    context?.revert();
    ScrollTrigger.removeEventListener('refreshInit', sortTriggers);
    container.replaceChildren();
    scene.hidden = true;
  };
  // Only activate the assembled scene after every selected local image decodes.
  if (!settings.enabled) return cleanup;
  const images = [];
  const parts = constructionAssets.map(asset => {
    const image = new Image();
    image.alt = '';
    image.src = import.meta.env.BASE_URL + 'images/section-03/' + encodeURIComponent(asset.file);
    images.push(image);
    const part = asset.cropTop ? document.createElement('div') : image;
    part.className = 'construction__part' + (asset.cropTop ? ' construction__part--crop' : '');
    part.dataset.part = asset.id;
    Object.assign(part.style, {
      left: `${asset.x / 1512 * 100}%`, top: `${asset.y / 857 * 100}%`,
      width: `${asset.width / 1512 * 100}%`,
    });
    if (asset.cropTop) {
      const originalWidth = asset.file === 'left-body.png' ? 910 : 877;
      part.style.aspectRatio = `${originalWidth} / ${asset.cropHeight}`;
      image.style.top = `-${asset.cropTop / asset.cropHeight * 100}%`;
      part.append(image);
    }
    container.append(part);
    return part;
  });
  Promise.all([document.fonts.ready, ...images.map(image => image.decode())]).then(() => {
    if (disposed) return;
    scene.hidden = false;
    if (images.some(image => image.naturalWidth < 2 || image.naturalHeight < 2)) throw new Error('Empty architecture asset');
    root.dataset.status = 'ready';
    context = gsap.context(() => {
      const texts = gsap.utils.toArray('.construction__texts p', root);
      const conclusion = root.querySelector('.construction__conclusion');
      const offset = index => {
        const a = constructionAssets[index], scale = scene.clientWidth / 1512;
        return (a.side === 'left' ? -(a.x + a.width + 32) : 1512 - a.x + 32) * scale;
      };
      gsap.set(texts, { autoAlpha: 0 });
      gsap.set(texts[0], { autoAlpha: 1 });
      const unit = settings.read + settings.assemble;
      const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: scene, start: 'top top',
        end: () => '+=' + scene.clientHeight * (3 * unit + settings.reveal + settings.finalHold),
        pin: true, pinSpacing: true, scrub: settings.scrub, invalidateOnRefresh: true, refreshPriority: -10,
      }});
      timeline.addLabel('begin', 0).addLabel('structure', unit).addLabel('assembly', 2 * unit)
        .addLabel('series', 3 * unit).addLabel('hold', 3 * unit + settings.reveal);
      parts.forEach((part, index) => {
        const a = constructionAssets[index];
        const entry = a.stage * unit;
        timeline.fromTo(part, { x: () => offset(index) }, {
          x: () => offset(index) * (a.stage === 0 ? .6 : a.stage === 1 ? .4 : 0), duration: settings.assemble,
        }, entry + settings.read);
        if (a.stage === 0) timeline.to(part, {
          x: () => offset(index) * .4, duration: settings.assemble,
        }, unit + settings.read);
        if (a.stage < 2) timeline.to(part, { x: 0, duration: settings.assemble }, 'assembly+=' + settings.read);
      });
      [1, 2].forEach(index => {
        const at = index * unit;
        timeline.to(texts[index - 1], { autoAlpha: 0, duration: .15 }, at - .15)
          .to(texts[index], { autoAlpha: 1, duration: .15 }, at);
      });
      // The third paragraph stays behind the parts; no forced fade before coverage.
      timeline.set(conclusion, { autoAlpha: 1 }, 'series')
        .fromTo(conclusion.querySelector('h3'), { y: () => scene.clientHeight * .45, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: settings.reveal }, 'series')
        .fromTo(conclusion.querySelector('p'), { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: settings.reveal * .35 }, 'series+=' + settings.reveal * .65);
      timeline.to({}, { duration: settings.finalHold }, 'hold');
    }, root);
    ScrollTrigger.refresh();
  }).catch(() => {
    if (disposed) return;
    root.dataset.status = 'awaiting-assets';
    scene.hidden = true;
    container.replaceChildren();
    console.warn('Секция 03 отключена: отсутствуют оригинальные PNG-фрагменты.');
  });
  return cleanup;
}
