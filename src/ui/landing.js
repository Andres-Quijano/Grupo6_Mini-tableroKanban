/**
 * landing.js — comportamiento de la página de presentación.
 *
 * Revela las secciones marcadas con data-reveal cuando entran en pantalla.
 * Usa IntersectionObserver (no escucha el scroll) y respeta a quien pidió
 * reducir el movimiento: en ese caso todo aparece sin animación.
 */
export function initLanding(root = document) {
  const sections = root.querySelectorAll('[data-reveal]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );
  sections.forEach((section) => observer.observe(section));
}
