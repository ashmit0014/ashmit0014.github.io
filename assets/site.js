// Two small behaviours, both optional: the page reads fine without them.
// 1. The ambient tint follows the section in view (Sidekick's rule for the song that is playing).
// 2. The deck under the iPad switches its screen, like the device's own Home · Music · Desk segment.
(function () {
  'use strict';

  // ---- ambient tint and the bar's current section
  var layers = {};
  Array.prototype.forEach.call(document.querySelectorAll('.ambient i'), function (el) { layers[el.dataset.tint] = el; });
  var links = {};
  Array.prototype.forEach.call(document.querySelectorAll('.bar nav a[href^="#"]'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var current = null;
  function show(name) {
    if (name === current) return;
    current = name;
    document.documentElement.setAttribute('data-tint', name);
    Object.keys(layers).forEach(function (k) { layers[k].classList.toggle('on', k === name); });
    Object.keys(links).forEach(function (k) {
      if (k === name) links[k].setAttribute('aria-current', 'true'); else links[k].removeAttribute('aria-current');
    });
  }
  show('intro');
  var sections = document.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target.dataset.section); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(sections, function (s) { io.observe(s); });
  }
  var bar = document.querySelector('.bar');
  function onScroll() { bar.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- the deck
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.deck [role="tab"]'));
  var screens = document.querySelectorAll('#sk-screen img');
  var caps = document.querySelectorAll('.device-fig .cap');
  var panel = document.getElementById('sk-screen');
  function select(tab, focus) {
    var name = tab.dataset.screen;
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    Array.prototype.forEach.call(screens, function (img) {
      if (img.dataset.screen === name && img.loading === 'lazy') img.loading = 'eager';
      img.classList.toggle('on', img.dataset.screen === name);
    });
    Array.prototype.forEach.call(caps, function (c) { c.classList.toggle('on', c.dataset.screen === name); });
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
  if (tabs.length) select(tabs[0], false);
  // warm the other screens once the page is idle, so a switch never shows an empty frame
  window.addEventListener('load', function () {
    setTimeout(function () { Array.prototype.forEach.call(screens, function (img) { img.loading = 'eager'; }); }, 1200);
  });
})();
