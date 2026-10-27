import './styles/global.css';
import './styles/typography.css';
import './styles/sections.css';
import './styles/hero.css';
import './styles/history.css';
import './styles/construction.css';
import './styles/apartment.css';
import './styles/footer.css';
import './styles/finale.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHero } from './animations/hero.js';
import { initHistory } from './animations/history.js';
import { initConstruction } from './animations/construction.js';
import { initApartment } from './animations/apartment.js';
import { initFinale } from './animations/finale.js';
import { sceneSettings } from './animations/config.js';

gsap.registerPlugin(ScrollTrigger);
const scenes = { hero: initHero, history: initHistory, construction: initConstruction, apartment: initApartment, finale: initFinale };
const dispose = Object.entries(scenes).map(([id, init]) => init({
  root: document.getElementById(id), gsap, ScrollTrigger, settings: sceneSettings[id],
}));
// HMR не должен оставлять закрепления и обработчики от предыдущей версии.
if (import.meta.hot) import.meta.hot.dispose(() => dispose.forEach(cleanup => cleanup()));
