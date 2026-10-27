export function initHistory({ root, gsap, ScrollTrigger, settings }) {
  if (!root) throw new Error('Не найдена секция: history');
  const scene = root.querySelector('.history__scene');
  const track = root.querySelector('.history__track');
  let disposed = false;
  let context;
  let observer;
  let frame;
  const cleanup = () => {
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(frame);
    context?.revert();
    track.replaceChildren();
    scene.hidden = true;
  };
  // No requests, empty image slots, or pin spacing while exports are missing.
  if (!settings.enabled) return cleanup;
  const images = settings.photos.map(photo => {
    const card = root.querySelector('template').content.firstElementChild.cloneNode(true);
    const image = card.querySelector('img');
    image.src = import.meta.env.BASE_URL + 'images/section-02/' + encodeURIComponent(photo.file);
    image.dataset.figmaNode = photo.node;
    if (photo.cropWidth) {
      image.style.width = `${photo.cropWidth}%`;
      image.style.left = `${photo.cropLeft}%`;
    }
    track.append(card);
    return image;
  });
  Promise.all([document.fonts.ready, ...images.map(image => image.decode())]).then(() => {
    if (disposed) return;
    scene.hidden = false;
    root.dataset.status = 'ready';
    context = gsap.context(() => {
      const viewport = root.querySelector('.history__viewport');
      const texts = gsap.utils.toArray('.history__text', root);
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const screen = () => scene.clientHeight;
      // Timeline units are viewport-relative scroll distances; rebuild after resize.
      const build = () => {
        const move = distance() / screen() * settings.movementPerViewport;
        const hold = settings.initialHoldScreens;
        const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          trigger: scene, start: 'top top',
          end: () => '+=' + (distance() * settings.movementPerViewport + screen() * (hold + settings.finalHoldScreens)),
          pin: true, pinSpacing: true, scrub: settings.scrub,
          invalidateOnRefresh: true,
        }});
        gsap.set(texts, { autoAlpha: 0 });
        gsap.set(texts[0], { autoAlpha: 1 });
        timeline.fromTo(track, { x: 0 }, { x: () => -distance(), duration: move }, hold);
        // Boundaries at midpoint between each pair of three-photo groups.
        [0, 1].forEach(index => {
          const at = hold + move * (index === 0 ? .25 : .75);
          const fade = settings.textFade;
          timeline.to(texts[index], { autoAlpha: 0, duration: fade }, at - fade)
            .to(texts[index + 1], { autoAlpha: 1, duration: fade }, at);
        });
        timeline.to({}, { duration: settings.finalHoldScreens }, hold + move);
        return timeline;
      };
      let timeline = build();
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
  }).catch(() => {
    if (disposed) return;
    scene.hidden = true;
    track.replaceChildren();
    root.dataset.status = 'awaiting-images';
    console.warn('Секция 02 не активирована: нужны все девять оригинальных фотографий.');
  });
  return cleanup;
}
