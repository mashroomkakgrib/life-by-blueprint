export function initApartment({ root, gsap, ScrollTrigger, settings }) {
  if (!root) throw new Error('Не найдена секция: apartment');
  const scene = root.querySelector('.apartment__scene');
  const images = [...root.querySelectorAll('img')];
  let disposed = false;
  let context;
  let timeline;
  let observer;
  let resizeFrame;
  const sort = () => ScrollTrigger.sort();
  ScrollTrigger.addEventListener('refreshInit', sort);
  Promise.all([document.fonts.ready, ...images.map(image => image.decode())]).then(() => {
    if (disposed) return;
    if (images.some(image => image.naturalWidth < 2)) throw new Error('Invalid apartment image');
    root.dataset.status = 'ready';
    context = gsap.context(() => {
      gsap.fromTo(root.querySelector('.apartment__heading'), { autoAlpha: 0, y: 35 }, {
        autoAlpha: 1, y: 0, ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.apartment__heading'), start: 'top 90%', end: 'top 35%', scrub: true, refreshPriority: -19 },
      });
      const build = () => {
        const plans = [...root.querySelectorAll('.apartment__plan')];
        const rooms = [...root.querySelectorAll('.apartment__room')];
        const intro = root.querySelector('.apartment__intro');
        const height = scene.clientHeight;
        const duration = rooms.reduce((sum, room) => sum + 2 * settings.read + settings.enter + room.querySelector('.apartment__photos').scrollHeight / height + .4, settings.intro) + settings.finalHold;
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          trigger: scene, start: 'top top', end: () => '+=' + duration * scene.clientHeight,
          pin: true, pinSpacing: true, scrub: settings.scrub, refreshPriority: -20, invalidateOnRefresh: true,
        }});
        tl.addLabel('plan', 0);
        tl.to(intro, { autoAlpha: 0, duration: settings.fade }, settings.intro - settings.fade);
        let cursor = settings.intro;
        rooms.forEach((room, index) => {
          const texts = [...room.querySelectorAll('.apartment__text')];
          const photos = room.querySelector('.apartment__photos');
          const start = cursor;
          tl.addLabel(room.dataset.room, start);
          tl.to(plans[index], { opacity: 0, duration: settings.fade }, start)
            .to(plans[index + 1], { opacity: 1, duration: settings.fade }, start)
            .fromTo(texts[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: settings.fade }, start);
          cursor += settings.read;
          tl.to(texts[0], { autoAlpha: 0, duration: settings.fade }, cursor - settings.fade)
            .fromTo(texts[1], { autoAlpha: 0 }, { autoAlpha: 1, duration: settings.fade }, cursor);
          cursor += settings.read;
          tl.addLabel(room.dataset.room + '-photos', cursor);
          tl.to(texts[1], { autoAlpha: 0, duration: settings.fade }, cursor - settings.fade)
            .fromTo(photos, { y: height, autoAlpha: 0 }, { y: height * .06, autoAlpha: 1, duration: settings.enter }, cursor);
          cursor += settings.enter;
          const travel = photos.scrollHeight / height;
          // The plan stays pinned while the real photos travel upward in one column.
          tl.to(photos, { y: -photos.scrollHeight + height * .08, duration: travel + .4 }, cursor)
            .to(photos, { autoAlpha: 0, duration: settings.fade }, cursor + travel + .4 - settings.fade);
          cursor += travel + .4;
        });
        tl.to({}, { duration: settings.finalHold }, cursor);
        return tl;
      };
      timeline = build();
      let width = scene.clientWidth, height = scene.clientHeight;
      observer = new ResizeObserver(() => {
        if (width === scene.clientWidth && height === scene.clientHeight) return;
        width = scene.clientWidth; height = scene.clientHeight;
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
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
    if (!disposed) {
      root.dataset.status = 'error';
      console.error('Не удалось загрузить материалы квартиры:', error);
    }
  });
  return () => {
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(resizeFrame);
    context?.revert();
    ScrollTrigger.removeEventListener('refreshInit', sort);
  };
}
