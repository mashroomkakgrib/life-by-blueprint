export function initFinale({ root, gsap, ScrollTrigger, settings }) {
  if (!root) throw new Error('Не найдена секция: finale');
  const scene = root.querySelector('.finale__scene');
  const track = root.querySelector('.finale__track');
  let disposed = false;
  let context;
  let timeline;
  let observer;
  let frame;
  const sort = () => ScrollTrigger.sort();
  ScrollTrigger.addEventListener('refreshInit', sort);
  Promise.all([document.fonts.ready, ...[...root.querySelectorAll('img')].map(image => image.decode())]).then(() => {
    if (disposed) return;
    root.dataset.status = 'ready';
    context = gsap.context(() => {
      const build = () => {
        const distance = () => Math.max(0, track.scrollWidth - scene.clientWidth);
        const movement = distance() / scene.clientHeight;
        const start = settings.reveal + settings.initialHold;
        const end = start + movement;
        const duration = end + settings.finalHold + settings.finish;
        const texts = [...root.querySelectorAll('.finale__message p')];
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          trigger: scene, start: 'top top', end: () => '+=' + duration * scene.clientHeight,
          pin: true, pinSpacing: true, scrub: settings.scrub, refreshPriority: -30, invalidateOnRefresh: true,
        }});
        tl.addLabel('appearance', 0).addLabel('movement', start).addLabel('last-photo', end)
          .addLabel('finish', end + settings.finalHold);
        tl.fromTo(track, { opacity: 0, x: 0 }, { opacity: 1, duration: settings.reveal }, 0)
          .to(track, { x: () => -distance(), duration: movement }, 'movement')
          .fromTo(root.querySelector('.finale__shade'), { opacity: 0 }, { opacity: 1, duration: settings.textFade }, start + .1)
          .fromTo(texts[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: settings.textFade }, start + .1)
          .fromTo(texts[1], { autoAlpha: 0 }, { autoAlpha: 1, duration: settings.textFade }, start + .35)
          .to(track, { opacity: .85, duration: settings.finish }, 'finish')
          .to(texts, { opacity: .9, duration: settings.finish }, 'finish');
        return tl;
      };
      timeline = build();
      let width = scene.clientWidth, height = scene.clientHeight;
      observer = new ResizeObserver(() => {
        if (width === scene.clientWidth && height === scene.clientHeight) return;
        width = scene.clientWidth; height = scene.clientHeight;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (disposed) return;
          timeline.scrollTrigger.kill(true);
          timeline.revert();
          context.add(() => { timeline = build(); });
          ScrollTrigger.refresh();
        });
      });
      observer.observe(scene);
    }, root);
    ScrollTrigger.refresh();
  }).catch(error => {
    if (!disposed) { root.dataset.status = 'error'; console.error('Ошибка загрузки финальной секции:', error); }
  });
  return () => {
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(frame);
    context?.revert();
    ScrollTrigger.removeEventListener('refreshInit', sort);
  };
}
