import {formulaSidebar} from './sidebar-formulas.js';

const button = document.getElementById('language');
const sections = document.querySelectorAll('[data-credits-lang]');
const requested = new URLSearchParams(location.search).get('lang');
let stored;
try { stored = localStorage.getItem('model-atlas-language'); } catch {}
let lang = requested === 'ko' || requested === 'en' ? requested : stored === 'en' ? 'en' : 'ko';

function render() {
  document.getElementById('formula-navigation').innerHTML = formulaSidebar(lang);
  document.documentElement.lang = lang;
  document.title = lang === 'ko' ? '출처와 라이선스 — Model Atlas' : 'Credits and licenses — Model Atlas';
  document.getElementById('skip-to-content').textContent = lang === 'ko' ? '본문으로 건너뛰기' : 'Skip to content';
  button.textContent = lang === 'ko' ? 'EN' : 'KO';
  button.setAttribute('aria-label', lang === 'ko' ? '영어로 전환' : 'Switch to Korean');
  sections.forEach(section => { section.hidden = section.lang !== lang; });
}
button.addEventListener('click', () => {
  lang = lang === 'ko' ? 'en' : 'ko';
  try { localStorage.setItem('model-atlas-language', lang); } catch {}
  const url = new URL(location.href);
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
  render();
});
render();

