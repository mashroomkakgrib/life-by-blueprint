import { createFacadeSequence } from './hero-facade.js';

export function initHero({ root, gsap, ScrollTrigger, settings }) {
  if (!root) throw new Error('Не найдена секция: hero');
  const image = root.querySelector('.hero__image');
  let disposed = false;
  let context;
  let facade;
  let observer;
  let resizeFrame;

  const ready = Promise.all([
    document.fonts.ready,
    image.decode(),
  ]);
  ready.then(() => {
    if (disposed) return;
    context = gsap.context(() => {
      const photo = root.querySelector('.hero__photograph');
      const plane = root.querySelector('.hero__image-plane');
      const title = root.querySelector('.hero__title');
      const captions = gsap.utils.toArray('.hero__caption', root);
      const distance = () => Math.max(0, plane.getBoundingClientRect().height - root.clientHeight);
      const travelStart = settings.reveal + settings.titleHold;
      const endTravel = travelStart + settings.travel;
      facade = createFacadeSequence({ root, gsap, settings: settings.facade });
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root, start: 'top top',
          end: () => '+=' + (root.clientHeight * (settings.revealScreens + settings.travelScreens + settings.outroScreens) + distance()),
          pin: true, pinSpacing: true, scrub: settings.scrub,
          invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      timeline.to(photo, { opacity: 1, duration: settings.reveal }, 0)
        .to(root, { '--hero-fill': '#3f3f3f', '--hero-stroke': '#3f3f3f', duration: settings.reveal }, 0)
        .to(title, { autoAlpha: 0, y: -40, duration: settings.titleExit }, travelStart)
        .to(plane, { y: () => -distance(), duration: settings.travel }, travelStart)
        .fromTo(root.querySelector('.hero__exit-gradient'), { y: 0, yPercent: 50 }, { y: 0, yPercent: -50, duration: settings.outro }, endTravel);
      // Intro and labels are mutually exclusive and fully reversible.
      const positions = [.08, .34, .57, .79];
      captions.forEach((caption, index) => {
        const at = travelStart + settings.travel * positions[index];
        timeline.fromTo(caption, { autoAlpha: 0 }, { autoAlpha: 1, duration: .22 }, at)
          .to(caption, { autoAlpha: 0, duration: .22 }, at + settings.travel * .12);
      });
      // A separate paused timeline is driven by the same scroll clock when enabled.
      if (settings.facade.enabled) timeline.to(facade.timeline, { progress: 1, duration: settings.travel }, travelStart);
    }, root);
    let previousWidth = root.clientWidth;
    let previousHeight = root.clientHeight;
    observer = new ResizeObserver(() => {
      const width = root.clientWidth, height = root.clientHeight;
      if (width === previousWidth && height === previousHeight) return;
      previousWidth = width; previousHeight = height;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(root);
    ScrollTrigger.refresh();
  }).catch(error => {
    if (!disposed) console.error('Не удалось подготовить первую секцию:', error);
  });
  return () => {
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(resizeFrame);
    context?.revert();
    facade?.destroy();
  };
}
