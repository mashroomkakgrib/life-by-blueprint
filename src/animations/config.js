export const sceneSettings = Object.freeze({
  hero: {
    // Timeline units; scroll distance is computed from the viewport and image.
    reveal: 1.2,
    titleHold: .3,
    titleExit: .5,
    travel: 5,
    outro: 1.2,
    revealScreens: 1.2,
    travelScreens: 3,
    outroScreens: 1,
    scrub: .6,
    facade: { enabled: false, layers: [] },
  },
  history: {
    // Nine original Figma card exports, already cropped to 435 × 425.
    enabled: true,
    scrub: .6,
    initialHoldScreens: .55,
    finalHoldScreens: .8,
    movementPerViewport: 1,
    textFade: .07,
    photos: [
      { file: 'image 135.png', node: '755:695' },
      { file: 'image 134.png', node: '755:694' },
      { file: 'image 131.png', node: '755:692' },
      { file: 'image 136.png', node: '755:698' },
      { file: 'image 137.png', node: '755:701' },
      { file: 'image 138.png', node: '755:704' },
      { file: 'image 139.png', node: '755:707' },
      { file: 'image 140.png', node: '755:710' },
      { file: 'image 141.png', node: '755:713' },
    ],
  }, construction: { enabled: true, scrub: .6, read: 1, assemble: 1.2, reveal: 1, finalHold: .7 }, apartment: { scrub: .5, intro: 1.1, read: 1.25, fade: .25, enter: .9, finalHold: .4 }, finale: { scrub: .6, reveal: .5, initialHold: .3, finalHold: .9, finish: .4, textFade: .45 },
});
